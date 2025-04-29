let ship;
let meteors = [];
let bullets = [];
let explosionSound;
let laserSound;
let meteorImage;
let spaceshipImage;
let gameOver = false;
let gameStarted = false;
let score = 0;
let lastScoreForExtraMeteor = 0;
let stars = [];
let isMobile = false;
let mobileMeteorFactor = 1;

function preload() {
  laserSound = loadSound("laser.mp3");
  explosionSound = loadSound("explosion.mp3");
  meteorImage = loadImage("meteoro.png");
  spaceshipImage = loadImage("spaceship.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  isMobile = /Mobi/.test(navigator.userAgent);
  mobileMeteorFactor = isMobile ? 1.8 : 1;

  ship = new Ship();

  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      r: random(0.5, 2),
      brightness: random(150, 255)
    });
  }

  for (let i = 0; i < 5; i++) {
    meteors.push(new Meteor());
  }
}

function draw() {
  background(0);

  for (let star of stars) {
    fill(star.brightness);
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
    text("Clique na tela ou pressione ESPAÇO para iniciar", width / 2, height / 2 - 60);
    textSize(18);
    text("📱 Controles no Celular:", width / 2, height / 2);
    text("Toque na parte de cima da tela para atirar", width / 2, height / 2 + 25);
    text("Toque no lado esquerdo para mover à esquerda", width / 2, height / 2 + 45);
    text("Toque no lado direito para mover à direita", width / 2, height / 2 + 65);
    text("⌨️ Controles no Teclado:", width / 2, height / 2 + 100);
    text("Setas ⬅️ ➡️ para mover", width / 2, height / 2 + 120);
    text("Barra de espaço para atirar", width / 2, height / 2 + 140);
    return;
  }

  if (gameOver) {
    fill(255, 0, 0);
    textSize(36);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2);
    fill(255);
    textSize(16);
    text("Toque para atirar ou pressione ESPAÇO para recomeçar", width / 2, height / 2 + 40);
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

        let pontos = round((6 - meteors[j].speed) + (40 - meteors[j].r) / 5);
        score += pontos;

        if (score % 10 === 0) {
          for (let m of meteors) {
            m.speed = min(m.speed + 0.3, 10);
          }
        }

        if (score - lastScoreForExtraMeteor >= 15) {
          meteors.push(new Meteor(true));
          lastScoreForExtraMeteor = score;
        }

        meteors.splice(j, 1);
        meteors.push(new Meteor());
        bullets.splice(i, 1); // remove o tiro também
        break;
      }
    }

    // remove tiros fora da tela
    if (b.y < 0) {
      bullets.splice(i, 1);
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

    if (gameOver && t.y < height / 3) {
      resetGame();
      return false;
    }

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

  for (let i = 0; i < 5; i++) {
    meteors.push(new Meteor());
  }
  ship = new Ship();
}

function resetGame() {
  gameOver = false;
  score = 0;
  bullets = [];
  meteors = [];
  lastScoreForExtraMeteor = 0;

  for (let i = 0; i < 5; i++) {
    meteors.push(new Meteor());
  }
  ship = new Ship();
}

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
    const baseSpeed = isMobile ? 10 : 6;
    const extraSpeed = floor(score / 10);
    const speed = baseSpeed + extraSpeed;

    this.x += this.direction * speed;
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
    this.r = random(20, 40) * mobileMeteorFactor;
    this.speed = random(2, 5) * mobileMeteorFactor;
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
    this.r = random(20, 40) * mobileMeteorFactor;
    this.speed = random(2, 5) * mobileMeteorFactor;
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

    const baseSpeed = isMobile ? 15 : 7;
    const extraSpeed = floor(score / 15);
    this.speed = baseSpeed + extraSpeed;
  }

  move() {
    this.y -= this.speed;
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
