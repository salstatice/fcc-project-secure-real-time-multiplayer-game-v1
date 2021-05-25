class Player {
  constructor({x, y, score, id, size}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.size = size;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
    }
    return this;
  }

  collision(item) {
    if ((this.x > item.x - this.size / 2) && (this.x < item.x + this.size / 2) &&
      (this.y > item.y - this.size / 2) && (this.y < item.y + this.size / 2))
      return true
  }

  calculateRank(arr) {
    let score = arr.map(x => x.score);
    score.sort((a,b) => b - a);
    let rank = score.indexOf(this.score) + 1 ;
    let result = 'Rank: ' + rank + '/' + score.length;
    return result
  }
}

export default Player;
