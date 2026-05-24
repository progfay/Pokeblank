<script lang="ts">
  const base = import.meta.env.BASE_URL;
</script>

<div class="screen">
  <main class="content">
    <h1 class="logo">
      <img src="{base}logo.svg" alt="" class="logo-icon" aria-hidden="true" />
      Pokéblank
    </h1>
    <div class="mode-list">
      <a href="{base}endless/" class="btn btn-primary btn-lg">Endless Mode</a>
      <a href="{base}timeattack/" class="btn btn-primary btn-lg">Time Attack Mode</a>
    </div>
  </main>
  <footer class="credit">
    <p>ポケットモンスター・ポケモン・Pokémonは<a href="https://www.nintendo.co.jp/" target="_blank" rel="noopener noreferrer">任天堂</a>・<a href="http://www.creatures.co.jp/" target="_blank" rel="noopener noreferrer">クリーチャーズ</a>・<a href="http://www.gamefreak.co.jp/" target="_blank" rel="noopener noreferrer">ゲームフリーク</a>の登録商標です。</p>
    <p>当サイトは個人ファンサイトであり、<a href="http://www.pokemon.co.jp/" target="_blank" rel="noopener noreferrer">株式会社ポケモン</a>他企業様とは一切関係ありません。</p>
    <p>©&nbsp;2026&nbsp;<a href="https://github.com/progfay" target="_blank" rel="noopener noreferrer">progfay</a></p>
  </footer>
</div>

<style>
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-8);
  }

  a.btn {
    text-decoration: none;
  }

  .mode-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: min(280px, 100%);
  }

  .logo {
    margin: 0;
    font-size: var(--text-display-size);
    line-height: var(--text-display-lh);
    font-weight: 700;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .logo-icon {
    height: 1em;
    width: auto;
  }

  .credit {
    padding: var(--space-6) var(--space-5);
    padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: center;
    font-size: 10px;
    line-height: 1.6;
    color: var(--color-text-subtle);

    p {
      margin: 0;
    }

    a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
</style>
