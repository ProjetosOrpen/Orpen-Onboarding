// Tema claro/escuro só da modal da extensão — usa localStorage (compartilhado
// com a página, já que content script roda no mesmo domínio) mas NUNCA mexe
// no <html> da página em si (isso é da Orpen, não nosso). Quem aplica o
// atributo é o próprio content-script.js, no elemento raiz da modal.
(function () {
  const STORAGE_KEY = 'orpen_templates_v2_theme';

  function getTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // localStorage indisponível — segue a preferência do sistema.
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // não crítico, só não persiste entre sessões.
    }
  }

  window.OrpenTemplatesV2.theme = { getTheme, setTheme };
})();
