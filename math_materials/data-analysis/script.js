// ========================================
// グローバル変数の宣言
// ========================================

// 現在のモード（'single' または 'compare'）
let currentMode = 'single';

// 入力されたデータを保存する配列
let dataArray = [];

// データのタイトルを保存する変数
let dataTitle = "";

// 比較モード用のデータ
let dataArray1 = [];
let dataArray2 = [];
let dataTitle1 = "";
let dataTitle2 = "";

// 比較モード用の度数分布表
let frequencyDistribution1 = {
    classWidth: 0,
    classes: [],
    minValue: 0,
    maxValue: 0
};

let frequencyDistribution2 = {
    classWidth: 0,
    classes: [],
    minValue: 0,
    maxValue: 0
};

// 度数分布表の情報を保存するオブジェクト
let frequencyDistribution = {
    classWidth: 0,      // 階級の幅
    classes: [],        // 各階級の情報を保存する配列
    minValue: 0,        // データの最小値
    maxValue: 0         // データの最大値
};

// 階級設定の自動計算結果を保存する変数
let autoClassSettings = {
    numClasses: 0,
    classWidth: 0,
    firstMin: 0
};

// ========================================
// モード選択機能
// ========================================

/**
 * 学習モードを選択する関数
 * @param {string} mode - 'single' または 'compare'
 */
