# 数直線対戦計算ゲーム - 実装仕様書 for Claude Code

## プロジェクト概要

中学校の数学授業のウォーミングアップ用ゲーム教材。
桃太郎電鉄風の数直線上を移動する対戦型計算ゲーム。

**技術スタック:** HTML + CSS + JavaScript（ライブラリ不要）
**ファイル構成:** 単一HTMLファイル（Google Classroomでの共有を容易にするため）
**推定プレイ時間:** 約10分

---

## ゲームルール

### 基本設定
- **プレイ人数:** 2〜4人（デフォルト3人）
- **数直線範囲:** -20 〜 +20
- **固定駅:** -16, -8, 0, +8, +16 の5カ所
- **初期位置:** 全プレイヤー0からスタート
- **ターン数:** 10ターン
- **到達判定:** 駅の±3マス以内

### ターンの流れ
1. **カード獲得判定**（30%の確率でランダムカードを1枚獲得）
2. **カード使用判断**（プレイヤーが選択）
3. **計算問題出題**（3択クイズ）
4. **正誤判定**
   - 正解: 答えの値が表示される
   - 不正解: 移動できない
5. **移動方向選択**（正解時のみ）
   - +答えマス進む
   - -答えマス進む
   - 移動しない（パス）
6. **移動実行とポイント計算**
   - 通過マス数 × 1点
7. **駅到達判定**
   - 駅の±3マス以内なら到達とみなす
   - 到達時: +15点、駅の位置に移動、次の駅が設定される

### ポイント設定
- **通過マスポイント:** 1点/マス
- **駅到達ポイント:** 15点

### 勝利条件
10ターン終了時、最も合計ポイントが高いプレイヤーが勝利

---

## カードシステム

### カードの種類と効果

| カード名 | 出現率 | 効果 | 使用タイミング |
|---------|-------|------|--------------|
| ランダムぶっとび | 25% | -2〜+4マスのランダム移動 | 計算問題の前 |
| 移動数2倍 | 30% | 次の移動距離が2倍になる | 計算問題の前（次の移動に適用） |
| ワープ | 25% | 目的地駅まで75%接近 | 計算問題の前 |
| 位置交換 | 10% | 目的地駅に最も近い相手プレイヤーと位置を交換 | 計算問題の前 |
| ポイント2倍 | 10% | 次のターンの獲得ポイントが2倍 | 計算問題の前（次のポイントに適用） |

### カード獲得
- 各ターン開始時に30%の確率で1枚獲得
- 手札上限なし（何枚でも保持可能）

### カード使用
- 計算問題の前に使用可能
- 1ターンに1枚まで使用可能
- 使用後は手札から削除

---

## 計算問題

### 問題の種類
すべての問題の答えは**1〜5の整数**に設定されています。

#### 1. 正負の数の加減
```
例:
- 3 + 2 = ?  (答え: 5)
- 7 - 4 = ?  (答え: 3)
- 8 - 7 = ?  (答え: 1)
- 6 - 2 = ?  (答え: 4)
```

#### 2. 一次方程式
```
例:
- 2x + 1 = 9, x = ?  (答え: 4)
- 3x - 2 = 7, x = ?  (答え: 3)
- x + 5 = 6, x = ?   (答え: 1)
- 4x - 3 = 17, x = ? (答え: 5)
```

#### 3. 素因数分解
```
例:
- 18 = 2 × ?²  (答え: 3)
- 12 = ? × 3   (答え: 4)
- 50 = ? × 25  (答え: 2)
- 20 = ? × 5   (答え: 4)
```

### 3択クイズの生成
- 正解1つ + 不正解2つ
- 不正解は正解±1〜3の範囲でランダム生成
- 選択肢はランダムな順序で表示

### 問題プール
最低20問以上を用意し、ランダムに出題

---

## UI/UX要件

### 画面レイアウト

