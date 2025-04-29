let ship;
let meteors = [];
let bullets = [];
let explosionSound;
let laserSound;
let meteorImage;
let spaceshipImage;
let explosionImage;
let explosions = [];
let gameOver = false;
let gameStarted = false;
let score = 0;
let lastScoreForExtraMeteor = 0;
let stars = [];
let isMobile = false;
let mobileFactor = 1;

function preload() {
  laserSound = loadSound("laser.mp3");
  explosionSound = loadSound("explosion.mp3");
  meteorImage = loadImage("meteoro.png");
  spaceshipImage = loadImage("spaceship.png");
  explosionImage = loadImage("explode.png"); // Nova imagem de explosão
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  isMobile = /Mobi/.test(navigator.userAgent);
  mobileFactor = isMobile ? 1.7 : 1;

  ship = new Ship();

  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(0.5, 2),
      brightness: random(150, 255)
    });
  }

  for (let i = 0; i < 10; i++) {
    meteors.push(new Meteor());
  }
}

function draw() {
  background(0);

  for (let star of stars) {
    fill(star.brightness);
    noStroke();
    ellipse(star.x, star.y, star.r * 2);
    star.y += star.r * 0.2;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }

  if (!gameStarted) {
    fill(255);
    textAlign(CENTER);
    textSize(28);
    text("Clique para iniciar", width / 2, height / 2 - 60);
    textSize(16);
    text("📱 Celular: Toque no centro da tela para atirar.\nToque nos lados para mover", width / 2, height / 2);
    text("⌨️ PC: Setas para mover, espaço para atirar", width / 2, height / 2 + 60);
    return;
  }

  if (gameOver) {
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(36);
    text("Game Over", width / 2, height / 2);
    fill(255);
    textSize(16);
    text("Clique para recomeçar", width / 2, height / 2 + 40);
    text("Score: " + score, width / 2, height / 2 + 70);
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

        // cria uma explosão
        explosions.push(new Explosion(meteors[j].x, meteors[j].y));

        let pontos = round((6 - meteors[j].speed) + (40 - meteors[j].r) / 5);
        score += pontos;

        if (score % 10 === 0) {
          for (let m of meteors) {
            m.speed = min(m.speed + 0.3, 12);
          }
        }

        if (score - lastScoreForExtraMeteor >= 15) {
          meteors.push(new Meteor(true));
          lastScoreForExtraMeteor = score;
        }

        meteors.splice(j, 1);
        meteors.push(new Meteor());
        bullets.splice(i, 1);
        break;
      }
    }
  }

  // mostra e atualiza explosões
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].show();
    explosions[i].update();
    if (explosions[i].finished()) {
      explosions.splice(i, 1);
    }
  }

  fill(255);
  textSize(16);
  text("Score: " + score, 10, 20);
}

function keyPressed() {
  if (!gameStarted && key === ' ') {
    startGame();
    return;
  }
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
  for (let t of touches) {
    if (!gameStarted) {
      startGame();
      return false;
    }

    if (gameOver) {
      resetGame();
      return false;
    }

    if (t.x < width * 0.25) {
      ship.move(-1);
    } else if (t.x > width * 0.75) {
      ship.move(1);
    } else {
      bullets.push(new Bullet(ship.x, ship.y));
      if (laserSound) laserSound.play();
    }
  }
  return false;
}

function touchEnded() {
  ship.move(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ship = new Ship();
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  bullets = [];
  meteors = [];
  lastScoreForExtraMeteor = 0;
  explosions = [];

  for (let i = 0; i < 10; i++) {
    meteors.push(new Meteor());
  }
  ship = new Ship();
}

function resetGame() {
  startGame();
}

// CLASSES

class Ship {
  constructor() {
    this.x = width / 2;
    this.y = height - 60;
    this.size = 40;
    this.direction = 0;
  }

  show() {
    imageMode(CENTER);
    image(spaceshipImage, this.x, this.y, this.size * 2, this.size * 2);
  }

  move(dir) {
    this.direction = dir;
  }

  update() {
    this.x += this.direction * 8;
    this.x = constrain(this.x, this.size, width - this.size);
  }
}

class Meteor {
  constructor(aimAtShip = false) {
    if (aimAtShip) {
      this.x = ship.x + random(-100, 100);
    } else {
      this.x = random(width);
    }
    this.y = random(-100, -40);
    this.r = random(20, 40) * mobileFactor;
    this.speed = random(3, 6) * mobileFactor;
  }

  move() {
    this.y += this.speed;
    if (this.y > height + this.r) {
      this.reset();
    }
  }

  reset() {
    this.x = random(width);
    this.y = random(-100, -40);
    this.r = random(20, 40) * mobileFactor;
    this.speed = random(3, 6) * mobileFactor;
  }

  show() {
    imageMode(CENTER);
    image(meteorImage, this.x, this.y, this.r * 2, this.r * 2);
  }

  hits(ship) {
    let d = dist(this.x, this.y, ship.x, ship.y);
    return d < this.r + ship.size * 0.7;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 5;
  }

  move() {
    this.y -= 10;
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

class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.timer = 15; // duração da explosão
  }

  show() {
    imageMode(CENTER);
    image(explosionImage, this.x, this.y, 60, 60);
  }

  update() {
    this.timer--;
  }

  finished() {
    return this.timer <= 0;
  }
}