function selectMode(mode) {
    currentMode = mode;

    // モード選択セクションを非表示
    document.getElementById('modeSelection').style.display = 'none';

    if (mode === 'single') {
        // 通常モード: ステップ1を表示
        document.getElementById('step1').style.display = 'block';
        document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
    } else if (mode === 'compare') {
        // 比較モード: ステップ1（比較）を表示
        document.getElementById('step1_compare').style.display = 'block';
        document.getElementById('step1_compare').scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// ステップ1: データ読み込み機能
// ========================================

/**
 * ユーザーが入力したデータを読み込む関数
 */
function loadData() {
    // タイトルとデータを入力欄から取得
    const titleInput = document.getElementById('dataTitle').value.trim();
    const dataInput = document.getElementById('dataInput').value.trim();
    const messageDiv = document.getElementById('dataLoadMessage');

    // 入力チェック: タイトルが空でないか
    if (titleInput === '') {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'データのタイトルを入力してください。';
        return;
    }

    // 入力チェック: データが空でないか
    if (dataInput === '') {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'データを入力してください。';
        return;
    }

    // カンマ区切りの文字列を配列に変換し、数値に変換
    const numbers = dataInput.split(',').map(item => parseFloat(item.trim()));

    // 入力チェック: すべて数値かどうか確認
    if (numbers.some(isNaN)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '数値以外のデータが含まれています。正しく入力してください。';
        return;
    }

    // 入力チェック: データが3個以上あるか
    if (numbers.length < 3) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'データは3個以上入力してください。';
        return;
    }

    // グローバル変数にデータを保存
    dataArray = numbers;
    dataTitle = titleInput;

    // 成功メッセージを表示
    messageDiv.className = 'message success';
    messageDiv.textContent = `データを読み込みました！（${dataArray.length}個のデータ）`;

    // ステップ2を表示
    showStep2();
}

/**
 * ステップ2（代表値）を表示する関数
 */
function showStep2() {
    // データを昇順に並び替え
    const sortedData = [...dataArray].sort((a, b) => a - b);

    // 平均値を計算
    const meanValue = calculateMean(dataArray);

    // データとタイトルを画面に表示
    document.getElementById('displayTitle').textContent = dataTitle;
    document.getElementById('displayData').textContent = dataArray.join(', ');
    document.getElementById('displayCount').textContent = dataArray.length;
    document.getElementById('displaySorted').textContent = sortedData.join(', ');
    document.getElementById('displayMean').textContent = meanValue;

    // ステップ2のセクションを表示
    document.getElementById('step2').style.display = 'block';

    // ページをステップ2までスクロール
    document.getElementById('step2').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 比較モードで2つのデータを読み込む関数
 */
function loadCompareData() {
    const title1Input = document.getElementById('dataTitle1').value.trim();
    const data1Input = document.getElementById('dataInput1').value.trim();
    const title2Input = document.getElementById('dataTitle2').value.trim();
    const data2Input = document.getElementById('dataInput2').value.trim();
    const messageDiv = document.getElementById('dataLoadMessageCompare');

    // 入力チェック
    if (title1Input === '' || title2Input === '') {
        messageDiv.className = 'message error';
        messageDiv.textContent = '両方のデータのタイトルを入力してください。';
        return;
    }

    if (data1Input === '' || data2Input === '') {
        messageDiv.className = 'message error';
        messageDiv.textContent = '両方のデータを入力してください。';
        return;
    }

    // データを数値配列に変換
    const numbers1 = data1Input.split(',').map(item => parseFloat(item.trim()));
    const numbers2 = data2Input.split(',').map(item => parseFloat(item.trim()));

    // 入力チェック: すべて数値か
    if (numbers1.some(isNaN) || numbers2.some(isNaN)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '数値以外のデータが含まれています。正しく入力してください。';
        return;
    }

    // 入力チェック: データが3個以上あるか
    if (numbers1.length < 3 || numbers2.length < 3) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '各データは3個以上入力してください。';
        return;
    }

    // グローバル変数にデータを保存
    dataArray1 = numbers1;
    dataArray2 = numbers2;
    dataTitle1 = title1Input;
    dataTitle2 = title2Input;

    // 成功メッセージを表示
    messageDiv.className = 'message success';
    messageDiv.textContent = `データを読み込みました！（データ1: ${dataArray1.length}個、データ2: ${dataArray2.length}個）`;

    // ステップ2（比較）を表示
    showStep2Compare();
}

/**
 * ステップ2（比較モード）を表示する関数
 */
function showStep2Compare() {
    // データ1の表示
    const sortedData1 = [...dataArray1].sort((a, b) => a - b);
    document.getElementById('displayTitle1').textContent = dataTitle1;
    document.getElementById('displayData1').textContent = dataArray1.join(', ');
    document.getElementById('displayCount1').textContent = dataArray1.length;
    document.getElementById('displaySorted1').textContent = sortedData1.join(', ');
    document.getElementById('displayMean1').textContent = calculateMean(dataArray1);
    document.getElementById('displayMedian1').textContent = calculateMedian(dataArray1);
    document.getElementById('displayMin1').textContent = calculateMin(dataArray1);
    document.getElementById('displayMax1').textContent = calculateMax(dataArray1);
    const range1 = calculateMax(dataArray1) - calculateMin(dataArray1);
    document.getElementById('displayRange1').textContent = Math.round(range1 * 10000000000) / 10000000000;

    // データ2の表示
    const sortedData2 = [...dataArray2].sort((a, b) => a - b);
    document.getElementById('displayTitle2').textContent = dataTitle2;
    document.getElementById('displayData2').textContent = dataArray2.join(', ');
    document.getElementById('displayCount2').textContent = dataArray2.length;
    document.getElementById('displaySorted2').textContent = sortedData2.join(', ');
    document.getElementById('displayMean2').textContent = calculateMean(dataArray2);
    document.getElementById('displayMedian2').textContent = calculateMedian(dataArray2);
    document.getElementById('displayMin2').textContent = calculateMin(dataArray2);
    document.getElementById('displayMax2').textContent = calculateMax(dataArray2);
    const range2 = calculateMax(dataArray2) - calculateMin(dataArray2);
    document.getElementById('displayRange2').textContent = Math.round(range2 * 10000000000) / 10000000000;

    // ステップ2（比較）のセクションを表示
    document.getElementById('step2_compare').style.display = 'block';
    document.getElementById('step2_compare').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 比較モードで階級設定へ進む関数
 */
function proceedToClassSettings() {
    calculateAutoClassSettingsCompare();
    showStep2_5();
}

// ========================================
// ステップ2: 代表値の計算と答え合わせ
// ========================================

/**
 * 代表値の答え合わせをする関数
 */
function checkRepresentativeValues() {
    // ユーザーの回答を取得
    const userMin = parseFloat(document.getElementById('answerMin').value);
    const userMax = parseFloat(document.getElementById('answerMax').value);
    const userRange = parseFloat(document.getElementById('answerRange').value);
    const userMedian = parseFloat(document.getElementById('answerMedian').value);

    // 入力チェック
    if (isNaN(userMin) || isNaN(userMax) || isNaN(userRange) || isNaN(userMedian)) {
        const resultDiv = document.getElementById('step2Result');
        resultDiv.className = 'result-message error';
        resultDiv.textContent = 'すべての欄に数値を入力してください。';
        return;
    }

    // 正しい値を計算
    const correctMin = calculateMin(dataArray);
    const correctMax = calculateMax(dataArray);
    const correctRange = Math.round((correctMax - correctMin) * 10000000000) / 10000000000;
    const correctMedian = calculateMedian(dataArray);

    // 答え合わせ
    const isMinCorrect = userMin === correctMin;
    const isMaxCorrect = userMax === correctMax;
    const isRangeCorrect = userRange === correctRange;
    const isMedianCorrect = userMedian === correctMedian;

    // 結果メッセージの作成
    let resultHTML = '<h3>答え合わせ結果</h3>';
    resultHTML += `<p>最小値: ${isMinCorrect ? '⭕ 正解' : '❌ 不正解'} （正解: ${correctMin}）</p>`;
    resultHTML += `<p>最大値: ${isMaxCorrect ? '⭕ 正解' : '❌ 不正解'} （正解: ${correctMax}）</p>`;
    resultHTML += `<p>範囲: ${isRangeCorrect ? '⭕ 正解' : '❌ 不正解'} （正解: ${correctRange}）</p>`;
    resultHTML += `<p>中央値: ${isMedianCorrect ? '⭕ 正解' : '❌ 不正解'} （正解: ${correctMedian}）</p>`;

    const resultDiv = document.getElementById('step2Result');

    // すべて正解ならステップ2.5（階級設定）へ進む
    if (isMinCorrect && isMaxCorrect && isRangeCorrect && isMedianCorrect) {
        resultDiv.className = 'result-message success';
        resultHTML += '<p><strong>全問正解です！次のステップに進みましょう。</strong></p>';
        resultDiv.innerHTML = resultHTML;

        // 階級の自動設定を計算してステップ2.5を表示
        calculateAutoClassSettings();
        showStep2_5();
    } else {
        resultDiv.className = 'result-message error';
        resultHTML += '<p><strong>間違いがあります。もう一度計算してみましょう。</strong></p>';
        resultDiv.innerHTML = resultHTML;
    }
}

// ========================================
// 代表値を計算する関数群
// ========================================

/**
 * 最小値を求める関数
 */
function calculateMin(arr) {
    return Math.min(...arr);
}

/**
 * 最大値を求める関数
 */
function calculateMax(arr) {
    return Math.max(...arr);
}

/**
 * 平均値を求める関数（小数第2位まで）
 */
function calculateMean(arr) {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    const mean = sum / arr.length;
    return Math.round(mean * 100) / 100; // 小数第2位まで
}

/**
 * 中央値を求める関数
 */
function calculateMedian(arr) {
    // データを昇順にソート
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    // データ数が奇数の場合は真ん中の値
    if (sorted.length % 2 === 1) {
        return sorted[mid];
    }
    // データ数が偶数の場合は真ん中2つの平均
    else {
        const median = (sorted[mid - 1] + sorted[mid]) / 2;
        // 浮動小数点誤差を防ぐため、小数第10位で四捨五入
        return Math.round(median * 10000000000) / 10000000000;
    }
}

// ========================================
// ステップ2.5: 階級設定
// ========================================

/**
 * 階級の自動設定を計算する関数
 */
function calculateAutoClassSettings() {
    const min = calculateMin(dataArray);
    const max = calculateMax(dataArray);
    const range = max - min;

    // 階級の数を決定（データ数に応じて調整）
    let numClasses = 5; // デフォルトは5階級
    if (dataArray.length >= 20) numClasses = 6;
    if (dataArray.length >= 40) numClasses = 7;
    if (dataArray.length >= 100) numClasses = 8;

    // 階級の幅を計算（整数になるように調整）
    let classWidth = Math.ceil(range / numClasses);

    // 階級の幅が0になる場合（すべて同じ値）の対処
    if (classWidth === 0) classWidth = 1;

    // 最初の階級の下限を決定
    let firstClassMin = min;

    // 自動設定を保存
    autoClassSettings = {
        numClasses: numClasses,
        classWidth: classWidth,
        firstMin: firstClassMin
    };
}

/**
 * 比較モード用：階級の自動設定を計算する関数
 */
function calculateAutoClassSettingsCompare() {
    // 両方のデータの最小値と最大値を取得
    const min1 = calculateMin(dataArray1);
    const max1 = calculateMax(dataArray1);
    const min2 = calculateMin(dataArray2);
    const max2 = calculateMax(dataArray2);

    // 両データを含む範囲を計算
    const overallMin = Math.min(min1, min2);
    const overallMax = Math.max(max1, max2);
    const range = overallMax - overallMin;

    // データ数の合計に応じて階級数を決定
    const totalData = dataArray1.length + dataArray2.length;
    let numClasses = 5;
    if (totalData >= 40) numClasses = 6;
    if (totalData >= 80) numClasses = 7;
    if (totalData >= 200) numClasses = 8;

    // 階級の幅を計算
    let classWidth = Math.ceil(range / numClasses);
    if (classWidth === 0) classWidth = 1;

    // 自動設定を保存
    autoClassSettings = {
        numClasses: numClasses,
        classWidth: classWidth,
        firstMin: overallMin
    };
}

/**
 * ステップ2.5（階級設定）を表示する関数
 */
function showStep2_5() {
    let min, max, range;

    if (currentMode === 'compare') {
        // 比較モードの場合は両データの範囲を表示
        const min1 = calculateMin(dataArray1);
        const max1 = calculateMax(dataArray1);
        const min2 = calculateMin(dataArray2);
        const max2 = calculateMax(dataArray2);
        min = Math.min(min1, min2);
        max = Math.max(max1, max2);
        range = max - min;
    } else {
        // 通常モードの場合
        min = calculateMin(dataArray);
        max = calculateMax(dataArray);
        range = max - min;
    }

    // 自動設定の値を画面に表示
    document.getElementById('autoMinValue').textContent = min;
    document.getElementById('autoMaxValue').textContent = max;
    document.getElementById('autoRange').textContent = range;
    document.getElementById('autoNumClasses').textContent = autoClassSettings.numClasses;
    document.getElementById('autoClassWidth').textContent = autoClassSettings.classWidth;

    // 手動入力欄にデフォルト値を設定
    document.getElementById('manualFirstMin').value = autoClassSettings.firstMin;
    document.getElementById('manualClassWidth').value = autoClassSettings.classWidth;
    document.getElementById('manualNumClasses').value = autoClassSettings.numClasses;

    // ステップ2.5のセクションを表示
    document.getElementById('step2_5').style.display = 'block';

    // ページをステップ2.5までスクロール
    document.getElementById('step2_5').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 自動設定で進む関数
 */
function useAutoSettings() {
    if (currentMode === 'compare') {
        // 比較モード: 2つの度数分布表を生成
        generateFrequencyTableCompare(
            autoClassSettings.numClasses,
            autoClassSettings.classWidth,
            autoClassSettings.firstMin
        );
        showStep3Compare();
    } else {
        // 通常モード: 度数分布表を生成
        generateFrequencyTable(
            autoClassSettings.numClasses,
            autoClassSettings.classWidth,
            autoClassSettings.firstMin
        );
        showStep3();
    }
}

/**
 * 手動設定で進む関数
 */
function useManualSettings() {
    // 手動入力値を取得
    const firstMin = parseFloat(document.getElementById('manualFirstMin').value);
    const classWidth = parseFloat(document.getElementById('manualClassWidth').value);
    const numClasses = parseInt(document.getElementById('manualNumClasses').value);

    const resultDiv = document.getElementById('step2_5Result');

    // 入力チェック
    if (isNaN(firstMin) || isNaN(classWidth) || isNaN(numClasses)) {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = 'すべての項目に数値を入力してください。';
        return;
    }

    // 階級の幅が整数かチェック
    if (!Number.isInteger(classWidth) || classWidth <= 0) {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = '階級の幅は正の整数を入力してください。';
        return;
    }

    // 階級の数が範囲内かチェック
    if (numClasses < 3 || numClasses > 15) {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = '階級の数は3〜15の間で設定してください。';
        return;
    }

    // 最初の階級の下限がデータの最小値以下かチェック
    let min, max;
    if (currentMode === 'compare') {
        min = Math.min(calculateMin(dataArray1), calculateMin(dataArray2));
        max = Math.max(calculateMax(dataArray1), calculateMax(dataArray2));
    } else {
        min = calculateMin(dataArray);
        max = calculateMax(dataArray);
    }

    if (firstMin > min) {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = `最初の階級の下限はデータの最小値（${min}）以下にしてください。`;
        return;
    }

    // すべてのデータが階級に収まるかチェック
    const lastClassMax = firstMin + (classWidth * numClasses);
    if (lastClassMax < max) {
        resultDiv.className = 'result-message error';
        resultDiv.textContent = `設定した階級ではデータの最大値（${max}）が収まりません。階級の幅か階級の数を増やしてください。`;
        return;
    }

    // 手動設定で度数分布表を生成
    if (currentMode === 'compare') {
        generateFrequencyTableCompare(numClasses, classWidth, firstMin);
        showStep3Compare();
    } else {
        generateFrequencyTable(numClasses, classWidth, firstMin);
        showStep3();
    }
}

// ========================================
// ステップ3: 度数分布表の生成
// ========================================

/**
 * 度数分布表を生成する関数
 * @param {number} numClasses - 階級の数
 * @param {number} classWidth - 階級の幅
 * @param {number} firstClassMin - 最初の階級の下限
 */
function generateFrequencyTable(numClasses, classWidth, firstClassMin) {
    const min = calculateMin(dataArray);
    const max = calculateMax(dataArray);

    // 度数分布表の各階級を作成
    frequencyDistribution.classWidth = classWidth;
    frequencyDistribution.minValue = min;
    frequencyDistribution.maxValue = max;
    frequencyDistribution.classes = [];

    for (let i = 0; i < numClasses; i++) {
        const classMin = firstClassMin + (i * classWidth);
        const classMax = classMin + classWidth;
        const classValue = (classMin + classMax) / 2; // 階級値

        // この階級に含まれるデータの個数を数える
        const frequency = dataArray.filter(val => {
            if (i === numClasses - 1) {
                // 最後の階級は上限を含む
                return val >= classMin && val <= classMax;
            } else {
                // それ以外は上限を含まない
                return val >= classMin && val < classMax;
            }
        }).length;

        frequencyDistribution.classes.push({
            min: classMin,
            max: classMax,
            classValue: classValue,
            frequency: frequency
        });
    }

    // 相対度数と累積相対度数を計算
    const totalFrequency = dataArray.length;
    let cumulativeRelativeFreq = 0;

    frequencyDistribution.classes.forEach(cls => {
        cls.relativeFrequency = cls.frequency / totalFrequency;
        cumulativeRelativeFreq += cls.relativeFrequency;
        cls.cumulativeRelativeFrequency = Math.round(cumulativeRelativeFreq * 100) / 100;
    });
}

/**
 * 比較モード用：2つのデータの度数分布表を生成する関数
 */
function generateFrequencyTableCompare(numClasses, classWidth, firstClassMin) {
    // データ1の度数分布表を生成
    frequencyDistribution1.classWidth = classWidth;
    frequencyDistribution1.minValue = calculateMin(dataArray1);
    frequencyDistribution1.maxValue = calculateMax(dataArray1);
    frequencyDistribution1.classes = [];

    // データ2の度数分布表を生成
    frequencyDistribution2.classWidth = classWidth;
    frequencyDistribution2.minValue = calculateMin(dataArray2);
    frequencyDistribution2.maxValue = calculateMax(dataArray2);
    frequencyDistribution2.classes = [];

    // 階級ごとにデータ1とデータ2の度数を計算
    for (let i = 0; i < numClasses; i++) {
        const classMin = firstClassMin + (i * classWidth);
        const classMax = classMin + classWidth;
        const classValue = (classMin + classMax) / 2;

        // データ1の度数
        const frequency1 = dataArray1.filter(val => {
            if (i === numClasses - 1) {
                return val >= classMin && val <= classMax;
            } else {
                return val >= classMin && val < classMax;
            }
        }).length;

        // データ2の度数
        const frequency2 = dataArray2.filter(val => {
            if (i === numClasses - 1) {
                return val >= classMin && val <= classMax;
            } else {
                return val >= classMin && val < classMax;
            }
        }).length;

        frequencyDistribution1.classes.push({
            min: classMin,
            max: classMax,
            classValue: classValue,
            frequency: frequency1
        });

        frequencyDistribution2.classes.push({
            min: classMin,
            max: classMax,
            classValue: classValue,
            frequency: frequency2
        });
    }

    // 相対度数と累積相対度数を計算（データ1）
    const totalFreq1 = dataArray1.length;
    let cumulativeRelFreq1 = 0;
    frequencyDistribution1.classes.forEach(cls => {
        cls.relativeFrequency = cls.frequency / totalFreq1;
        cumulativeRelFreq1 += cls.relativeFrequency;
        cls.cumulativeRelativeFrequency = Math.round(cumulativeRelFreq1 * 100) / 100;
    });

    // 相対度数と累積相対度数を計算（データ2）
    const totalFreq2 = dataArray2.length;
    let cumulativeRelFreq2 = 0;
    frequencyDistribution2.classes.forEach(cls => {
        cls.relativeFrequency = cls.frequency / totalFreq2;
        cumulativeRelFreq2 += cls.relativeFrequency;
        cls.cumulativeRelativeFrequency = Math.round(cumulativeRelFreq2 * 100) / 100;
    });
}

/**
 * 比較モードのステップ3を表示する関数
 */
function showStep3Compare() {
    // 比較用度数分布表のHTML作成
    createFrequencyTableHTMLCompare();

    // ステップ3（比較）のセクションを表示
    document.getElementById('step3_compare').style.display = 'block';

    // ページをステップ3までスクロール
    document.getElementById('step3_compare').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 比較モード用の度数分布表のHTMLを作成する関数
 */
function createFrequencyTableHTMLCompare() {
    const container = document.getElementById('frequencyTableContainerCompare');

    let html = '<table class="frequency-table">';
    html += '<tr>';
    html += '<th>階級（以上〜未満）</th>';
    html += '<th>階級値</th>';
    html += `<th style="background: #667eea;">度数<br>${dataTitle1}</th>`;
    html += `<th style="background: #667eea;">相対度数<br>${dataTitle1}</th>`;
    html += `<th style="background: #667eea;">累積相対度数<br>${dataTitle1}</th>`;
    html += `<th style="background: #43a047;">度数<br>${dataTitle2}</th>`;
    html += `<th style="background: #43a047;">相対度数<br>${dataTitle2}</th>`;
    html += `<th style="background: #43a047;">累積相対度数<br>${dataTitle2}</th>`;
    html += '</tr>';

    frequencyDistribution1.classes.forEach((cls1, index) => {
        const cls2 = frequencyDistribution2.classes[index];
        html += '<tr>';

        // 階級の範囲
        const isLastClass = index === frequencyDistribution1.classes.length - 1;
        const rangeText = isLastClass
            ? `${cls1.min}以上〜${cls1.max}以下`
            : `${cls1.min}以上〜${cls1.max}未満`;
        html += `<td>${rangeText}</td>`;

        // 階級値
        html += `<td>${cls1.classValue}</td>`;

        // データ1の度数
        html += `<td style="background: #e8eaf6;">${cls1.frequency}</td>`;

        // データ1の相対度数
        html += `<td style="background: #e8eaf6;">${cls1.relativeFrequency.toFixed(2)}</td>`;

        // データ1の累積相対度数
        html += `<td style="background: #e8eaf6;">${cls1.cumulativeRelativeFrequency.toFixed(2)}</td>`;

        // データ2の度数
        html += `<td style="background: #e8f5e9;">${cls2.frequency}</td>`;

        // データ2の相対度数
        html += `<td style="background: #e8f5e9;">${cls2.relativeFrequency.toFixed(2)}</td>`;

        // データ2の累積相対度数
        html += `<td style="background: #e8f5e9;">${cls2.cumulativeRelativeFrequency.toFixed(2)}</td>`;

        html += '</tr>';
    });

    // 合計行を追加
    const totalFrequency1 = frequencyDistribution1.classes.reduce((sum, cls) => sum + cls.frequency, 0);
    const totalFrequency2 = frequencyDistribution2.classes.reduce((sum, cls) => sum + cls.frequency, 0);
    html += '<tr style="font-weight: bold; background-color: #f0f4ff;">';
    html += '<td colspan="2">合計</td>';
    html += `<td style="background: #e8eaf6;">${totalFrequency1}</td>`;
    html += '<td style="background: #e8eaf6;">1.00</td>';
    html += '<td></td>';
    html += `<td style="background: #e8f5e9;">${totalFrequency2}</td>`;
    html += '<td style="background: #e8f5e9;">1.00</td>';
    html += '<td></td>';
    html += '</tr>';

    html += '</table>';
    container.innerHTML = html;
}

/**
 * 比較モードのステップ4を表示する関数
 */
function showStep4Compare() {
    document.getElementById('step4_compare').style.display = 'block';
    document.getElementById('step4_compare').scrollIntoView({ behavior: 'smooth' });

    // 軸のみを描画
    drawPolygonAxes();
}

/**
 * 度数分布多角形の軸のみを描画する関数
 */
function drawPolygonAxes() {
    const canvas = document.getElementById('polygonCanvas');
    const ctx = canvas.getContext('2d');

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // 軸を描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Y軸
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // X軸
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    // X軸ラベル（階級値）
    const numClasses = frequencyDistribution1.classes.length;
    const barWidth = chartWidth / numClasses;

    frequencyDistribution1.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth) + (barWidth / 2);
        const y = canvas.height - padding + 25;
        ctx.fillText(cls.classValue.toString(), x, y);
    });

    // 軸のタイトル
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('度数', 0, 0);
    ctx.restore();

    ctx.fillText('階級値', canvas.width / 2, canvas.height - 10);

    // Y軸の目盛り
    const maxFreq1 = Math.max(...frequencyDistribution1.classes.map(c => c.frequency));
    const maxFreq2 = Math.max(...frequencyDistribution2.classes.map(c => c.frequency));
    const maxFrequency = Math.max(maxFreq1, maxFreq2);
    const yStep = Math.ceil(maxFrequency / 5);

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = i * yStep;
        const y = canvas.height - padding - (i * chartHeight / 5);
        ctx.fillText(value.toString(), padding - 10, y + 5);

        // グリッド線
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
}

/**
 * 度数分布多角形を表示する関数
 */
function showPolygon() {
    const canvas = document.getElementById('polygonCanvas');
    const ctx = canvas.getContext('2d');

    // 軸を再描画
    drawPolygonAxes();

    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const numClasses = frequencyDistribution1.classes.length;
    const barWidth = chartWidth / numClasses;

    const maxFreq1 = Math.max(...frequencyDistribution1.classes.map(c => c.frequency));
    const maxFreq2 = Math.max(...frequencyDistribution2.classes.map(c => c.frequency));
    const maxFrequency = Math.max(maxFreq1, maxFreq2);
    const yScale = chartHeight / (Math.ceil(maxFrequency / 5) * 5);

    // データ1の度数分布多角形（青系）
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;

    // 線を描画
    ctx.beginPath();
    frequencyDistribution1.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth) + (barWidth / 2);
        const y = canvas.height - padding - (cls.frequency * yScale);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // ポイントを描画
    ctx.fillStyle = '#667eea';
    frequencyDistribution1.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth) + (barWidth / 2);
        const y = canvas.height - padding - (cls.frequency * yScale);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // データ2の度数分布多角形（緑系）
    ctx.strokeStyle = '#43a047';
    ctx.lineWidth = 3;

    // 線を描画
    ctx.beginPath();
    frequencyDistribution2.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth) + (barWidth / 2);
        const y = canvas.height - padding - (cls.frequency * yScale);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // ポイントを描画
    ctx.fillStyle = '#43a047';
    frequencyDistribution2.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth) + (barWidth / 2);
        const y = canvas.height - padding - (cls.frequency * yScale);

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // 凡例を描画
    const legendX = canvas.width - 200;
    const legendY = 30;

    // データ1の凡例
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 40, legendY);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dataTitle1, legendX + 50, legendY + 5);

    // データ2の凡例
    ctx.strokeStyle = '#43a047';
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 30);
    ctx.lineTo(legendX + 40, legendY + 30);
    ctx.stroke();

    ctx.fillText(dataTitle2, legendX + 50, legendY + 35);

    // メッセージを表示
    const messageDiv = document.getElementById('step4CompareMessage');
    messageDiv.className = 'message success';
    messageDiv.innerHTML = '<p><strong>度数分布多角形が表示されました！</strong></p><p>2つのデータの分布を比較してみましょう。</p>';

    // 画像出力セクションを表示
    showExportSection();
}

