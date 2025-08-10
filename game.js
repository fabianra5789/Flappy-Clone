class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // Configuración del juego
        this.gravity = 0.6;
        this.jumpStrength = -12;
        this.pipeSpeed = 2;
        this.pipeGap = 200; // Aumentado de 150 a 200 para más espacio
        this.pipeWidth = 60;
        
        // Estado del juego
        this.gameRunning = false;
        this.gameStarted = false; // Nueva variable para controlar el inicio
        this.score = 0;
        
        // Pájaro
        this.bird = {
            x: 80,
            y: this.canvas.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            color: '#FFD700'
        };
        
        // Tubos
        this.pipes = [];
        this.pipeTimer = 0;
        
        // Eventos
        this.setupEvents();
        
        // Iniciar el juego
        this.reset();
        this.gameLoop();
    }
    
    setupEvents() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Eventos de mouse/touch
        this.canvas.addEventListener('click', () => {
            this.jump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
    }
    
    jump() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startGame();
        }
        if (this.gameRunning) {
            this.bird.velocity = this.jumpStrength;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOverElement.style.display = 'none';
    }
    
    reset() {
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.pipeTimer = 0;
        this.gameRunning = false;
        this.gameStarted = false; // Resetear también el estado de inicio
        this.gameOverElement.style.display = 'none'; // Ocultar modal de game over
        this.updateScore();
    }
    
    updateScore() {
        this.scoreElement.textContent = `Puntuación: ${this.score}`;
    }
    
    createPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.canvas.height - (topHeight + this.pipeGap),
            passed: false
        });
    }
    
    updateBird() {
        // Solo aplicar física si el juego ha comenzado
        if (!this.gameStarted) return;
        
        if (!this.gameRunning) return;
        
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // Verificar límites
        if (this.bird.y <= 0 || this.bird.y + this.bird.height >= this.canvas.height) {
            this.gameOver();
        }
    }
    
    updatePipes() {
        if (!this.gameRunning) return;
        
        // Crear nuevos tubos
        this.pipeTimer++;
        if (this.pipeTimer > 90) { // Cada ~1.5 segundos a 60fps
            this.createPipe();
            this.pipeTimer = 0;
        }
        
        // Mover tubos
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Verificar puntuación
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
            }
            
            // Eliminar tubos fuera de pantalla
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
            
            // Verificar colisiones
            if (this.checkCollision(pipe)) {
                this.gameOver();
            }
        }
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Verificar si el pájaro está en el rango horizontal del tubo
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Verificar colisión con tubo superior o inferior
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
    }
    
    drawBird() {
        this.ctx.fillStyle = this.bird.color;
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        
        // Dibujar ojo
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.bird.x + 20, this.bird.y + 5, 8, 8);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.bird.x + 22, this.bird.y + 7, 4, 4);
        
        // Dibujar pico
        this.ctx.fillStyle = '#FF6347';
        this.ctx.fillRect(this.bird.x + 30, this.bird.y + 12, 8, 6);
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        
        for (const pipe of this.pipes) {
            // Tubo superior
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Tubo inferior
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Bordes de los tubos
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
            this.ctx.fillStyle = '#228B22';
        }
    }
    
    drawBackground() {
        // Cielo
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nubes simples
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(120, 90, 40, 0, Math.PI * 2);
        this.ctx.arc(140, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(300, 150, 25, 0, Math.PI * 2);
        this.ctx.arc(315, 140, 35, 0, Math.PI * 2);
        this.ctx.arc(330, 150, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar elementos
        this.drawBackground();
        this.drawPipes();
        this.drawBird();
        
        // Mensaje de inicio - solo mostrar si el juego no ha comenzado
        if (!this.gameStarted && this.pipes.length === 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(50, 250, 300, 100);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('¡Presiona ESPACIO', 200, 280);
            this.ctx.fillText('o haz clic para empezar!', 200, 310);
            this.ctx.textAlign = 'left';
        }
    }
    
    gameLoop() {
        this.updateBird();
        this.updatePipes();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Función global para reiniciar el juego
function restartGame() {
    game.reset(); // Ahora reset() ya oculta el modal correctamente
}

// Inicializar el juego cuando se carga la página
let game;
window.addEventListener('load', () => {
    game = new FlappyBird();
});