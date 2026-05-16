# ポケモンクイズアプリ 技術要件書

## 1. 技術スタック

### 1.1 コア

| 項目 | 採用技術 |
|---|---|
| フレームワーク | Svelte 5（Runes） |
| 言語 | TypeScript |
| ツールチェイン | Vite+ |
| パッケージマネージャ | npm |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions（デプロイのみ） |

### 1.2 開発ツール

| 項目 | 採用技術 |
|---|---|
| テストランナー | Vitest |
| ブラウザテスト | Vitest Browser Mode（Playwright provider / Chromium のみ） |
| Lint / Format / TypeCheck | Vite+ 同梱の Oxlint / Oxfmt / tsgo（`vp check` で一括実行） |
| データ取得スクリプト実行 | Node.js Type Stripping |

### 1.3 CSS

- Svelte 標準のコンポーネント scoped CSS
- 共通変数が必要な場合は `App.svelte` の `:global()` または `app.css` で定義

### 1.4 ブラウザサポート

- Baseline Widely Available 基準
- モバイルブラウザ想定
- 表示言語は日本語固定

### 1.5 SSR / SPA 構成

- SSR なし
- SPA / SSG として静的配信

---

## 2. リポジトリ構成

### 2.1 ディレクトリ構成

```
.
├── .github/workflows/
│   └── deploy.yml
├── public/
├── scripts/
│   └── fetch-pokemon.ts
├── src/
│   ├── App.svelte
│   ├── main.ts
│   ├── components/
│   │   ├── question-view/
│   │   │   ├── QuestionView.svelte
│   │   │   ├── Letter.svelte
│   │   │   ├── InputField.svelte
│   │   │   └── SpecialKeyboard.svelte
│   │   └── answer-view/
│   │       ├── AnswerView.svelte
│   │       └── PokedexLink.svelte
│   ├── data/
│   │   ├── pokedex.json
│   │   ├── pokedex.json.d.ts
│   │   ├── special-chars.json
│   │   └── special-chars.json.d.ts
│   └── lib/
│       ├── text/
│       │   ├── segment.ts
│       │   ├── normalize.ts
│       │   ├── validation.ts
│       │   └── special-chars.ts
│       └── quiz/
│           ├── question.ts
│           ├── matching.ts
│           └── answer.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

### 2.2 リポジトリの性質

- 単一パッケージのリポジトリ
- monorepo ではない

### 2.3 npm scripts

- `npm run generate:pokedex`: PokéAPI からデータを取得し、`src/data/` 配下のファイルを生成

---

## 3. データ取得

### 3.1 エンドポイント

- PokéAPI 公式 GraphQL: `https://graphql.pokeapi.co/v1beta2`
- HTTP メソッド: POST
- GraphQL クライアント: 素の `fetch`

### 3.2 取得対象

- `pokemon-species` のうち `is_default = true` のもの
- 取得フィールド: 図鑑番号、日本語名（`ja-Hrkt`、language id = 1）

### 3.3 リクエスト戦略

- 1 リクエストで全件取得
- リトライ処理なし
- エラー時は exit code 1 で終了

### 3.4 出力ファイル

#### 3.4.1 `src/data/pokedex.json`

minify 形式のタプル配列:

```json
[[1,"フシギダネ"],[2,"フシギソウ"],[3,"フシギバナ"],...]
```

各要素は `[図鑑番号, 名前]` のタプル、図鑑番号順にソート。

#### 3.4.2 `src/data/pokedex.json.d.ts`

相対パス指定、静的型定義:

```typescript
declare module './pokedex.json' {
  export type PokedexEntry = readonly [pokedexNumber: number, name: string];
  const pokedex: readonly PokedexEntry[];
  export default pokedex;
}
```

#### 3.4.3 `src/data/special-chars.json`

全ポケモン名から集めた特殊文字（ひらがな・カタカナ以外）の配列、Unicode コードポイント順:

```json
["2",":","Z","♀","♂"]
```

#### 3.4.4 `src/data/special-chars.json.d.ts`

```typescript
declare module './special-chars.json' {
  const specialChars: readonly string[];
  export default specialChars;
}
```

### 3.5 Git 管理

- `pokedex.json` および `pokedex.json.d.ts` はリポジトリにコミット
- `special-chars.json` および `special-chars.json.d.ts` も同様にコミット

### 3.6 スクリプトの責務

1. PokéAPI GraphQL から `pokemon-species` を取得
2. `[pokedexNumber, name]` のタプル配列に整形、図鑑番号順にソート
3. 全名前を grapheme 分割し、特殊文字を集めて重複排除、Unicode コードポイント順にソート
4. `src/data/pokedex.json` を書き出し（minify、`JSON.stringify` のみ）
5. `src/data/pokedex.json.d.ts` をテンプレート文字列で組み立てて書き出し
6. `src/data/special-chars.json` を書き出し
7. `src/data/special-chars.json.d.ts` を書き出し

