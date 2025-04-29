let ship;
let meteors = [];
let bullets = [];
let explosionSound;
let laserSound;
let gameOver = false;
let score = 0;

function preload() {
  laserSound = loadSound("laser.mp3");
  explosionSound = loadSound("explosion.mp3");
}

function setup() {
  createCanvas(400, 600);
  resetGame();
}

function resetGame() {
  ship = new Ship();
  meteors = [];
  bullets = [];
  gameOver = false;
  score = 0;

  for (let i = 0; i < 5; i++) {
    meteors.push(new Meteor());
  }
}

function draw() {
  background(0);

  if (gameOver) {
    fill(255, 0, 0);
    textSize(36);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2);
    textSize(20);
    text("Score: " + score, width / 2, height / 2 + 40);
    textSize(16);
    text("Pressione ESPAÇO ou Toque para recomeçar", width / 2, height / 2 + 80);
    return;
  }

  ship.show();
  ship.update();

  for (let m of meteors) {
    m.move();
    m.show();

    if (m.hits(ship)) {
      gameOver = true;
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.move();
    b.show();

    for (let j = meteors.length - 1; j >= 0; j--) {
      if (b.hits(meteors[j])) {
        explosionSound.play();
        // Pontuação adaptativa
        let pontos = round((6 - meteors[j].speed) + (40 - meteors[j].r) / 5);
        score += pontos;

        // Dificuldade progressiva
        if (score % 10 === 0) {
          for (let m of meteors) {
            m.speed += 0.3;
          }
        }

        meteors.splice(j, 1);
        meteors.push(new Meteor());
        bullets.splice(i, 1);
        break;
      }
    }
  }

  fill(255);
  textSize(16);
  text("Score: " + score, 10, 20);
}

function keyPressed() {
  if (gameOver && key === ' ') {
    resetGame();
    return;
  }
  
  if (keyCode === RIGHT_ARROW) {
    ship.move(1);
  } else if (keyCode === LEFT_ARROW) {
    ship.move(-1);
  } else if (key === ' ') {
    bullets.push(new Bullet(ship.x, ship.y));
    if (laserSound) laserSound.play();
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    ship.move(0);
  }
}

function touchStarted() {
  if (gameOver) {
    resetGame();
    return false;
  }
  
  for (let t of touches) {
    if (t.y < height / 3) {
      bullets.push(new Bullet(ship.x, ship.y));
      if (laserSound) laserSound.play();
    } else if (t.x < width / 2) {
      ship.move(-1);
    } else {
      ship.move(1);
    }
  }
  return false;
}

function touchEnded() {
  ship.move(0);
}

// Classe da Nave
class Ship {
  constructor() {
    this.x = width / 2;
    this.y = height - 20;
    this.size = 20;
    this.direction = 0;
  }

  show() {
    fill(0, 255, 0);
    noStroke();
    triangle(this.x, this.y - this.size,
             this.x - this.size, this.y + this.size,
             this.x + this.size, this.y + this.size);
  }

  move(dir) {
    this.direction = dir;
  }

  update() {
    this.x += this.direction * 5;
    this.x = constrain(this.x, this.size, width - this.size);
  }
}

// Classe do Meteoro
class Meteor {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-100, -40);
    this.r = random(20, 40);
    this.speed = random(2, 5);
  }

  move() {
    this.y += this.speed;
    if (this.y > height + this.r) {
      this.reset();
    }
  }

  show() {
    fill(150);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }

  hits(ship) {
    let d = dist(this.x, this.y, ship.x, ship.y);
    return d < this.r + ship.size;
  }
}

// Classe do Tiro
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 5;
  }

  move() {
    this.y -= 7;
  }

  show() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }

  hits(meteor) {
    let d = dist(this.x, this.y, meteor.x, meteor.y);
    return d < this.r + meteor.r;
  }
}
