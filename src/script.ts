import weaponsData from '../weapon.json';

// イベントリスナーのイベントタイプをハードコーディングするのが嫌だったので定数にした
const EVENT_CLICK = 'click';
const EVENT_NONE = 'none';

const STYLE_HIDDEN = 'hidden';

// getElementOrNull(document, '#to-title-button')のようにしてもエラーにはならないが、
// 返却されるジェネリック型を明示的に指定することで以下のようなメリットがある
    // 後の処理でその型特有のプロパティやメソッドにアクセスしやすくなる
    // 型安全性が向上し、型に関連するエラーをコンパイル時に検出できるようになる
const startButton = getElementOrNull<HTMLButtonElement>(document, '#start-button');
// const nextButton = getElementOrNull<HTMLButtonElement>(document,'#next-button');
// const toResultButton = getElementOrNull<HTMLButtonElement>(document, '#to-result-button');
const toTitleButton = getElementOrNull<HTMLButtonElement>(document, '#to-title-button');

const startScreen = getElementOrNull<HTMLDivElement>(document, '#start-screen');
const quizScreen = getElementOrNull<HTMLDivElement>(document, '#quiz-screen');
const resultScreen = getElementOrNull<HTMLDivElement>(document, '#result-screen');

const weapon1Element = getElementOrNull<HTMLDivElement>(document, '#weapon-1');
const weapon2Element = getElementOrNull<HTMLDivElement>(document, '#weapon-2');
const weapon1Img = weapon1Element? getElementOrNull<HTMLImageElement>(weapon1Element, 'img') : null;
const weapon2Img = weapon2Element? getElementOrNull<HTMLImageElement>(weapon2Element, 'img') : null;
const weapon1NameElement = weapon1Element? getElementOrNull<HTMLDivElement>(weapon1Element, '.quiz-screen-weapon-name') : null;
const weapon2NameElement = weapon2Element? getElementOrNull<HTMLDivElement>(weapon2Element, '.quiz-screen-weapon-name') : null;

const answerModal = getElementOrNull<HTMLDivElement>(document, '#answer-modal');
const answerImage = getElementOrNull<HTMLImageElement>(document, '#answer-image');  

const questionNumberElement = getElementOrNull<HTMLSpanElement>(document, '#question-number');

// 出題履歴と回答履歴を保持するための配列
// ts(7034)回避のために変数の型を定義する（let questionHistory = [];だと型推論が機能しない）
type QuestionHistory = {
    question: {
        questionNumber: number;
        weapon1Id: number;
        weapon2Id: number;
    },
    result: {
        userAnswer: number,
        correctAnswer: number,
        isAnswerCorrect: boolean;
    }
};
let questionHistory: QuestionHistory[] = [];

// 問題数をカウントするための変数
let questionNumberCount: number = 0;

// ランダムな2つのブキのための変数
let weapon1Id: number = 0;
let weapon2Id: number = 0;

// ユーザの回答を保持するための変数
let userAnswer: number = 0;

