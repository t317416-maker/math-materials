// ========================================
// 効果音システム (Web Audio API)
// ========================================

/**
 * Web Audio APIを使った効果音生成システム
 */
const SoundEffects = {
    audioContext: null,

    // Audio Contextの初期化
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    // 正解時の効果音（ピンポン音）
    playCorrect() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 高音（ピン）
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.value = 880; // A5
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc1.start(now);
        osc1.stop(now + 0.2);

        // 低音（ポン）
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 660; // E5
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.setValueAtTime(0.3, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);
    },

    // 不正解時の効果音（ブブー音）
    playIncorrect() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.value = 100;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    },

    // カード取得時の効果音（キラキラ音）
    playCardGet() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 上昇音階のキラキラ音
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C (high)
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    },

    // 駅到達時の効果音（ファンファーレ）
    playStationReached() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // ファンファーレのメロディー
        const melody = [
            { freq: 523, time: 0 },    // C
            { freq: 659, time: 0.15 },  // E
            { freq: 784, time: 0.3 },   // G
            { freq: 1047, time: 0.45 }  // C (high)
        ];

        melody.forEach((note) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = note.freq;
            const startTime = now + note.time;
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    },

    // タイマー警告音（カチカチ音）
    playTimerTick() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    },

    // ボタンクリック音
    playClick() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 300;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
    }
};

// ========================================
// ゲーム状態管理
// ========================================

/**
 * ゲームの状態を管理するオブジェクト
 */
const gameState = {
    // ゲーム設定
    numPlayers: 3,              // プレイヤー人数（デフォルト3人）
    maxTurns: 10,               // 最大ターン数
    stations: [-16, -8, 0, 8, 16],  // 駅の位置（固定）
    answerTimeLimit: 3,         // 回答時間制限（秒）

    // 現在の状態
    currentTurn: 1,             // 現在のターン（1〜10）
    currentPlayerIndex: 0,      // 現在のプレイヤーインデックス（0〜）
    currentStationIndex: 0,     // 現在の目的地駅のインデックス
    targetStation: -16,         // 目的地駅の位置

    // プレイヤーデータ
    players: [],                // プレイヤー配列（初期化時に作成）

    // ターン内の一時データ
    currentQuestion: null,      // 現在の問題
    currentAnswer: null,        // 正解の答え
    selectedAnswer: null,       // プレイヤーが選んだ答え
    moveDoubleActive: false,    // 移動数2倍フラグ
    pointDoubleActive: false,   // ポイント2倍フラグ

    // タイマー管理
    timerInterval: null,        // タイマーのインターバルID
    timeRemaining: 3,           // 残り時間

    // ゲームフェーズ
    phase: 'start'              // start, card, question, move, result, end
};

// ========================================
// 問題プール（答えの範囲: -10〜+10）
// ========================================

/**
 * 計算問題のプール（答えは-10〜+10の整数）
 */
