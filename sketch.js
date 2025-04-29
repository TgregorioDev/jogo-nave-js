let ship;
let meteors = [];
let bullets = [];
let explosionSound;
let laserSound;
let meteorImage;
let spaceshipImage;
let explosionImage;
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
  explosionImage = loadImage("explode.png"); // nova imagem de explosão
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  isMobile = /Mobi/.test(navigator.userAgent);
  mobileFactor = isMobile ? 1.5 : 1;

  ship = new Ship();

  for (let i = 0; i < 200; i++) {
    stars.push({ x: random(width), y: random(height), r: random(0.5, 2), brightness: random(150, 255) });
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
    showInstructions();
    return;
  }

  if (gameOver) {
    fill(255, 0, 0);
    textSize(36);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2);
    fill(255);
    textSize(16);
    text("Toque ou pressione ESPAÇO para recomeçar", width / 2, height / 2 + 40);
    text("Score: " + score, width / 2, height / 2 + 70);
    return;
  }

  ship.show();
  ship.update();

  // Mostrar e atualizar meteoros
  for (let i = meteors.length - 1; i >= 0; i--) {
    let m = meteors[i];
    m.move();
    m.show();

    if (m.exploding) {
      m.explosionTimer--;
      if (m.explosionTimer <= 0) {
        meteors.splice(i, 1);
        meteors.push(new Meteor());
      }
      continue;
    }

    if (m.hits(ship)) {
      gameOver = true;
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.move();
    b.show();

    for (let j = meteors.length - 1; j >= 0; j--) {
      let m = meteors[j];
      if (!m.exploding && b.hits(m)) {
        explosionSound.play();

        m.exploding = true;
        m.explosionTimer = 15; // ~0.25 segundos
        m.speed = 0;

        score += 10;

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
  if (!gameStarted && key === ' ') return startGame();
  if (gameOver && key === ' ') return resetGame();

  if (keyCode === RIGHT_ARROW) ship.move(1);
  else if (keyCode === LEFT_ARROW) ship.move(-1);
  else if (key === ' ') shoot();
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) ship.move(0);
}

function touchStarted() {
  for (let t of touches) {
    if (!gameStarted) return startGame();
    if (gameOver) return resetGame();

    if (t.x < width * 0.25) ship.move(-1);
    else if (t.x > width * 0.75) ship.move(1);
    else shoot();
  }
  return false;
}

function touchEnded() {
  ship.move(0);
}

function shoot() {
  bullets.push(new Bullet(ship.x, ship.y));
  if (laserSound) laserSound.play();
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  bullets = [];
  meteors = [];
  lastScoreForExtraMeteor = 0;

  for (let i = 0; i < 10; i++) {
    meteors.push(new Meteor());
  }
  ship = new Ship();
}

function resetGame() {
  startGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function showInstructions() {
  fill(255);
  textAlign(CENTER);
  textSize(28);
  text("Toque na tela ou pressione ESPAÇO para iniciar", width / 2, height / 2 - 60);
  textSize(18);
  text("📱 No celular:", width / 2, height / 2);
  text("Toque no meio para atirar", width / 2, height / 2 + 25);
  text("Toque nas laterais para mover", width / 2, height / 2 + 45);
  text("⌨️ No teclado:", width / 2, height / 2 + 80);
  text("Setas ⬅️ ➡️ para mover", width / 2, height / 2 + 100);
  text("Barra de espaço para atirar", width / 2, height / 2 + 120);
}

// ==== CLASSES ====

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
    this.x += this.direction * 7;
    this.x = constrain(this.x, this.size, width - this.size);
  }
}

class Meteor {
  constructor() {
    this.x = random(width);
    this.y = random(-100, -40);
    this.r = random(20, 40) * mobileFactor;
    this.speed = random(3, 6) * mobileFactor;
    this.exploding = false;
    this.explosionTimer = 0;
  }

  move() {
    if (!this.exploding) this.y += this.speed;
    if (this.y > height + this.r) this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-100, -40);
    this.r = random(20, 40) * mobileFactor;
    this.speed = random(3, 6) * mobileFactor;
    this.exploding = false;
    this.explosionTimer = 0;
  }

  show() {
    imageMode(CENTER);
    if (this.exploding) {
      image(explosionImage, this.x, this.y, this.r * 2, this.r * 2);
    } else {
      image(meteorImage, this.x, this.y, this.r * 2, this.r * 2);
    }
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
    this.y -= 9;
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
