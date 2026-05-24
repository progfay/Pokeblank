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
├── timeattack/
│   └── index.html
├── public/
├── scripts/
│   └── fetch-pokemon.ts
├── src/
│   ├── App.svelte
│   ├── TimeAttackApp.svelte
│   ├── TopPage.svelte
│   ├── app.css
│   ├── home-main.ts
│   ├── main.ts
│   ├── timeattack-main.ts
│   ├── components/
│   │   ├── question-view/
│   │   │   ├── QuestionView.svelte
│   │   │   ├── Letter.svelte
│   │   │   └── InputField.svelte
│   │   ├── answer-view/
│   │   │   ├── AnswerView.svelte
│   │   │   └── PokedexLink.svelte
│   │   └── timeattack/
│   │       ├── StartView.svelte
│   │       ├── Timer.svelte
│   │       ├── ResultView.svelte
│   │       └── ShareModal.svelte
│   ├── data/
│   │   ├── pokedex.json
│   │   └── pokedex.json.d.ts
│   └── lib/
│       ├── pokemon/
│       │   └── pokedex-url.ts
│       ├── stores/
│       │   ├── quiz.svelte.ts
│       │   └── timeattack.svelte.ts
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

Vite の `rollupOptions.input` で 3 エントリポイントをビルドする:

| エントリ     | HTML                    | エントリポイント         | マウント対象           |
| ------------ | ----------------------- | ------------------------ | ---------------------- |
| `main`       | `index.html`            | `src/home-main.ts`       | `TopPage.svelte`       |
| `endless`    | `endless/index.html`    | `src/main.ts`            | `App.svelte`           |
| `timeattack` | `timeattack/index.html` | `src/timeattack-main.ts` | `TimeAttackApp.svelte` |

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

// url/query（Time Attack 用、5 問セット）
export type RestoredSet = readonly { entry: PokedexEntry; question: Question }[];
export function encodeSet(items: readonly { pokedexNumber: number; question: Question }[]): string;
export function decodeSet(encoded: string, pokedex: Pokedex): RestoredSet | null;
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

トップページ・Endless Mode・Time Attack Mode の 3 ページ。

Endless Mode 内には 2 つのモード:

- 出題モード（`'question'`）
- 答え合わせモード（`'answer'`）

Time Attack Mode には 3 つのフェーズ:

- スタート画面（`'start'`） — Start ボタン押下待ち
- プレイ画面（`'playing'`） — 1〜5 問目を順に表示
- 結果画面（`'result'`） — 5 問終了後の結果表示

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

TimeAttackApp.svelte     ← Time Attack Mode（/timeattack/）
├─ createTimeAttackStore により状態管理
│
├── StartView.svelte                    （phase === 'start'）
│
├── QuestionView.svelte                 （phase === 'playing'、再利用）
│    ├── Letter.svelte
│    └── InputField.svelte
├── Timer.svelte                        （phase === 'playing'、オーバーレイ）
│
└── ResultView.svelte                   （phase === 'result'）
     ├── PokedexLink.svelte（each で展開）
     └── ShareModal.svelte（Web Share 未対応時のみ）
