module.exports = {
  // 1. 環境設定
  env: {
    browser: true, // ブラウザ固有のグローバル変数（window, document等）を許可
    es2021: true,  // ES2021（ES12）の構文を有効化
    node: true,    // Node.js環境（module.exports等）を許可（ビルド設定ファイル用）
  },

  // 2. 基本ルールの継承
  extends: [
    'eslint:recommended', // ESLint公式の推奨ルール
  ],

  // 3. パーサー設定
  parserOptions: {
    ecmaVersion: 'latest', // 最新のECMAScript構文をサポート
    sourceType: 'module',  // import/export (ES Modules) を使用する
  },

  // 4. プラグイン
  plugins: [
    // 必要に応じて追加
  ],

  // 5. グローバル変数
  globals: {
    // 外部ライブラリを定義
  },

  // 6. 個別ルール設定 (0: off, 1: warn, 2: error)
  rules: {
    /* --- 基本的なコードスタイル --- */
    'semi': ['error', 'always'],     // セミコロンの強制
    'quotes': ['error', 'single'],   // シングルクォートの強制
    'no-console': 'warn',            // console.log の使用を警告
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 未使用変数を警告（_で始まる引数は除外）

    /* --- JavaScriptガイドライン反映 --- */

    // 1. var の禁止 (const/letを強制)
    'no-var': 'error',

    // 2. const/let の適切な利用 (constを優先)
    'prefer-const': 'error',

    // 3. テンプレートリテラル (``) の強制
    'prefer-template': 'error',

    // 4. 変数/関数名は camelCase の強制
    'camelcase': ['error', { properties: 'always' }],

    // 5. 定数は UPPER_SNAKE_CASE の利用を推奨 (id-matchは複雑なため、シンプルなルールでカバー)
    //    ⇒ 既に設定されている camelcase がプロパティもチェックするため、ここで厳密に定数名のチェックを入れるのは非推奨だが、
    //       代替として以下のルールを警告として残す。
    // 'id-match': [
    //   'warn',
    //   '^[a-z]+([A-Z][a-z]+)*$', // camelCase
    //   {
    //     'properties': true,
    //     'onlyDeclarations': true,
    //     'ignoreDestructuring': false
    //   }
    // ],

    // 6. 厳密等価演算子 (===) の強制 (ガイドライン外だが推奨)
    'eqeqeq': 'error',
  },
};