if (startButton && toTitleButton &&
    startScreen && quizScreen && resultScreen &&
    weapon1Element && weapon2Element && weapon1Img && weapon2Img &&
    questionNumberElement &&
    answerModal && answerImage
    ) {

    // スタートボタンを押したとき
    startButton.addEventListener('click', function() {
        // 画面の切り替え
        startScreen.classList.add(STYLE_HIDDEN);
        quizScreen.classList.remove(STYLE_HIDDEN);

        // 問題数をカウントアップ
        questionNumberCount++;

        // ランダムなブキを2種類取得してHTMLに挿入
        const randomWeaponsIds = getRandomWeaponsIds();
        displayRandomWeapons(randomWeaponsIds.weapon1Id, randomWeaponsIds.weapon2Id);
    });

    // ブキ1かブキ2の画像を押したとき
    setupWeaponClickListener(weapon1Element, weapon1Img);
    setupWeaponClickListener(weapon2Element, weapon2Img);

    // 次へボタンを押したとき
    // nextButton.addEventListener(EVENT_CLICK, function() {
    //     // 次へボタンを非表示
    //     nextButton.classList.add(STYLE_HIDDEN);
    //     // 問題数をインクリメント
    //     questionNumberCount++;

    //     // 問題数が10に達したかチェック
    //     if (questionNumberCount > 10) {
    //         // 10問目を終えたら結果画面へのボタンを表示
    //         toResultButton.classList.remove(STYLE_HIDDEN);
    //         setWeaponClickable(false, weapon1Img, weapon2Img);
    //     } else {
    //         // ブキの画像をクリックできるようにする
    //         setWeaponClickable(true, weapon1Img, weapon2Img);

    //         // 問題数をHTMLに挿入
    //         questionNumberElement.textContent = questionNumberCount.toString();

    //         // ランダムなブキを2種類取得してHTMLに挿入
    //         const randomWeaponsIds = getRandomWeaponsIds();
    //         displayRandomWeapons(randomWeaponsIds.weapon1Id, randomWeaponsIds.weapon2Id);
    //     }  
    // });

    // モーダルをクリックしたときの処理
    // answerModal.addEventListener(EVENT_CLICK, function() {
    //     // 問題数をインクリメント
    //     questionNumberCount++;
    //     // モーダルを非表示
    //     answerModal.classList.add(STYLE_HIDDEN);

    //     // 問題数が10に達したかチェック
    //     if (questionNumberCount > 10) {
    //         // 結果画面へ
    //         quizScreen.classList.add(STYLE_HIDDEN);
    //         resultScreen.classList.remove(STYLE_HIDDEN);
    //         calculateAndDisplayScore();
    //         displayQuestionHistory();
    //     } else {
    //         // ブキの画像をクリックできるようにする
    //         setWeaponClickable(true, weapon1Img, weapon2Img);

    //         // 問題数をHTMLに挿入
    //         questionNumberElement.textContent = questionNumberCount.toString();

    //         // ランダムなブキを2種類取得してHTMLに挿入
    //         const randomWeaponsIds = getRandomWeaponsIds();
    //         displayRandomWeapons(randomWeaponsIds.weapon1Id, randomWeaponsIds.weapon2Id);
    //     }
    // });

    // 結果画面へのボタンを押したとき
    // toResultButton.addEventListener(EVENT_CLICK, function() {
    //     quizScreen.classList.add(STYLE_HIDDEN);
    //     resultScreen.classList.remove(STYLE_HIDDEN);
    // });

    // タイトル画面へのボタンを押したとき
    toTitleButton.addEventListener(EVENT_CLICK, function() {
        // 変数の初期化
        questionNumberCount = 0;
        questionHistory = [];

        // 画像のクリックイベントを再度有効にする
        setWeaponClickable(true, weapon1Img, weapon2Img);

        // 画像とalt属性をリセット
        weapon1Img.src = '';
        weapon1Img.alt = '';
        weapon2Img.src = '';
        weapon2Img.alt = '';

        // weapon-id属性をリセット
        weapon1Element.setAttribute('weapon-id', '');
        weapon2Element.setAttribute('weapon-id', '');

        // 問題数をリセット
        questionNumberElement.textContent = '1';

        // 結果画面のresult-grid-containerの子要素を全て削除
        const resultGridContainer = document.getElementById('result-grid-container');
        if (resultGridContainer) {
            while (resultGridContainer.firstChild) {
                resultGridContainer.removeChild(resultGridContainer.firstChild);
            }
        }

        // 結果画面へのボタンを非表示にする
        // toResultButton.classList.add(STYLE_HIDDEN);

        // 画面切り替え
        resultScreen.classList.add(STYLE_HIDDEN);
        startScreen.classList.remove(STYLE_HIDDEN);
    });
}


/**
 *
 * 以下、関数定義
 *
 */

