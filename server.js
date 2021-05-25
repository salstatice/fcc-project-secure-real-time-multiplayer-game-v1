require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();


// game setup
const Player = require('./public/Player.mjs');
const Collectible = require('./public/Collectible.mjs');
const config = require('./public/config.mjs');

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(cors({origin: '*'})); 

app.use(helmet());
app.use(helmet.noCache());

app.use((req, res, next) => {
  res.set('x-powered-by', 'PHP 7.4.3');
  next();
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});



// collectible functions
const generateCollectible = () => {

  // random coin position
  let x = Math.floor(Math.random() * (config.play_max_x - config.play_min_x)) + config.play_min_x ;
  let y = Math.floor(Math.random() * (config.play_max_y - config.play_min_y)) + config.play_min_y ;
  
  // random coin value and size
  let coins = [['green', 1, 12, 15], ['red', 2, 16, 16], ['blue', 3, 16, 16], ['diamond', 5, 16, 12]];
  let n = Math.floor(Math.random() * coins.length);

  let collectible = new Collectible({
    x: x,
    y: y,
    w: coins[n][2],
    h: coins[n][3],
    value: coins[n][1], 
    id: new Date(),
  })

  return collectible;
}

// init game server setup
let players = [];
let collectible = generateCollectible();

// socket setup
const io = socket(server);

// on connection, expect socket
io.on('connection', (socket) => {
  console.log('a user connected');

  // emit init with socket id for client to create player
  socket.emit('init', {
    id: socket.id
  })
  
  // Listenon start, expect new player 
  // safety concern? how can i tell if the player object is safe to use
  socket.on('start', (data) => {
    
    // update players arr
    console.log('player ' + data.player.id + ' joined the game')
    players = players.filter(x => x.id != data.player.id)
    players.push(data.player)
    
    // emit players arr and collectible
    io.emit('game', {
      players: players,
      collectible: collectible
    })
  })  


  // Listen on movement, expect updated player info  
  socket.on('move', (socket) => {
    // update players list
    players = players.filter(x => x.id != socket.player.id)
    players.push(socket.player)

    // emit upated players arr and collectible
    io.emit('game', {
      players: players,
      collectible: collectible
    })
  })
  
  // Listen on renew coin request, expect collectible.id
  socket.on('renew coin', (data) => {
    // renew collectible
    if (data.id == collectible.id.toJSON()) {
      collectible = generateCollectible();
      
      // emit players arr and updated collectible
      io.emit('game', {
        players: players,
        collectible: collectible,
      })
    }
  })

  // Listen on player disconnecting
  socket.on('disconnect', (reason) => {
    console.log(socket.id + ' disconnecting...' + reason);
    
    // remove disconnected player from players arr
    players = players.filter(x => x.id != socket.id)

    io.emit('game', {
      players: players,
      collectible: collectible
    })
  });

});




module.exports = app; // For testing
