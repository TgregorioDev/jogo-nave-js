let canvas;

function setup() {
  // Cria um canvas que se adapta ao tamanho da janela, mas com limites
  let maxWidth = min(windowWidth, 400); // Largura máxima de 400px
  let maxHeight = min(windowHeight, 600); // Altura máxima de 600px
  
  canvas = createCanvas(maxWidth, maxHeight);
  canvas.style('width', '100%');
  canvas.style('height', 'auto');
  
  // Centraliza o canvas na página
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  
  // Restante do seu setup...
  ship = new Ship();
  
  for (let i = 0; i < 5; i++) {
    meteors.push(new Meteor());
  }
}

function windowResized() {
  // Redimensiona o canvas quando a janela muda de tamanho
  let maxWidth = min(windowWidth, 400);
  let maxHeight = min(windowHeight, 600);
  
  resizeCanvas(maxWidth, maxHeight);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}

// Modifique a classe Ship para usar posições relativas
class Ship {
  constructor() {
    this.x = width / 2;
    this.y = height - 20;
    this.size = width * 0.05; // Tamanho relativo à largura
    this.direction = 0;
  }
  // ... resto da classe
}

// Modifique a classe Meteor para tamanhos relativos
class Meteor {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(width);
    this.y = random(-100, -40);
    this.r = random(width * 0.05, width * 0.1); // Tamanho relativo
    this.speed = random(2, 5);
  }
  // ... resto da classe
}

// Modifique a classe Bullet
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = width * 0.0125; // Tamanho relativo
  }
  // ... resto da classe
}

// Atualize a função touchStarted para melhor resposta em mobile
function touchStarted() {
  if (gameOver) {
    resetGame();
    return false;
  }
  
  // Área maior para atirar (parte superior da tela)
  if (mouseY < height / 2) {
    bullets.push(new Bullet(ship.x, ship.y));
    if (laserSound) laserSound.play();
  } else if (mouseX < width / 2) {
    ship.move(-1);
  } else {
    ship.move(1);
  }
  return false;
}