const questionPool = [
    // 正負の数の加減（負の数を含む）
    { type: "addition", question: "3 + 2 = ?", correctAnswer: 5 },
    { type: "addition", question: "7 - 4 = ?", correctAnswer: 3 },
    { type: "addition", question: "-3 + 5 = ?", correctAnswer: 2 },
    { type: "addition", question: "2 - 5 = ?", correctAnswer: -3 },
    { type: "addition", question: "-4 + 2 = ?", correctAnswer: -2 },
    { type: "addition", question: "10 - 3 = ?", correctAnswer: 7 },
    { type: "addition", question: "-8 + 10 = ?", correctAnswer: 2 },
    { type: "addition", question: "5 - 10 = ?", correctAnswer: -5 },
    { type: "addition", question: "-6 + 4 = ?", correctAnswer: -2 },
    { type: "addition", question: "8 - 3 = ?", correctAnswer: 5 },
    { type: "addition", question: "-2 + 8 = ?", correctAnswer: 6 },
    { type: "addition", question: "1 - 9 = ?", correctAnswer: -8 },
    { type: "addition", question: "-10 + 5 = ?", correctAnswer: -5 },
    { type: "addition", question: "9 - 1 = ?", correctAnswer: 8 },
    { type: "addition", question: "-7 + 17 = ?", correctAnswer: 10 },

    // 一次方程式
    { type: "equation", question: "2x + 1 = 9, x = ?", correctAnswer: 4 },
    { type: "equation", question: "3x - 2 = 7, x = ?", correctAnswer: 3 },
    { type: "equation", question: "x + 5 = 6, x = ?", correctAnswer: 1 },
    { type: "equation", question: "4x - 3 = 17, x = ?", correctAnswer: 5 },
    { type: "equation", question: "2x + 3 = 7, x = ?", correctAnswer: 2 },
    { type: "equation", question: "3x + 1 = 10, x = ?", correctAnswer: 3 },
    { type: "equation", question: "5x - 4 = 21, x = ?", correctAnswer: 5 },
    { type: "equation", question: "2x - 1 = 1, x = ?", correctAnswer: 1 },
    { type: "equation", question: "4x + 2 = 18, x = ?", correctAnswer: 4 },
    { type: "equation", question: "3x - 1 = 5, x = ?", correctAnswer: 2 },
    { type: "equation", question: "2x + 5 = -1, x = ?", correctAnswer: -3 },
    { type: "equation", question: "x - 3 = -10, x = ?", correctAnswer: -7 },
    { type: "equation", question: "2x + 10 = 0, x = ?", correctAnswer: -5 },
    { type: "equation", question: "3x + 6 = -12, x = ?", correctAnswer: -6 },
    { type: "equation", question: "x + 8 = 0, x = ?", correctAnswer: -8 },

    // 素因数分解
    { type: "factorization", question: "18 = 2 × ?²", correctAnswer: 3 },
    { type: "factorization", question: "12 = ? × 3", correctAnswer: 4 },
    { type: "factorization", question: "50 = ? × 25", correctAnswer: 2 },
    { type: "factorization", question: "20 = ? × 5", correctAnswer: 4 },
    { type: "factorization", question: "32 = 2 × ?²", correctAnswer: 4 },
    { type: "factorization", question: "45 = 5 × ?²", correctAnswer: 3 },
    { type: "factorization", question: "8 = ? × 4", correctAnswer: 2 },
    { type: "factorization", question: "27 = 3 × ?²", correctAnswer: 3 },
    { type: "factorization", question: "10 = ? × 2", correctAnswer: 5 },
    { type: "factorization", question: "24 = ? × 6", correctAnswer: 4 },
    { type: "factorization", question: "36 = 4 × ?²", correctAnswer: 3 },
    { type: "factorization", question: "60 = ? × 10", correctAnswer: 6 },
    { type: "factorization", question: "48 = ? × 8", correctAnswer: 6 },
    { type: "factorization", question: "72 = ? × 9", correctAnswer: 8 },
    { type: "factorization", question: "100 = ? × 10", correctAnswer: 10 }
];

// ========================================
// カード定義
// ========================================

/**
 * カードの種類と効果を定義
 */
const cardDefinitions = {
    "ランダムぶっとび": {
        description: "-2〜+4マスのランダム移動",
        probability: 0.25,  // 25%
        effect: function(player) {
            const move = Math.floor(Math.random() * 7) - 2;
            const oldPos = player.position;
            player.position += move;
            player.position = Math.max(-20, Math.min(20, player.position));
            const actualMove = player.position - oldPos;
            return `${actualMove >= 0 ? '+' : ''}${actualMove}マス移動しました!`;
        }
    },
    "移動数2倍": {
        description: "次の移動距離が2倍",
        probability: 0.30,  // 30%
        effect: function(player) {
            gameState.moveDoubleActive = true;
            return "次の移動が2倍になります!";
        }
    },
    "ワープ": {
        description: "目的地まで75%接近",
        probability: 0.25,  // 25%
        effect: function(player) {
            const distance = gameState.targetStation - player.position;
            const move = Math.floor(distance * 0.75);
            const oldPos = player.position;
            player.position += move;
            player.position = Math.max(-20, Math.min(20, player.position));
            const actualMove = player.position - oldPos;
            return `目的地に向かって${Math.abs(actualMove)}マス移動しました!`;
        }
    },
    "位置交換": {
        description: "目的地に最も近い相手と位置交換",
        probability: 0.10,  // 10%
        effect: function(player) {
            const others = gameState.players.filter(p => p.id !== player.id);
            if (others.length === 0) return "交換できる相手がいません";

            const nearest = others.reduce((prev, curr) => {
                const prevDist = Math.abs(prev.position - gameState.targetStation);
                const currDist = Math.abs(curr.position - gameState.targetStation);
                return currDist < prevDist ? curr : prev;
            });

            const temp = player.position;
            player.position = nearest.position;
            nearest.position = temp;
            return `${nearest.name}と位置を交換しました!`;
        }
    },
    "ポイント2倍": {
        description: "次のポイントが2倍",
        probability: 0.10,  // 10%
        effect: function(player) {
            gameState.pointDoubleActive = true;
            return "次のポイントが2倍になります!";
        }
    }
};