// 要素取得とnullチェックを行う関数
function getElementOrNull<E extends Element>(parent: Element | Document, selector: string): E | null {
    const element = parent.querySelector(selector) as E | null;
    if (element === null) {
        console.error(`エラー：要素${parent}.${selector}の取得に失敗しました。`);
        return null;
    }
    return element;
}

// ブキをランダムに2つ選ぶ関数
function getRandomWeaponsIds() {
    // weapon.jsonから全てのidを取得
    const ids = weaponsData.map(weapon => weapon.id);
    
    // ids配列からランダムにidを選択
    // Math.floor(Math.random() * ids.length)は、0からidsの最大インデックス（もしlengthが5であれば最大インデックスは4）の値をとる
    const randomId1 = ids[Math.floor(Math.random() * ids.length)];
    let randomId2 = ids[Math.floor(Math.random() * ids.length)];
    // 同じidが選ばれないようにする
    while(randomId1 === randomId2) {
        randomId2 = ids[Math.floor(Math.random() * ids.length)];
    }

    // 選択したidに基づいてブキのデータを取得
    weapon1Id = weaponsData.find(weapon => weapon.id === randomId1)?.id ?? 0;
    weapon2Id = weaponsData.find(weapon => weapon.id === randomId2)?.id ?? 0;
    if (!weapon1Id || !weapon2Id) {
        console.error('エラー：ブキのデータ取得');
    }
    return { weapon1Id, weapon2Id };
}

// ブキの情報をHTMLに挿入する関数
function displayRandomWeapons(weapon1Id: number, weapon2Id: number) {

    // ブキのnameとimageを取得
    const weapon1Name = weaponsData.find(weapon => weapon.id === weapon1Id)?.name;
    const weapon1Image = weaponsData.find(weapon => weapon.id === weapon1Id)?.image;
    const weapon2Name = weaponsData.find(weapon => weapon.id === weapon2Id)?.name;
    const weapon2Image = weaponsData.find(weapon => weapon.id === weapon2Id)?.image;
    if (weapon1Name == null || weapon1Image == null || weapon2Name == null || weapon2Image == null) {
        console.error('エラー:ブキの名前、画像パス取得');
        return;
    }

    // HTMLにブキ画像のsrcとaltを挿入
    if (weapon1Img && weapon2Img) {
        weapon1Img.src = weapon1Image;
        weapon1Img.alt = weapon1Name;
        weapon2Img.src = weapon2Image;
        weapon2Img.alt = weapon2Name;
    }

    // HTMLにブキのIDを挿入
    if (weapon1Element && weapon2Element) {
        weapon1Element.setAttribute('weapon-id', weapon1Id.toString());
        weapon2Element.setAttribute('weapon-id', weapon2Id.toString());
    }

    // HTMLにブキの名前を挿入
    if (weapon1NameElement && weapon2NameElement) {
        weapon1NameElement.textContent = weapon1Name;
        weapon2NameElement.textContent = weapon2Name;
    }
}
// ブキの画像クリック可否を操作する処理
function setWeaponClickable(isClickable: boolean, weapon1Img: HTMLImageElement, weapon2Img: HTMLImageElement) {
    if (isClickable){
        weapon1Img.style.pointerEvents = '';
        weapon2Img.style.pointerEvents = '';
    } else {
        weapon1Img.style.pointerEvents = EVENT_NONE;
        weapon2Img.style.pointerEvents = EVENT_NONE;
    }
}

// 答え合わせ用の関数（正解のブキのidを返す）
function checkAnswer(weapon1Id: number, weapon2Id: number): number {

    // ?はオプショナルチェイニング演算子エラーts(2532)対策
    const weapon1Range: number | null = weaponsData.find(weapon => weapon.id === weapon1Id)?.range ?? null;
    const weapon2Range: number | null = weaponsData.find(weapon => weapon.id === weapon2Id)?.range ?? null;
    if (weapon1Range == null || weapon2Range == null) {
        console.error('エラー：ブキの射程取得');
        return 0;
    }
    // weapon1とweapon2のrangeを比較してどちらの値が大きいか確認する
    const correctAnswer = weapon1Range > weapon2Range ? weapon1Id : weapon2Id;
    return correctAnswer;
}

