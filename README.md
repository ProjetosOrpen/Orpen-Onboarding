# 🚀 ORPEN · Setup de Ambiente & IA Auditora

Plataforma oficial de onboarding, setup de atendimento omnichannel e auditoria inteligente de IA com motor **OpenAI 5.6 Sol**.

---

## 📁 Estrutura do Projeto

```
Orpen/
├── index.html              # Ponto de entrada principal
├── vercel.json             # Configurações de rotas e headers para Vercel
├── package.json            # Scripts de execução local
├── .gitignore              # Arquivos ignorados no versionamento Git
├── orpen-logo-white.svg    # Logotipo oficial em vetor
├── orpen-logo.svg          # Logotipo padrão
│
├── css/
│   ├── main.css            # Layout em 3 colunas, variáveis, tipografia e formulários
│   └── auditor.css         # Estilos da IA Auditora, Chat interativo e Modal do Prompt
│
└── js/
    ├── state.js            # Estado reativo S, templates e validações
    ├── blocks.js           # Definição dos 12 blocos do setup
    ├── auditor.js          # Motor da IA Auditora, complexidade de prompt e compilador
    └── app.js              # Controlador principal, render loop e eventos
```

---

## ⚡ Como Rodar Localmente

### Opção 1: Direto no Navegador
Basta abrir o arquivo [`index.html`](index.html) em qualquer navegador moderno.

### Opção 2: Servidor Local Node.js
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

---

## ☁️ Como Fazer Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)
1. Suba esta pasta para um repositório no seu **GitHub**.
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Importe o repositório.
4. Clique em **Deploy** (a Vercel detecta automaticamente o `index.html` e `vercel.json`).

### Opção 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 🤖 IA Auditora (OpenAI 5.6 Sol)
* **Chave da API**: Pode ser inserida diretamente no campo de texto da tela ou salva via `localStorage` com a chave `orpen_openai_sk`.
* **Modo Demo**: Se nenhuma chave for informada, o sistema executa o motor simulado em tempo real, permitindo testes completos e demonstrações executivas.