// ========================================
// ゲーム初期化
// ========================================

/**
 * ゲームを初期化する
 * @param {number} numPlayers - プレイヤー人数（2〜4）
 */
function initializeGame(numPlayers = 3) {
    gameState.numPlayers = numPlayers;
    gameState.currentTurn = 1;
    gameState.currentPlayerIndex = 0;
    gameState.currentStationIndex = 0;
    gameState.targetStation = gameState.stations[0];
    gameState.phase = 'card';

    // 共通エリアを非表示
    const commonArea = document.getElementById('common-game-area');
    commonArea.classList.remove('active');

    // プレイヤー配列を作成
    const colors = ["#FF6B6B", "#4ECDC4", "#95E77D", "#FFE66D"];
    const markers = ["🔴", "🔵", "🟢", "🟡"];
    gameState.players = [];

    for (let i = 0; i < numPlayers; i++) {
        gameState.players.push({
            id: i,
            name: `プレイヤー${i + 1}`,
            position: 0,
            score: 0,
            cards: [],
            color: colors[i],
            marker: markers[i]
        });
    }

    updateAllUI();
    startTurn();
}

/**
 * ターンを開始する
 */
function startTurn() {
    const player = getCurrentPlayer();

    // カード獲得判定（30%の確率）
    if (Math.random() < 0.3) {
        const card = drawRandomCard();
        player.cards.push(card);

        // カード獲得エフェクト
        showCardAcquiredEffect(card);

        setTimeout(() => {
            gameState.phase = 'card';
            updateAllUI();
            showCardPhase();
        }, 2000);
    } else {
        gameState.phase = 'card';
        updateAllUI();
        showCardPhase();
    }
}

/**
 * カード獲得エフェクトを表示
 * @param {string} cardName - カード名
 */
function showCardAcquiredEffect(cardName) {
    const player = getCurrentPlayer();
    const playerGameSpace = document.getElementById(`game-space-${gameState.currentPlayerIndex}`);

    SoundEffects.playCardGet(); // カード取得音を再生

    let html = '<div class="card-acquired-effect">';
    html += '<div class="sparkle">✨</div>';
    html += `<h2 style="font-size: 18px; margin: 10px 0;">カード獲得!</h2>`;
    html += `<div style="background: linear-gradient(135deg, #fff9e6 0%, #ffe6b3 100%); border: 3px solid #ffd700; border-radius: 12px; padding: 15px; margin: 10px 0;">`;
    html += `<div style="font-size: 16px; font-weight: bold; color: #d4a017; margin-bottom: 5px;">${cardName}</div>`;
    html += `<div style="font-size: 12px; color: #666;">${cardDefinitions[cardName].description}</div>`;
    html += `</div>`;
    html += '<div class="sparkle">✨</div>';
    html += '</div>';

    playerGameSpace.innerHTML = html;
}

/**
 * ランダムにカードを1枚引く
 * @returns {string} カード名
 */
function drawRandomCard() {
    const cards = Object.keys(cardDefinitions);
    const probabilities = cards.map(name => cardDefinitions[name].probability);
    const total = probabilities.reduce((sum, p) => sum + p, 0);

    let random = Math.random() * total;
    for (let i = 0; i < cards.length; i++) {
        random -= probabilities[i];
        if (random <= 0) {
            return cards[i];
        }
    }
    return cards[0];
}

/**
 * 現在のプレイヤーを取得
 * @returns {Object} プレイヤーオブジェクト
 */
function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

// ========================================
// カードフェーズ
// ========================================

/**
 * カード使用フェーズの画面を表示
 */