```

### 5.3 各コンポーネントの責務

| コンポーネント         | 責務                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `TopPage.svelte`       | トップページ。ロゴ・Endless / Time Attack へのリンク・クレジット表示                      |
| `App.svelte`           | Endless Mode 全体。`createQuizStore` を呼び出し、画面モード切り替えを担う                 |
| `QuestionView.svelte`  | 出題画面のレイアウト。送信/スキップボタン、letters の each 展開（両モードで共有）         |
| `Letter.svelte`        | 1 文字の表示。`revealed`/`hint-revealed` は値を表示、`masked` はボタン（`◯`）でタップ通知 |
| `InputField.svelte`    | 入力欄。Enter で送信イベント発火                                                          |
| `AnswerView.svelte`    | Endless の答え合わせ画面。正誤表示・該当ポケモン一覧・Next / Share ボタン                 |
| `PokedexLink.svelte`   | ポケモン名と公式図鑑へのアンカーリンク                                                    |
| `TimeAttackApp.svelte` | Time Attack Mode 全体。`createTimeAttackStore` を呼び出し、フェーズ切り替えを担う         |
| `StartView.svelte`     | Time Attack のスタート画面。タイトル・Start ボタン・Share ボタン                          |
| `Timer.svelte`         | プレイ中のタイマー表示・進行インジケータ・ペナルティ popup                                |
| `ResultView.svelte`    | Time Attack の結果画面。合計タイム・各問の状態と該当ポケモン・共有 / 新規ボタン           |
| `ShareModal.svelte`    | Web Share 未対応時のフォールバックモーダル。コピー用 URL 表示                             |

### 5.4 状態管理

#### 5.4.1 Endless Mode

`src/lib/stores/quiz.svelte.ts` の `createQuizStore` に集約。`$state` Rune を使用:

- `mode: 'question' | 'answer'`
- `question: Question`
- `rawInput: string`
- `error: string | null`
- `matchingEntries: readonly PokedexEntry[]`
- `wasCorrect: boolean`
- `matchedEntry: PokedexEntry | null`

`App.svelte` はストアを呼び出し、子コンポーネントに props を渡す（lift state up パターン）。

#### 5.4.2 Time Attack Mode

`src/lib/stores/timeattack.svelte.ts` の `createTimeAttackStore` に集約。問題データと進行状態を明確に分離する。

| 区分       | 内容                                                                       | 保持場所   | 永続性                                  |
| ---------- | -------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| 問題データ | 5 問の図鑑番号・revealed mask                                              | URL（`q`） | 不変（共有 URL で再現）                 |
| 進行状態   | 現在の問番号・各問のヒント使用/スキップ・`startTime`・ペナルティ合計・解答 | メモリ     | 永続化しない（リロードで Start に戻る） |

進行状態の主要フィールド:

- `phase: 'start' | 'playing' | 'result'`
- `questions: readonly { entry, initialQuestion }[]`（5 問、不変）
- `currentIndex: number`（0..4）
- `currentQuestion: Question`（ヒント反映後の状態）
- `rawInput: string` / `error: string | null`
- `startTimeMs: number | null`（`performance.now()`）
- `penaltyTotalMs: number`
- `perQuestion: { hintUsed: boolean; skipped: boolean; currentQuestion: Question; elapsedMs: number | null }[]`
- `popups: { id, label }[]`（ペナルティ加算演出）
- `finalTotalMs: number`（5 問終了時の合計タイム）
- `correctAnimation: boolean`（正解演出中フラグ）

### 5.5 イベントフロー

#### 5.5.1 Endless Mode

| ユーザー操作        | 発火元                    | 通知先      | ストアでの処理                                                                     |
| ------------------- | ------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| 入力欄に文字を打つ  | InputField                | App → Store | `rawInput` を更新、`error` をクリア                                                |
| マスク文字をタップ  | Letter                    | App → Store | `withRevealed(question, index)` で `hint-revealed` に更新                          |
| 送信ボタン or Enter | QuestionView / InputField | App → Store | normalize → findMatchingEntries → checkAnswer、エラー表示またはモード切り替え      |
| スキップボタン      | QuestionView              | App → Store | `findMatchingEntries` を計算、`wasCorrect = false`、モード切り替え                 |
| Next ボタン         | AnswerView                | App → Store | 新規問題生成、URL 更新、モード切り替え                                             |
| 共有ボタン          | AnswerView                | —           | `navigator.share` で穴パターンと URL を共有（`canShare` が `true` の場合のみ表示） |

#### 5.5.2 Time Attack Mode

| ユーザー操作        | 発火元                    | 通知先                | ストアでの処理                                                                                 |
| ------------------- | ------------------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| Start ボタン        | StartView                 | TimeAttackApp → Store | `startTimeMs = performance.now()`、`phase = 'playing'`                                         |
| 入力欄に文字を打つ  | InputField                | TimeAttackApp → Store | `rawInput` を更新、`error` をクリア                                                            |
| マスク文字をタップ  | Letter                    | TimeAttackApp → Store | `withRevealed` で `currentQuestion` 更新、`hintUsed = true`、`penaltyTotalMs += 10_000`、popup |
| 送信ボタン or Enter | QuestionView / InputField | TimeAttackApp → Store | normalize → checkAnswer。正解なら次問へ or 結果へ。不正解なら error 表示                       |
| Skip ボタン         | QuestionView              | TimeAttackApp → Store | `skipped = true`、`penaltyTotalMs += 30_000`、popup、次問へ or 結果へ                          |
| 共有ボタン          | ResultView                | —                     | `navigator.share` 対応時は呼び出し、未対応時はクリップボードコピー + `ShareModal` 表示         |
| 新規ボタン          | ResultView                | TimeAttackApp → Store | 新規 5 問生成、URL を `replaceState` で更新、`phase = 'start'` に戻す                          |

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

---

## 10. Time Attack 技術要件

仕様が「何を作るか」を定義するのに対し、本章は Time Attack Mode の「どう実装するか」を定義する。仕様で保留・未定義だった箇所の確定内容もここに含む。

### 10.1 URL・エンコード

#### 10.1.1 パラメータ

- パラメータ名は `q`（Endless Mode と共通。値の長さで形式が異なる）
  - Endless: 3 文字 / Time Attack: 15 文字
  - パス（`/endless/` と `/timeattack/`）でモードを区別するため、パラメータ名が同一でも取り違えは起きない
- 値は 5 問分（各 3 文字）を連結した 15 文字の文字列
- 各問のエンコードは SPEC「3.6」と同一の 17 bit 形式（自作 64 進数 3 文字）
  - `value = (revealed_mask << 11) | (pokedex_number - 1)`
  - `revealed_mask` は「最初にランダム表示された文字」のみ。ヒントで開示した文字は含めない
- 進行に応じた URL の上書きは行わない（同じ URL なら常に同じ 5 問。SPEC 8.6 準拠）

#### 10.1.2 復元時の検証

ページ読み込み時に `q` が存在すれば 5 問を復元する。以下をすべて満たす場合のみ採用する。

- 文字列長が 15 文字ちょうどであること
- 各 3 文字が自作 64 進数として正しくデコードできること
- **図鑑番号の妥当性**: デコードした図鑑番号が 1 以上、同梱 JSON のポケモン件数以下であること
- **revealed mask の妥当性**: 該当ポケモンの名前長（grapheme 単位）を超える bit が立っていないこと
  - 名前長を `L` とすると、`revealed_mask` の bit `L` 以上が 0 であること

#### 10.1.3 フォールバック

- 上記検証を 1 問でも満たさない場合、**5 問丸ごとランダム再生成**にフォールバックする
  - 一部の問だけを差し替える処理は行わない（SPEC 8.6 の「セット単位でのフォールバック」と整合）

### 10.2 計測

#### 10.2.1 時刻源

- 実測タイムの計測には `performance.now()` を使用する
  - 単調増加クロックのため、システム時計の変更や NTP 同期の影響を受けない
  - `Date.now()` は採用しない（計測中の時計補正でタイムがずれ得るため）

#### 10.2.2 計測方式

- 経過時間は「**開始時刻との差分を毎回算出する**」方式とする
  - `elapsed = performance.now() - startTime`
  - 「毎フレーム経過分を積算する」方式は採用しない
- この差分方式により、**バックグラウンドタブでも計測が継続**する
  - タブが非アクティブで `requestAnimationFrame` が停止しても、復帰時に差分を取り直せば停止していた時間も自動的に含まれる（SPEC 8.2「実測タイム = Start から 5 問目正解までの経過時間」と整合）

#### 10.2.3 タイマー表示

- 表示の更新は `requestAnimationFrame` で毎フレーム行う
- 表示・記録の精度は **0.01 秒（1/100 秒）**
  - 差分（ミリ秒）を 1/100 秒に丸めて表示する
- プレイ中に表示するのは「ペナルティ込みの合計タイム」のみ（SPEC 8.2 準拠）

#### 10.2.4 内部の値管理

- 実測タイム（ストップウォッチ）と合計タイム（実測 + ペナルティ）を別管理（SPEC 8.2 準拠）
- 合計タイム = `elapsed + penaltyTotal`
  - `penaltyTotal` はヒント（+10s/回）とスキップ（+30s/回）の累計（SPEC 8.3 準拠）

### 10.3 画面・遷移

#### 10.3.1 Start 前の状態

- `/timeattack/` 遷移直後は計測を開始せず、Start ボタンの押下を待つ（SPEC 8.2 準拠）
- **Start 前は 1 問目を伏せておく**
  - Start 押下で初めて 1 問目を表示する
  - 計測開始前に問題を眺めて考える時間を稼ぐ抜け道を塞ぐため

#### 10.3.2 プレイ中のリロード・履歴操作

- プレイ中にブラウザのリロード・戻る/進むが行われた場合は**リセットする**
  - URL は不変（同じ 5 問）なので、同一の 5 問を Start 待ち状態から再開する
  - 進行中だったタイマー・ペナルティ・解答状態は破棄する

#### 10.3.3 正解時の演出と遷移

- 正解した瞬間に計測上の確定処理（5 問目の場合は finalTotalMs 算出）を行う（SPEC 8.2 準拠）
- 正解時は短い演出（300ms の Check アイコン pop）を挟んでから次問または結果画面へ遷移する
  - 演出中は submit / skip / reveal を無視する（多重発火防止）
- 5 問目正解時も他の問と同じ演出を挟んだ後、結果画面に切り替える
- 結果画面の表示は画面切り替えで行い、ページ遷移（リロード）はしない（SPEC 8.8 / 8.9 準拠）

### 10.4 結果画面

#### 10.4.1 ヒント使用問の表示

- ヒント使用の扱いは 2 系統を**独立して**持つ
  - **区別表示**: 結果画面の穴パターン上で、ヒントで開示した文字を `tile-hint` の色付きタイルとして表示する（SPEC 8.8 準拠）
  - **ペナルティ加算**: ヒント 1 回につき +10 秒を合計タイムに加算する（SPEC 8.3 準拠）
- 上記は別機能であり、片方が他方を兼ねることはない

#### 10.4.2 共有（Web Share フォールバック）

- 「共有」ボタンは Web Share API を使用する（SPEC 8.8 準拠）
- **未対応環境ではクリップボードコピー + コピー用モーダルを表示**する
  - その場で URL をコピーしたうえで、コピー対象の URL をモーダルで提示する

### 10.5 実装方針（難所）

実装が複雑になりやすい箇所について、方針を明確化する。

#### 10.5.1 復元処理のフロー

復元は「**全 5 問の検証を完了してからレンダリングする**」方式とする。

1. `q`（15 文字）を 3 文字ずつ 5 つに分割する
2. 各 3 文字を **Endless と共通のデコード・検証関数**（`decodeQuestion`）に渡す
   - この関数は 1 問分の文字列を受け取り、「デコード → 図鑑番号の範囲検証 → 名前参照 → grapheme 長算出 → revealed mask の検証」を行う純粋関数とする
   - Endless（1 問）も Time Attack（5 問）もこの同一関数を呼ぶ。検証ルールの二重実装を避ける
3. 5 問すべてが検証を通った場合のみ、その確定データを画面生成に渡す
4. 1 問でも検証に失敗した場合は、5 問丸ごとランダム再生成にフォールバックする（部分差し替えはしない）

この順序により、検証を通った確定データだけがレンダリングに渡るため、不正な mask が描画に紛れ込む事故を構造的に防げる。

#### 10.5.2 状態管理の責務分離

状態を「問題データ」と「進行状態」に明確に二分する（5.4.2 の表を参照）。

- 進行状態は **メモリ上のみで保持し、`sessionStorage` 等には退避しない**
- これにより、プレイ中のリロード・戻る/進む時に進行状態が自然に消え、「URL の同じ 5 問を Start 待ち状態から再開」（10.3.2）がそのまま成立する
- 問題データ（URL）と進行状態（メモリ）を混在管理しないことで、「何を永続化し何を捨てるか」の判断が構造的に固定される

#### 10.5.3 計測表示と計測継続の両立（補足）

- タイマー表示は `requestAnimationFrame` で毎フレーム更新するが、非アクティブタブでは rAF が停止する
- 計測値は「`performance.now()` との差分を毎回算出する」方式のため、rAF が停止しても計測値はズレない（10.2.2 参照）
- **「経過分を毎フレーム積算する」方式に書き換えると計測継続が壊れる**ため、積算方式は採用しない（実装時の注意点）

### 10.6 確定事項サマリ

| 項目                         | 決定内容                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| URL パラメータ名             | `q`（Endless と共通。5 問 × 3 文字 = 15 文字連結。パスでモード区別） |
| 図鑑番号の検証               | 同梱 JSON の件数以内か                                               |
| revealed mask の検証         | 名前長を超える bit が立っていたら不正                                |
| 一部不正時のフォールバック   | 5 問丸ごとランダム再生成                                             |
| 時刻源                       | `performance.now()`                                                  |
| バックグラウンドタブ         | 計測継続（差分算出方式により自然に実現）                             |
| タイマー表示更新             | `requestAnimationFrame` で毎フレーム                                 |
| 表示・記録精度               | 0.01 秒（1/100）                                                     |
| Start 前の 1 問目            | 伏せておく（Start で初表示）                                         |
| プレイ中のリロード・履歴操作 | リセット（Start 待ちから再開）                                       |
| 正解時の演出                 | 300ms の Check アイコン pop を挟んでから次問 or 結果へ遷移           |
| 5 問目正解時の遷移           | 他の問と同じ演出を挟んでから結果画面へ                               |
| ヒント使用問                 | 結果画面では tile-hint の色付き表示で区別（ペナルティ加算は独立）    |
| Web Share 未対応時           | クリップボードコピー + コピー用モーダル                              |
| 復元検証のタイミング         | 全 5 問の検証完了後にレンダリング                                    |
| デコード・検証ロジック       | Endless と共通の純粋関数                                             |
| 進行状態の保持               | メモリ上のみ（永続化しない）                                         |
| 状態管理の分離               | URL=問題データ / メモリ=進行状態                                     |
| 復元失敗時の挙動             | 5 問丸ごとランダム再生成のみ（warning 表示はしない）                 |
