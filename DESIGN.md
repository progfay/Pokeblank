# ポケモンクイズアプリ 技術要件書

## 1. 技術スタック

### 1.1 コア

| 項目                 | 採用技術                       |
| -------------------- | ------------------------------ |
| フレームワーク       | Svelte 5（Runes）              |
| 言語                 | TypeScript                     |
| ツールチェイン       | Vite+                          |
| パッケージマネージャ | pnpm                           |
| ホスティング         | GitHub Pages                   |
| CI/CD                | GitHub Actions（デプロイのみ） |

### 1.2 開発ツール

| 項目                      | 採用技術                                                    |
| ------------------------- | ----------------------------------------------------------- |
| テストランナー            | Vitest                                                      |
| ブラウザテスト            | Vitest Browser Mode（Playwright provider / Chromium のみ）  |
| Lint / Format / TypeCheck | Vite+ 同梱の Oxlint / Oxfmt / tsgo（`vp check` で一括実行） |
| データ取得スクリプト実行  | Node.js Type Stripping                                      |

### 1.3 CSS

- Svelte 標準のコンポーネント scoped CSS
- グローバルスタイル（CSS カスタムプロパティ・共通クラス）は `app.css` で定義。`.screen`・`.btn`・`.tile` などの共有クラスはここで管理する

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
├── endless/
│   └── index.html
├── public/
├── scripts/
│   └── fetch-pokemon.ts
├── src/
│   ├── App.svelte
│   ├── TopPage.svelte
│   ├── app.css
│   ├── home-main.ts
│   ├── main.ts
│   ├── components/
│   │   ├── question-view/
│   │   │   ├── QuestionView.svelte
│   │   │   ├── Letter.svelte
│   │   │   └── InputField.svelte
│   │   └── answer-view/
│   │       ├── AnswerView.svelte
│   │       └── PokedexLink.svelte
│   ├── data/
│   │   ├── pokedex.json
│   │   └── pokedex.json.d.ts
│   └── lib/
│       ├── pokemon/
│       │   └── pokedex-url.ts
│       ├── stores/
│       │   └── quiz.svelte.ts
│       ├── text/
│       │   ├── segment.ts
│       │   └── normalize.ts
│       ├── url/
│       │   └── query.ts
│       └── quiz/
│           ├── question.ts
│           ├── matching.ts
│           ├── answer.ts
│           └── shuffle.ts
├── .node-version
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── vite.config.ts
```

### 2.2 リポジトリの性質

- 単一パッケージのリポジトリ
- monorepo ではない

### 2.3 pnpm scripts

- `pnpm run generate:pokedex`: PokéAPI からデータを取得し、`src/data/` 配下のファイルを生成

### 2.4 マルチページ構成

Vite の `rollupOptions.input` で 2 エントリポイントをビルドする:

| エントリ  | HTML                 | エントリポイント   | マウント対象     |
| --------- | -------------------- | ------------------ | ---------------- |
| `main`    | `index.html`         | `src/home-main.ts` | `TopPage.svelte` |
| `endless` | `endless/index.html` | `src/main.ts`      | `App.svelte`     |

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

minify 形式の文字列配列（図鑑番号順、インデックス 0 が図鑑番号 1 に対応）:

```json
["フシギダネ","フシギソウ","フシギバナ",...]
```

フェッチ時にスクリプト内で `id === index + 1` の連番性を検証する。

#### 3.4.2 `src/data/pokedex.json.d.ts`

```typescript
declare module "./pokedex.json" {
  const pokedex: readonly string[];
  export default pokedex;
}
```

### 3.5 Git 管理

- `pokedex.json` および `pokedex.json.d.ts` はリポジトリにコミット

### 3.6 スクリプトの責務

1. PokéAPI GraphQL から `pokemon-species` を取得
2. 図鑑番号の連番性を検証（`id !== index + 1` の場合 exit code 1）
3. 名前のみの文字列配列に整形、図鑑番号順にソート
4. `src/data/pokedex.json` を書き出し（minify、`JSON.stringify` のみ）
5. `src/data/pokedex.json.d.ts` をテンプレート文字列で組み立てて書き出し

ファイル書き出しには `node:fs/promises` の `writeFile` を使用。

---

## 4. コアロジック

### 4.1 型定義

#### 4.1.1 テキスト処理

```typescript
// src/lib/text/normalize.ts
declare const normalizedBrand: unique symbol;
export type Normalized = string & { readonly [normalizedBrand]: true };
```

#### 4.1.2 クイズ

```typescript
// src/lib/quiz/question.ts
export type Letter = {
  readonly kind: "masked" | "revealed" | "hint-revealed";
  readonly value: string;
};

export type Question = {
  readonly letters: readonly Letter[];
};

export type PokedexEntry = readonly [pokedexNumber: number, name: string];
export type Pokedex = readonly PokedexEntry[];