function showCardPhase() {
    const player = getCurrentPlayer();
    const playerGameSpace = document.getElementById(`game-space-${gameState.currentPlayerIndex}`);

    if (player.cards.length === 0) {
        setTimeout(() => {
            showQuestionPhase();
        }, 500);
        return;
    }

    // プレイヤー2（下側）は横並び、それ以外は縦並び
    const isPlayerBottom = gameState.currentPlayerIndex === 1;
    const cardsStyle = isPlayerBottom
        ? 'display: flex; flex-direction: row; gap: 8px; flex-wrap: wrap; justify-content: center;'
        : 'display: flex; flex-direction: column; gap: 8px;';

    let html = '<h3 style="font-size: 16px; margin-bottom: 10px;">🎴 カードを使用しますか？</h3>';
    html += `<div style="${cardsStyle}">`;

    player.cards.forEach((cardName, index) => {
        const card = cardDefinitions[cardName];
        html += `
            <button class="btn btn-warning" style="padding: 10px; font-size: 14px;" onclick="useCard(${index})">
                <div style="font-weight: bold;">${cardName}</div>
                <div style="font-size: 11px; font-weight: normal;">${card.description}</div>
            </button>
        `;
    });

    html += '</div>';
    html += '<button class="btn btn-secondary" style="margin-top: 10px; padding: 10px; font-size: 14px;" onclick="skipCard()">使わない</button>';

    playerGameSpace.innerHTML = html;
}

/**
 * カードを使用する
 * @param {number} cardIndex - カードのインデックス
 */
function useCard(cardIndex) {
    const player = getCurrentPlayer();
    const cardName = player.cards[cardIndex];
    const card = cardDefinitions[cardName];

    const message = card.effect(player);
    player.cards.splice(cardIndex, 1);

    showMessage(`「${cardName}」を使用! ${message}`, 'success');
    updateAllUI();

    setTimeout(() => {
        showQuestionPhase();
    }, 2000);
}

/**
 * カードを使わずに次へ
 */
function skipCard() {
    showQuestionPhase();
}

// ========================================
// 問題フェーズ
// ========================================

/**
 * 計算問題フェーズの画面を表示
 */
function showQuestionPhase() {
    gameState.phase = 'question';

    const question = questionPool[Math.floor(Math.random() * questionPool.length)];
    gameState.currentQuestion = question;
    gameState.currentAnswer = question.correctAnswer;

    const choices = generateChoices(question.correctAnswer);

    // タイマー開始
    gameState.timeRemaining = gameState.answerTimeLimit;
    startTimer();

    // プレイヤー専用エリアに問題を表示
    const playerGameSpace = document.getElementById(`game-space-${gameState.currentPlayerIndex}`);

    // プレイヤー2（下側）は横並び、それ以外は縦並び
    const isPlayerBottom = gameState.currentPlayerIndex === 1;
    const choicesStyle = isPlayerBottom
        ? 'display: flex; flex-direction: row; gap: 8px; flex-wrap: wrap; justify-content: center;'
        : 'display: flex; flex-direction: column; gap: 8px;';

    let html = '<h3 style="font-size: 16px; margin-bottom: 10px;">計算問題</h3>';
    html += `<div class="timer-display" id="timer-display" style="font-size: 14px; padding: 6px; margin: 8px 0;">残り時間: ${gameState.timeRemaining}秒</div>`;
    html += `<div class="question-text" style="font-size: 20px; padding: 12px; margin: 10px 0;">${question.question}</div>`;
    html += `<div class="choices" id="choices-container" style="${choicesStyle}">`;

    choices.forEach(choice => {
        html += `<button class="btn btn-primary choice-btn" style="padding: 10px; font-size: 16px;" onclick="checkAnswer(${choice})">${choice}</button>`;
    });

    html += '</div>';
    playerGameSpace.innerHTML = html;
}

/**
 * タイマーを開始
 */
function startTimer() {
    // 既存のタイマーをクリア
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;

        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `残り時間: ${gameState.timeRemaining}秒`;

            // 残り1秒で赤くして警告音を鳴らす
            if (gameState.timeRemaining <= 1) {
                timerDisplay.style.color = '#e53935';
                timerDisplay.style.fontWeight = 'bold';
                SoundEffects.playTimerTick(); // 警告音を再生
            }
        }

        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            handleTimeout();
        }
    }, 1000);
}

/**
 * タイムアウト処理
 */
