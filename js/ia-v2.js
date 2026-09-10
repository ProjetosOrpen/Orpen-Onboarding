/* ============================================================
   ORPEN ONBOARDING - ASSISTENTE DE IA (VERSÃO 2 CONVERSACIONAL)
   Integração Direta com Webhook N8N:
   https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding
   ============================================================ */

const IA_V2_CONFIG = {
  webhookUrl: "https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding",
  defaultGreeting: ""
};

let IA_V2_LOADING = false;

// Garante uma sessão única e persistente para o histórico no N8N
function getIaV2SessionId() {
  if (!S.ia.v2SessionId) {
    const slug = (S.contrato.razaoSocial || "cliente").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 18);
    S.ia.v2SessionId = `onb_${slug}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  return S.ia.v2SessionId;
}

// Inicializa o array de mensagens se estiver vazio e remove mensagens chumbadas
function initIaV2Messages() {
  if (!S.ia.v2Messages) {
    S.ia.v2Messages = [];
  }
  // Remove qualquer resquício da mensagem inicial chumbada
  S.ia.v2Messages = S.ia.v2Messages.filter(m => !m.text.includes("Qual é o nome da sua empresa/clínica"));
}

function formatIaV2Time() {
  const d = new Date();
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Formatação segura de Markdown para visualização limpa de balões
function formatIaV2Markdown(txt) {
  if (!txt) return "";

  // Se o texto for um JSON bruto (ex: {"reply": "...", "extractedData": ...}), extrai apenas a mensagem
  let cleanTxt = txt;
  if (typeof cleanTxt === "string") {
    const trimmed = cleanTxt.trim();
    if (trimmed.startsWith("{") && (trimmed.includes('"reply"') || trimmed.includes('"message"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        cleanTxt = parsed.reply || parsed.message || parsed.output || cleanTxt;
      } catch (e) {
        const matchReply = trimmed.match(/"(?:reply|message)"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (matchReply && matchReply[1]) {
          try {
            cleanTxt = JSON.parse(`"${matchReply[1]}"`);
          } catch (e2) {
            cleanTxt = matchReply[1];
          }
        }
      }
    }
  }

  let html = esc(cleanTxt);
  // Negrito **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Itálico *texto*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Código inline `codigo`
  html = html.replace(/`([^`]+)`/g, '<code class="ia-inline-code">$1</code>');
  // Listas com marcadores
  html = html.replace(/(?:^|\n)[-•]\s+(.+)/g, '<li class="ia-msg-li">$1</li>');
  // Quebras de linha
  html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  return html;
}

// Sincronização completa de variáveis extraídas pelo N8N
function sincronizarVariaveisExtraidas(data) {
  if (!data || typeof data !== "object") return;
  let updated = false;

  const setIf = (k, v) => {
    if (v !== undefined && v !== null && v !== "") {
      S.ia[k] = v;
      updated = true;
    }
  };

  setIf("nome", data.nome);
  if (data.tom) {
    S.ia.tom = Array.isArray(data.tom) ? data.tom : [data.tom];
    updated = true;
  }
  setIf("extensaoResp", data.extensaoResp);
  if (data.idiomas && Array.isArray(data.idiomas) && data.idiomas.length) {
    S.ia.idiomas = data.idiomas;
    updated = true;
  }
  setIf("emojiUso", data.emojiUso);
  setIf("emojisPermitidos", data.emojisPermitidos);
  setIf("processoOtimizar", data.processoOtimizar || data.problema);
  setIf("kpis", data.kpis);
  setIf("habilidades", data.habilidades);
  setIf("restricoes", data.restricoes);
  setIf("foraEscopo", data.foraEscopo);
  if (data.topicosTransbordo && Array.isArray(data.topicosTransbordo) && data.topicosTransbordo.length) {
    S.ia.topicosTransbordo = data.topicosTransbordo;
    updated = true;
  }
  if (data.fluxosPreAtendimento && Array.isArray(data.fluxosPreAtendimento) && data.fluxosPreAtendimento.length) {
    S.ia.fluxosPreAtendimento = data.fluxosPreAtendimento;
    updated = true;
  }
  setIf("filaFallback", data.filaFallback);
  setIf("inatTempo", data.inatTempo);
  setIf("inatAcao", data.inatAcao);
  setIf("msgFinalizacao", data.msgFinalizacao);
  setIf("baseUrl", data.baseUrl);
  setIf("faqTexto", data.faqTexto);
  setIf("faqRespNome", data.faqRespNome);
  setIf("faqRespEmail", data.faqRespEmail);

  if (data.triagemConcluida === true || data.concluido === true || data.finished === true || data.status === "concluido") {
    if (!S.ia.triagemConcluida) {
      S.ia.triagemConcluida = true;
      updated = true;
    }
  }

  if (updated) {
    toast("Variáveis do assistente sincronizadas em tempo real via IA!");
    soft();
    drawSum();
  }
}

// Extração heurística a partir de resumos textuais retornados pelo bot na conversa
function extrairVariaveisDeTexto(botReply, userText) {
  if (!botReply || typeof botReply !== "string") return;
  let updated = false;

  // 1. Extração do Nome da IA (ex: "Assistente: Max", "### Resumo da Ires")
  const mNome = botReply.match(/###\s*Resumo\s+d[ao]\s+([A-Za-zÀ-ÿ0-9_-]+)/i) ||
                botReply.match(/(?:Assistente|nome\s+d[ao]\s+assistente|nome\s+da\s+ia):\s*([A-Za-zÀ-ÿ0-9_-]+)/i);
  if (mNome && mNome[1]) {
    const cleanNome = mNome[1].trim();
    if (cleanNome && cleanNome !== S.ia.nome) {
      S.ia.nome = cleanNome;
      updated = true;
    }
  }

  // 2. Extração do Tom de Voz
  const mTom = botReply.match(/Tom:\s*([^\n\r\.]+)/i);
  if (mTom && mTom[1]) {
    const tons = mTom[1].split(/,\s*|\s+e\s+|\//).map(t => t.trim()).filter(Boolean);
    if (tons.length) {
      S.ia.tom = tons;
      updated = true;
    }
  }

  // 3. Extração da Autonomia / Habilidades
  const mAutonomia = botReply.match(/Autonomia:\s*([^\n\r]+)/i);
  if (mAutonomia && mAutonomia[1] && mAutonomia[1].length > 10) {
    S.ia.habilidades = mAutonomia[1].trim();
    updated = true;
  }

  // 4. Extração de Blindagens e Restrições
  const mBlind = botReply.match(/###\s*Restrições\s+e\s+blindagens\s*\n+([\s\S]+?)(?:\n\s*Transbordo|\n\s*Parabéns|\n\s*\n\s*\n|$)/i) ||
                botReply.match(/(?:Blindagens|Restrições):\s*([^\n\r]+)/i);
  if (mBlind && mBlind[1] && mBlind[1].length > 10) {
    S.ia.restricoes = mBlind[1].trim();
    updated = true;
  }

  // 5. Extração de Transbordo Humano / Filas
  const mTrans = botReply.match(/Transbordo(?:\s+humano)?:\s*([^\n\r]+)/i);
  if (mTrans && mTrans[1]) {
    const filas = mTrans[1].match(/(?:Fila|fila)\s+[^\s,;\.\)]+/gi);
    if (filas && filas.length) {
      S.ia.topicosTransbordo = Array.from(new Set(filas.map(f => f.trim())));
      updated = true;
    }
  }

  // 7. Extração de Destinos das filas se especificados
  const mDestConsulta = botReply.match(/Triagem\s+de\s+consultas[\s\S]*?Destino:\s*([^\n\r\.]+)/i);
  const mDestExame = botReply.match(/Triagem\s+de\s+exames[\s\S]*?Destino:\s*([^\n\r\.]+)/i);

  if (S.ia.fluxosPreAtendimento && S.ia.fluxosPreAtendimento.length) {
    if (mDestConsulta && mDestConsulta[1]) {
      const fConsulta = S.ia.fluxosPreAtendimento.find(f => /consulta/i.test(f.nome));
      if (fConsulta) fConsulta.destino = mDestConsulta[1].trim();
    } else if (mTrans && /consultas/i.test(mTrans[1])) {
      const fConsulta = S.ia.fluxosPreAtendimento.find(f => /consulta/i.test(f.nome));
      if (fConsulta) fConsulta.destino = "Fila de Consultas";
    }

    if (mDestExame && mDestExame[1]) {
      const fExame = S.ia.fluxosPreAtendimento.find(f => /exame/i.test(f.nome));
      if (fExame) fExame.destino = mDestExame[1].trim();
    } else if (mTrans && /atendimento/i.test(mTrans[1])) {
      const fExame = S.ia.fluxosPreAtendimento.find(f => /exame/i.test(f.nome));
      if (fExame) fExame.destino = "Fila de Atendimento";
    }
  }

  // 8. Detecção heurística de Conclusão da Triagem / Atendimento da IA
  const isConcluidoTexto = /auditoria concluída|setup concluído|parabéns.*estrutura inicial|estrutura inicial.*validada|triagem concluída|mapeamento concluído|onboarding concluído/i.test(botReply) ||
    (/###\s*Resumo\s+d[ao]/i.test(botReply) && /Transbordo/i.test(botReply));

  if (isConcluidoTexto && !S.ia.triagemConcluida) {
    S.ia.triagemConcluida = true;
    S.ia.activeTab = "prompt";
    updated = true;
    toast("🎉 Triagem da IA concluída com sucesso! Gerando System Prompt corporativo...");
    setTimeout(() => {
      if (typeof solicitarPromptIaEspecialista === "function") {
        solicitarPromptIaEspecialista();
      }
    }, 40);
  }

  // 9. Detecção de Automação MCP vs Triagem de Perguntas para Atendente Humano
  const isMcpTexto = /reagendamento autom[aá]tico por ia|agendamento autom[aá]tico por ia|execu[cç][aã]o direta em sistema|via mcp|acessar sequ[eê]ncia de sistemas|alterar agenda autom[aá]tica/i.test(userText || '') ||
                     /reagendamento autom[aá]tico por ia|agendamento autom[aá]tico por ia|execu[cç][aã]o direta em sistema|via mcp/i.test(botReply || '');

  const isTriagemTexto = /apenas triagem|triagem para atendente|triagem de perguntas para o reagendamento humano|transbordo humano|triagem de consultas|triagem de exames/i.test(userText || '') ||
                         /triagem de consultas e exames|apenas coleta|triagem com transbordo/i.test(botReply || '');

  if (isMcpTexto && !isTriagemTexto) {
    if (S.ia.acaoSistemas !== 'mcp_automatico') {
      S.ia.acaoSistemas = 'mcp_automatico';
      updated = true;
    }
  } else if (isTriagemTexto) {
    if (S.ia.acaoSistemas !== 'triagem_humano') {
      S.ia.acaoSistemas = 'triagem_humano';
      updated = true;
    }
  }

  if (updated) {
    soft();
    drawSum();
  }
}

// Envia mensagem para o Webhook N8N
async function sendIaV2Message(customText) {
  if (IA_V2_LOADING) return;

  const inputEl = document.getElementById("ia_v2_input");
  const text = (customText !== undefined ? customText : (inputEl ? inputEl.value : "")).trim();
  if (!text) return;

  if (inputEl) {
    inputEl.value = "";
    inputEl.style.height = "auto";
  }

  initIaV2Messages();

  const qp = document.getElementById("ia_v2_quick_prompts");
  if (qp) qp.style.display = "none";

  S.ia.v2Messages.push({
    sender: "user",
    text: text,
    time: formatIaV2Time()
  });

  IA_V2_LOADING = true;
  renderIaV2ChatStream();

  const webhookUrl = S.ia.v2WebhookUrl || IA_V2_CONFIG.webhookUrl;
  const sessionId = getIaV2SessionId();

  const payload = {
    threadId: sessionId,
    sessionId: sessionId,
    message: text,
    history: S.ia.v2Messages.slice(-10),
    context: {
      empresa: S.contrato.razaoSocial || "",
      cnpj: S.contrato.cnpj || "",
      cidade: S.contrato.cidade || "",
      accountManager: S.contrato.am || "",
      representante: S.contatos.projNome || S.contatos.legNome || "",
      contatoEmail: S.contatos.projEmail || S.contatos.legEmail || "",
      contatoTelefone: S.contatos.projTel || "",
      canais: S.contrato.canais || [],
      licencasAgente: S.contrato.licAgente || 0,
      licencasGestor: S.contrato.licGestor || 0,
      telefoneWhats: S.whats.numero || "",
      horariosOperacao: S.operacao.diasSem || "",
      jornada: S.operacao.jornada || "",
      filasCadastradas: (S.operacao.setores || []).map(s => ({ nome: s.nome, dac: s.dac })),
      iaAtual: {
        nome: S.ia.nome || "",
        tom: S.ia.tom || [],
        habilidades: S.ia.habilidades || "",
        restricoes: S.ia.restricoes || "",
        topicosTransbordo: S.ia.topicosTransbordo || [],
        fluxosPreAtendimento: S.ia.fluxosPreAtendimento || [],
        filaFallback: S.ia.filaFallback || "",
        inatTempo: S.ia.inatTempo || "",
        inatAcao: S.ia.inatAcao || "",
        baseUrl: S.ia.baseUrl || "",
        faqTexto: S.ia.faqTexto || ""
      }
    },
    metadata: {
      origem: "Orpen_Onboarding_V2",
      timestamp: new Date().toISOString()
    }
  };

  try {
    let parsedData = null;
    let rawResponse = "";

    try {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      rawResponse = await resp.text();

      // Fallback caso Webhook N8N esteja configurado como GET
      if (resp.status === 404 && rawResponse.includes("Did you mean to make a GET request")) {
        console.warn("Webhook no N8N configurado para GET. Realizando fallback...");
        const getUrl = new URL(webhookUrl);
        getUrl.searchParams.set("message", text);
        getUrl.searchParams.set("threadId", sessionId);
        getUrl.searchParams.set("sessionId", sessionId);
        getUrl.searchParams.set("empresa", S.contrato.razaoSocial || "");

        const getResp = await fetch(getUrl.toString(), { method: "GET" });
        rawResponse = await getResp.text();
      } else if (!resp.ok) {
        throw new Error(`N8N retornou HTTP ${resp.status}: ${rawResponse}`);
      }

      // Processamento e extração robusta da resposta do N8N
      function parseJsonSafe(val) {
        if (typeof val === "string") {
          const trimmed = val.trim();
          if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            try {
              return JSON.parse(trimmed);
            } catch (e) {
              return val;
            }
          }
        }
        return val;
      }

      parsedData = parseJsonSafe(rawResponse);
    } catch (fetchErr) {
      throw fetchErr;
    }

    let botReply = "";
    let extracted = null;

    function unwrapPayload(obj) {
      if (!obj) return;
      if (Array.isArray(obj) && obj.length > 0) {
        unwrapPayload(obj[0]);
        return;
      }
      if (typeof obj === "string") {
        const p = parseJsonSafe(obj);
        if (p && typeof p === "object") unwrapPayload(p);
        else if (!botReply) botReply = obj;
        return;
      }
      if (typeof obj === "object") {
        if (obj.output) {
          const pOut = parseJsonSafe(obj.output);
          if (pOut && typeof pOut === "object") unwrapPayload(pOut);
          else if (!botReply && typeof pOut === "string") botReply = pOut;
        }
        if (obj.response) {
          const pResp = parseJsonSafe(obj.response);
          if (pResp && typeof pResp === "object") unwrapPayload(pResp);
        }
        if (!botReply) {
          botReply = obj.reply || obj.message || obj.text || obj.resposta || "";
        }
        if (!extracted) {
          extracted = obj.extractedData || obj.state || obj.parsed_ai;
        }
        if (obj.triagemConcluida === true || obj.concluido === true || obj.finished === true || obj.status === "concluido") {
          S.ia.triagemConcluida = true;
        }
      }
    }

    unwrapPayload(parsedData);

    // Se botReply ainda for uma string JSON, faz uma segunda descompactação
    if (typeof botReply === "string") {
      const p = parseJsonSafe(botReply);
      if (p && typeof p === "object") {
        botReply = p.reply || p.message || p.text || botReply;
        if (!extracted && p.extractedData) extracted = p.extractedData;
      }
    }

    if (!botReply) {
      botReply = rawResponse || "Mensagem processada pelo fluxo no N8N.";
    }

    // Se o N8N retornou mensagem padrão de início sem responder
    if (botReply === "Workflow was started" || (typeof botReply === "string" && botReply.includes("Workflow was started"))) {
      botReply = `Mensagem recebida com sucesso pelo fluxo do N8N!\n\n*(Dica técnica: Para retornar a resposta gerada pela IA nesta conversa, adicione no final do fluxo no N8N o nó **Respond to Webhook** retornando o JSON: \`{"reply": "sua resposta aqui"}\`)*.`;
    }

    if (extracted && typeof extracted === "object") {
      sincronizarVariaveisExtraidas(extracted);
    }
    extrairVariaveisDeTexto(botReply, text);

    S.ia.v2Messages.push({
      sender: "bot",
      text: botReply,
      time: formatIaV2Time()
    });

  } catch (err) {
    console.error("Erro na chamada Webhook N8N:", err);
    S.ia.v2Messages.push({
      sender: "bot",
      isError: true,
      text: `Não foi possível obter resposta do Webhook do N8N.\n\n**Detalhes:** ${err.message || err}\n**URL:** \`${webhookUrl}\`\n\n*Verifique se o workflow está ativo ou se o webhook aceita requisições.*`,
      time: formatIaV2Time()
    });
  } finally {
    IA_V2_LOADING = false;
    renderIaV2ChatStream();
    soft();
    drawSum();
  }
}

function reiniciarChatIaV2() {
  const slug = (S.contrato.razaoSocial || "cliente").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 18);
  S.ia.v2SessionId = `onb_${slug}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  S.ia.v2Messages = [];
  S.ia.triagemConcluida = false;
  S.ia.promptGeradoIa = "";
  S.ia.promptFonteAtiva = "local";
  S.ia.acaoSistemas = "triagem_humano";
  S.ia.tokensPrompt = 0;
  S.ia.planoIdentificado = "";
  S.ia.activeTab = "chat";
  IA_V2_LOADING = false;
  soft();
  draw();
  toast("Conversa reiniciada com nova sessão!");
}

function setIaTab(tab) {
  S.ia.activeTab = tab;
  if (tab === "prompt" && !S.ia.promptGeradoIa && !S.ia.promptIaLoading && S.ia.triagemConcluida) {
    if (typeof solicitarPromptIaEspecialista === "function") {
      solicitarPromptIaEspecialista();
    }
  }
  soft();
  draw();
}

function finalizarTriagemManual() {
  S.ia.triagemConcluida = true;
  S.ia.activeTab = "prompt";
  toast("✅ Triagem finalizada com sucesso! Gerando System Prompt corporativo...");
  soft();
  draw();
  if (typeof solicitarPromptIaEspecialista === "function") {
    solicitarPromptIaEspecialista();
  }
}

function handlePromptEditorInput(val) {
  S.ia.promptGeradoIa = val;
  S.ia.promptFonteAtiva = "ia";
  const tokensEst = typeof calcularTokensPrompt === "function" ? calcularTokensPrompt(val) : 0;
  S.ia.tokensPrompt = tokensEst;
  const diag = typeof avaliarTierIa === "function" ? avaliarTierIa(val) : { tier: "Prata", badgeClass: "tier-prata" };
  S.ia.planoIdentificado = diag.tier;

  const countEl = document.getElementById("screen_prompt_token_count");
  if (countEl) countEl.textContent = `~${tokensEst.toLocaleString('pt-BR')} tokens`;

  const planEl = document.getElementById("screen_prompt_plan_name");
  if (planEl) planEl.textContent = diag.tier;

  const tierTag = document.getElementById("screen_prompt_tier_tag");
  if (tierTag) {
    tierTag.textContent = diag.tier.toUpperCase();
    tierTag.className = `tier-badge ${diag.badgeClass}`;
  }

  if (typeof drawSum === "function") drawSum();
  soft();
}

function copiarPromptNaTela() {
  const el = document.getElementById("ia_screen_prompt_editor");
  const text = el ? el.value : (S.ia.promptGeradoIa || (typeof gerarPromptFinalCompilado === "function" ? gerarPromptFinalCompilado() : ""));
  navigator.clipboard.writeText(text).then(() => {
    toast("Prompt copiado para a área de transferência!");
  }).catch(() => {
    toast("Prompt selecionado!");
  });
}

function baixarPromptTxtNaTela() {
  const el = document.getElementById("ia_screen_prompt_editor");
  const text = el ? el.value : (S.ia.promptGeradoIa || (typeof gerarPromptFinalCompilado === "function" ? gerarPromptFinalCompilado() : ""));
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `system-prompt-${(S.ia.nome || S.contrato.razaoSocial || 'orpen').toLowerCase().replace(/\s+/g, '-')}.txt`;
  a.click();
  toast("Arquivo do System Prompt baixado com sucesso!");
}

function alternarFontePromptNaTela(fonte) {
  S.ia.promptFonteAtiva = fonte;
  if (fonte === "ia" && !S.ia.promptGeradoIa && !S.ia.promptIaLoading) {
    if (typeof solicitarPromptIaEspecialista === "function") {
      solicitarPromptIaEspecialista();
    }
  } else {
    soft();
    draw();
  }
}

function renderIaV2PromptEditor() {
  const isIa = S.ia.promptFonteAtiva === "ia";
  let currentPrompt = "";
  if (isIa) {
    currentPrompt = S.ia.promptGeradoIa || (S.ia.promptIaLoading ? "" : (typeof gerarPromptFinalCompilado === "function" ? gerarPromptFinalCompilado() : ""));
  } else {
    currentPrompt = typeof gerarPromptFinalCompilado === "function" ? gerarPromptFinalCompilado() : "";
  }

  const tokensEst = typeof calcularTokensPrompt === "function" ? calcularTokensPrompt(currentPrompt) : 0;
  S.ia.tokensPrompt = tokensEst;
  const diag = typeof avaliarTierIa === "function" ? avaliarTierIa(currentPrompt) : { tier: "Prata", badgeClass: "tier-prata", desc: "" };
  S.ia.planoIdentificado = diag.tier;

  return `
    <div class="ia-screen-prompt-card card">
      <!-- Abas Superiores de Alternância da Tela de IA -->
      <div class="ia-tabs-nav">
        <button type="button" class="ia-tab-btn active" onclick="setIaTab('prompt')">
          ${ico('sparkles')} Editor do System Prompt <span class="ia-tab-badge">Pronto</span>
        </button>
        <button type="button" class="ia-tab-btn" onclick="setIaTab('chat')">
          ${ico('message-square')} Ver Conversa da Triagem (${(S.ia.v2Messages || []).length})
        </button>
      </div>

      <!-- Header Hero do Prompt -->
      <div class="ia-prompt-hero-header">
        <div class="ia-prompt-hero-main">
          <div class="ia-prompt-badge-row">
            <span class="block-badge">System Prompt Corporativo</span>
            <span class="tier-badge ${diag.badgeClass}" id="screen_prompt_tier_tag">${diag.tier.toUpperCase()}</span>
            <span class="prompt-source-tag ${isIa ? 'ia' : 'local'}" id="screen_prompt_source_badge">
              ${isIa ? '✨ IA Especialista (N8N)' : '⚙️ Compilador Determinístico'}
            </span>
          </div>
          <h2 class="ia-prompt-hero-title">Editor do System Prompt de Atendimento</h2>
          <p class="ia-prompt-hero-desc">
            Este é o prompt corporativo compilado a partir da entrevista com a IA. Você pode editar diretamente qualquer instrução abaixo. Todas as alterações e métricas de tokens são salvas em tempo real.
          </p>
        </div>

        <div class="ia-prompt-metrics-box">
          <div class="ia-metric-pill">
            <span class="ia-metric-lbl">Tokens Estimados</span>
            <span class="ia-metric-val mono" id="screen_prompt_token_count">~${tokensEst.toLocaleString('pt-BR')} tokens</span>
          </div>
          <div class="ia-metric-pill">
            <span class="ia-metric-lbl">Plano Identificado</span>
            <span class="ia-metric-val" id="screen_prompt_plan_name">${diag.tier}</span>
          </div>
        </div>
      </div>

      <!-- Toolbar com Ações Rápidas -->
      <div class="ia-prompt-toolbar">
        <div class="ia-prompt-actions-left">
          <button type="button" class="btn btn-p sm" onclick="copiarPromptNaTela()">
            ${ico('copy')} Copiar Prompt
          </button>
          <button type="button" class="btn btn-s sm" onclick="baixarPromptTxtNaTela()">
            ${ico('download')} Baixar .txt
          </button>
          <button type="button" class="btn btn-s sm ${S.ia.promptIaLoading ? 'disabled' : ''}" onclick="solicitarPromptIaEspecialista()" id="btn_regerar_ia_tela">
            ${ico(S.ia.promptIaLoading ? 'loader' : 'sparkles')} ${S.ia.promptIaLoading ? 'Gerando via IA…' : 'Regerar com IA Especialista'}
          </button>
        </div>

        <div class="ia-prompt-actions-right">
          <div class="prompt-tab-group">
            <button type="button" class="prompt-tab-btn ${isIa ? 'active' : ''}" onclick="alternarFontePromptNaTela('ia')">
              ${ico('sparkles')} Versão IA
            </button>
            <button type="button" class="prompt-tab-btn ${!isIa ? 'active' : ''}" onclick="alternarFontePromptNaTela('local')">
              ${ico('code')} Versão Compilada
            </button>
          </div>
        </div>
      </div>

      <!-- Área do Editor ou Loading -->
      ${S.ia.promptIaLoading ? `
        <div class="prompt-loading-overlay">
          <div class="ia-loading-spinner">${ico('loader', 'spin-icon')}</div>
          <h4 style="margin:14px 0 6px;color:#fff;font-size:15px">IA Especialista em Engenharia de Prompts Ativa</h4>
          <p style="margin:0;font-size:13px;color:var(--color-muted-2);max-width:480px">
            Processando o histórico da entrevista, diretrizes anti-alucinação, fluxos de transbordo e regras operacionais no N8N. O System Prompt aparecerá aqui em instantes...
          </p>
        </div>
      ` : `
        <div class="ia-prompt-editor-wrap">
          <textarea
            id="ia_screen_prompt_editor"
            class="ia-prompt-editor-textarea"
            spellcheck="false"
            placeholder="Digite ou personalize as instruções do System Prompt..."
            oninput="handlePromptEditorInput(this.value)"
          >${esc(currentPrompt)}</textarea>
        </div>
      `}

      <!-- Rodapé do Editor com Explicação do Plano e Status -->
      <div class="ia-prompt-footer-info">
        <div class="ia-plan-explanation">
          <b>Critério do Plano:</b> ${esc(diag.criterio || diag.desc)}
        </div>
        <div class="ia-editor-save-indicator">
          <span class="save-dot"></span> Salvo automaticamente no setup
        </div>
      </div>

      ${nav()}
    </div>
  `;
}

function renderIaV2MessagesHtml() {
  initIaV2Messages();

  if (S.ia.v2Messages.length === 0 && !IA_V2_LOADING) {
    return `
      <div class="ia-chat-empty-state">
        <div class="ia-empty-badge">ORPEN IA</div>
        <h4>Assistente de Onboarding</h4>
        <p>Envie uma mensagem abaixo ou selecione um atalho de início para começar o alinhamento do seu atendimento.</p>
      </div>
    `;
  }

  let html = S.ia.v2Messages.map(m => {
    const isBot = m.sender === 'bot';
    return `
      <div class="ia-msg-row ${isBot ? 'bot' : 'user'}">
        <div class="ia-msg-avatar ${isBot ? 'bot' : 'user'}">
          ${isBot ? 'IA' : 'CLI'}
        </div>
        <div class="ia-msg-bubble-wrap">
          <div class="ia-msg-bubble ${isBot ? 'bot' : 'user'} ${m.isError ? 'error' : ''}">
            <div class="ia-msg-text">${formatIaV2Markdown(m.text)}</div>
          </div>
          <span class="ia-msg-time">${esc(m.time || '')}</span>
        </div>
      </div>
    `;
  }).join("");

  if (IA_V2_LOADING) {
    html += `
      <div class="ia-msg-row bot">
        <div class="ia-msg-avatar bot">IA</div>
        <div class="ia-msg-bubble-wrap">
          <div class="ia-msg-bubble bot typing">
            <span class="ia-typing-dot"></span>
            <span class="ia-typing-dot"></span>
            <span class="ia-typing-dot"></span>
          </div>
        </div>
      </div>
    `;
  }

  if (S.ia.triagemConcluida && !IA_V2_LOADING) {
    html += `
      <div class="ia-triagem-concluida-card">
        <div class="ia-triagem-badge-row">
          <span class="badge-status-concluido">${ico('check-circle')} Triagem Finalizada com Sucesso</span>
        </div>
        <h3 class="ia-triagem-card-title">Mapeamento da ${esc(S.ia.nome || 'IA')} Concluído!</h3>
        <p class="ia-triagem-card-desc">
          Todas as diretrizes de persona, autonomia, restrições e filas foram apuradas. O System Prompt corporativo já foi compilado e está disponível para edição direta.
        </p>
        <div class="ia-triagem-actions-row">
          <button type="button" class="btn btn-p ia-btn-pulse" onclick="setIaTab('prompt')">
            ${ico('sparkles')} Abrir Editor do System Prompt
          </button>
        </div>
      </div>
    `;
  }

  return html;
}

function renderIaV2ChatStream() {
  const stream = document.getElementById("ia_v2_chat_stream");
  if (stream) {
    stream.innerHTML = renderIaV2MessagesHtml();
    setTimeout(() => {
      stream.scrollTop = stream.scrollHeight;
    }, 15);
  }
  const btn = document.getElementById("ia_v2_send_btn");
  if (btn) {
    btn.disabled = IA_V2_LOADING;
    btn.textContent = IA_V2_LOADING ? "Enviando…" : "Enviar";
  }
}

function renderIaV2Chat() {
  // Se a triagem foi concluída e a aba ativa é o prompt (ou padrão), exibe diretamente o Editor do System Prompt
  if (S.ia.triagemConcluida && S.ia.activeTab !== "chat") {
    return renderIaV2PromptEditor();
  }

  initIaV2Messages();
  const sessionId = getIaV2SessionId();
  const webhookUrl = S.ia.v2WebhookUrl || IA_V2_CONFIG.webhookUrl;

  return `
    <div class="ia-v2-chat-card card">
      ${S.ia.triagemConcluida ? `
        <div class="ia-tabs-nav">
          <button type="button" class="ia-tab-btn" onclick="setIaTab('prompt')">
            ${ico('sparkles')} Editor do System Prompt <span class="ia-tab-badge">Pronto</span>
          </button>
          <button type="button" class="ia-tab-btn active" onclick="setIaTab('chat')">
            ${ico('message-square')} Ver Conversa da Triagem (${(S.ia.v2Messages || []).length})
          </button>
        </div>
      ` : ''}

      <div class="ia-v2-header">
        <div class="ia-v2-header-info">
          <span class="block-badge">Assistente de IA</span>
          <h2 class="ia-v2-title">Entrevista Conversacional</h2>
        </div>

        <div class="ia-v2-header-actions">
          ${S.ia.triagemConcluida ? `
            <span class="badge-status-concluido">${ico('check-circle')} Triagem Concluída</span>
            <button type="button" class="btn btn-p sm ia-btn-pulse" onclick="setIaTab('prompt')" title="Abrir Editor do System Prompt">
              ${ico('sparkles')} Abrir Editor do Prompt
            </button>
          ` : `
            <span class="badge-status-em-andamento">${ico('clock')} Triagem em Andamento</span>
            ${(S.ia.v2Messages && S.ia.v2Messages.length >= 2) ? `
              <button type="button" class="btn btn-s sm" onclick="finalizarTriagemManual()" title="Concluir triagem e liberar prompt">
                ${ico('check')} Concluir Triagem
              </button>
            ` : ''}
          `}
          <button type="button" class="btn btn-s sm" onclick="reiniciarChatIaV2()" title="Limpar mensagens e reiniciar">
            ${ico('refresh-cw')} Reiniciar
          </button>
        </div>
      </div>

      <div class="ia-v2-chat-box">
        <div class="ia-v2-chat-stream" id="ia_v2_chat_stream">
          ${renderIaV2MessagesHtml()}
        </div>

        ${(S.ia.v2Messages.length <= 1 && !IA_V2_LOADING) ? `
          <div class="ia-v2-quick-prompts" id="ia_v2_quick_prompts">
            <span class="ia-v2-quick-label">Sugestões:</span>
            <div class="ia-v2-quick-chips">
              <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Olá! Gostaria de iniciar o mapeamento do meu assistente de atendimento.')">
                Iniciar Onboarding
              </button>
              <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Nossa empresa precisa otimizar agendamento e esclarecer dúvidas frequentes.')">
                Qualificação e Dúvidas
              </button>
              <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Quero definir o tom de voz acolhedor, profissional e direto.')">
                Estilo e Tom de Voz
              </button>
              <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Quais informações você ainda precisa para concluir meu assistente?')">
                Próximos Passos
              </button>
            </div>
          </div>
        ` : ''}

        <div class="ia-v2-input-bar">
          <textarea
            id="ia_v2_input"
            class="ia-v2-textarea"
            rows="1"
            placeholder="Digite sua resposta ou tire uma dúvida sobre o assistente..."
            onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); sendIaV2Message(); }"
            oninput="this.style.height='auto';this.style.height=(Math.min(this.scrollHeight, 90))+'px'"
          ></textarea>
          <button
            type="button"
            class="btn btn-p ia-v2-send-btn"
            id="ia_v2_send_btn"
            onclick="sendIaV2Message()"
            ${IA_V2_LOADING ? 'disabled' : ''}
          >
            ${IA_V2_LOADING ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </div>

      ${nav()}
    </div>
  `;
}