/**
 * ステップ3を表示する関数
 */
function showStep3() {
    // 度数分布表のHTML作成
    createFrequencyTableHTML();

    // ステップ3のセクションを表示
    document.getElementById('step3').style.display = 'block';

    // ページをステップ3までスクロール
    document.getElementById('step3').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 度数分布表のHTMLを作成する関数（一部空欄にする）
 */
function createFrequencyTableHTML() {
    const container = document.getElementById('frequencyTableContainer');

    let html = '<p>下の度数分布表の空欄を埋めなさい。</p>';
    html += '<table class="frequency-table">';
    html += '<tr>';
    html += '<th>階級（以上〜未満）</th>';
    html += '<th>階級値</th>';
    html += '<th>度数</th>';
    html += '<th>相対度数</th>';
    html += '<th>累積相対度数</th>';
    html += '</tr>';

    frequencyDistribution.classes.forEach((cls, index) => {
        html += '<tr>';

        // 階級の範囲
        const isLastClass = index === frequencyDistribution.classes.length - 1;
        const rangeText = isLastClass
            ? `${cls.min}以上〜${cls.max}以下`
            : `${cls.min}以上〜${cls.max}未満`;
        html += `<td>${rangeText}</td>`;

        // 階級値（いくつか空欄にする）
        if (index === 1 || index === 3) {
            html += `<td><input type="number" step="any" id="classValue${index}" class="table-input"></td>`;
        } else {
            html += `<td>${cls.classValue}</td>`;
        }

        // 度数（いくつか空欄にする）
        if (index === 0 || index === 2) {
            html += `<td><input type="number" id="frequency${index}" class="table-input"></td>`;
        } else {
            html += `<td>${cls.frequency}</td>`;
        }

        // 相対度数（いくつか空欄にする）
        if (index === 1 || index === 4) {
            html += `<td><input type="number" step="0.01" id="relativeFreq${index}" class="table-input"></td>`;
        } else {
            html += `<td>${cls.relativeFrequency.toFixed(2)}</td>`;
        }

        // 累積相対度数（いくつか空欄にする）
        if (index === 2 || index === 3) {
            html += `<td><input type="number" step="0.01" id="cumulativeFreq${index}" class="table-input"></td>`;
        } else {
            html += `<td>${cls.cumulativeRelativeFrequency.toFixed(2)}</td>`;
        }

        html += '</tr>';
    });

    // 合計行を追加
    const totalFrequency = frequencyDistribution.classes.reduce((sum, cls) => sum + cls.frequency, 0);
    html += '<tr style="font-weight: bold; background-color: #f0f4ff;">';
    html += '<td colspan="2">合計</td>';
    html += `<td>${totalFrequency}</td>`;
    html += '<td>1.00</td>';
    html += '<td></td>';
    html += '</tr>';

    html += '</table>';

    container.innerHTML = html;
}

/**
 * 度数分布表の答え合わせをする関数
 */
function checkFrequencyTable() {
    let allCorrect = true;
    let resultHTML = '<h3>答え合わせ結果</h3>';

    // 各空欄の答え合わせ
    const checks = [
        { index: 1, type: 'classValue', correct: frequencyDistribution.classes[1].classValue, label: '階級値（2行目）' },
        { index: 3, type: 'classValue', correct: frequencyDistribution.classes[3].classValue, label: '階級値（4行目）' },
        { index: 0, type: 'frequency', correct: frequencyDistribution.classes[0].frequency, label: '度数（1行目）' },
        { index: 2, type: 'frequency', correct: frequencyDistribution.classes[2].frequency, label: '度数（3行目）' },
        { index: 1, type: 'relativeFreq', correct: frequencyDistribution.classes[1].relativeFrequency, label: '相対度数（2行目）', decimals: 2 },
        { index: 4, type: 'relativeFreq', correct: frequencyDistribution.classes[4].relativeFrequency, label: '相対度数（5行目）', decimals: 2 },
        { index: 2, type: 'cumulativeFreq', correct: frequencyDistribution.classes[2].cumulativeRelativeFrequency, label: '累積相対度数（3行目）', decimals: 2 },
        { index: 3, type: 'cumulativeFreq', correct: frequencyDistribution.classes[3].cumulativeRelativeFrequency, label: '累積相対度数（4行目）', decimals: 2 }
    ];

    checks.forEach(check => {
        const inputElement = document.getElementById(`${check.type}${check.index}`);
        if (!inputElement) return; // 要素が存在しない場合はスキップ

        const userAnswer = parseFloat(inputElement.value);
        let isCorrect = false;

        if (check.decimals !== undefined) {
            // 小数の場合は誤差を許容
            isCorrect = !isNaN(userAnswer) && Math.abs(userAnswer - check.correct) < 0.01;
        } else {
            // 整数の場合は完全一致
            isCorrect = userAnswer === check.correct;
        }

        const correctValue = check.decimals !== undefined
            ? check.correct.toFixed(check.decimals)
            : check.correct;

        resultHTML += `<p>${check.label}: ${isCorrect ? '⭕ 正解' : '❌ 不正解'} （正解: ${correctValue}）</p>`;

        if (!isCorrect) allCorrect = false;
    });

    const resultDiv = document.getElementById('step3Result');

    if (allCorrect) {
        resultDiv.className = 'result-message success';
        resultHTML += '<p><strong>全問正解です！次のステップに進みましょう。</strong></p>';
        resultDiv.innerHTML = resultHTML;

        // ステップ4を表示
        showStep4();
    } else {
        resultDiv.className = 'result-message error';
        resultHTML += '<p><strong>間違いがあります。もう一度確認してみましょう。</strong></p>';
        resultDiv.innerHTML = resultHTML;
    }
}

// ========================================
// ステップ4: 最頻値の読み取り
// ========================================

/**
 * ステップ4を表示する関数
 */
function showStep4() {
    document.getElementById('step4').style.display = 'block';
    document.getElementById('step4').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 最頻値の答え合わせをする関数
 */
function checkMode() {
    const userMode = parseFloat(document.getElementById('answerMode').value);

    if (isNaN(userMode)) {
        const resultDiv = document.getElementById('step4Result');
        resultDiv.className = 'result-message error';
        resultDiv.textContent = '数値を入力してください。';
        return;
    }

    // 最も度数が多い階級を見つける
    let maxFrequency = 0;
    let modeClass = null;

    frequencyDistribution.classes.forEach(cls => {
        if (cls.frequency > maxFrequency) {
            maxFrequency = cls.frequency;
            modeClass = cls;
        }
    });

    const correctMode = modeClass.classValue;
    const isCorrect = userMode === correctMode;

    const resultDiv = document.getElementById('step4Result');

    if (isCorrect) {
        resultDiv.className = 'result-message success';
        resultDiv.innerHTML = `<p>⭕ 正解です！</p><p>最頻値は ${correctMode} です。</p><p><strong>次のステップに進みましょう。</strong></p>`;

        // ステップ5を表示
        showStep5();
    } else {
        resultDiv.className = 'result-message error';
        resultDiv.innerHTML = `<p>❌ 不正解です。</p><p>最も度数が多い階級の階級値を答えてください。</p><p>ヒント: 度数分布表を見て、度数が最も大きい行の階級値を探しましょう。</p>`;
    }
}

// ========================================
// ステップ5: ヒストグラムの表示
// ========================================

/**
 * ステップ5を表示する関数（軸のみ描画）
 */
function showStep5() {
    document.getElementById('step5').style.display = 'block';
    document.getElementById('step5').scrollIntoView({ behavior: 'smooth' });

    // 軸のみを描画
    drawAxesOnly();
}

/**
 * 軸のみを描画する関数
 */
function drawAxesOnly() {
    const canvas = document.getElementById('histogramCanvas');
    const ctx = canvas.getContext('2d');

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 描画設定
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // 軸を描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Y軸
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // X軸
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    // X軸ラベル（階級）
    const numClasses = frequencyDistribution.classes.length;
    const barWidth = chartWidth / numClasses;

    frequencyDistribution.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth) + (barWidth / 2);
        const y = canvas.height - padding + 25;
        ctx.fillText(cls.classValue.toString(), x, y);
    });

    // 軸のタイトル
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('度数', 0, 0);
    ctx.restore();

    ctx.fillText('階級値', canvas.width / 2, canvas.height - 10);

    // Y軸の目盛り
    const maxFrequency = Math.max(...frequencyDistribution.classes.map(c => c.frequency));
    const yStep = Math.ceil(maxFrequency / 5);

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = i * yStep;
        const y = canvas.height - padding - (i * chartHeight / 5);
        ctx.fillText(value.toString(), padding - 10, y + 5);

        // グリッド線
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
}