function handleTimeout() {
    // 選択肢ボタンを無効化
    const choicesContainer = document.getElementById('choices-container');
    if (choicesContainer) {
        const buttons = choicesContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }

    showMessage(`時間切れです! 正解は ${gameState.currentAnswer} でした。移動できません。`, 'error');

    setTimeout(() => {
        endTurn();
    }, 2000);
}

/**
 * 選択肢を生成する（3択、-10〜+10の範囲）
 * @param {number} correctAnswer - 正解
 * @returns {Array<number>} 選択肢の配列
 */
function generateChoices(correctAnswer) {
    const choices = [correctAnswer];

    while (choices.length < 3) {
        const offset = Math.floor(Math.random() * 5) + 1;  // 1〜5
        const wrongAnswer = correctAnswer + (Math.random() < 0.5 ? offset : -offset);

        // -10〜+10の範囲内、重複なし
        if (wrongAnswer >= -10 && wrongAnswer <= 10 && !choices.includes(wrongAnswer)) {
            choices.push(wrongAnswer);
        }
    }

    return choices.sort(() => Math.random() - 0.5);
}

/**
 * 答えをチェックする
 * @param {number} selectedAnswer - 選択した答え
 */
function checkAnswer(selectedAnswer) {
    // タイマーを停止
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.selectedAnswer = selectedAnswer;
    const isCorrect = (selectedAnswer === gameState.currentAnswer);

    // ボタンを無効化
    const choicesContainer = document.getElementById('choices-container');
    if (choicesContainer) {
        const buttons = choicesContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }

    if (isCorrect) {
        SoundEffects.playCorrect(); // 正解音を再生
        showMessage(`正解です! 答えは ${gameState.currentAnswer} です`, 'success');
        setTimeout(() => {
            autoMoveToTarget(); // 自動で目的地方向へ移動
        }, 1500);
    } else {
        SoundEffects.playIncorrect(); // 不正解音を再生
        showMessage(`不正解です。正解は ${gameState.currentAnswer} でした。移動できません。`, 'error');
        setTimeout(() => {
            endTurn();
        }, 2000);
    }
}

/**
 * 自動で目的地方向へ移動する
 */
function autoMoveToTarget() {
    const player = getCurrentPlayer();
    let distance = Math.abs(gameState.currentAnswer);

    if (gameState.moveDoubleActive) {
        distance *= 2;
        gameState.moveDoubleActive = false;
    }

    // 目的地への方向を計算
    const direction = gameState.targetStation - player.position;

    // 目的地の方向へ移動
    let moveDistance;
    if (direction > 0) {
        moveDistance = distance; // 正方向へ移動
    } else if (direction < 0) {
        moveDistance = -distance; // 負方向へ移動
    } else {
        moveDistance = 0; // すでに目的地にいる
    }

    movePlayer(moveDistance);
}

// ========================================
// 移動フェーズ
// ========================================

/**
 * 移動方向選択フェーズの画面を表示
 */
function showMovePhase() {
    gameState.phase = 'move';

    let distance = Math.abs(gameState.currentAnswer);

    if (gameState.moveDoubleActive) {
        distance *= 2;
        gameState.moveDoubleActive = false;
    }

    const gameArea = document.getElementById('game-area');
    let html = '<h3>移動方向を選択してください</h3>';
    html += `<div class="message info">移動距離: ${distance}マス</div>`;
    html += '<div class="btn-group">';
    html += `<button class="btn btn-success" onclick="movePlayer(${distance})">+${distance}マス進む</button>`;
    html += `<button class="btn btn-danger" onclick="movePlayer(-${distance})">-${distance}マス進む</button>`;
    html += `<button class="btn btn-secondary" onclick="movePlayer(0)">移動しない</button>`;
    html += '</div>';

    gameArea.innerHTML = html;
}

/**
 * プレイヤーを移動させる
 * @param {number} distance - 移動距離
 */
function movePlayer(distance) {
    const player = getCurrentPlayer();
    const oldPosition = player.position;

    player.position += distance;
    player.position = Math.max(-20, Math.min(20, player.position));

    const actualDistance = Math.abs(player.position - oldPosition);

    let points = actualDistance;

    if (gameState.pointDoubleActive) {
        points *= 2;
        gameState.pointDoubleActive = false;
    }

    player.score += points;

    updateNumberLine();
    updateScoreboard();

    let message = `${actualDistance}マス移動しました! (位置: ${oldPosition} → ${player.position})<br>`;
    message += `通過マス: ${actualDistance}マス → +${points}点<br>`;
    message += `現在の得点: ${player.score}点`;

    showMessage(message, 'success');

    setTimeout(() => {
        checkStationReach();
    }, 1000);
}