```
┌─────────────────────────────────────────┐
│  タイトル: 数直線対戦計算ゲーム         │
├─────────────────────────────────────────┤
│  ゲーム情報エリア                        │
│  - 現在のターン: X / 10                  │
│  - 現在のプレイヤー: プレイヤーY         │
│  - 目的地駅: Z                           │
├─────────────────────────────────────────┤
│  数直線表示エリア                        │
│  -20 ←─────────●─────→ +20             │
│       駅  プレイヤー駒  駅               │
├─────────────────────────────────────────┤
│  スコアボードエリア                      │
│  プレイヤー1: XX点 (位置: Y)             │
│  プレイヤー2: XX点 (位置: Y) ← 現在     │
│  プレイヤー3: XX点 (位置: Y)             │
├─────────────────────────────────────────┤
│  手札カードエリア                        │
│  [カード1] [カード2] [カード3]           │
├─────────────────────────────────────────┤
│  ゲームエリア（状況に応じて変化）        │
│  - カード使用選択                        │
│  - 計算問題表示                          │
│  - 移動方向選択                          │
│  - 結果表示                              │
└─────────────────────────────────────────┘
```

### 数直線の表示
- 駅の位置: -16, -8, 0, +8, +16 を強調表示（★マーク）
- 目的地駅: 特に目立たせる（🎯マークや色）
- プレイヤー駒: 色分けして表示（●マーク）
- 現在位置の数値を表示