/**
 * ヒストグラムを完全に描画する関数
 */
function showHistogram() {
    const canvas = document.getElementById('histogramCanvas');
    const ctx = canvas.getContext('2d');

    // 軸を再描画
    drawAxesOnly();

    // 描画設定
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const numClasses = frequencyDistribution.classes.length;
    const barWidth = chartWidth / numClasses;

    const maxFrequency = Math.max(...frequencyDistribution.classes.map(c => c.frequency));
    const yScale = chartHeight / (Math.ceil(maxFrequency / 5) * 5);

    // 棒グラフを描画
    frequencyDistribution.classes.forEach((cls, index) => {
        const x = padding + (index * barWidth);
        const barHeight = cls.frequency * yScale;
        const y = canvas.height - padding - barHeight;

        // グラデーションカラー
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // 枠線
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth - 2, barHeight);

        // 度数の値を表示
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cls.frequency.toString(), x + barWidth / 2, y - 5);
    });

    // メッセージを表示
    const messageDiv = document.getElementById('step5Message');
    messageDiv.className = 'message success';
    messageDiv.innerHTML = '<p><strong>ヒストグラムが表示されました！</strong></p><p>ノートにかいたヒストグラムと比べてみましょう。</p>';

    // 画像出力セクションを表示
    showExportSection();
}

