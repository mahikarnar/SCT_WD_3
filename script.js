class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' or 'pvc'
        this.scores = { X: 0, O: 0 };
        this.isComputerTurn = false;
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
        this.bindEvents();
    }
    
    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.gameStatus = document.getElementById('gameStatus');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.winnerModal = document.getElementById('winnerModal');
        this.winnerText = document.getElementById('winnerText');
        this.playerOName = document.getElementById('playerOName');
        
        this.updateDisplay();
    }
    
    bindEvents() {
        // Cell clicks
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        // Game mode buttons
        document.getElementById('pvpMode').addEventListener('click', () => this.setGameMode('pvp'));
        document.getElementById('pvcMode').addEventListener('click', () => this.setGameMode('pvc'));
        
        // Control buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetBoard());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        
        // Modal close on outside click
        this.winnerModal.addEventListener('click', (e) => {
            if (e.target === this.winnerModal) {
                this.closeModal();
            }
        });
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode === 'pvp' ? 'pvpMode' : 'pvcMode').classList.add('active');
        
        // Update player O name
        this.playerOName.textContent = mode === 'pvp' ? 'Player O' : 'Computer';
        
        this.newGame();
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.isComputerTurn) {
            return;
        }
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            setTimeout(() => this.computerMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateCell(index, player);
        
        if (this.checkWinner()) {
            this.endGame(player);
        } else if (this.board.every(cell => cell !== '')) {
            this.endGame('tie');
        } else {
            this.switchPlayer();
        }
    }
    
    updateCell(index, player) {
        const cell = this.cells[index];
        cell.textContent = player === 'X' ? '❌' : '⭕';
        cell.classList.add('taken');
        
        // Add animation
        cell.style.transform = 'scale(0)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 50);
        
        this.playSound('move');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    checkWinner() {
        return this.winningConditions.find(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return true;
            }
            return false;
        });
    }
    
    highlightWinningCells(condition) {
        condition.forEach(index => {
            this.cells[index].classList.add('winning');
        });
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result === 'tie') {
            this.gameStatus.textContent = "It's a tie! 🤝";
            this.showModal("It's a Tie! 🤝");
        } else {
            const winnerName = result === 'X' ? 'Player X' : 
                              (this.gameMode === 'pvc' ? 'Computer' : 'Player O');
            this.gameStatus.textContent = `${winnerName} wins! 🎉`;
            this.scores[result]++;
            this.updateScores();
            this.showModal(`${winnerName} Wins! 🎉`);
            this.playSound('win');
        }
    }
    
    computerMove() {
        if (!this.gameActive) return;
        
        this.isComputerTurn = true;
        this.gameStatus.textContent = "Computer is thinking... 🤖";
        
        // Add thinking animation to a random empty cell
        const emptyCells = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        if (emptyCells.length > 0) {
            const thinkingCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.cells[thinkingCell].classList.add('thinking');
            
            setTimeout(() => {
                this.cells[thinkingCell].classList.remove('thinking');
                const move = this.getBestMove();
                this.isComputerTurn = false;
                this.makeMove(move, 'O');
            }, 1000);
        }
    }
    
    getBestMove() {
        // Check if computer can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Check if computer needs to block player
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') {
            return 4;
        }
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available spot
        const availableSpots = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }
    
    showModal(message) {
        this.winnerText.textContent = message;
        this.winnerModal.style.display = 'block';
        
        // Add entrance animation
        const modalContent = this.winnerModal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.8)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }, 50);
    }
    
    closeModal() {
        this.winnerModal.style.display = 'none';
    }
    
    playAgain() {
        this.closeModal();
        this.resetBoard();
    }
    
    resetBoard() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isComputerTurn = false;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'winning', 'thinking');
            cell.style.transform = '';
        });
        
        this.updateDisplay();
        this.playSound('reset');
    }
    
    newGame() {
        this.resetBoard();
        this.scores = { X: 0, O: 0 };
        this.updateScores();
    }
    
    updateDisplay() {
        const playerName = this.currentPlayer === 'X' ? 'Player X' : 
                          (this.gameMode === 'pvc' ? 'Computer' : 'Player O');
        this.turnIndicator.textContent = `${playerName}'s Turn`;
        this.gameStatus.textContent = "Make your move!";
        
        // Add turn indicator animation
        this.turnIndicator.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.turnIndicator.style.transform = 'scale(1)';
        }, 200);
    }
    
    updateScores() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        
        // Add score update animation
        [this.scoreX, this.scoreO].forEach(scoreElement => {
            scoreElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
            }, 300);
        });
    }
    
    playSound(type) {
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let frequency;
            
            switch (type) {
                case 'move':
                    frequency = 440; // A note
                    break;
                case 'win':
                    frequency = 880; // Higher A note
                    break;
                case 'reset':
                    frequency = 220; // Lower A note
                    break;
                default:
                    return;
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Fallback for browsers that don't support Web Audio API
            console.log(`Sound: ${type}`);
        }
    }
}

// Particle system for background effects
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        document.body.appendChild(this.canvas);
        
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Enhanced game initialization with loading animation
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.classList.add('loading');
    
    setTimeout(() => {
        document.body.classList.remove('loading');
        
        // Initialize game
        const game = new TicTacToeGame();
        
        // Initialize particle system
        new ParticleSystem();
        
        // Add welcome message
        setTimeout(() => {
            const gameStatus = document.getElementById('gameStatus');
            gameStatus.textContent = "Welcome! Choose your game mode and start playing!";
        }, 500);
        
    }, 1000);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'R' to reset
    if (e.key.toLowerCase() === 'r') {
        document.getElementById('resetBtn').click();
    }
    
    // Press 'N' for new game
    if (e.key.toLowerCase() === 'n') {
        document.getElementById('newGameBtn').click();
    }
    
    // Press '1' for PvP mode
    if (e.key === '1') {
        document.getElementById('pvpMode').click();
    }
    
    // Press '2' for PvC mode
    if (e.key === '2') {
        document.getElementById('pvcMode').click();
    }
    
    // Press Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('winnerModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// Add touch support for mobile devices
let touchStartTime = 0;

document.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
});

document.addEventListener('touchend', (e) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Prevent accidental clicks (too short or too long touches)
    if (touchDuration < 50 || touchDuration > 500) {
        e.preventDefault();
        return false;
    }
});

// Add visual feedback for button interactions
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('mouseup', () => {
        button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
});

// Performance optimization: Reduce animations on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
}

// Add theme persistence
const savedTheme = localStorage.getItem('tic-tac-toe-theme');
if (savedTheme) {
    document.body.classList.add(savedTheme);
}

// Export for potential future enhancements
window.TicTacToeGame = TicTacToeGame;