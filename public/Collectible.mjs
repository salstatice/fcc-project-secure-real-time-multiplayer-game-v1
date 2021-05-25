class Collectible {
  constructor({x, y, w, h, value, id}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = value;
    this.id = id;
    this.renew = false; 
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