/**
 * 駅到達判定
 */
function checkStationReach() {
    const player = getCurrentPlayer();
    const distance = Math.abs(player.position - gameState.targetStation);

    if (distance <= 3) {
        player.position = gameState.targetStation;
        player.score += 15;

        updateNumberLine();
        updateScoreboard();

        SoundEffects.playStationReached(); // 駅到達音を再生
        showMessage(`🎉 駅 ${gameState.targetStation} に到達しました! +15点`, 'celebration');

        gameState.currentStationIndex = (gameState.currentStationIndex + 1) % gameState.stations.length;
        gameState.targetStation = gameState.stations[gameState.currentStationIndex];

        setTimeout(() => {
            showMessage(`次の目的地は駅 ${gameState.targetStation} です`, 'info');
            setTimeout(() => {
                endTurn();
            }, 1500);
        }, 2000);
    } else {
        endTurn();
    }
}

/**
 * ターンを終了する
 */
function endTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.numPlayers;

    if (gameState.currentPlayerIndex === 0) {
        gameState.currentTurn++;
    }

    if (gameState.currentTurn > gameState.maxTurns) {
        showFinalResults();
        return;
    }

    updateAllUI();

    setTimeout(() => {
        startTurn();
    }, 1000);
}

/**
 * 最終結果を表示
 */
function showFinalResults() {
    gameState.phase = 'end';

    const ranking = [...gameState.players].sort((a, b) => b.score - a.score);

    const commonArea = document.getElementById('common-game-area');
    let html = '<div class="final-results">';
    html += '<h2>🎊 ゲーム終了!</h2>';
    html += '<div class="ranking" style="margin: 20px 0;">';

    ranking.forEach((player, index) => {
        const medal = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
        const bgColor = index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                        index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%)' :
                        index === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #daa520 100%)' : '#f0f0f0';
        html += `
            <div style="background: ${bgColor}; padding: 15px; margin: 10px 0; border-radius: 10px; font-size: 18px; font-weight: bold;">
                ${medal} ${index + 1}位: ${player.name} ${player.marker} - ${player.score}点
            </div>
        `;
    });

    html += '</div>';
    html += '<button class="btn btn-primary" onclick="location.reload()">もう一度遊ぶ</button>';
    html += '</div>';

    commonArea.innerHTML = html;
    commonArea.classList.add('active');

    // プレイヤーエリアをクリア
    for (let i = 0; i < gameState.numPlayers; i++) {
        const playerSpace = document.getElementById(`game-space-${i}`);
        if (playerSpace) playerSpace.innerHTML = '';
    }
}

// ========================================
// UI更新関数
// ========================================

/**
 * すべてのUIを更新
 */
function updateAllUI() {
    updateGameInfo();
    updateNumberLine();
    updateScoreboard();
    updateCardsDisplay();
}

/**
 * ゲーム情報を更新
 */
function updateGameInfo() {
    document.getElementById('turn-display').textContent = `${gameState.currentTurn} / ${gameState.maxTurns}`;
    document.getElementById('target-station-display').textContent = gameState.targetStation;

    // 背景色を現在のプレイヤーの色に変更
    const body = document.body;
    body.className = `player-${gameState.currentPlayerIndex}-turn`;
}

/**
 * 数直線を描画
 */
function updateNumberLine() {
    const container = document.getElementById('number-line');

    const existingMarkers = container.querySelectorAll('.station, .player-marker, .tick-mark');
    existingMarkers.forEach(el => el.remove());

    // 目盛りを描画（-20から+20まで2刻み）
    for (let pos = -20; pos <= 20; pos += 2) {
        const tickEl = document.createElement('div');
        tickEl.className = 'tick-mark';
        if (pos % 10 === 0) {
            tickEl.classList.add('major');
        }
        const percent = ((pos + 20) / 40) * 90 + 5;
        tickEl.style.left = `${percent}%`;
        container.appendChild(tickEl);
    }

    // 駅を描画
    gameState.stations.forEach(station => {
        const stationEl = document.createElement('div');
        stationEl.className = 'station';
        if (station === gameState.targetStation) {
            stationEl.className += ' target';
            stationEl.textContent = '🎯';
        } else {
            stationEl.textContent = '★';
        }
        const percent = ((station + 20) / 40) * 90 + 5;
        stationEl.style.left = `${percent}%`;
        container.appendChild(stationEl);
    });

    // プレイヤー駒を描画
    gameState.players.forEach(player => {
        const markerEl = document.createElement('div');
        markerEl.className = 'player-marker';
        markerEl.textContent = player.marker;
        markerEl.style.backgroundColor = player.color;
        const percent = ((player.position + 20) / 40) * 90 + 5;
        markerEl.style.left = `${percent}%`;
        markerEl.title = `${player.name}: ${player.position}`;
        container.appendChild(markerEl);
    });
}