// questionHistoryへのデータ追加を行う関数
function addQuestionHistory(questionNumberCount: number, weapon1Id: number, weapon2Id: number, userAnswer: number, correctAnswer: number) {
    questionHistory.push({
        question: {
            questionNumber: questionNumberCount,
            weapon1Id: weapon1Id,
            weapon2Id: weapon2Id,
        },
        result: {
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isAnswerCorrect: userAnswer === correctAnswer
        }
    });
    console.debug(questionHistory);
}

// ブキの画像にイベントリスナーを設定する共通関数
// function setupWeaponClickListener(userSelectedWeaponElement: HTMLDivElement, UserSelectedWeaponImg: HTMLImageElement) {
//     if (weapon1Img && weapon2Img && nextButton) {
//         UserSelectedWeaponImg.addEventListener(EVENT_CLICK, () => {
//             userAnswer = Number(userSelectedWeaponElement.getAttribute('weapon-id'));
//             const correctAnswer = checkAnswer(weapon1Id, weapon2Id);
//             addQuestionHistory(questionNumberCount, weapon1Id, weapon2Id, userAnswer, correctAnswer);
//             setWeaponClickable(false, weapon1Img, weapon2Img);
//             nextButton.classList.remove(STYLE_HIDDEN);
//         });
//     }
// }

// モーダル使うバージョン
function setupWeaponClickListener(userSelectedWeaponElement: HTMLDivElement, UserSelectedWeaponImg: HTMLImageElement) {
    if (weapon1Img && weapon2Img && answerModal && answerImage && quizScreen && resultScreen && questionNumberElement) {
        UserSelectedWeaponImg.addEventListener(EVENT_CLICK, () => {
            setWeaponClickable(false, weapon1Img, weapon2Img);
            userAnswer = Number(userSelectedWeaponElement.getAttribute('weapon-id'));
            const correctAnswer = checkAnswer(weapon1Id, weapon2Id);
            addQuestionHistory(questionNumberCount, weapon1Id, weapon2Id, userAnswer, correctAnswer);
            const isCorrect = userAnswer === correctAnswer;
            // モーダルと回答画像の表示を更新
            answerImage.src = isCorrect ? '/mark_maru.png' : '/mark_batsu.png';
            answerModal.classList.remove(STYLE_HIDDEN);

            // モーダルを自動で閉じて次の問題に進む
            setTimeout(() => {
                answerModal.classList.add(STYLE_HIDDEN);
                questionNumberCount++;
                if (questionNumberCount > 10) {
                    quizScreen.classList.add(STYLE_HIDDEN);
                    resultScreen.classList.remove(STYLE_HIDDEN);
                    calculateAndDisplayScore();
                    displayQuestionHistory();
                } else {
                    setWeaponClickable(true, weapon1Img, weapon2Img);
                    questionNumberElement.textContent = questionNumberCount.toString();
                    const randomWeaponsIds = getRandomWeaponsIds();
                    displayRandomWeapons(randomWeaponsIds.weapon1Id, randomWeaponsIds.weapon2Id);
                }
            }, 300);
        });
    }
}

// 正答率計算と表示
function calculateAndDisplayScore() {
    const correctAnswers = questionHistory.filter(q => q.result.isAnswerCorrect).length;
    const totalQuestions = questionHistory.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const scorePercentageElement = getElementOrNull<HTMLParagraphElement>(document, '#score-percentage');
    if (scorePercentageElement) {
        scorePercentageElement.textContent = `${scorePercentage}%`;
    }
}