// src/lib/quiz/answer.ts
export type AnswerResult =
  | { kind: "correct"; matchedPokemon: PokedexEntry }
  | { kind: "not-a-pokemon" }
  | { kind: "incorrect" };

// src/lib/quiz/matching.ts
export type SegmentedEntry = {
  readonly entry: PokedexEntry;
  readonly graphemes: readonly string[];
};
```

`PokedexEntry` は `pokedex.json`（文字列配列）から以下のように生成する:

```typescript
const pokedex: readonly PokedexEntry[] = pokedexData.map((name, i) => [i + 1, name] as const);
```

### 4.2 関数シグネチャ

```typescript
// text/segment
export function segment(text: string): readonly string[];

// text/normalize
export function normalize(raw: string): Normalized;

// quiz/question
export function pickRandomPokemon(pokedex: Pokedex): PokedexEntry;
export function generateQuestion(entry: PokedexEntry): Question;
// 2 文字未満の場合は Error をスロー
export function withRevealed(question: Question, letterIndex: number): Question;

// quiz/shuffle
export function shuffleIndices(total: number): number[];

// quiz/matching
export function segmentPokedex(pokedex: Pokedex): readonly SegmentedEntry[];
export function matchesPattern(candidateGraphemes: readonly string[], question: Question): boolean;
export function findMatchingEntries(
  segmentedPokedex: readonly SegmentedEntry[],
  question: Question,
): readonly PokedexEntry[];

// quiz/answer
export function checkAnswer(
  input: Normalized,
  nameSet: ReadonlySet<string>,
  matchingEntries: readonly PokedexEntry[],
): AnswerResult;

// pokemon/pokedex-url
export function pokedexUrl(pokedexNumber: number): string;

// url/query
export function encodeQuestion(pokedexNumber: number, question: Question): string;
export function decodeQuestion(
  encoded: string,
  pokedex: Pokedex,
): { entry: PokedexEntry; question: Question } | null;
```

### 4.3 設計原則

- コアロジックは純粋関数のみ
- リアクティブな状態管理は `quiz.svelte.ts` ストアが担う

### 4.4 乱数の扱い

- `Math.random` を直接使用
- テスト時は `vi.spyOn(Math, 'random').mockReturnValue(...)` でモック

### 4.5 文字列正規化

- ひらがな → カタカナ: 文字コードシフト（`+0x60`）
- 半角 ASCII 印字可能文字（`!-~`）→ 全角大文字: `toUpperCase` ＋ 文字コードシフト（`+0xFEE0`）
- 関数名・型名から「ひらがな」「カタカナ」という言葉を排除し、「正規化」という抽象で表現

### 4.6 マッチング判定

- `matchesPattern` は `"revealed"` の文字のみを照合する（`"hint-revealed"` は照合対象外）
- 答え合わせ画面に表示する「該当ポケモン」は、ヒントで開示した文字を含まない元の穴パターンに基づく

### 4.7 URL 保存

出題情報を 17 bit の整数値にパックし、自作 64 進数で 3 文字にエンコード:

```
value = (revealed_mask << 11) | (pokedex_number - 1)
```

- bit 0–10: 図鑑番号 − 1
- bit 11–16: revealed ビットマスク（`"revealed"` の位置のみ、`"hint-revealed"` は含めない）
- 文字セット: URL-safe な 64 文字を独自順序で配置
- ページ読み込み時に `?q=` パラメータが存在すれば復元し、不正な値の場合はランダムに生成
- 次の問題への遷移時に `history.replaceState` で上書き

---

## 5. コンポーネント設計

### 5.1 画面構成

トップページとエンドレスモードの 2 ページ。

エンドレスモード内には 2 つのモードのみ:

- 出題モード（`'question'`）
- 答え合わせモード（`'answer'`）

設定画面、確認ダイアログ、永続化機構はなし。

### 5.2 コンポーネント階層

```
TopPage.svelte           ← トップページ（/ ）

App.svelte               ← Endless Mode（/endless/）
├─ createQuizStore により状態管理
│
├── QuestionView.svelte
│    ├── Letter.svelte（each で展開）
│    └── InputField.svelte
│
└── AnswerView.svelte
     └── PokedexLink.svelte