ファイル書き出しには `node:fs/promises` の `writeFile` を使用。

---

## 4. コアロジック

### 4.1 型定義

#### 4.1.1 テキスト処理

```typescript
// src/lib/text/normalize.ts
declare const normalizedBrand: unique symbol;
export type Normalized = string & { readonly [normalizedBrand]: true };

// src/lib/text/validation.ts
declare const validatedBrand: unique symbol;
export type ValidatedInput = Normalized & { readonly [validatedBrand]: true };
```

#### 4.1.2 クイズ

```typescript
// src/lib/quiz/question.ts
export type Letter = {
  readonly kind: 'masked' | 'revealed';
  readonly value: string;
};

export type Question = {
  readonly letters: readonly Letter[];
};

// src/lib/quiz/answer.ts
export type AnswerResult =
  | { kind: 'correct'; matchedPokemon: PokedexEntry }
  | { kind: 'incorrect' };
```

### 4.2 関数シグネチャ

```typescript
// text/segment
export function segment(text: string): readonly string[];

// text/normalize
export function normalize(raw: string): Normalized;

// text/validation
export function validate(
  normalized: Normalized,
  allowedSpecialChars: readonly string[]
): ValidatedInput | null;

// text/special-chars
export function isSpecialChar(grapheme: string): boolean;

// quiz/question
export function pickRandomPokemon(pokedex: Pokedex): PokedexEntry;
export function generateQuestion(entry: PokedexEntry): Question;
// 2 文字未満の場合は Error をスロー
export function withRevealed(question: Question, letterIndex: number): Question;

// quiz/matching
export function matchesPattern(
  candidateGraphemes: readonly string[],
  question: Question
): boolean;
export function findAllMatchingPokedexEntries(
  pokedex: Pokedex,
  question: Question
): readonly PokedexEntry[];

// quiz/answer
export function checkAnswer(
  input: ValidatedInput,
  matchingEntries: readonly PokedexEntry[]
): AnswerResult;
```

### 4.3 設計原則

- コアロジックは純粋関数のみ
- リアクティブな状態管理は UI 層（Svelte Runes）が担う

### 4.4 乱数の扱い

- `Math.random` を直接使用
- テスト時は `vi.spyOn(Math, 'random').mockReturnValue(...)` でモック

### 4.5 特殊文字の判定

- ひらがな（U+3040〜U+309F）、カタカナ（U+30A0〜U+30FF）以外を特殊文字とみなす
- `isSpecialChar` 関数は `src/lib/text/special-chars.ts` に配置
- データ取得スクリプトからもこの関数を使用

### 4.6 文字列正規化

- 文字コードシフトによってひらがなをカタカナに変換
- 関数名・型名から「ひらがな」「カタカナ」という言葉を排除し、「正規化」という抽象で表現

---

## 5. コンポーネント設計

### 5.1 画面構成

2 つのモードのみ:

- 出題モード（`'question'`）
- 答え合わせモード（`'answer'`）

設定画面、確認ダイアログ、永続化機構はなし。

### 5.2 コンポーネント階層

```
App.svelte
├─ 画面モード切り替え
├─ pokedex / specialChars の読み込み
├─ Question の生成と保持
├─ 状態管理（rawInput, error, matchingEntries）
│
├── QuestionView.svelte
│    ├── Letter.svelte（each で展開）
│    ├── InputField.svelte
│    └── SpecialKeyboard.svelte
│
└── AnswerView.svelte
     └── PokedexLink.svelte
```

### 5.3 各コンポーネントの責務

| コンポーネント | 責務 |
|---|---|
| `App.svelte` | アプリ全体、画面モード切り替え、状態の集約 |
| `QuestionView.svelte` | 出題画面のレイアウト、送信/パスボタン、letters の each 展開 |
| `Letter.svelte` | 1 文字の表示。`revealed` は値を表示、`masked` は `◯` を表示し dblclick で親に通知 |
| `InputField.svelte` | 入力欄。Enter で送信イベント発火 |
| `SpecialKeyboard.svelte` | 全特殊文字を常時表示、ボタン押下で親に通知 |
| `AnswerView.svelte` | 答え合わせ画面のレイアウト、次の問題ボタン |
| `PokedexLink.svelte` | ポケモン名と公式図鑑へのアンカーリンク |

### 5.4 状態管理

`App.svelte` に集約:

- `mode: 'question' | 'answer'`
- `question: Question`
- `rawInput: string`
- `error: string | null`
- `matchingEntries: readonly PokedexEntry[]`

子コンポーネントは props を受け取り、イベントで親に通知する（lift state up パターン）。

### 5.5 イベントフロー