// 回答履歴表示の関数
function displayQuestionHistory() {
    const resultsTable = document.getElementById('result-grid-container');
    if (!resultsTable) return;
    
    const questionNumberHeader = document.createElement('div');
    questionNumberHeader.classList.add('header-cell');
    questionNumberHeader.textContent = '問題番号';
    resultsTable.appendChild(questionNumberHeader);

    const questionHeader = document.createElement('div');
    questionHeader.classList.add('header-cell', 'question');
    questionHeader.textContent = '問題';
    resultsTable.appendChild(questionHeader);

    const resultHeader = document.createElement('div');
    resultHeader.classList.add('header-cell');
    resultHeader.textContent = '成否';
    resultsTable.appendChild(resultHeader);


    questionHistory.forEach((history, index) => {
        const row = document.createElement('div');
        row.style.display = 'contents'; 
        
        const questionCell = document.createElement('div');
        questionCell.id = `quiz-number-${index + 1}`;
        questionCell.textContent = `第${index + 1}問`;
        // questionCell.style.gridArea = `quiz-number-${index + 1}-area`;
        questionCell.style.gridColumnStart = '1';
        questionCell.style.gridColumnEnd = '2';
        questionCell.style.gridRowStart = `${index + 2}`;
        questionCell.style.gridRowEnd = `${index + 3}`;
        questionCell.classList.add('result-question-number');
        
        const weapon1Image = weaponsData.find(weapon => weapon.id === history.question.weapon1Id)?.image ?? '';
        const weapon2Image = weaponsData.find(weapon => weapon.id === history.question.weapon2Id)?.image ?? '';
        
        const weapon1Cell = document.createElement('div');
        const img1 = document.createElement('img');
        img1.src = weapon1Image;
        weapon1Cell.appendChild(img1);
        // weapon1Cell.style.gridArea = `quiz-content-${index + 1}-area`;
        weapon1Cell.style.gridColumnStart = '2';
        weapon1Cell.style.gridColumnEnd = '3';
        weapon1Cell.style.gridRowStart = `${index + 2}`;
        weapon1Cell.style.gridRowEnd = `${index + 3}`;
        
        
        const weapon2Cell = document.createElement('div');
        const img2 = document.createElement('img');
        img2.src = weapon2Image;
        weapon2Cell.appendChild(img2);
        // weapon2Cell.style.gridArea = `quiz-content-${index + 1}-area`;
        weapon2Cell.style.gridColumnStart = '3';
        weapon2Cell.style.gridColumnEnd = '4';
        weapon2Cell.style.gridRowStart = `${index + 2}`;
        weapon2Cell.style.gridRowEnd = `${index + 3}`;


        const selectedWeapon = document.createElement('div');
        selectedWeapon.classList.add('selected-weapon-background');

        // ユーザが選択したブキの方だけカラー表示とクラス付与を行う
        if (history.question.weapon1Id !== history.result.userAnswer) {
            img1.style.filter = 'grayscale(100%)';
            img1.style.opacity = '0.5';

            weapon2Cell.appendChild(selectedWeapon);
        } else {
            img2.style.filter = 'grayscale(100%)';
            img2.style.opacity = '0.5';

            weapon1Cell.appendChild(selectedWeapon);
        }

        const resultCell = document.createElement('div');
        const resultImg = document.createElement('img');
        resultImg.src = history.result.isAnswerCorrect ? '/mark_maru.png' : '/mark_batsu.png';
        resultCell.appendChild(resultImg);
        // resultCell.style.gridArea = `result-${index + 1}-area`;
        resultCell.style.gridColumnStart = '4';
        resultCell.style.gridColumnEnd = '5';
        resultCell.style.gridRowStart = `${index + 2}`;
        resultCell.style.gridRowEnd = `${index + 3}`;

        // 画像を小さめに表示
        img1.classList.add('results-img');
        img2.classList.add('results-img');
        resultImg.classList.add('results-img');

        row.appendChild(questionCell);
        row.appendChild(weapon1Cell);
        row.appendChild(weapon2Cell);
        row.appendChild(resultCell);

        resultsTable.appendChild(row);
    });
}