// ========================================
// 画像出力機能
// ========================================

/**
 * 画像出力セクションを表示する関数
 */
function showExportSection() {
    document.getElementById('exportSection').style.display = 'block';
    document.getElementById('exportSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 比較モードの結果を画像として出力する関数
 */
function exportCompareMode(canvas, ctx) {
    // 描画開始位置
    let yPosition = 40;
    const leftMargin = 40;
    const rightMargin = 40;
    const contentWidth = canvas.width - leftMargin - rightMargin;

    // ========================================
    // タイトル部分
    // ========================================
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('データの活用 - 比較モード学習結果', leftMargin, yPosition);
    yPosition += 50;

    // 区切り線
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftMargin, yPosition);
    ctx.lineTo(canvas.width - rightMargin, yPosition);
    ctx.stroke();
    yPosition += 40;

    // ========================================
    // データ1情報
    // ========================================
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`データセット1: ${dataTitle1}`, leftMargin, yPosition);
    yPosition += 35;

    ctx.fillStyle = '#333';
    ctx.font = '18px sans-serif';
    ctx.fillText(`データの個数: ${dataArray1.length}個`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`平均値: ${calculateMean(dataArray1)}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`中央値: ${calculateMedian(dataArray1)}`, leftMargin + 20, yPosition);
    yPosition += 30;
    const range1 = Math.round((calculateMax(dataArray1) - calculateMin(dataArray1)) * 10000000000) / 10000000000;
    ctx.fillText(`範囲: ${range1}`, leftMargin + 20, yPosition);
    yPosition += 40;

    // ========================================
    // データ2情報
    // ========================================
    ctx.fillStyle = '#43a047';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`データセット2: ${dataTitle2}`, leftMargin, yPosition);
    yPosition += 35;

    ctx.fillStyle = '#333';
    ctx.font = '18px sans-serif';
    ctx.fillText(`データの個数: ${dataArray2.length}個`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`平均値: ${calculateMean(dataArray2)}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`中央値: ${calculateMedian(dataArray2)}`, leftMargin + 20, yPosition);
    yPosition += 30;
    const range2 = Math.round((calculateMax(dataArray2) - calculateMin(dataArray2)) * 10000000000) / 10000000000;
    ctx.fillText(`範囲: ${range2}`, leftMargin + 20, yPosition);
    yPosition += 50;

    // ========================================
    // 度数分布表
    // ========================================
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('度数分布表', leftMargin, yPosition);
    yPosition += 35;

    // 表のヘッダー
    const tableStartY = yPosition;
    const numCols = 8; // 階級、階級値、データ1度数、データ1相対度数、データ1累積相対度数、データ2度数、データ2相対度数、データ2累積相対度数
    const colWidth = contentWidth / numCols;
    const rowHeight = 30;

    // ヘッダー背景
    ctx.fillStyle = '#667eea';
    ctx.fillRect(leftMargin, tableStartY, colWidth * 2, rowHeight); // 階級と階級値
    ctx.fillStyle = '#667eea';
    ctx.fillRect(leftMargin + colWidth * 2, tableStartY, colWidth * 3, rowHeight); // データ1の列
    ctx.fillStyle = '#43a047';
    ctx.fillRect(leftMargin + colWidth * 5, tableStartY, colWidth * 3, rowHeight); // データ2の列

    // ヘッダーテキスト
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const headers = ['階級', '階級値', `度数\n${dataTitle1}`, `相対\n${dataTitle1}`, `累積\n${dataTitle1}`, `度数\n${dataTitle2}`, `相対\n${dataTitle2}`, `累積\n${dataTitle2}`];
    headers.forEach((header, index) => {
        const lines = header.split('\n');
        const x = leftMargin + (index + 0.5) * colWidth;
        if (lines.length === 2) {
            ctx.fillText(lines[0], x, tableStartY + 12);
            ctx.fillText(lines[1], x, tableStartY + 23);
        } else {
            ctx.fillText(header, x, tableStartY + 18);
        }
    });

    yPosition = tableStartY + rowHeight;

    // 表のデータ行
    ctx.font = '10px sans-serif';
    frequencyDistribution1.classes.forEach((cls1, index) => {
        const cls2 = frequencyDistribution2.classes[index];

        // 背景色（交互）
        if (index % 2 === 0) {
            ctx.fillStyle = '#f8f9fa';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(leftMargin, yPosition, contentWidth, rowHeight);

        // 枠線
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(leftMargin, yPosition, contentWidth, rowHeight);

        // テキスト
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';

        // 階級
        const isLastClass = index === frequencyDistribution1.classes.length - 1;
        const rangeText = isLastClass
            ? `${cls1.min}~${cls1.max}`
            : `${cls1.min}~${cls1.max}`;
        ctx.fillText(rangeText, leftMargin + 0.5 * colWidth, yPosition + 18);

        // 階級値
        ctx.fillText(cls1.classValue.toString(), leftMargin + 1.5 * colWidth, yPosition + 18);

        // データ1の度数
        ctx.fillText(cls1.frequency.toString(), leftMargin + 2.5 * colWidth, yPosition + 18);

        // データ1の相対度数
        ctx.fillText(cls1.relativeFrequency.toFixed(2), leftMargin + 3.5 * colWidth, yPosition + 18);

        // データ1の累積相対度数
        ctx.fillText(cls1.cumulativeRelativeFrequency.toFixed(2), leftMargin + 4.5 * colWidth, yPosition + 18);

        // データ2の度数
        ctx.fillText(cls2.frequency.toString(), leftMargin + 5.5 * colWidth, yPosition + 18);

        // データ2の相対度数
        ctx.fillText(cls2.relativeFrequency.toFixed(2), leftMargin + 6.5 * colWidth, yPosition + 18);

        // データ2の累積相対度数
        ctx.fillText(cls2.cumulativeRelativeFrequency.toFixed(2), leftMargin + 7.5 * colWidth, yPosition + 18);

        yPosition += rowHeight;
    });

    // 合計行
    const totalFrequency1 = frequencyDistribution1.classes.reduce((sum, cls) => sum + cls.frequency, 0);
    const totalFrequency2 = frequencyDistribution2.classes.reduce((sum, cls) => sum + cls.frequency, 0);
    ctx.fillStyle = '#f0f4ff';
    ctx.fillRect(leftMargin, yPosition, contentWidth, rowHeight);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftMargin, yPosition, contentWidth, rowHeight);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('合計', leftMargin + colWidth, yPosition + 18);
    ctx.fillText(totalFrequency1.toString(), leftMargin + 2.5 * colWidth, yPosition + 18);
    ctx.fillText('1.00', leftMargin + 3.5 * colWidth, yPosition + 18);
    ctx.fillText(totalFrequency2.toString(), leftMargin + 5.5 * colWidth, yPosition + 18);
    ctx.fillText('1.00', leftMargin + 6.5 * colWidth, yPosition + 18);

    yPosition += rowHeight + 40;

    // ========================================
    // 度数分布多角形
    // ========================================
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('度数分布多角形', leftMargin, yPosition);
    yPosition += 35;

    const polyWidth = contentWidth;
    const polyHeight = 400;
    const polyStartY = yPosition;
    const polyPadding = 60;

    const polyChartWidth = polyWidth - polyPadding * 2;
    const polyChartHeight = polyHeight - polyPadding * 2;

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftMargin, polyStartY, polyWidth, polyHeight);

    // 軸
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Y軸
    ctx.beginPath();
    ctx.moveTo(leftMargin + polyPadding, polyStartY + polyPadding);
    ctx.lineTo(leftMargin + polyPadding, polyStartY + polyHeight - polyPadding);
    ctx.stroke();

    // X軸
    ctx.beginPath();
    ctx.moveTo(leftMargin + polyPadding, polyStartY + polyHeight - polyPadding);
    ctx.lineTo(leftMargin + polyWidth - polyPadding, polyStartY + polyHeight - polyPadding);
    ctx.stroke();

    // 度数分布多角形を描画
    const numClasses = frequencyDistribution1.classes.length;
    const barWidth = polyChartWidth / numClasses;
    const maxFreq1 = Math.max(...frequencyDistribution1.classes.map(c => c.frequency));
    const maxFreq2 = Math.max(...frequencyDistribution2.classes.map(c => c.frequency));
    const maxFrequency = Math.max(maxFreq1, maxFreq2);
    const yScale = polyChartHeight / (Math.ceil(maxFrequency / 5) * 5);

    // データ1の線
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    frequencyDistribution1.classes.forEach((cls, index) => {
        const x = leftMargin + polyPadding + (index * barWidth) + (barWidth / 2);
        const y = polyStartY + polyHeight - polyPadding - (cls.frequency * yScale);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // データ1のポイント
    ctx.fillStyle = '#667eea';
    frequencyDistribution1.classes.forEach((cls, index) => {
        const x = leftMargin + polyPadding + (index * barWidth) + (barWidth / 2);
        const y = polyStartY + polyHeight - polyPadding - (cls.frequency * yScale);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // データ2の線
    ctx.strokeStyle = '#43a047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    frequencyDistribution2.classes.forEach((cls, index) => {
        const x = leftMargin + polyPadding + (index * barWidth) + (barWidth / 2);
        const y = polyStartY + polyHeight - polyPadding - (cls.frequency * yScale);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // データ2のポイント
    ctx.fillStyle = '#43a047';
    frequencyDistribution2.classes.forEach((cls, index) => {
        const x = leftMargin + polyPadding + (index * barWidth) + (barWidth / 2);
        const y = polyStartY + polyHeight - polyPadding - (cls.frequency * yScale);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // 階級値ラベル
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    frequencyDistribution1.classes.forEach((cls, index) => {
        const x = leftMargin + polyPadding + (index * barWidth) + (barWidth / 2);
        const y = polyStartY + polyHeight - polyPadding + 20;
        ctx.fillText(cls.classValue.toString(), x, y);
    });

    // 凡例
    const legendX = leftMargin + polyWidth - 180;
    const legendY = polyStartY + 30;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 40, legendY);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dataTitle1, legendX + 50, legendY + 5);

    ctx.strokeStyle = '#43a047';
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 30);
    ctx.lineTo(legendX + 40, legendY + 30);
    ctx.stroke();
    ctx.fillText(dataTitle2, legendX + 50, legendY + 35);

    yPosition = polyStartY + polyHeight + 20;

    // ========================================
    // 画像をダウンロード
    // ========================================
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `データ比較_${dataTitle1}_${dataTitle2}_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        URL.revokeObjectURL(url);

        // 成功メッセージを表示
        const messageDiv = document.getElementById('exportMessage');
        messageDiv.className = 'message success';
        messageDiv.textContent = '画像を保存しました！ダウンロードフォルダを確認してください。';
    });
}

/**
 * 結果を画像として出力する関数
 */
function exportAsImage() {
    const canvas = document.getElementById('exportCanvas');
    const ctx = canvas.getContext('2d');

    // 比較モードかどうかで処理を分岐（キャンバスサイズが異なる）
    if (currentMode === 'compare') {
        // 比較モードは度数分布表があるため、より大きなキャンバスが必要
        canvas.width = 1200;
        canvas.height = 2000;

        // 背景を白に設定
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        exportCompareMode(canvas, ctx);
        return;
    }

    // 通常モード用のキャンバスサイズ
    canvas.width = 1200;
    canvas.height = 1600;

    // 背景を白に設定
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 描画開始位置
    let yPosition = 40;
    const leftMargin = 40;
    const rightMargin = 40;
    const contentWidth = canvas.width - leftMargin - rightMargin;

    // ========================================
    // タイトル部分
    // ========================================
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('データの活用 - 学習結果', leftMargin, yPosition);
    yPosition += 50;

    // 区切り線
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftMargin, yPosition);
    ctx.lineTo(canvas.width - rightMargin, yPosition);
    ctx.stroke();
    yPosition += 40;

    // ========================================
    // データ情報
    // ========================================
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('データ情報', leftMargin, yPosition);
    yPosition += 35;

    ctx.font = '18px sans-serif';
    ctx.fillText(`タイトル: ${dataTitle}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`データの個数: ${dataArray.length}個`, leftMargin + 20, yPosition);
    yPosition += 30;

    // データを表示（長すぎる場合は省略）
    const dataText = dataArray.join(', ');
    if (dataText.length > 80) {
        ctx.fillText(`データ: ${dataText.substring(0, 77)}...`, leftMargin + 20, yPosition);
    } else {
        ctx.fillText(`データ: ${dataText}`, leftMargin + 20, yPosition);
    }
    yPosition += 30;

    // 昇順データ
    const sortedData = [...dataArray].sort((a, b) => a - b);
    const sortedText = sortedData.join(', ');
    if (sortedText.length > 80) {
        ctx.fillText(`昇順: ${sortedText.substring(0, 77)}...`, leftMargin + 20, yPosition);
    } else {
        ctx.fillText(`昇順: ${sortedText}`, leftMargin + 20, yPosition);
    }
    yPosition += 50;

    // ========================================
    // 代表値
    // ========================================
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('代表値', leftMargin, yPosition);
    yPosition += 35;

    ctx.font = '18px sans-serif';
    const mean = calculateMean(dataArray);
    const median = calculateMedian(dataArray);
    const min = calculateMin(dataArray);
    const max = calculateMax(dataArray);
    const range = max - min;

    ctx.fillText(`平均値: ${mean}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`中央値: ${median}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`最小値: ${min}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`最大値: ${max}`, leftMargin + 20, yPosition);
    yPosition += 30;
    ctx.fillText(`範囲: ${range}`, leftMargin + 20, yPosition);
    yPosition += 50;

    // ========================================
    // 度数分布表
    // ========================================
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('度数分布表', leftMargin, yPosition);
    yPosition += 35;

    // 表のヘッダー
    const tableStartY = yPosition;
    const colWidth = contentWidth / 5;
    const rowHeight = 35;

    // ヘッダー背景
    const gradient = ctx.createLinearGradient(leftMargin, tableStartY, leftMargin, tableStartY + rowHeight);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#43a047');
    ctx.fillStyle = gradient;
    ctx.fillRect(leftMargin, tableStartY, contentWidth, rowHeight);

    // ヘッダーテキスト
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    const headers = ['階級', '階級値', '度数', '相対度数', '累積相対度数'];
    headers.forEach((header, index) => {
        ctx.fillText(header, leftMargin + (index + 0.5) * colWidth, tableStartY + 22);
    });

    yPosition = tableStartY + rowHeight;

    // 表のデータ行
    ctx.font = '15px sans-serif';
    frequencyDistribution.classes.forEach((cls, index) => {
        // 背景色（交互）
        if (index % 2 === 0) {
            ctx.fillStyle = '#f8f9fa';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(leftMargin, yPosition, contentWidth, rowHeight);

        // 枠線
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(leftMargin, yPosition, contentWidth, rowHeight);

        // テキスト
        ctx.fillStyle = '#333';

        // 階級
        const isLastClass = index === frequencyDistribution.classes.length - 1;
        const rangeText = isLastClass
            ? `${cls.min}~${cls.max}`
            : `${cls.min}~${cls.max}`;
        ctx.fillText(rangeText, leftMargin + 0.5 * colWidth, yPosition + 22);

        // 階級値
        ctx.fillText(cls.classValue.toString(), leftMargin + 1.5 * colWidth, yPosition + 22);

        // 度数
        ctx.fillText(cls.frequency.toString(), leftMargin + 2.5 * colWidth, yPosition + 22);

        // 相対度数
        ctx.fillText(cls.relativeFrequency.toFixed(2), leftMargin + 3.5 * colWidth, yPosition + 22);

        // 累積相対度数
        ctx.fillText(cls.cumulativeRelativeFrequency.toFixed(2), leftMargin + 4.5 * colWidth, yPosition + 22);

        yPosition += rowHeight;
    });

    yPosition += 30;

    // ========================================
    // ヒストグラム
    // ========================================
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ヒストグラム', leftMargin, yPosition);
    yPosition += 35;

    // ヒストグラムを描画
    const histWidth = contentWidth;
    const histHeight = 300;
    const histStartY = yPosition;
    const histPadding = 50;

    const histChartWidth = histWidth - histPadding * 2;
    const histChartHeight = histHeight - histPadding * 2;

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftMargin, histStartY, histWidth, histHeight);

    // 軸
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Y軸
    ctx.beginPath();
    ctx.moveTo(leftMargin + histPadding, histStartY + histPadding);
    ctx.lineTo(leftMargin + histPadding, histStartY + histHeight - histPadding);
    ctx.stroke();

    // X軸
    ctx.beginPath();
    ctx.moveTo(leftMargin + histPadding, histStartY + histHeight - histPadding);
    ctx.lineTo(leftMargin + histWidth - histPadding, histStartY + histHeight - histPadding);
    ctx.stroke();

    // ヒストグラムの棒を描画
    const numClasses = frequencyDistribution.classes.length;
    const barWidth = histChartWidth / numClasses;
    const maxFreq = Math.max(...frequencyDistribution.classes.map(c => c.frequency));
    const yScale = histChartHeight / (Math.ceil(maxFreq / 5) * 5);

    frequencyDistribution.classes.forEach((cls, index) => {
        const x = leftMargin + histPadding + (index * barWidth);
        const barHeight = cls.frequency * yScale;
        const y = histStartY + histHeight - histPadding - barHeight;

        // グラデーション
        const barGradient = ctx.createLinearGradient(x, y, x, histStartY + histHeight - histPadding);
        barGradient.addColorStop(0, '#667eea');
        barGradient.addColorStop(1, '#43a047');

        ctx.fillStyle = barGradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // 枠線
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth - 2, barHeight);

        // 階級値ラベル
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cls.classValue.toString(), x + barWidth / 2, histStartY + histHeight - histPadding + 20);

        // 度数の値
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(cls.frequency.toString(), x + barWidth / 2, y - 5);
    });

    // 軸ラベル
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    // X軸ラベル
    ctx.fillText('階級値', leftMargin + histWidth / 2, histStartY + histHeight - 5);

    // Y軸ラベル
    ctx.save();
    ctx.translate(leftMargin + 15, histStartY + histHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('度数', 0, 0);
    ctx.restore();

    // ========================================
    // 画像をダウンロード
    // ========================================
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `データの活用_${dataTitle}_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        URL.revokeObjectURL(url);

        // 成功メッセージを表示
        const messageDiv = document.getElementById('exportMessage');
        messageDiv.className = 'message success';
        messageDiv.textContent = '画像を保存しました！ダウンロードフォルダを確認してください。';
    });
}

