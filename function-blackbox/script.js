// DOM要素が読み込まれてから処理を開始
document.addEventListener('DOMContentLoaded', () => {

    // HTMLの要素を取得
    const ruleSelect = document.getElementById('rule-select');
    const xInput = document.getElementById('x-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const yOutput = document.getElementById('y-output');
    const historyBody = document.getElementById('history-body');
    const resetBtn = document.getElementById('reset-btn');

    // --- ここから追加：小数から分数へ変換する機能 ---

    /**
     * 2つの数の最大公約数(GCD)を計算する関数
     * @param {number} a
     * @param {number} b
     * @returns {number} 最大公約数
     */
    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    /**
     * 小数を分数に変換する関数
     * @param {number} decimal - 変換したい小数
     * @returns {string} - 整数または分数形式の文字列
     */
    function toFraction(decimal) {
        // 既に整数であれば、そのまま文字列として返す
        if (Number.isInteger(decimal)) {
            return decimal.toString();
        }

        // 浮動小数点数の誤差を考慮し、小数点以下10桁に丸める
        const tolerance = 1.0E-10;
        let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
        let b = decimal;
        do {
            let a = Math.floor(b);
            let aux = h1; h1 = a * h1 + h2; h2 = aux;
            aux = k1; k1 = a * k1 + k2; k2 = aux;
            b = 1 / (b - a);
        } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

        // 分子と分母を返す
        return `${h1} / ${k1}`;
    }
    // --- 追加ここまで ---


    // 「このカードを入れる！」ボタンがクリックされたときの処理
    calculateBtn.addEventListener('click', () => {
        const xValue = parseFloat(xInput.value);

        if (isNaN(xValue)) {
            alert('数字を入力してください。');
            return;
        }

        const selectedRule = ruleSelect.value;
        let yValue = ''; 

        // ルールに応じてyの値を計算
        switch (selectedRule) {
            case 'A': // 比例 (y = 2x)
                yValue = 2 * xValue;
                break;
            case 'B': // 反比例 (y = 12 / x)
                if (xValue === 0) {
                    yValue = 'エラー';
                } else {
                    yValue = 12 / xValue;
                }
                break;
            case 'C': // 一次関数 (y = 2x + 3)
                yValue = 2 * xValue + 3;
                break;
            case 'D': // それ以外の関数 (y = x²)
                yValue = xValue * xValue;
                break;
            case 'E': // それ以外の関数 (y = 10 - x)
                yValue = 10 - xValue;
                break;
        }

        // ★変更点：計算結果を分数に変換してから表示する
        let displayText;
        if (typeof yValue === 'number') {
            displayText = toFraction(yValue); // toFraction関数を呼び出す
        } else {
            displayText = yValue; // 'エラー'などの文字列はそのまま
        }

        // 変換後のテキストを画面に表示（アニメーション付き）
        yOutput.classList.remove('updated');
        void yOutput.offsetWidth; // リフロー強制でアニメーションをリセット
        yOutput.classList.add('updated');
        yOutput.textContent = displayText;

        // 記録テーブルに新しい行を追加
        if (yValue !== 'エラー') {
            const newRow = historyBody.insertRow(0); // 新しい行を一番上に追加
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            cell1.textContent = xValue;
            cell2.textContent = displayText; // 表示されている値を記録
        }
        
        // 入力欄を空にする
        xInput.value = '';
    });

    // ルールが変更されたときの処理
    ruleSelect.addEventListener('change', () => {
        historyBody.innerHTML = '';
        yOutput.textContent = '?';
    });
    
    // リセットボタンが押されたときの処理
    resetBtn.addEventListener('click', () => {
        historyBody.innerHTML = '';
        yOutput.textContent = '?';
    });
});