```

### 5.3 各コンポーネントの責務

| コンポーネント        | 責務                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `TopPage.svelte`      | トップページ。ロゴ・Endless Mode へのリンク・クレジット表示                               |
| `App.svelte`          | Endless Mode 全体。`createQuizStore` を呼び出し、画面モード切り替えを担う                 |
| `QuestionView.svelte` | 出題画面のレイアウト。送信/スキップボタン、letters の each 展開                           |
| `Letter.svelte`       | 1 文字の表示。`revealed`/`hint-revealed` は値を表示、`masked` はボタン（`◯`）でタップ通知 |
| `InputField.svelte`   | 入力欄。Enter で送信イベント発火                                                          |
| `AnswerView.svelte`   | 答え合わせ画面。正誤表示・該当ポケモン一覧・Next / Share ボタン                           |
| `PokedexLink.svelte`  | ポケモン名と公式図鑑へのアンカーリンク                                                    |

### 5.4 状態管理

`src/lib/stores/quiz.svelte.ts` の `createQuizStore` に集約。`$state` Rune を使用:

- `mode: 'question' | 'answer'`
- `question: Question`
- `rawInput: string`
- `error: string | null`
- `matchingEntries: readonly PokedexEntry[]`
- `wasCorrect: boolean`
- `matchedEntry: PokedexEntry | null`

`App.svelte` はストアを呼び出し、子コンポーネントに props を渡す（lift state up パターン）。

### 5.5 イベントフロー

| ユーザー操作        | 発火元                    | 通知先      | ストアでの処理                                                                     |
| ------------------- | ------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| 入力欄に文字を打つ  | InputField                | App → Store | `rawInput` を更新、`error` をクリア                                                |
| マスク文字をタップ  | Letter                    | App → Store | `withRevealed(question, index)` で `hint-revealed` に更新                          |
| 送信ボタン or Enter | QuestionView / InputField | App → Store | normalize → findMatchingEntries → checkAnswer、エラー表示またはモード切り替え      |
| スキップボタン      | QuestionView              | App → Store | `findMatchingEntries` を計算、`wasCorrect = false`、モード切り替え                 |
| Next ボタン         | AnswerView                | App → Store | 新規問題生成、URL 更新、モード切り替え                                             |
| 共有ボタン          | AnswerView                | —           | `navigator.share` で穴パターンと URL を共有（`canShare` が `true` の場合のみ表示） |

### 5.6 ヒント機能

- タップ（`click` イベント）の判定
- 出題時に決定された「ソースポケモン」（= 出題対象ポケモン）の該当位置の文字を表示
- 一度開いたヒントは戻せない
- 使用回数に制限なし
- ヒントで開示した文字は `"hint-revealed"` として管理し、マッチング判定には含めない

### 5.7 公式図鑑へのリンク

- URL 生成: `src/lib/pokemon/pokedex-url.ts` の `pokedexUrl(pokedexNumber)` 関数
- URL 形式: `https://zukan.pokemon.co.jp/detail/{図鑑番号を 4 桁ゼロ埋め}`
- 答え合わせ画面では画像を表示せず、名前のアンカーリンクのみ

### 5.8 ビジュアルビューポート対応

`App.svelte` で `window.visualViewport` の `resize` / `scroll` イベントを購読し、実際の表示高さ（`vh`）を `$state` で追跡。`.screen` の `height` にインラインスタイルとして適用し、ソフトキーボード表示時のレイアウトズレを防ぐ。

---

## 6. JSON ファイルへの型定義

### 6.1 アプローチ

`*.d.ts` でモジュール宣言を行う方式。

```typescript
declare module "./pokedex.json" {
  const pokedex: readonly string[];
  export default pokedex;
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

- grapheme 分割（`segment`）
- 穴パターン（letters）生成ロジック
- マッチングロジック
- 正規化（ひらがな → カタカナ、半角 ASCII → 全角大文字変換）
- 正解判定（`checkAnswer`）
- 該当エントリ抽出（`findMatchingEntries`）
- 図鑑 URL 生成（`pokedexUrl`）

#### 7.1.2 コンポーネント単体テスト（Browser Mode、`.svelte.test.ts`）

Svelte コンポーネントの単体動作。

- `Letter.svelte`: masked/revealed/hint-revealed の表示、タップで親に通知
- `InputField.svelte`: 入力 → 値の更新、Enter で送信（IME 変換中は送信しない）
- `QuestionView.svelte`: 送信ボタンの有効/無効、スキップ・送信・ヒント開示の通知
- `AnswerView.svelte`: 正解/スキップ表示、該当ポケモン一覧、Next ボタン通知、matched entry ハイライト
- `PokedexLink.svelte`: 図鑑番号のゼロ埋め、URL 生成

#### 7.1.3 統合テスト（Browser Mode、`.svelte.test.ts`）

複数コンポーネントにまたがるフロー（`App.svelte` を丸ごとマウントして検証）。

- タップによるヒント開示
- Enter キーでの送信フロー
- 未知のポケモン名でのエラー表示
- パターン不一致でのエラー表示
- 正解後に答え合わせ画面へ遷移
- スキップボタン押下 → 答え合わせ画面遷移
- Next ボタンで出題画面に戻る

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
feat(ui): add hint reveal on letter tap
fix(input): prevent Enter submission during IME
chore(config): configure Vitest browser mode
chore(ci): add GitHub Pages deploy workflow
```

---

## 9. アクセシビリティ

初期実装ではセマンティック HTML の使用と仕様準拠の機能実装のみに集中。それ以外のアクセシビリティ対応は後回しとする。
