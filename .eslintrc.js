module.exports = {
  // 1. 環境設定: コードが動作する環境を定義（グローバル変数の認識など）
  env: {
    browser: true, // ブラウザ固有のグローバル変数（window, document等）を許可
    es2021: true,  // ES2021（ES12）の構文を有効化
    node: true,    // Node.js環境（module.exports等）を許可（ビルド設定ファイル用）
  },

  // 2. 基本ルールの継承: 既存の推奨ルールセットをベースにする
  extends: [
    'eslint:recommended', // ESLint公式の推奨ルール
    // 'plugin:prettier/recommended', // Prettierを併用する場合はコメントアウトを外す
  ],

  // 3. パーサー設定: JavaScriptの構文解析オプション
  parserOptions: {
    ecmaVersion: 'latest', // 最新のECMAScript構文をサポート
    sourceType: 'module',  // import/export (ES Modules) を使用する
  },

  // 4. プラグイン: 機能拡張（Vue, Reactなどを導入する際はここに追加）
  plugins: [
    // 'import',
  ],

  // 5. グローバル変数: 外部ライブラリ（jQueryの$など）を明示的に許可する場合に使用
  globals: {
    // jQuery: 'readonly',
    // $: 'readonly',
  },

  // 6. 個別ルール設定: 'extends' の内容を上書き・追加する
  // 0: off, 1: warn, 2: error
  rules: {
    /* --- 基本的なルール例 --- */

    // console.log の使用（開発中はwarn、本番ビルド時は別途制御推奨）
    'no-console': 'warn',

    // 未使用変数のチェック（_で始まる引数は除外などの設定も可）
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // セミコロンの強制（neverにすれば禁止）
    'semi': ['error', 'always'],

    // クォートの統一（single: シングルクォート, double: ダブルクォート）
    'quotes': ['error', 'single'],

    /* --- 以下、必要に応じてコメントアウトを外して調整 --- */

    // インデント（Prettierを使う場合は競合するためOFFにするかPrettierに任せる）
    // 'indent': ['error', 2],

    // varの禁止（const/letを強制）
    // 'no-var': 'error',

    // 厳密等価演算子 (===) の強制
    // 'eqeqeq': 'error',
  },
};