| ユーザー操作 | 発火元 | 通知先 | App での処理 |
|---|---|---|---|
| 入力欄に文字を打つ | InputField | App | `rawInput` を更新 |
| 特殊文字ボタンを押す | SpecialKeyboard | App | `rawInput` に追加 |
| マスク文字をダブルクリック | Letter | App | `withRevealed(question, index)` で更新 |
| 送信ボタン or Enter | QuestionView / InputField | App | normalize → validate → checkAnswer、モード切り替え |
| パスボタン | QuestionView | App | matchingEntries を計算、モード切り替え |
| 次の問題へ | AnswerView | App | 新規問題生成、モード切り替え |

### 5.6 ヒント機能

- ダブルクリックの判定は `dblclick` イベントを使用
- 出題時に決定された「ソースポケモン」（= 出題対象ポケモン）の該当位置の文字を表示
- 一度開いたヒントは戻せない
- 使用回数に制限なし

### 5.7 公式図鑑へのリンク

- URL 形式: `https://zukan.pokemon.co.jp/detail/{図鑑番号を 4 桁ゼロ埋め}`
- `PokedexLink.svelte` 内部で生成
- 答え合わせ画面では画像を表示せず、名前のアンカーリンクのみ

---

## 6. JSON ファイルへの型定義

### 6.1 アプローチ

`*.d.ts` でモジュール宣言を行う方式。

```typescript
declare module './pokedex.json' {
  // 型定義
}
```

### 6.2 配置

JSON ファイルと同じディレクトリに `.d.ts` ファイルを配置する。

### 6.3 生成方法

データ取得スクリプトが JSON ファイルと `.d.ts` ファイルの両方を書き出す。型定義の内容は静的（実データを反映しない）。

### 6.4 declare module のパス指定

相対パスを使用（ワイルドカードは使わない）。

---

## 7. テスト戦略

### 7.1 3 層の使い分け

#### 7.1.1 純粋な単体テスト（Node 環境の Vitest、`.test.ts`）

DOM やブラウザ API に依存しないロジックのみ。

- 穴パターン（letters）生成ロジック
- マッチングロジック
- 正規化（ひらがな → カタカナ変換）
- バリデーション
- 正解判定（`checkAnswer`）
- 該当エントリ抽出（`findAllMatchingPokedexEntries`）
- 特殊文字判定（`isSpecialChar`）

#### 7.1.2 コンポーネント単体テスト（Browser Mode、`.svelte.test.ts`）

Svelte コンポーネントの単体動作。

- `Letter.svelte`: masked/revealed の表示、dblclick で親に通知
- `InputField.svelte`: 入力 → 値の更新、Enter で送信
- `SpecialKeyboard.svelte`: ボタン押下で親に通知
- `PokedexLink.svelte`: 図鑑番号のゼロ埋め、URL 生成

#### 7.1.3 統合テスト（Browser Mode、`.svelte.test.ts`）

複数コンポーネントにまたがるフロー、jsdom では困難な挙動。

- ダブルクリックによるヒント開示
- フォーカス・選択状態の制御、IME 入力との相互作用
- Enter キーでの送信フロー
- 出題 → 解答入力 → 答え合わせ → 次の問題への状態遷移
- 特殊文字ボタン押下 → 入力欄への文字追加
- パスボタン押下 → 答え合わせ画面遷移

### 7.2 ツール構成

- テストランナー: Vitest
- Browser provider: Playwright
- ブラウザ: Chromium のみ
- Svelte 5 の Runes を含むテストは `.svelte.test.ts` 拡張子を使用

### 7.3 CI での実行

- Lint / TypeCheck / Test は CI で実行しない
- 原則ローカルで実行
- CI は GitHub Pages へのデプロイのみ

---

## 8. コミット規約

### 8.1 メッセージフォーマット

Conventional Commits をフル採用:

```
<type>(<scope>): <subject>
```

### 8.2 言語と長さ

- 言語: 英語
- 全体で 80 文字以内

### 8.3 type 一覧

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマットのみ
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・依存関係・設定
- `perf`: パフォーマンス改善

### 8.4 scope

- 緩く運用、省略可
- 候補例: `quiz`, `data`, `ui`, `config`, `deps`, `ci`

### 8.5 コミット粒度

- 1 論理的変更 = 1 コミット
- 細かく小さく分割

### 8.6 ブランチ戦略

- main ブランチに直接コミットを積む
- feature ブランチや Pull Request は作成しない

### 8.7 git push の取り扱い

- ローカルでのコミットのみを行い、`git push` は実行しない
- リモートへの反映は別途、開発者の判断で手動で行う

### 8.8 強制ツール

- なし（自主運用）

### 8.9 コミットメッセージの例

```
feat(quiz): add letter generation logic
feat(data): add PokeAPI GraphQL fetcher script
feat(ui): add special character keyboard component
fix(input): prevent Enter submission during IME
chore(config): configure Vitest browser mode
chore(ci): add GitHub Pages deploy workflow
```

---

## 9. アクセシビリティ

初期実装ではセマンティック HTML の使用と仕様準拠の機能実装のみに集中。それ以外のアクセシビリティ対応は後回しとする。
