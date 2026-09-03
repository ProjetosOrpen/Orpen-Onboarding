/* ============================================================
   ORPEN ONBOARDING - ASSISTENTE DE IA (VERSÃO 2 CONVERSACIONAL)
   Integração Direta com Webhook N8N:
   https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding
   ============================================================ */

const IA_V2_CONFIG = {
  webhookUrl: "https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding",
  defaultGreeting: `Olá! Sou a Especialista de Onboarding da **ORPEN**.

Estou aqui para criar o assistente de inteligência artificial ideal para sua empresa. Vou conduzir uma conversa rápida e estruturada para entender seu negócio, suas regras de atendimento e configurar tudo automaticamente.

Para começarmos: **Qual é o nome da sua empresa/clínica e qual é o principal objetivo ou dor que você gostaria de resolver no atendimento pelo WhatsApp?**`
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

// Inicializa o array de mensagens se estiver vazio
function initIaV2Messages() {
  if (!S.ia.v2Messages) {
    S.ia.v2Messages = [];
  }
  if (S.ia.v2Messages.length === 0) {
    S.ia.v2Messages.push({
      sender: "bot",
      text: IA_V2_CONFIG.defaultGreeting,
      time: formatIaV2Time()
    });
  }
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

  if (updated) {
    toast("Variáveis do assistente sincronizadas em tempo real via IA!");
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
      filasCadastradas: (S.operacao.setores || []).map(s => ({ nome: s.nome, dac: s.dac, horario: s.horario || "" })),
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
  S.ia.v2Messages = [
    {
      sender: "bot",
      text: IA_V2_CONFIG.defaultGreeting,
      time: formatIaV2Time()
    }
  ];
  IA_V2_LOADING = false;
  draw();
  toast("Conversa reiniciada com nova sessão!");
}

function renderIaV2MessagesHtml() {
  initIaV2Messages();

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

  return html;
}

function renderIaV2ChatStream() {
  const stream = document.getElementById("ia_v2_chat_stream");
  if (stream) {
    stream.innerHTML = renderIaV2MessagesHtml();
    stream.scrollTop = stream.scrollHeight;
  }
  const btn = document.getElementById("ia_v2_send_btn");
  if (btn) {
    btn.disabled = IA_V2_LOADING;
    btn.textContent = IA_V2_LOADING ? "Enviando…" : "Enviar";
  }
}

function renderIaV2Chat() {
  initIaV2Messages();
  const sessionId = getIaV2SessionId();
  const webhookUrl = S.ia.v2WebhookUrl || IA_V2_CONFIG.webhookUrl;

  return `
    <div class="ia-v2-chat-card">
      <div class="ia-v2-header">
        <div class="ia-v2-header-info">
          <div class="ia-v2-badge-row">
            <span class="block-badge">Assistente de IA · Versão 2</span>
            <span class="ia-v2-status-pill online" title="Webhook N8N oficial ativo">
              <span class="dot" style="width:6px;height:6px;background:var(--color-success)"></span>
              N8N Webhook Conectado
            </span>
          </div>
          <h2 class="block-hero-title">Entrevista Conversacional com IA</h2>
          <p class="block-hero-desc">Converse com a IA em tempo real. Ela fará perguntas sobre o seu atendimento e estruturará seu assistente virtual automaticamente.</p>
        </div>

        <div class="ia-v2-header-actions">
          <button class="btn btn-s sm" onclick="reiniciarChatIaV2()" title="Limpar mensagens e iniciar do zero">
            🔄 Reiniciar Conversa
          </button>
        </div>
      </div>

      <div class="ia-v2-tracker-box">
        <div class="ia-v2-tracker-top">
          <span class="ia-v2-tracker-kicker">Mapeamento em Tempo Real</span>
          <span class="ia-v2-tracker-count">Sessão: <code>${esc(sessionId.substring(0, 18))}…</code></span>
        </div>
        <div class="ia-v2-pills-row">
          <span class="ia-v2-pill ${S.ia.nome ? 'done' : ''}">
            ${S.ia.nome ? '✅' : '○'} Nome: <strong>${esc(S.ia.nome || 'Pendente')}</strong>
          </span>
          <span class="ia-v2-pill ${S.ia.tom && S.ia.tom.length ? 'done' : ''}">
            ${S.ia.tom && S.ia.tom.length ? '✅' : '○'} Tom: <strong>${esc((S.ia.tom || []).join(', ') || 'Pendente')}</strong>
          </span>
          <span class="ia-v2-pill ${S.ia.habilidades ? 'done' : ''}">
            ${S.ia.habilidades ? '✅' : '○'} Autonomia: <strong>${S.ia.habilidades ? 'Mapeado' : 'Pendente'}</strong>
          </span>
          <span class="ia-v2-pill ${S.ia.restricoes ? 'done' : ''}">
            ${S.ia.restricoes ? '✅' : '○'} Restrições: <strong>${S.ia.restricoes ? 'Definidas' : 'Pendente'}</strong>
          </span>
          <span class="ia-v2-pill ${(S.ia.topicosTransbordo || []).length ? 'done' : ''}">
            ${(S.ia.topicosTransbordo || []).length ? '✅' : '○'} Transbordo: <strong>${(S.ia.topicosTransbordo || []).length} assuntos</strong>
          </span>
        </div>
      </div>

      <div class="ia-v2-chat-box">
        <div class="ia-v2-chat-stream" id="ia_v2_chat_stream">
          ${renderIaV2MessagesHtml()}
        </div>

        <div class="ia-v2-quick-prompts">
          <span class="ia-v2-quick-label">Sugestões de início:</span>
          <div class="ia-v2-quick-chips">
            <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Olá! Gostaria de iniciar o mapeamento do meu assistente de atendimento.')">
              Iniciar Onboarding
            </button>
            <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Nossa empresa é um hospital/clínica e precisamos otimizar agendamento e dúvidas frequentes.')">
              Clínica / Saúde
            </button>
            <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Quero definir o tom de voz acolhedor, profissional e direto.')">
              Estilo e Tom de Voz
            </button>
            <button type="button" class="ia-v2-chip" onclick="sendIaV2Message('Quais informações você ainda precisa para concluir meu assistente?')">
              O que falta preencher?
            </button>
          </div>
        </div>

        <div class="ia-v2-input-bar">
          <textarea
            id="ia_v2_input"
            class="ia-v2-textarea"
            rows="1"
            placeholder="Digite sua resposta ou tire uma dúvida sobre o onboarding... (Shift+Enter para pular linha)"
            onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); sendIaV2Message(); }"
            oninput="this.style.height='auto';this.style.height=(this.scrollHeight)+'px'"
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

        <div class="ia-v2-footer-info">
          <span>Pressione <strong>Enter</strong> para enviar e <strong>Shift + Enter</strong> para quebra de linha.</span>
          <span style="font-family:'IBM Plex Mono',monospace;font-size:10.5px">Webhook: automate.orpen.com.br/webhook/Orpen_IA_Onboarding</span>
        </div>
      </div>

      <div class="navrow" style="margin-top:20px;padding-top:16px;border-top:1.5px solid var(--color-border)">
        <button class="btn btn-s" onclick="go('ia')">← 9. Assistente de IA</button>
        <div class="sp"></div>
        <button class="btn btn-p" onclick="go('integ')">Avançar para Integração →</button>
      </div>
    </div>
  `;
}
