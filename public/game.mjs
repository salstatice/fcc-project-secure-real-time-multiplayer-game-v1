import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import config from './config.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');


// initialize game
const loadImg = (url) => {
  let img = new Image();
  img.src = url
  return img
}

let green_gem = loadImg('./public/images/green_gem.png');
let red_gem = loadImg('./public/images/red_gem.png');
let blue_gem = loadImg('./public/images/blue_gem.png');
let diamond = loadImg('./public/images/diamond.png');
let gabumon = loadImg('./public/images/gabumon_64.png');
let agumon = loadImg('./public/images/agumon_64.png');



let p1;
let players;
let collectible;
let lastCoin;
let speed = 5;


socket.on('init', data => {
  p1 = makePlayer(data.id)
  
  socket.emit('start', {player: p1})
})


// Listen on game info. Expect data: players arr and Collectible
socket.on('game', data => {
  
  // assign players arr and Collectible
  players = data.players;
  collectible = data.collectible;

  // draw background, players and Collectible
  clear();
  drawbg();
  for (let i = 0; i < players.length; i++) {
    (players[i].id == p1.id) ? drawPlayer(players[i], gabumon) : drawPlayer(players[i], agumon)
  }
  drawCoin(collectible);

  // calulate rank and draw rank text
  drawRank(p1.calculateRank(players));
})


// Listen to key press
document.addEventListener("keydown", function(event) {
  
  // move player
  let dir = getDir(event.keyCode)
  if (withinRange(dir, p1)) {
     p1.movePlayer(dir, speed)
  }
  
  // Check if player collated with coin, increase score
  // compare lastCoin to prevent getting double score
  if ((p1.collision(collectible)) && (lastCoin != collectible.id)) {
    console.log('I got a coin')
    p1.score += collectible.value;
    console.log(p1)
    lastCoin = collectible.id

    // emit renew coin request
    socket.emit('renew coin', { id: collectible.id })
  }
  
  // emit player updated coord and score
  socket.emit('move', { player: p1, })
})





// game display setup
function drawbg() {
  context.lineWidth = config.window_border;
  context.strokeStyle = 'white';
  context.strokeRect(config.window_left_margin, config.window_top_margin, config.game_width, config.game_height);

  context.fillStyle = 'white';
  context.textAlign = 'left';
  context.textBaseline = 'bottom';
  context.font = '24px serif';
  context.fillText('Controls: WASD', config.banner_side, config.banner_top , config.game_width)

  context.textAlign = 'center';
  context.textBaseline = 'bottom';
  context.font = '28px serif';
  context.fillText('Coin Race', config.canvas_width / 2 , config.banner_top , config.game_width)
}

// clear player related elements
function clear() {
  context.clearRect(0, 0, config.canvas_width, config.canvas_height )
}

// draw player
function drawPlayer(player, img) {
  context.drawImage(img, player.x - player.size / 2, player.y - player.size / 2)
}

// draw rank
function drawRank(rank) {
  context.save();
  context.textAlign = 'right';
  context.font = '24px serif';
  context.fillText(rank, config.canvas_width - config.banner_side , config.banner_top , config.game_width)
  context.restore();
}

function drawCoin(collectible) {
  let img;
  switch (collectible.value) {
    case 1:
      img = green_gem;
      break;
    case 2:
      img = red_gem;
      break;
    case 3:
      img = blue_gem;
      break;
    case 5:
      img = diamond;
      break;
    default:
      img = green_gem;
  }
  
  context.drawImage(img, collectible.x, collectible.y)
}

// helper functions
// create player
const makePlayer = (id) => {
  let x = Math.floor(Math.random() * (config.play_max_x - config.play_min_x)) + config.play_min_x;
  let y = Math.floor(Math.random() * (config.play_max_y - config.play_min_y)) + config.play_min_y;

  let player = new Player({x:x, y:y, score:0, id:id, size: 64})
  console.log(player)

  return player;
}

// get direction
const getDir = (keycode) => {
  if (keycode === 37 || keycode === 65) return 'left';
  if (keycode === 38 || keycode === 87) return 'up';
  if (keycode === 39 || keycode === 68) return 'right';
  if (keycode === 40 || keycode === 83) return 'down';
}

// if player still within range, return true
const withinRange = (dir, player) => {
  switch (dir){
    case 'up':
      if (player.y > config.play_min_y) return true;
      break;
    case 'down':
      if (player.y < config.play_max_y) return true;
      break;
    case 'left':
      if (player.x > config.play_min_x) return true;
      break;
    case 'right':
      if (player.x < config.play_max_x) return true;
      break;
    default:
      return false;
  }
}