### 色設定の提案
- プレイヤー1: 赤 (#FF6B6B)
- プレイヤー2: 青 (#4ECDC4)
- プレイヤー3: 緑 (#95E77D)
- プレイヤー4: 黄 (#FFE66D)
- 駅: グレー (#999999)
- 目的地駅: オレンジ (#FF9F1C)

### アニメーション
- 駒の移動: スムーズにスライド（0.5秒程度）
- カード使用: カードが光る演出
- 正解/不正解: フィードバック表示
- 駅到達: お祝い演出（簡易的な✨エフェクト）

### ボタン・UI要素
- ボタンは大きく、タップしやすいサイズ
- ホバー時の視覚的フィードバック
- 無効化されたボタンはグレーアウト

---

## データ構造

### ゲーム状態オブジェクト

```javascript
const gameState = {
  // ゲーム設定
  numPlayers: 3,
  maxTurns: 10,
  stations: [-16, -8, 0, 8, 16],
  
  // 現在の状態
  currentTurn: 1,
  currentPlayerIndex: 0,
  currentStationIndex: 0,
  targetStation: -16,
  
  // プレイヤーデータ
  players: [
    {
      id: 0,
      name: "プレイヤー1",
      position: 0,
      score: 0,
      cards: ["移動数2倍", "ワープ"],
      color: "#FF6B6B"
    },
    // ... 他のプレイヤー
  ],
  
  // ターン内の一時データ
  currentQuestion: null,
  currentAnswer: null,
  moveDoubleActive: false,  // 移動数2倍フラグ
  pointDoubleActive: false  // ポイント2倍フラグ
};
```

### 問題オブジェクト

```javascript
const questionPool = [
  {
    type: "addition",
    question: "3 + 2 = ?",
    correctAnswer: 5,
    choices: [5, 4, 6]  // ランダムにシャッフルして表示
  },
  {
    type: "equation",
    question: "2x + 1 = 9, x = ?",
    correctAnswer: 4,
    choices: [4, 3, 5]
  },
  {
    type: "factorization",
    question: "18 = 2 × ?²",
    correctAnswer: 3,
    choices: [3, 2, 4]
  },
  // ... 最低20問以上
];
```

### カード定義

```javascript
const cardDefinitions = {
  "ランダムぶっとび": {
    description: "-2〜+4マスのランダム移動",
    effect: function(player, gameState) {
      const move = Math.floor(Math.random() * 7) - 2; // -2〜+4
      player.position += move;
      player.position = Math.max(-20, Math.min(20, player.position));
      return `${move >= 0 ? '+' : ''}${move}マス移動しました!`;
    }
  },
  "移動数2倍": {
    description: "次の移動距離が2倍",
    effect: function(player, gameState) {
      gameState.moveDoubleActive = true;
      return "次の移動が2倍になります!";
    }
  },
  "ワープ": {
    description: "目的地まで75%接近",
    effect: function(player, gameState) {
      const distance = gameState.targetStation - player.position;
      const move = Math.floor(distance * 0.75);
      player.position += move;
      player.position = Math.max(-20, Math.min(20, player.position));
      return `目的地に向かって${Math.abs(move)}マス移動しました!`;
    }
  },
  "位置交換": {
    description: "目的地に最も近い相手と位置交換",
    effect: function(player, gameState) {
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
    effect: function(player, gameState) {
      gameState.pointDoubleActive = true;
      return "次のポイントが2倍になります!";
    }
  }
};
```

---

## ゲームフロー詳細

### 1. ゲーム開始画面
- プレイヤー人数選択（2〜4人）
- プレイヤー名入力（オプション、デフォルトは「プレイヤー1」など）
- 「ゲーム開始」ボタン

### 2. ターン開始フェーズ
```
ターン X / 10
プレイヤーYのターンです

[カード獲得判定]
→ カードを獲得した場合: 「〇〇カードを獲得しました!」
→ カードを獲得しなかった場合: 何も表示しない
```

### 3. カード使用選択フェーズ
```
手札: [カード1] [カード2] [カード3]

[各カードに「使う」ボタン]
[「カードを使わない」ボタン]
```

### 4. カード効果実行フェーズ（カード使用時のみ）
```
カード「〇〇」を使用しました!
効果: ××

[「次へ」ボタン]
```

### 5. 計算問題フェーズ
```
問題: 2x + 1 = 9, x = ?

[選択肢1: 4]  [選択肢2: 3]  [選択肢3: 5]
```

### 6. 正誤判定フェーズ
```
正解の場合:
「正解です! 答えは X です」

不正解の場合:
「不正解です。正解は X でした」
「移動できません」
→ [「次のターンへ」ボタン] で次のプレイヤーへ
```

### 7. 移動方向選択フェーズ（正解時のみ）
```
移動距離: X マス
(移動数2倍カードの効果で 2X マス)

[+Xマス進む]  [-Xマス進む]  [移動しない]
```

### 8. 移動実行フェーズ
```
Xマス移動しました!
位置: A → B
通過マス: Xマス → +X点
(ポイント2倍カードの効果で +2X点)

現在の得点: Y点
```

### 9. 駅到達判定フェーズ
```
駅到達の場合:
「駅 Z に到達しました! 🎉」
「+15点」
「次の目的地は駅 W です」

駅到達していない場合:
何も表示しない

[「次のターンへ」ボタン]
```

### 10. ゲーム終了フェーズ（10ターン終了後）
```
ゲーム終了!

最終結果:
1位: プレイヤーX  YY点 🏆
2位: プレイヤーA  BB点
3位: プレイヤーC  DD点

[「もう一度遊ぶ」ボタン]
```

---

## 実装上の注意点

### 1. 移動制限
- プレイヤーの位置は常に-20〜+20の範囲内に制限
- 範囲外に移動しようとした場合は端で停止

```javascript
player.position = Math.max(-20, Math.min(20, player.position));
```

### 2. 駅到達判定
- 駅の±3マス以内に入ったら到達とみなす
- 到達したプレイヤーは駅の正確な位置に移動

```javascript
function checkStationReach(playerPosition, targetStation) {
  return Math.abs(playerPosition - targetStation) <= 3;
}
```

### 3. 次の駅の設定
- 駅は配列の順番に巡回
- 最後の駅の次は最初の駅に戻る

```javascript
currentStationIndex = (currentStationIndex + 1) % stations.length;
targetStation = stations[currentStationIndex];
```

### 4. カード効果の適用タイミング
- 「移動数2倍」「ポイント2倍」は次のアクションに適用
- 効果適用後は即座にフラグをfalseに戻す

### 5. ターン管理
- ターンカウンターは1から開始
- プレイヤーインデックスは0から開始
- 全プレイヤーが1回ずつ行動したら次のターンへ

```javascript
// 次のプレイヤーへ
currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;

// 全員が行動したらターンを進める
if (currentPlayerIndex === 0) {
  currentTurn++;
}
```

---

## 問題生成アルゴリズム

### 正負の数の加減
```javascript
function generateAdditionProblem() {
  const answer = Math.floor(Math.random() * 5) + 1; // 1〜5
  const a = Math.floor(Math.random() * 10) + answer; // answer〜(answer+10)
  const b = a - answer;
  
  const question = `${a} - ${b} = ?`;
  const choices = generateChoices(answer);
  
  return { type: "addition", question, correctAnswer: answer, choices };
}
```

### 一次方程式
```javascript
function generateEquationProblem() {
  const x = Math.floor(Math.random() * 5) + 1; // 1〜5
  const coef = Math.floor(Math.random() * 3) + 2; // 2〜4
  const c = Math.floor(Math.random() * 10) + 1; // 1〜10
  const d = coef * x + c;
  
  const question = `${coef}x + ${c} = ${d}, x = ?`;
  const choices = generateChoices(x);
  
  return { type: "equation", question, correctAnswer: x, choices };
}
```

### 素因数分解
```javascript
function generateFactorizationProblem() {
  const answer = Math.floor(Math.random() * 4) + 2; // 2〜5
  const k = Math.floor(Math.random() * 5) + 2; // 2〜6
  const n = k * answer * answer;
  
  const question = `${n} = ${k} × ?²`;
  const choices = generateChoices(answer);
  
  return { type: "factorization", question, correctAnswer: answer, choices };
}
```

### 選択肢生成（3択）
```javascript
function generateChoices(correctAnswer) {
  const choices = [correctAnswer];
  
  // 不正解の選択肢を2つ生成
  while (choices.length < 3) {
    const offset = Math.floor(Math.random() * 3) + 1; // 1〜3
    const wrongAnswer = correctAnswer + (Math.random() < 0.5 ? offset : -offset);
    
    // 1〜5の範囲内、重複なし
    if (wrongAnswer >= 1 && wrongAnswer <= 5 && !choices.includes(wrongAnswer)) {
      choices.push(wrongAnswer);
    }
  }
  
  // シャッフル
  return choices.sort(() => Math.random() - 0.5);
}
```

---

## レスポンシブデザイン要件

### PC表示
- 横幅最大800px程度
- 中央揃え
- 数直線を横長に表示

### タブレット表示
- 画面幅に合わせて調整
- ボタンサイズを大きめに
- タッチ操作を考慮

### スマートフォン表示
- 縦向き想定
- ボタンは縦に並べる
- 数直線はコンパクトに表示

---

## ファイル構成

```
number-line-game.html
├─ <head>
│   ├─ <meta> タグ（文字コード、ビューポート設定）
│   ├─ <style> タグ（すべてのCSS）
│   └─ <title>
├─ <body>
│   ├─ ゲーム画面HTML
│   └─ <script> タグ（すべてのJavaScript）
└─ （単一ファイルで完結）
```

---

## デバッグ・テスト項目

### 基本動作
- [ ] ゲーム開始時の初期化
- [ ] 各プレイヤーのターン進行
- [ ] 10ターン終了後のゲーム終了

### カード機能
- [ ] 各カードの効果が正しく適用される
- [ ] カード使用後に手札から削除される
- [ ] 移動数2倍、ポイント2倍が次のアクションにのみ適用される

### 計算問題
- [ ] 問題がランダムに出題される
- [ ] 正解/不正解の判定が正しい
- [ ] 選択肢が3つ表示される

### 移動システム
- [ ] 移動方向選択が正しく機能
- [ ] 移動範囲が-20〜+20に制限される
- [ ] 駒がアニメーションで移動する

### 駅到達
- [ ] ±3マス以内で到達判定が正しい
- [ ] 駅到達時にポイントが加算される
- [ ] 次の駅が正しく設定される

### スコア計算
- [ ] 通過マスポイントが正しく計算される
- [ ] 駅到達ポイントが正しく加算される
- [ ] ポイント2倍カードの効果が正しい

### UI/UX
- [ ] 現在のプレイヤーが分かりやすく表示される
- [ ] 数直線上の位置が正確に表示される
- [ ] ボタンが押しやすく、反応が分かりやすい

---

## 拡張性の考慮

将来的な拡張のため、以下の点を考慮してコードを記述してください:

1. **問題の追加が容易**
   - 問題プールに追加するだけで対応可能

2. **駅の位置変更が容易**
   - `stations`配列を変更するだけで対応可能

3. **カードの追加が容易**
   - `cardDefinitions`にオブジェクトを追加するだけ

4. **パラメータ調整が容易**
   - ゲーム設定を変数で管理

---

## コメントの記述方針

初心者にも理解しやすいよう、以下のようなコメントを付けてください:

```javascript
// ゲーム状態を管理するオブジェクト
const gameState = {
  numPlayers: 3,  // プレイヤー人数
  currentTurn: 1,  // 現在のターン（1〜10）
  // ...
};

/**
 * プレイヤーを次の位置に移動させる関数
 * @param {number} playerId - プレイヤーのID
 * @param {number} distance - 移動距離（正の数で右、負の数で左）
 */
function movePlayer(playerId, distance) {
  // プレイヤーを取得
  const player = gameState.players[playerId];
  
  // 移動数2倍カードの効果を適用
  if (gameState.moveDoubleActive) {
    distance *= 2;
    gameState.moveDoubleActive = false;  // 効果を1回だけ適用
  }
  
  // 移動を実行（範囲制限付き）
  player.position += distance;
  player.position = Math.max(-20, Math.min(20, player.position));
  
  // アニメーションで移動を表示
  animatePlayerMove(player);
}
```

---

## 完成イメージ

### ゲーム開始時
- タイトル表示
- プレイヤー人数選択
- シンプルで分かりやすい

### プレイ中
- 数直線が常に表示され、各プレイヤーの位置が一目瞭然
- 現在のターンとプレイヤーが明確
- カード、問題、移動選択が段階的に表示
- 適切なフィードバックとアニメーション

### ゲーム終了時
- ランキング表示
- 再プレイが簡単

---

## 実装の優先順位

### Phase 1: 最小限の動作（MVP）
1. ゲーム初期化（プレイヤー人数選択）
2. 数直線とプレイヤー駒の表示
3. 計算問題の出題と正誤判定
4. 基本的な移動（移動方向選択なし、常に+方向）
5. スコア計算
6. ゲーム終了判定

### Phase 2: コア機能の追加
7. 移動方向選択機能
8. 駅システムと到達判定
9. カードシステム（すべてのカード）
10. アニメーション効果

### Phase 3: UI/UX向上
11. デザインの洗練
12. レスポンシブ対応
13. エフェクトの追加
14. 操作説明の追加

---

## 成果物の確認ポイント

実装完了後、以下を確認してください:

✅ 単一のHTMLファイルで動作する
✅ ブラウザで開いてすぐに遊べる
✅ 10分程度でゲームが完結する
✅ 計算問題が正しく出題される
✅ カードシステムが正常に動作する
✅ スコア計算が正確
✅ タブレットでの操作が快適
✅ コードにコメントが適切に付いている
✅ 中学生が楽しめるデザイン

---

以上の仕様に基づいて実装を進めてください。
不明点があれば、いつでも質問してください!