/**
 * スコアボードを更新（カード形式、横並び）
 */
function updateScoreboard() {
    const container = document.getElementById('scoreboard-container');
    let html = '<div class="player-cards-container">';

    gameState.players.forEach((player, index) => {
        const isActive = index === gameState.currentPlayerIndex;
        html += `
            <div class="player-card ${isActive ? 'active' : ''}">
                <div class="player-card-header">
                    <span class="player-marker-large">${player.marker}</span>
                    <span class="player-name-card">${player.name}</span>
                </div>
                <div class="player-card-body">
                    <div class="stat-item">
                        <div class="stat-label">得点</div>
                        <div class="stat-value">${player.score}点</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">位置</div>
                        <div class="stat-value">${player.position}</div>
                    </div>
                </div>
                <div class="player-card-footer">
                    <div class="card-count">🎴 ${player.cards.length}枚</div>
                    <div class="card-list">${player.cards.join(', ') || 'なし'}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * カード表示を更新
 * 注: 新しいレイアウトではカード情報はスコアボードに表示されるため、この関数は空実装
 */
function updateCardsDisplay() {
    // カード情報はupdateScoreboard()でプレイヤーカードとして表示される
    // この関数は互換性のために残しているが、何もしない
}

/**
 * メッセージを表示
 * @param {string} text - メッセージテキスト
 * @param {string} type - メッセージタイプ
 */
function showMessage(text, type = 'info') {
    const playerGameSpace = document.getElementById(`game-space-${gameState.currentPlayerIndex}`);
    if (!playerGameSpace) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.fontSize = '14px';
    messageDiv.style.padding = '10px';
    messageDiv.style.margin = '10px 0';
    messageDiv.innerHTML = text;
    playerGameSpace.insertBefore(messageDiv, playerGameSpace.firstChild);
}

// ========================================
// ゲーム開始画面
// ========================================

/**
 * ゲーム開始画面を表示
 */
function showStartScreen() {
    const commonArea = document.getElementById('common-game-area');
    if (!commonArea) {
        console.error('common-game-area element not found in DOM');
        console.log('Available elements with id:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    let html = '<div style="text-align: center;">';
    html += '<h2>🎯 ゲームスタート</h2>';
    html += '<p style="margin: 20px 0; color: #666;">プレイ人数を選択してください</p>';
    html += '<div class="btn-group">';
    html += '<button class="btn btn-primary" onclick="startGame(2)">2人</button>';
    html += '<button class="btn btn-primary" onclick="startGame(3)">3人（推奨）</button>';
    html += '</div>';
    html += '<div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; text-align: left;">';
    html += '<h4>📖 ゲームルール</h4>';
    html += '<ul style="margin-left: 20px; line-height: 1.8;">';
    html += '<li><strong>⏱️ 制限時間3秒</strong>で計算問題に回答</li>';
    html += '<li>正解すると、<strong>自動で目的地方向へ移動</strong>します</li>';
    html += '<li>駅（★）の±3マス以内に到達すると<strong>+15点</strong></li>';
    html += '<li>✨カードを使って有利に進めよう!</li>';
    html += '<li>10ターン終了時に最も得点が高いプレイヤーが勝利!</li>';
    html += '</ul>';
    html += '</div>';
    html += '</div>';
    commonArea.innerHTML = html;
    commonArea.classList.add('active');
}

/**
 * ゲームを開始する
 * @param {number} numPlayers - プレイヤー人数
 */
function startGame(numPlayers) {
    initializeGame(numPlayers);
}

// ========================================
// 初期化
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    showStartScreen();
});