// ========================================
// リセット機能
// ========================================

/**
 * すべての入力と状態をリセットする関数
 */
function resetAll() {
    // 確認ダイアログ
    if (!confirm('最初からやり直しますか？入力した内容はすべて消えます。')) {
        return;
    }

    // グローバル変数をリセット
    currentMode = 'single';
    dataArray = [];
    dataTitle = "";
    dataArray1 = [];
    dataArray2 = [];
    dataTitle1 = "";
    dataTitle2 = "";
    frequencyDistribution = {
        classWidth: 0,
        classes: [],
        minValue: 0,
        maxValue: 0
    };
    frequencyDistribution1 = {
        classWidth: 0,
        classes: [],
        minValue: 0,
        maxValue: 0
    };
    frequencyDistribution2 = {
        classWidth: 0,
        classes: [],
        minValue: 0,
        maxValue: 0
    };
    autoClassSettings = {
        numClasses: 0,
        classWidth: 0,
        firstMin: 0
    };

    // 入力フォームをリセット
    document.getElementById('dataTitle').value = '';
    document.getElementById('dataInput').value = '';
    document.getElementById('dataLoadMessage').innerHTML = '';
    document.getElementById('dataTitle1').value = '';
    document.getElementById('dataInput1').value = '';
    document.getElementById('dataTitle2').value = '';
    document.getElementById('dataInput2').value = '';
    document.getElementById('dataLoadMessageCompare').innerHTML = '';

    // すべてのステップを非表示
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step1_compare').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step2_compare').style.display = 'none';
    document.getElementById('step2_5').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    document.getElementById('step3_compare').style.display = 'none';
    document.getElementById('step4').style.display = 'none';
    document.getElementById('step4_compare').style.display = 'none';
    document.getElementById('step5').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';

    // モード選択を再表示
    document.getElementById('modeSelection').style.display = 'block';

    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// ページ読み込み時の初期化
// ========================================

// ページが読み込まれたときに実行される処理
window.addEventListener('load', function() {
    console.log('データの活用学習教材が読み込まれました');
});
