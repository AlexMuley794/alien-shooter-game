const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Ajustar el tamaño del canvas
canvas.width = 800;
canvas.height = 600;

// Estado del juego
let gamePaused = false;
let aliens = [];
let ship = { x: 100, y: canvas.height - 60, width: 50, height: 50, image: new Image() };
let score = 0;
let keys = { left: false, right: false };
let shots = [];  // Array para almacenar los disparos

// Cargar imágenes de la nave, los aliens y los disparos
const alienImage = new Image();
const shipImage = new Image();
const shotImage = new Image();

// Asignar las rutas correctas a las imágenes
shipImage.src = 'images/ship.png'; // Asegúrate de que la ruta sea correcta
alienImage.src = 'images/alien.png'; // Asegúrate de que la ruta sea correcta
shotImage.src = 'images/disparo.png'; // Asegúrate de que la ruta sea correcta

// Comprobar si las imágenes se cargaron correctamente
shipImage.onload = function() {
    console.log('Imagen de la nave cargada');
    initGame(); 
};
alienImage.onload = function() {
    console.log('Imagen de los aliens cargada');
};
shotImage.onload = function() {
    console.log('Imagen del disparo cargada');
};

// Inicializar los marcianos
function initAliens() {
    aliens = [];
    const rows = 3;  // Número de filas de aliens iniciales
    const cols = Math.floor(canvas.width / 60);  // Número de columnas de aliens (dependiendo del ancho del canvas)
    const gap = 60;  // Espacio entre los aliens

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            aliens.push({
                x: col * gap + 50,  // Distribuye los aliens horizontalmente
                y: row * gap + 50,  // Distribuye los aliens verticalmente
                width: 40,
                height: 40,
                alive: true,
                image: alienImage
            });
        }
    }
}

// Función para verificar colisiones
function checkCollision() {
    for (let i = 0; i < aliens.length; i++) {
        let alien = aliens[i];
        if (alien.alive &&
            alien.x < ship.x + ship.width &&
            alien.x + alien.width > ship.x &&
            alien.y < ship.y + ship.height &&
            alien.y + alien.height > ship.y) {
            gameOver(); // Termina el juego si hay colisión
            break;
        }
    }

    // Verificar si un disparo ha golpeado un alien
    for (let i = 0; i < shots.length; i++) {
        let shot = shots[i];
        for (let j = 0; j < aliens.length; j++) {
            let alien = aliens[j];
            if (alien.alive &&
                shot.x < alien.x + alien.width &&
                shot.x + shot.width > alien.x &&
                shot.y < alien.y + alien.height &&
                shot.y + shot.height > alien.y) {
                // El disparo ha golpeado un alien
                alien.alive = false;
                shots.splice(i, 1); // Elimina el disparo
                score += 10; // Incrementa la puntuación
                break;
            }
        }
    }
}

// Función para mostrar el mensaje de "Juego Terminado"
function gameOver() {
    gamePaused = true;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fondo semitransparente

    drawShip();
    drawAliens();

    ctx.fillStyle = "red";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("¡Juego Terminado!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Haz clic en 'Reiniciar' para volver a jugar.", canvas.width / 2, canvas.height / 2 + 20);
}

// Función para reiniciar el juego
function restartGame() {
    gamePaused = false;
    aliens = [];
    shots = []; // Reinicia los disparos
    ship = { x: 100, y: canvas.height - 60, width: 50, height: 50, image: shipImage };
    score = 0;
    scoreElement.textContent = "Puntuación: 0";

    initAliens(); // Inicializa los marcianos
    update(); // Vuelve a iniciar el ciclo de actualización
}

// Función para actualizar el juego
function update() {
    if (gamePaused) return; // No actualices si el juego está pausado

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas

    drawShip();
    drawAliens();
    drawShots(); // Dibuja los disparos
    moveShip();
    moveAliens();
    moveShots(); // Mueve los disparos
    checkCollision();
    drawScore();
    requestAnimationFrame(update); // Llama a la siguiente actualización
}

// Función para dibujar la nave
function drawShip() {
    ctx.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
}

// Función para dibujar los marcianos
function drawAliens() {
    aliens.forEach(alien => {
        if (alien.alive) {
            ctx.drawImage(alien.image, alien.x, alien.y, alien.width, alien.height);
        }
    });
}

// Función para dibujar los disparos
function drawShots() {
    shots.forEach(shot => {
        ctx.drawImage(shotImage, shot.x, shot.y, shot.width, shot.height);
    });
}

// Función para mover los disparos
function moveShots() {
    shots.forEach((shot, index) => {
        shot.y -= shot.speed;  // Los disparos se mueven hacia arriba

        // Elimina los disparos que han salido de la pantalla
        if (shot.y + shot.height < 0) {
            shots.splice(index, 1); // Elimina el disparo
        }
    });
}

// Función para dibujar la puntuación
function drawScore() {
    scoreElement.textContent = "Puntuación: " + score; // Actualiza la puntuación en el HTML
}

// Función para mover la nave
function moveShip() {
    if (keys.left && ship.x > 0) {
        ship.x -= 5;
    }
    if (keys.right && ship.x < canvas.width - ship.width) {
        ship.x += 5;
    }
}

// Función para mover los marcianos
function moveAliens() {
    let moveDown = false;

    aliens.forEach(alien => {
        alien.y += 1;  // Los marcianos caen hacia abajo
        if (alien.y >= canvas.height) {
            alien.y = 0;  // Si el alien llega al fondo, vuelve a la parte superior

            // Agregar nuevas filas de aliens al llegar al fondo
            const cols = Math.floor(canvas.width / 60);  // Número de columnas para la nueva fila
            const gap = 60;  // Espacio entre los aliens

            // Crear nueva fila de aliens
            for (let col = 0; col < cols; col++) {
                aliens.push({
                    x: col * gap + 50,  // Nueva posición horizontal de los aliens
                    y: -40,  // Inicia fuera de la pantalla, para que bajen desde arriba
                    width: 40,
                    height: 40,
                    alive: true,
                    image: alienImage
                });
            }
        }
    });
}

// Función para capturar las teclas
window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft") {
        keys.left = true;
    } else if (e.key === "ArrowRight") {
        keys.right = true;
    } else if (e.key === " " || e.key === "ArrowUp") {  // Tecla de disparo (espacio o flecha arriba)
        createShot();  // Crear un disparo
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === "ArrowLeft") {
        keys.left = false;
    } else if (e.key === "ArrowRight") {
        keys.right = false;
    }
});

// Crear un disparo
function createShot() {
    const shot = {
        x: ship.x + ship.width / 2 - 5,  // Posición X: centro de la nave
        y: ship.y,  // Posición Y: justo arriba de la nave
        width: 10,
        height: 20,
        speed: 5  // Velocidad del disparo
    };
    shots.push(shot);  // Agrega el disparo al array
}

// Inicializa los marcianos y empieza el juego
initAliens();
update();

// Event listeners para los botones
document.getElementById('pauseButton').addEventListener('click', () => {
    gamePaused = !gamePaused; // Pausar o reanudar el juego
    const pauseButton = document.getElementById('pauseButton');
    if (gamePaused) {
        pauseButton.textContent = "Reanudar"; // Cambiar el texto a "Reanudar"
    } else {
        pauseButton.textContent = "Pausar"; // Cambiar el texto a "Pausar"
    }
});

document.getElementById('restartButton').addEventListener('click', restartGame); // Reiniciar el juego
