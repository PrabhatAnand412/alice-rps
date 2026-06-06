(() => {
    const MOVES = ["Rock", "Paper", "Scissors"];
    const HAND_SIGNS = { "Rock": "✊", "Paper": "✋", "Scissors": "✌️" };
    
    // Updated Alice's Taunts
    const BOT_TAUNTS = [
        "Alice says: 'Too easy!'",
        "Alice says: 'Better luck next time.'",
        "Alice says: 'I read your mind!'",
        "Alice says: 'Calculated.'",
        "Alice says: 'Is that all you got?'",
        "Alice says: 'Not even close!'" 
    ];

    const gameState = { playerScore: 0, botScore: 0, isAnimating: false };

    const DOM = {
        playerScore: document.getElementById('player-score'),
        botScore: document.getElementById('bot-score'),
        playerChoice: document.getElementById('player-choice'),
        botChoice: document.getElementById('bot-choice'),
        resultMsg: document.getElementById('result-message'),
        controls: document.getElementById('controls-container'),
        buttons: document.querySelectorAll('.action-btn'),
        resetBtn: document.getElementById('reset-btn')
    };

    // --- AUDIO SYNTHESIZER ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playTone = (frequency, type = 'sine', duration = 0.1, vol = 0.1) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        oscillator.stop(audioCtx.currentTime + duration);
    };

    // --- GAME LOGIC ---
    DOM.controls.addEventListener('click', (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn || gameState.isAnimating) return; 
        
        if (navigator.vibrate) navigator.vibrate(50);
        playTone(400, 'sine', 0.1, 0.05); 
        
        playRound(btn.dataset.move);
    });

    const playRound = (playerMove) => {
        gameState.isAnimating = true;
        toggleButtons(true);
        clearGlows();
        
        const botMove = MOVES[Math.floor(Math.random() * MOVES.length)];
        
        updateUI('✊', '✊', "Wait for it...", "#94a3b8");
        DOM.playerChoice.className = 'choice-display shake-anim';
        DOM.botChoice.className = 'choice-display shake-anim-bot';

        setTimeout(() => {
            DOM.playerChoice.className = 'choice-display pop-anim';
            DOM.botChoice.className = 'choice-display pop-anim-bot';
            
            updateUI(HAND_SIGNS[playerMove], HAND_SIGNS[botMove]);
            resolveWinner(playerMove, botMove);
        }, 1500);
    };

    const resolveWinner = (player, bot) => {
        if (player === bot) {
            updateText(DOM.resultMsg, "It's a draw!", "#94a3b8");
            playTone(300, 'triangle', 0.3);
            endRound();
        } else if (
            (player === "Rock" && bot === "Scissors") ||
            (player === "Paper" && bot === "Rock") ||
            (player === "Scissors" && bot === "Paper")
        ) {
            gameState.playerScore++;
            updateText(DOM.resultMsg, `You win! ${player} beats ${bot}.`, "#22c55e");
            DOM.playerChoice.classList.add('winner-glow');
            
            playTone(600, 'sine', 0.4, 0.2); 
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
            
            endRound();
        } else {
            gameState.botScore++;
            DOM.botChoice.classList.add('loser-glow');
            
            playTone(150, 'sawtooth', 0.5, 0.1); 
            if (navigator.vibrate) navigator.vibrate(300); 
            
            const randomTaunt = BOT_TAUNTS[Math.floor(Math.random() * BOT_TAUNTS.length)];
            
            // Updated text to announce Alice as the winner
            updateText(DOM.resultMsg, `Alice wins! ${bot} beats ${player}. ${randomTaunt}`, "#ef4444");
            
            endRound();
        }
    };

    const endRound = () => {
        DOM.playerScore.textContent = gameState.playerScore;
        DOM.botScore.textContent = gameState.botScore;
        gameState.isAnimating = false;
        toggleButtons(false);
    };

    // --- UTILITIES ---
    const toggleButtons = (disabled) => DOM.buttons.forEach(btn => btn.disabled = disabled);
    const clearGlows = () => {
        DOM.playerChoice.classList.remove('winner-glow', 'loser-glow');
        DOM.botChoice.classList.remove('winner-glow', 'loser-glow');
    };

    const updateUI = (playerSign, botSign, msg = null, color = null) => {
        DOM.playerChoice.textContent = playerSign;
        DOM.botChoice.textContent = botSign;
        if (msg) updateText(DOM.resultMsg, msg, color);
    };

    const updateText = (element, text, color) => {
        element.textContent = text;
        element.style.color = color;
    };

    DOM.resetBtn.addEventListener('click', () => {
        if (gameState.isAnimating) return;
        gameState.playerScore = 0;
        gameState.botScore = 0;
        DOM.playerScore.textContent = '0';
        DOM.botScore.textContent = '0';
        clearGlows();
        updateUI('✊', '✊', 'Choose your hand sign!', 'var(--primary-blue)');
        DOM.playerChoice.className = 'choice-display';
        DOM.botChoice.className = 'choice-display';
    });
})();