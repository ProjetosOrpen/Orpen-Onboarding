/* ============================================================
   IA AUDITORA (OPENAI 5.6 SOL) & GERADOR DE SYSTEM PROMPT
   ============================================================ */

let AUDITOR_CHAT_MESSAGES = [
  { sender: "bot", text: "Olá! Sou a **IA Auditora da ORPEN** (motor 5.6 Sol). Vou te guiar na criação do assistente virtual da sua empresa passo a passo.\n\nPara começarmos: **Qual será o nome do seu assistente de IA e qual o tom de voz desejado?** (Ex.: 'Ires, tom cordial e acolhedor')." }
];

let AUDITOR_STEP = 0; // 0: Nome/Tom, 1: Público/Objetivo, 2: Habilidades, 3: Restrições, 4: Smart Jump, 5: Conclusão

function getOpenAIKey() {
  try { return localStorage.getItem("orpen_openai_key") || ""; } catch (e) { return ""; }
}

function salvarOpenAIKey(k) {
  try {
    localStorage.setItem("orpen_openai_key", (k || "").trim());
    toast("Chave de API salva com segurança.");
  } catch (e) {}
}

function renderChatMessages() {
  return AUDITOR_CHAT_MESSAGES.map(m => `
    <div class="chat-bubble ${m.sender}">
      <div class="chat-avatar">${m.sender === 'bot' ? 'IA' : 'CLI'}</div>
      <div class="chat-text">
        <p>${esc(m.text).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</p>
      </div>
    </div>
  `).join("");
}

function renderChatQuickChips() {
  if (AUDITOR_STEP === 0) {
    return `
      <span class="chat-quick-label">Sugestões:</span>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Ires, tom cordial e acolhedor')">Ires (Cordial)</button>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Luna, tom direto e objetivo')">Luna (Direto)</button>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Max, tom comercial e consultivo')">Max (Comercial)</button>
    `;
  }
  if (AUDITOR_STEP === 1) {
    return `
      <span class="chat-quick-label">Sugestões:</span>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Pacientes querendo marcar exames e tirar dúvidas de preparo')">Triagem de Pacientes</button>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Leads de empresas querendo proposta comercial')">Qualificação de Leads</button>
    `;
  }
  if (AUDITOR_STEP === 2) {
    return `
      <span class="chat-quick-label">Sugestões:</span>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Passar horários, endereços, lista de convênios e links de agendamento')">Horários e Convênios</button>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Explicar preparos de exames laboratoriais e enviar tabela de valores')">Preparos de Exames</button>
    `;
  }
  if (AUDITOR_STEP === 3) {
    return `
      <span class="chat-quick-label">Sugestões:</span>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Proibido dar parecer médico, prescrever ou confirmar cirurgias sem autorização')">Blindagem Médica</button>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Não dar descontos fora da tabela nem prometer prazos de entrega urgentes')">Blindagem Comercial</button>
    `;
  }
  if (AUDITOR_STEP === 4) {
    return `
      <span class="chat-quick-label">Sugestões:</span>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Transferir para Recepção se for emergência e Financeiro se for boleto')">Recepção / Financeiro</button>
      <button type="button" class="chat-quick-chip" onclick="responderRapido('Transferir para Comercial se for proposta e Suporte se for dúvida técnica')">Comercial / Suporte</button>
    `;
  }
  return `
    <button type="button" class="chat-quick-chip" onclick="reiniciarChatAuditora()">Reiniciar Conversa</button>
    <button type="button" class="chat-quick-chip" onclick="abrirModalPromptFinal()">${S.ia.triagemConcluida ? '✨ Ver System Prompt' : '🔒 Prompt (Aguardando Triagem)'}</button>
  `;
}

function renderAuditorBanner() {
  const diag = avaliarTierIa();
  const isChat = S.ia._mode === "chat";
  return `
    <div class="auditor-banner">
      <div class="auditor-avatar">IA</div>
      <div class="auditor-content" style="flex:1">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <h4>ORPEN IA Auditora · Motor 5.6 Sol</h4>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="tier-badge ${diag.badgeClass}" style="margin:0">${diag.tier}</span>
            <span class="badge-prompt-stat" style="background:rgba(255,255,255,0.12);color:var(--color-brand-accent);font-weight:700">OpenAI 5.6 Sol Active</span>
          </div>
        </div>
        <p>A Auditora analisa em tempo real a densidade do prompt, prevenindo alucinações e otimizando fluxos de transbordo humano.</p>
        <div class="auditor-actions">
          <button type="button" class="auditor-chip" onclick="abrirModalPromptFinal()">${S.ia.triagemConcluida ? '✨ Ver System Prompt Compilado' : '🔒 System Prompt (Aguardando Triagem)'}</button>
          <button type="button" class="auditor-chip" onclick="aplicarPerfilClinica()">Perfil Clínicas / Saúde</button>
          <button type="button" class="auditor-chip" onclick="aplicarPerfilComercial()">Perfil Comercial / Vendas</button>
          <button type="button" class="auditor-chip" onclick="setIaViewMode('${isChat ? 'form' : 'chat'}')">
            ${isChat ? 'Modo Formulário Guiado' : 'Abrir Copiloto Conversacional'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderAuditorChatBox() {
  const key = getOpenAIKey();
  return `
    <div class="chat-container">
      <div class="chat-cfg-bar">
        <div style="display:flex;align-items:center;gap:8px">
          <span><b>Copiloto Conversacional Orpen</b> (5.6 Sol)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="password" id="cfg_openai_key" placeholder="OpenAI Key (sk-...) ou use Modo Demo" value="${esc(key)}" onchange="salvarOpenAIKey(this.value)">
          <button class="c-chip" style="background:oklch(25% .01 280);color:#fff;border-color:oklch(35% .01 280)" onclick="salvarOpenAIKey(document.getElementById('cfg_openai_key').value)">Salvar</button>
        </div>
      </div>

      <div class="chat-stream" id="chat_stream">
        ${renderChatMessages()}
      </div>

      <div class="chat-quick-chips">
        ${renderChatQuickChips()}
      </div>

      <div class="chat-input-row">
        <textarea id="chat_user_input" placeholder="Digite sua resposta ou instrução para a IA Auditora..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();enviarChatUser();}"></textarea>
        <button class="btn btn-p" style="padding:10px 18px" onclick="enviarChatUser()">Enviar ↵</button>
      </div>

      <div style="padding:12px 16px;background:var(--color-surface);border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center">
        <button class="btn btn-s" onclick="setIaViewMode('form')">← Voltar ao Formulário Guiado</button>
        <button class="btn ${S.ia.triagemConcluida ? 'btn-p' : 'btn-s'}" onclick="abrirModalPromptFinal()">${S.ia.triagemConcluida ? '✨ Ver System Prompt Compilado' : '🔒 System Prompt (Aguardando Triagem)'}</button>
      </div>
    </div>
  `;
}

function responderRapido(txt) {
  const inp = document.getElementById("chat_user_input");
  if (inp) inp.value = txt;
  enviarChatUser();
}

async function enviarChatUser() {
  const inp = document.getElementById("chat_user_input");
  if (!inp) return;
  const userText = inp.value.trim();
  if (!userText) return;
  inp.value = "";

  AUDITOR_CHAT_MESSAGES.push({ sender: "user", text: userText });
  document.getElementById("chat_stream").innerHTML = renderChatMessages();
  const stream = document.getElementById("chat_stream");
  if (stream) stream.scrollTop = stream.scrollHeight;

  const key = getOpenAIKey();

  if (key && key.startsWith("sk-")) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Você é a IA Auditora da ORPEN (motor 5.6 Sol). Audite e colete os dados do assistente de atendimento do cliente. Indague sobre ambiguidades e determine o plano ideal (Prata, Gold ou Diamante) de forma acolhedora e precisa." },
            ...AUDITOR_CHAT_MESSAGES.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
          ]
        })
      });
      const data = await resp.json();
      if (data.choices && data.choices[0]) {
        const botReply = data.choices[0].message.content;
        AUDITOR_CHAT_MESSAGES.push({ sender: "bot", text: botReply });
        processarExtracaoConversacional(userText);
        draw();
        return;
      }
    } catch (err) {
      console.warn("Falha na chamada da OpenAI API, usando motor 5.6 Sol simulado.", err);
    }
  }

  // Motor Determinístico Inteligente (5.6 Sol)
  setTimeout(() => {
    processarFluxoAuditoraSimulado(userText);
    draw();
  }, 350);
}

function processarFluxoAuditoraSimulado(userText) {
  let botReply = "";

  if (AUDITOR_STEP === 0) {
    const partes = userText.split(/,|;|-|\./);
    const nomeDetectado = partes[0].replace(/meu assistente|chame|nome|é|vai ser/gi, "").trim();
    S.ia.nome = nomeDetectado || "Ires";
    if (/formal|institucional/i.test(userText)) S.ia.tom = ["Formal e institucional"];
    else if (/consultivo|técnico/i.test(userText)) S.ia.tom = ["Técnico e consultivo"];
    else S.ia.tom = ["Cordial e acolhedor", "Direto e objetivo"];

    AUDITOR_STEP = 1;
    botReply = `Perfeito! O assistente se chamará **${S.ia.nome}** com tom **${S.ia.tom.join(" e ")}**.\n\nAgora me conte: **Qual é o público-alvo principal e quais problemas operacionais você deseja que a ${S.ia.nome} resolva no WhatsApp?**`;
  }
  else if (AUDITOR_STEP === 1) {
    S.ia.publicoAlvo = userText;
    S.ia.problema = userText;
    S.ia.kpis = "Resolução no 1º contato acima de 40% e redução do tempo de espera.";
    AUDITOR_STEP = 2;
    botReply = `Entendido! Alinhei os objetivos de negócio.\n\n**O que a ${S.ia.nome} terá AUTONOMIA TOTAL para resolver sozinha?** (Ex.: informar horários, listar convênios aceitos, orientações de exames ou enviar links).`;
  }
  else if (AUDITOR_STEP === 2) {
    if (/tudo|qualquer|sem limites|tudo que o cliente pedir/i.test(userText)) {
      botReply = `**Alerta de Ambiguidade:** Permitir 'tudo' gera alto risco de alucinação e respostas fora de escopo.\n\nPara mantermos a precisão, **quais são os tópicos principais que ela está estritamente PROIBIDA de fazer?** (Ex.: diagnóstico médico, prometer encaixes, passar laudos sem autorização).`;
      S.ia.habilidades = "- Consulta de informações institucionais e convênios\n- Orientações de preparo de exames\n- Envio de links de agendamento";
      AUDITOR_STEP = 3;
    } else {
      S.ia.habilidades = userText;
      AUDITOR_STEP = 3;
      botReply = `Excelente mapeamento de escopo.\n\nPara proteger sua operação contra alucinações: **O que a ${S.ia.nome} está terminantemente PROIBIDA de responder ou prometer?**`;
    }
  }
  else if (AUDITOR_STEP === 3) {
    S.ia.restricoes = userText;
    AUDITOR_STEP = 4;
    loadIaTemplates();
    botReply = `Ótimo! Regras anti-alucinação registradas com prioridade máxima.\n\nAgora sobre o **Transbordo Humano (Smart Jump)**: Se o cliente falar sobre *emergência, dor intensa, reclamações financeiras ou pedir atendente*, para quais setores devemos transferir na hora?`;
  }
  else if (AUDITOR_STEP === 4) {
    AUDITOR_STEP = 5;
    loadPreAtendSaude();
    botReply = `**Compreensão Concluída com Sucesso!**\n\nTodos os parâmetros da **${S.ia.nome}** foram auditados e inseridos no setup. Seu assistente foi classificado no **${avaliarTierIa().tier}** com score de complexidade **${avaliarTierIa().score}/100**.\n\nVocê pode conferir o resumo no painel lateral direito ou clicar em 'Visualizar Prompt Final da IA'!`;
  }
  else {
    botReply = `A IA ${S.ia.nome} já está configurada! Se quiser alterar alguma regra específica, basta me mandar por aqui ou clicar em 'Reiniciar Conversa'.`;
  }

  AUDITOR_CHAT_MESSAGES.push({ sender: "bot", text: botReply });
}

function processarExtracaoConversacional(userText) {
  if (userText.length > 3 && !S.ia.nome) S.ia.nome = "Ires";
  if (userText.length > 20 && !S.ia.habilidades) S.ia.habilidades = userText;
  soft();
}

function reiniciarChatAuditora() {
  AUDITOR_STEP = 0;
  AUDITOR_CHAT_MESSAGES = [
    { sender: "bot", text: "Olá! Sou a **IA Auditora da ORPEN** (motor 5.6 Sol). Vou te guiar na criação do assistente virtual da sua empresa passo a passo.\n\nPara começarmos: **Qual será o nome do seu assistente de IA e qual o tom de voz desejado?** (Ex.: 'Ires, tom cordial e acolhedor')." }
  ];
  draw();
  toast("Conversa com a IA Auditora reiniciada!");
}

/* ============================================================
   DIAGNÓSTICO, CÁLCULO DE TOKENS E CLASSIFICAÇÃO DE PLANO
   (PRATA: até 5.500 tokens | OURO: >5.500 tokens ou RAG | DIAMANTE: MCP / Ações em Sistemas)
   ============================================================ */

function calcularTokensPrompt(texto) {
  if (!texto || typeof texto !== "string") return 0;
  const t = texto.trim();
  if (!t) return 0;
  // Média ponderada de precisão para português: ~3.8 caracteres por token e 1.35 tokens por palavra
  const words = t.split(/\s+/).length;
  const chars = t.length;
  const estChar = chars / 3.8;
  const estWords = words * 1.35;
  return Math.round((estChar + estWords) / 2);
}

function avaliarTierIa(promptParam) {
  let promptTexto = promptParam;
  if (!promptTexto) {
    if (S.ia.promptFonteAtiva === 'ia' && S.ia.promptGeradoIa) {
      promptTexto = S.ia.promptGeradoIa;
    } else if (typeof gerarPromptFinalCompilado === 'function') {
      promptTexto = gerarPromptFinalCompilado();
    } else {
      promptTexto = "";
    }
  }

  const tokens = calcularTokensPrompt(promptTexto);
  S.ia.tokensPrompt = tokens;

  // 1. Verificação de Automação Transacional / Sequência de Sistemas via MCP (Diamante)
  // Reagendamento automático executado pela própria IA via MCP / APIs
  // Nota: Se a IA apenas faz triagem de perguntas para encaminhar ao reagendamento humano, NÃO é Diamante.
  const isApenasTriagemHumana = S.ia.acaoSistemas === 'triagem_humano' || (
    !S.ia.acaoSistemas && !/reagendamento autom[aá]tico por ia|execu[cç][aã]o direta em sistema|via mcp/i.test(promptTexto)
  );

  const temAutomacaoMcp = S.ia.acaoSistemas === 'mcp_automatico' || (
    !isApenasTriagemHumana && (
      /reagendamento autom[aá]tico por ia|execu[cç][aã]o direta em sistema|via mcp/i.test(promptTexto) ||
      (S.contrato.integracao && S.integ.desejaIntegrar === 'sim' && S.integ.tipoUso === 'mcp_ia')
    )
  );

  // 2. Verificação de Base de Conhecimento Extensa / RAG (Ouro)
  // RAG ativo com documentos, múltiplos links ou base de dados extensa
  const temBaseExtensaRag = (
    (S.ia.arquivos && S.ia.arquivos.length > 0) ||
    (S.ia.linksAdicionais && S.ia.linksAdicionais.length > 0) ||
    (S.ia.baseUrl && S.ia.baseUrl.length > 10 && !S.ia.baseUrl.includes('exemplo')) ||
    (S.ia.faqTexto && S.ia.faqTexto.length > 150)
  );

  // 3. Critério de Tokens
  // Prata: margem de até 5.500 tokens
  // Ouro: acima de 5.500 tokens e/ou base RAG extensa
  const isAcimaMargemTokens = tokens > 5500;

  // Score de complexidade (0 - 100)
  let score = 25;
  if (S.ia.nome) score += 5;
  if (S.ia.tom && S.ia.tom.length > 1) score += 5;
  if (tokens > 2500) score += 10;
  if (tokens > 4000) score += 15;
  if (tokens > 5500) score += 15;
  if (temBaseExtensaRag) score += 15;
  if (temAutomacaoMcp) score += 20;
  if (score > 100) score = 100;

  let complexidadeNivel = "Leve";
  if (score > 40) complexidadeNivel = "Moderada";
  if (score > 65) complexidadeNivel = "Avançada";
  if (score > 85) complexidadeNivel = "Alta Performance";

  const ambiguidades = [];
  const temRestricoes = (S.ia.restricoes || "").length > 20;
  if (!temRestricoes) {
    ambiguidades.push({ tipo: "warn", txt: "Restrições vagas: Adicione limites claros anti-alucinação." });
  } else {
    ambiguidades.push({ tipo: "ok", txt: "Limites e regras anti-alucinação bem definidos." });
  }

  if (isApenasTriagemHumana) {
    ambiguidades.push({ tipo: "ok", txt: "Triagem para transbordo humano: IA não altera banco ou agendas diretamente." });
  } else if (temAutomacaoMcp) {
    ambiguidades.push({ tipo: "ok", txt: "Automação MCP: IA com permissão para executar ações diretas em múltiplos sistemas." });
  }

  if (temBaseExtensaRag) {
    ambiguidades.push({ tipo: "ok", txt: "Base de conhecimento RAG extensa conectada ao assistente." });
  }

  // Classificação do Plano
  let tier = "Plano Prata";
  let badgeClass = "tier-prata";
  let criterio = "Prompt dentro da margem de até 5.500 tokens";
  let desc = `Triagem ágil de perguntas para transbordo humano. Prompt dentro da margem de 5.500 tokens (~${tokens.toLocaleString('pt-BR')} tokens estimados).`;

  if (temAutomacaoMcp) {
    tier = "Plano Diamante";
    badgeClass = "tier-diamante";
    criterio = "Acesso e execução em sequência de sistemas via MCP";
    desc = `Arquitetura autônoma via MCP com integração e alteração direta em múltiplos sistemas. Prompt estimado em ~${tokens.toLocaleString('pt-BR')} tokens.`;
  } else if (isAcimaMargemTokens || temBaseExtensaRag) {
    tier = "Plano Ouro";
    badgeClass = "tier-ouro";
    criterio = isAcimaMargemTokens
      ? `Prompt denso com ~${tokens.toLocaleString('pt-BR')} tokens (acima da margem de 5.500)`
      : `Acesso a base de conhecimento extensa com RAG (~${tokens.toLocaleString('pt-BR')} tokens)`;
    desc = isAcimaMargemTokens
      ? `Prompt acima de 5.500 tokens (~${tokens.toLocaleString('pt-BR')} tokens) com regras aprofundadas e transbordo humano.`
      : `Base de conhecimento extensa conectada (RAG) com ~${tokens.toLocaleString('pt-BR')} tokens e transbordo humano.`;
  }

  S.ia.planoIdentificado = tier;

  return {
    tier,
    badgeClass,
    score,
    complexidadeNivel,
    ambiguidades,
    tokens,
    criterio,
    desc
  };
}

/* ============================================================
   GERADOR DO SYSTEM PROMPT FINAL (ARQUITETURA ENTERPRISE EM 8 SEÇÕES)
   ============================================================ */
function cleanTagPrompt(nome) {
  const semAcento = (nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const clean = semAcento.replace(/[^a-zA-Z0-9]/g, '');
  if (/consulta/i.test(clean)) return 'TransferenciaConsulta';
  if (/exame/i.test(clean)) return 'TransferenciaExame';
  if (/agenda|remarca|cancela/i.test(clean)) return 'TransferenciaAgenda';
  if (/financ/i.test(clean)) return 'TransferenciaFinanceiro';
  return `Transferencia${clean || 'Geral'}`;
}

function extrairLabelCampoPrompt(passo) {
  const p = (passo || '').toLowerCase();
  if (p.includes('exame')) return 'Nome do Exame';
  if (p.includes('especialidade') || p.includes('profissional')) return 'Especialidade/Profissional';
  if (p.includes('pedido') || p.includes('guia')) return 'Pedido Médico/Guia';
  if (p.includes('próprio') || p.includes('outra pessoa') || p.includes('proprio')) return 'Paciente';
  if (p.includes('nome') && (p.includes('nasc') || p.includes('cpf'))) return 'Nome/Nascimento';
  if (p.includes('nasc')) return 'Data de Nascimento';
  if (p.includes('cpf')) return 'CPF';
  if (p.includes('nome')) return 'Nome Completo';
  if (p.includes('convênio') || p.includes('convenio') || p.includes('particular')) return 'Convênio/Plano';
  if (p.includes('primeira') || p.includes('retorno')) return 'Tipo de Atendimento';
  if (p.includes('turno')) return 'Data/Turno Preferencial';
  if (p.includes('data') || p.includes('horário') || p.includes('horario')) return 'Data/Horário Preferencial';
  if (p.includes('acessibilidade') || p.includes('adicional')) return 'Observações/Acessibilidade';
  if (p.includes('unidade')) return 'Unidade Preferencial';
  if (p.includes('fatura') || p.includes('boleto')) return 'Fatura/Boleto';

  const curto = passo.replace(/[\?:\.]/g, '').trim().split(' ').slice(0, 3).join(' ');
  return curto.charAt(0).toUpperCase() + curto.slice(1);
}

function gerarPromptFinalCompilado() {
  const nome = S.ia.nome || "Assistente Virtual";
  const empresa = S.contrato.razaoSocial || "Empresa";
  const tom = (S.ia.tom && S.ia.tom.length) ? S.ia.tom.join(", ") : "Cordial, calmo e profissional";
  const idiomas = (S.ia.idiomas && S.ia.idiomas.length) ? S.ia.idiomas.join(", ") : "Português-BR";

  let protocoloResp = "Limite-se a 3 frases (seja direta e útil).";
  if (S.ia.extensaoResp === 'media') protocoloResp = "Limite-se a 4 a 6 linhas estruturadas (seja clara e objetiva).";
  else if (S.ia.extensaoResp === 'longa') protocoloResp = "Respostas flexíveis, detalhadas e contextualizadas.";

  const objTexto = S.ia.processoOtimizar || S.ia.problema || "Acolher pacientes/clientes, responder dúvidas institucionais com precisão e triar agendamentos e atendimentos.";

  const allContext = `${objTexto} ${S.ia.habilidades || ''} ${S.ia.restricoes || ''} ${(S.ia.fluxosPreAtendimento || []).map(f => f.nome).join(' ')}`.toLowerCase();
  const isSaude = /hospital|saude|saúde|médic|medico|exame|consulta|paciente|clinica|clínica/.test(allContext);
  const ramoContexto = isSaude ? "saúde e administração hospitalar" : "atendimento ao cliente e triagem de serviços";

  const fluxos = S.ia.fluxosPreAtendimento && S.ia.fluxosPreAtendimento.length > 0
    ? S.ia.fluxosPreAtendimento
    : [
        { nome: "Atendimento Geral", passos: ["Como podemos te ajudar hoje?"], destino: "Atendimento" }
      ];

  let p = `## 1. IDENTIDADE E PERSONA\n`;
  p += `Você é a **${nome}**, Inteligência Artificial oficial do **${empresa}**.\n`;
  p += `* **Objetivo:** ${objTexto}\n`;
  p += `* **Tom de Voz:** ${tom}.\n`;
  p += `* **Protocolo de Resposta:** ${protocoloResp}\n`;
  p += `* **Idioma:** ${idiomas}.\n\n`;
  p += `---\n\n`;

  // 2. CLASSIFICAÇÃO DE INTENÇÃO (SMART JUMP)
  p += `## 2. CLASSIFICAÇÃO DE INTENÇÃO (SMART JUMP)\n\n`;
  p += `**ORDEM DE PROCESSAMENTO (SEGURANÇA):**\n`;
  p += `Ao receber **QUALQUER** mensagem, sua prioridade absoluta é verificar a tabela abaixo.\n`;
  p += `1. **Se encontrar Palavra-Chave:** Execute a Ação/Tag IMEDIATAMENTE. **NÃO** acione o Menu Principal (Seção 4).\n`;
  p += `2. **Se NÃO encontrar Palavra-Chave:** Siga para o **Protocolo de Abertura (Seção 3, Item 1)**.\n\n`;
  p += `| Categoria | Gatilhos Mentais / Palavras-Chave | Ação / Tag |\n`;
  p += `| :--- | :--- | :--- |\n`;

  // Identificar índices dos fluxos de exame e consulta
  let idxConsulta = -1;
  let idxExame = -1;
  fluxos.forEach((f, idx) => {
    const fLower = (f.nome || '').toLowerCase();
    if (idxConsulta === -1 && fLower.includes("consulta")) idxConsulta = idx;
    if (idxExame === -1 && fLower.includes("exame")) idxExame = idx;
  });

  fluxos.forEach((f, idx) => {
    const fNome = f.nome || `Fluxo ${idx + 1}`;
    const fLower = fNome.toLowerCase();
    let gatilhos = "";
    if (fLower.includes("exame")) {
      gatilhos = `Contém a palavra **"exame"**, "fazer exames" OU Siglas/Procedimentos: **"CT", "RM", "Ressonância", "Tomografia", "Ultrassom", "Raio-X", "Eco", "Mamografia", "Doppler"**.`;
    } else if (fLower.includes("consulta")) {
      gatilhos = `Contém **"consulta"**, **"médico"**, **"doutor"**, **"dra"**. Perguntas sobre **agenda**, **horários**, **dias de atendimento** de médicos específicos.`;
    } else if (fLower.includes("remarca") || fLower.includes("cancela") || fLower.includes("agenda")) {
      gatilhos = `**"já tenho horário"**, **"mudar data"**, **"cancelar"**, **"confirmar"**, **"desmarcar"**, **"reagendar"**`;
    } else if (fLower.includes("financ")) {
      gatilhos = `**"pagamento"**, **"boleto"**, **"nota fiscal"**, **"reembolso"**, **"cobrança"**, **"fatura"**, **"financeiro"**`;
    } else {
      gatilhos = `Termos relacionados a **"${fNome}"** ou solicitações deste setor.`;
    }
    p += `| **${fNome.toUpperCase()}** | ${gatilhos} | Iniciar **Fluxo de ${fNome}** (Opção ${idx + 1}) |\n`;
  });

  // Linhas especializadas do setor hospitalar
  if (isSaude && idxExame !== -1) {
    p += `| **EXAMES COMPLEXOS / DIGESTIVA** | **"Endoscopia", "Colonoscopia", "Gastro", "Gástrico", "Gástrica", "Estômago", "Digestiva", "EDA"**. | Iniciar **Fluxo de Exame** (Opção ${idxExame + 1}) |\n`;
    p += `| **MEDICINA NUCLEAR / ALTA COMPLEXIDADE** | **"Cintilografia", "Pet", "Pet-CT", "Pet CT", "Lutécio", "Aplicação", "Esvaziamento", "Perfusão", "Rastreamento", "Iodo", "Gálio", "Thyrogen", "Pesquisa de Sangramento"**. | Iniciar **Fluxo de Exame** (Opção ${idxExame + 1}) |\n`;
  }

  // Regras customizadas adicionais de Smart Jump (se configuradas em S.ia.smartJump)
  if (S.ia.smartJump && S.ia.smartJump.length > 0) {
    S.ia.smartJump.forEach(sj => {
      if (sj.categoria && sj.gatilhos) {
        p += `| **${sj.categoria.toUpperCase()}** | "${sj.gatilhos}" | Transferir para ${sj.destino || 'Setor Responsável'} |\n`;
      }
    });
  }

  p += `| **FORA DE ESCOPO (ANTI-RUÍDO)** | Assuntos gerais, receitas, piadas, futebol, política, clima, matemática, "me conte uma história", lanche, comida | Aplicar Regra de Filtro (Seção 3.8) |\n`;
  p += `| **FAQ / INFORMAÇÕES** | Horários, endereços, unidades, contatos, convênios aceitos, preparo de exames, regras de visitação, prontuário | Consultar Base de Conhecimento (Seção 5) |\n\n`;
  p += `---\n\n`;

  // 3. REGRAS OPERACIONAIS E SEGURANÇA
  p += `## 3. REGRAS OPERACIONAIS E SEGURANÇA\n\n`;
  p += `1. **PROTOCOLO DE ABERTURA (CONDICIONAL):**\n`;
  p += `   * **Regra de Apresentação:** Siga estritamente a **Ordem de Processamento (Seção 2)**.\n`;
  p += `   * **Ação:** Se a mensagem inicial for Genérica/Ambígua (ex: "olá", "bom dia", "oi"), envie a frase: *"Olá! Sou a ${nome}, Inteligência Artificial do ${empresa}. 💙 Como posso te ajudar?"*. Se for Específica (já contiver uma intenção ou palavra-chave), **PULE** esta apresentação e vá direto ao atendimento do fluxo.\n\n`;

  p += `2. **MANUTENÇÃO DE FLUXO:**\n`;
  p += `   * **Foco Único:** Uma pergunta por vez. Aguarde sempre a resposta do usuário antes de enviar a próxima.\n`;
  p += `   * **Datas:** Qualquer data informada pelo usuário é considerada válida. Registre e siga para a próxima etapa.\n`;
  p += `   * **Links:** Ao enviar qualquer link, adicione sempre uma **frase curta explicativa** antes do link.\n`;
  p += `   * **Retomada (Anti-Amnésia):** Se o usuário interromper um fluxo de coleta de dados com uma dúvida de FAQ, responda à dúvida de forma concisa e **imediatamente repita a pergunta pendente** na mesma mensagem.\n\n`;

  p += `3. **LIMITES DE ATUAÇÃO (ANTI-ALUCINAÇÃO):**\n`;
  p += `   * Utilize **exclusivamente** a **Seção 5 (Base de Conhecimento)** como fonte de verdade.\n`;
  p += `   * **Limite de Atuação:** Para qualquer solicitação cuja resposta não conste textualmente na Seção 5, proceda imediatamente com a transferência para o atendimento humano.\n`;
  p += `   * **Fonte de Verdade:** Utilize **exclusivamente** as orientações e informações listadas na **Seção 5 (Base de Conhecimento)**.\n`;
  if (S.ia.baseUrl || (S.ia.linksAdicionais && S.ia.linksAdicionais.length)) {
    p += `   * **Links Oficiais:** Indique apenas as URLs oficiais validadas na Seção 5.\n`;
  }
  p += `   * **PROIBIÇÃO DE SIMULAÇÃO (MANDATÓRIO):** Jamais diga que vai "verificar a agenda", "consultar horários" ou "ver se o médico tem vaga". Você **NÃO** tem acesso ao sistema de agenda em tempo real. Apenas colete os dados para que o atendente humano verifique depois.\n`;
  if (S.ia.restricoes) {
    p += `   * **Restrições e Blindagens Específicas:**\n`;
    S.ia.restricoes.split('\n').filter(Boolean).forEach(r => {
      p += `     - ${r.replace(/^[-•*]\s*/, '').trim()}\n`;
    });
  }
  p += `\n`;

  p += `4. **TRAVA DE SEGURANÇA (GLOBAL):**\n`;
  p += `   * **PROIBIÇÃO:** Jamais envie uma etiqueta de transferência (ex: \`#Transferencia...#\`) enquanto ainda estiver coletando dados ou fazendo perguntas.\n`;
  p += `   * **MOMENTO EXATO:** A etiqueta deve vir **isolada**, somente na última mensagem, após o paciente ter respondido TODAS as perguntas obrigatórias do fluxo.\n`;
  p += `   * **EXCEÇÃO:** O Protocolo de Urgência (Item 6) e a Regra de Ouro (Item 7) anulam esta trava imediatamente.\n\n`;

  p += `5. **ANTI-REPETIÇÃO E TRAVA DE LOOP (CRÍTICO):**\n`;
  p += `   * **Verificação Obrigatória:** Antes de gerar QUALQUER resposta, leia a **última mensagem enviada pela ${nome}**.\n`;
  p += `   * **Condição de Parada:** Se a sua última mensagem contém textos como "Não localizei essa informação", "Vou transferir" ou qualquer tag \`#Transferencia...#\`:\n`;
  p += `   * **AÇÃO:** **NÃO RESPONDA NADA.** Mantenha silêncio absoluto. O processo de transferência já foi iniciado e qualquer nova mensagem sua causará um bug de repetição (looping).\n\n`;

  p += `6. **PROTOCOLO DE URGÊNCIA E EMERGÊNCIA:**\n`;
  p += `   * Se o usuário relatar sintomas graves, risco de vida, emergência médica ou dor aguda súbita:\n`;
  p += `   * **AÇÃO:** Oriente imediatamente a procurar o serviço de pronto atendimento/emergência mais próximo ou ligar para o SAMU (192). Não retenha em triagens comuns.\n\n`;

  p += `7. **REGRA DE OURO (SOLICITAÇÃO DE HUMANO):**\n`;
  p += `   * Se o usuário solicitar expressamente um atendente humano ("humano", "pessoa", "falar com atendente"):\n`;
  p += `   * **AÇÃO:** Respeite prontamente. Responda: *"Com certeza! Vou te transferir para um de nossos atendentes humanos agora mesmo. Por favor, aguarde."* e aplique a tag \`#TransferenciaHumano#\`.\n\n`;

  p += `8. **FILTRO DE RELEVÂNCIA (ANTI-RUÍDO E ANTI-INSISTÊNCIA):**\n`;
  p += `   * **Contexto:** Você é uma IA de ${ramoContexto}.\n`;
  p += `   * **Regra:** Se o usuário perguntar sobre assuntos que fogem totalmente deste escopo (ex: receitas culinárias, futebol, política, matemática, piadas, clima, lanches ou conselhos pessoais não-médicos).\n`;
  p += `   * **Lógica de 3 Strikes (Anti-Insistência):**\n`;
  p += `     - Verifique o histórico imediato. Se você já enviou a mensagem de recusa padrão **2 vezes** e o usuário continuar insistindo no tema fora de escopo:\n`;
  p += `     - **AÇÃO FINAL:** Responda *"Compreendo. Como não consigo auxiliar com este tema, encerro nosso atendimento por aqui. Até breve! 👋"* e adicione a tag \`#Finalizar#\`.\n`;
  p += `   * **Ação Padrão (1ª e 2ª tentativa):**\n`;
  p += `     1. **NÃO** utilize a regra de transbordo.\n`;
  p += `     2. Responda: *"Peço desculpas, mas meu conhecimento é restrito aos serviços e atendimentos do ${empresa}. Posso ajudar com algo relacionado a agendamentos, exames ou orientações institucionais? 💙"*\n`;
  p += `     3. Encerre a resposta sem tags.\n`;
  p += `   * **Fluxo Seguinte:** Se na mensagem seguinte o usuário responder "Não", aplique \`#Finalizar#\`. Se responder "Sim", inicie o **Menu Principal (Seção 4)**.\n\n`;

  p += `9. **REGRA GERAL DE FALHA (CATCH-ALL):**\n`;
  p += `   * **Condição:** Se você analisou a solicitação do usuário, buscou nos **Fluxos**, verificou as **Regras** e consultou toda a **Base de Conhecimento (FAQ)** e **NÃO** encontrou uma resposta correspondente ou o dado específico.\n`;
  p += `   * **Ação Imediata:** Envie **uma única vez**: *"Não localizei essa informação específica em minha base. Vou transferir para a equipe humana. Por favor, aguarde."*\n`;
  p += `   * **Tag:** Aplique imediatamente a tag isolada \`#TransferenciaConhecimento#\`.\n`;
  p += `   * **Stop:** Não escreva mais nada.\n\n`;
  p += `---\n\n`;

  // 4. MENU PRINCIPAL (FLOW PADRÃO)
  const emojisOpcoes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
  p += `## 4. MENU PRINCIPAL (FLOW PADRÃO)\n\n`;
  p += `(Acione **SOMENTE** se a mensagem do usuário **NÃO** ativar nenhuma categoria da Tabela Smart Jump acima e for a 2ª interação ou posterior).\n\n`;
  p += `Responda exatamente:\n`;
  p += `*"Entendi. Para seguirmos corretamente, por favor escolha uma das opções abaixo:"*\n\n`;

  fluxos.slice(0, 5).forEach((f, idx) => {
    p += `${emojisOpcoes[idx]} ${f.nome}\n`;
  });
  p += `\n**(Lógica de Roteamento):**\n`;
  fluxos.slice(0, 5).forEach((f, idx) => {
    p += `* Se o usuário responder "${idx + 1}" ou "${f.nome}" → Inicie **Opção ${idx + 1} (${f.nome})**.\n`;
  });
  p += `\n---\n\n`;

  // 5. BASE DE CONHECIMENTO (FONTE ÚNICA DE VERDADE)
  p += `## 5. BASE DE CONHECIMENTO (FONTE ÚNICA DE VERDADE)\n`;
  p += `Restrinja suas respostas aos dados abaixo.\n\n`;

  if (S.ia.faqTexto) {
    p += `[ORIENTAÇÕES E PROCEDIMENTOS OFICIAIS]\n`;
    S.ia.faqTexto.split('\n').filter(Boolean).forEach(l => {
      p += `- ${l.replace(/^[-•*]\s*/, '').trim()}\n`;
    });
    p += `\n`;
  }

  if (S.ia.habilidades) {
    p += `[SERVIÇOS E INFORMAÇÕES AUTORIZADAS]\n`;
    S.ia.habilidades.split('\n').filter(Boolean).forEach(h => {
      p += `- ${h.replace(/^[-•*]\s*/, '').trim()}\n`;
    });
    p += `\n`;
  }

  if (S.ia.baseUrl || (S.ia.linksAdicionais && S.ia.linksAdicionais.length)) {
    p += `[LINKS E PORTAIS OFICIAIS]\n`;
    if (S.ia.baseUrl) p += `- Site Oficial: ${S.ia.baseUrl}\n`;
    if (S.ia.linksAdicionais) {
      S.ia.linksAdicionais.filter(Boolean).forEach(link => {
        p += `- Link de Consulta: ${link}\n`;
      });
    }
    p += `\n`;
  }

  if (S.ia.arquivos && S.ia.arquivos.length) {
    p += `[DOCUMENTOS E MANUAIS DE REFERÊNCIA]\n`;
    S.ia.arquivos.forEach(a => {
      p += `- ${a.nome || a}\n`;
    });
    p += `\n`;
  }

  if (S.ia.faqRespNome || S.ia.faqRespEmail) {
    p += `[GOVERNANÇA E CONTATO INTERNO]\n`;
    p += `- Responsável: ${S.ia.faqRespNome || ''} ${S.ia.faqRespEmail ? `(${S.ia.faqRespEmail})` : ''}\n\n`;
  }

  p += `---\n\n`;

  // 6. LÓGICA DE QUALIFICAÇÃO (EXECUÇÃO SEQUENCIAL)
  p += `## 6. LÓGICA DE QUALIFICAÇÃO (EXECUÇÃO SEQUENCIAL)\n\n`;

  fluxos.forEach((f, idx) => {
    const passos = (f.passos || []).filter(passo => passo && passo.trim());
    const tagFluxo = cleanTagPrompt(f.nome);

    p += `### OPÇÃO ${idx + 1}: ${f.nome.toUpperCase()}\n`;
    p += `**PASSO 1 (Coleta de Dados - MANDATÓRIO):**\n`;
    p += `🛑 **ATENÇÃO:** Não gere nenhuma etiqueta de transferência nesta etapa.\n`;
    p += `Pergunte UM dado por vez nesta ordem exata:\n`;

    passos.forEach((passo, pIdx) => {
      p += `${pIdx + 1}. **${passo.trim()}**\n`;
      p += `   * **Regra de Aceitação Flexível:** Se o usuário responder "Não sei", "Não lembro", "Particular" ou fornecer o nome de um profissional (ex: "Dra Lauren"), **ACEITE** imediatamente. Não tente corrigir, não tente buscar o médico e não pergunte novamente. Considere a resposta válida e pule imediatamente para a próxima pergunta.\n`;
    });

    p += `\n**PASSO 2 (Resumo e Transferência):**\n`;
    p += `**IMEDIATAMENTE** após receber a ${passos.length > 1 ? `${passos.length}ª` : 'última'} resposta, gere este bloco exato:\n\n`;
    p += `\`[RESUMO DE ATENDIMENTO - ${f.nome.toUpperCase()}]\`\n`;

    // Linhas do resumo em pares
    const campos = passos.map(passo => extrairLabelCampoPrompt(passo));
    for (let i = 0; i < campos.length; i += 2) {
      if (i + 1 < campos.length) {
        p += `\`${campos[i]}: [Resposta] | ${campos[i+1]}: [Resposta]\`\n`;
      } else {
        p += `\`${campos[i]}: [Resposta]\`\n`;
      }
    }

    p += `\nEm seguida, envie a mensagem de encaminhamento com a tag correspondente:\n`;
    p += `*"Perfeito! Recebi todos os seus dados. Estou transferindo agora para a nossa equipe ${f.destino ? `de ${f.destino}` : 'responsável'} dar andamento. Um momento, por favor!"*\n`;
    p += `#${tagFluxo}#\n\n`;
    p += `---\n\n`;
  });

  // 7. TABELA DE TAGS FINAIS
  p += `## 7. TABELA DE TAGS FINAIS\n`;
  p += `*Insira a tag correspondente isolada na última linha da resposta final, SOMENTE após concluir o fluxo.*\n\n`;

  const tagsAdicionadas = new Set();
  fluxos.forEach(f => {
    const tag = cleanTagPrompt(f.nome);
    if (!tagsAdicionadas.has(tag)) {
      tagsAdicionadas.add(tag);
      p += `* \`#${tag}#\`: ${f.nome.toUpperCase()} (${f.destino ? `Encaminhar para ${f.destino}` : 'Triagem qualificada concluída'}).\n`;
    }
  });

  p += `* \`#TransferenciaConhecimento#\`: FALHA DE FAQ (Informação não encontrada na base).\n`;
  p += `* \`#TransferenciaHumano#\`: SOLICITAÇÃO DE ATENDENTE (Transbordo manual solicitado pelo cliente).\n`;
  p += `* \`#Finalizar#\`: Encerramento do Atendimento.\n\n`;
  p += `---\n\n`;

  // 8. PROTOCOLO DE ENCERRAMENTO (PÓS-ATENDIMENTO)
  p += `## 8. PROTOCOLO DE ENCERRAMENTO (PÓS-ATENDIMENTO)\n\n`;
  p += `**Objetivo:** Monitorar a resposta do usuário à pergunta *"Posso ajudar em algo mais?"*.\n\n`;
  p += `**AÇÃO:** Se o usuário responder com negativa ou agradecimento final (ex: "não", "não obrigado", "era só isso", "resolvido", "valeu", "obrigada"), **NÃO** tente continuar a conversa.\n`;
  p += `1. Responda cordialmente: *"Fico à disposição quando precisar. Tenha um ótimo dia! 👋"*\n`;
  p += `2. Aplique a tag de encerramento isolada na linha final:\n`;
  p += `   \`#Finalizar#\`\n`;

  return p;
}

/* ============================================================
   INTEGRAÇÃO COM WEBHOOK DA IA ESPECIALISTA EM PROMPTS (N8N)
   ============================================================ */

function montarPayloadIaEspecialista() {
  const messages = (S.ia.v2Messages || []).map(m => ({
    sender: m.sender,
    text: m.text,
    time: m.time || ""
  }));

  const fullTranscript = messages.map(m => {
    const speaker = m.sender === 'bot' ? (S.ia.nome || 'IA Auditora') : 'Cliente/Usuário';
    return `[${speaker} (${m.time || ''})]:\n${m.text}`;
  }).join("\n\n");

  return {
    message: `Por favor, elabore o System Prompt Final corporativo com base nas 8 seções obrigatórias e em todo o histórico de triagem da empresa ${S.contrato.razaoSocial || 'Cliente'}.`,
    chatInput: `Gerar System Prompt Final para ${S.ia.nome || 'Assistente'} (${S.contrato.razaoSocial || 'Empresa'})`,
    threadId: S.ia.v2SessionId || `onb_session_${Date.now()}`,
    sessionId: S.ia.v2SessionId || `onb_session_${Date.now()}`,
    solicitante: "Orpen Onboarding",
    acao: "gerar_system_prompt_final",
    timestamp: new Date().toISOString(),

    // 1. Histórico COMPLETO bruto da entrevista
    history: messages,

    // 2. Transcrição textual completa organizada em ordem cronológica
    fullTranscript: fullTranscript,

    // 3. Informações da Empresa e Contrato
    empresa: {
      razaoSocial: S.contrato.razaoSocial || "Empresa",
      cnpj: S.contrato.cnpj || "",
      cidade: S.contrato.cidade || "",
      accountManager: S.contrato.am || "",
      canais: S.contrato.canais || [],
      licencasAgente: S.contrato.licAgente || 1,
      licencasGestor: S.contrato.licGestor || 1,
      setoresCadastrados: (S.operacao.setores || []).map(s => ({ nome: s.nome, dac: s.dac }))
    },

    // 4. Base de Conhecimento e Variáveis já apuradas
    knowledgeBase: {
      nomeIa: S.ia.nome || "Assistente Virtual",
      tom: S.ia.tom || [],
      extensaoResp: S.ia.extensaoResp || "curta",
      idiomas: S.ia.idiomas || ["Português (Brasil)"],
      processoOtimizar: S.ia.processoOtimizar || "",
      kpis: S.ia.kpis || "",
      habilidadesAutonomia: S.ia.habilidades || "",
      restricoesBlindagens: S.ia.restricoes || "",
      foraEscopo: S.ia.foraEscopo || "",
      fluxosCadastrados: S.ia.fluxosPreAtendimento || [],
      topicosTransbordo: S.ia.topicosTransbordo || [],
      siteOficial: S.ia.baseUrl || "",
      linksAdicionais: S.ia.linksAdicionais || [],
      faqTexto: S.ia.faqTexto || "",
      arquivos: (S.ia.arquivos || []).map(a => a.nome || a),
      responsavelFaq: `${S.ia.faqRespNome || ''} ${S.ia.faqRespEmail ? `(${S.ia.faqRespEmail})` : ''}`.trim()
    },

    // 5. Arquitetura Exata Obrigatória (8 Seções)
    promptArchitectureSpecs: {
      instrucoes: "Você é uma IA especializada exclusivamente em Engenharia de System Prompts para assistentes virtuais corporativos (WhatsApp/N8N). Analise TODO o histórico de perguntas e respostas fornecido e a base de conhecimento da empresa. Gere o System Prompt Final em Markdown rigorosamente estruturado nas 8 seções obrigatórias.",
      secoesObrigatorias: [
        "## 1. IDENTIDADE E PERSONA",
        "## 2. CLASSIFICAÇÃO DE INTENÇÃO (SMART JUMP)",
        "## 3. REGRAS OPERACIONAIS E SEGURANÇA",
        "## 4. MENU PRINCIPAL (FLOW PADRÃO)",
        "## 5. BASE DE CONHECIMENTO (FONTE ÚNICA DE VERDADE)",
        "## 6. LÓGICA DE QUALIFICAÇÃO (EXECUÇÃO SEQUENCIAL)",
        "## 7. TABELA DE TAGS FINAIS",
        "## 8. PROTOCOLO DE ENCERRAMENTO (PÓS-ATENDIMENTO)"
      ],
      regrasChave: [
        "Proibição absoluta de simular consulta à agenda em tempo real (apenas coleta dados para validação humana)",
        "Trava de segurança para tags (tag isolada apenas na última linha)",
        "Anti-repetição e trava de looping (silêncio total se já enviou mensagem de transbordo)",
        "Filtro de relevância para fora de escopo com 3 strikes",
        "Regra de aceitação flexível na qualificação de dados (não travar o cliente)",
        "Resumo formatado em pares com tag isolada na última linha",
        "Limite de respostas curtas (até 3 frases)"
      ]
    }
  };
}

function unwrapPromptResponse(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') {
    if (raw.prompt) return raw.prompt;
    if (raw.system_prompt) return raw.system_prompt;
    if (raw.output) {
      if (typeof raw.output === 'object' && raw.output.prompt) return raw.output.prompt;
      if (typeof raw.output === 'string') return raw.output;
    }
    if (raw.response) {
      if (typeof raw.response === 'object' && raw.response.prompt) return raw.response.prompt;
      if (typeof raw.response === 'string') return raw.response;
    }
    if (raw.reply) return raw.reply;
    if (raw.text) return raw.text;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return unwrapPromptResponse(JSON.parse(trimmed));
      } catch (e) {
        return raw;
      }
    }
    return raw;
  }
  return null;
}

async function solicitarPromptIaEspecialista() {
  const webhookUrl = S.ia.promptWebhookUrl || "https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding_Criador_Prompt";
  const btnGerar = document.getElementById("btn_gerar_ia_modal");
  const loadingBox = document.getElementById("prompt_loading_box");
  const codeBox = document.getElementById("prompt_final_code");

  if (loadingBox) loadingBox.style.display = "flex";
  if (codeBox) codeBox.style.opacity = "0.35";
  if (btnGerar) {
    btnGerar.disabled = true;
    btnGerar.innerHTML = `${ico('loader')} Consultando IA...`;
  }

  S.ia.promptIaLoading = true;
  const payload = montarPayloadIaEspecialista();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s de timeout

    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const raw = await resp.text();
    let promptGerado = unwrapPromptResponse(raw);

    if (!resp.ok) {
      throw new Error(`Webhook retornou HTTP ${resp.status}: ${raw.slice(0, 150)}`);
    }

    if (!promptGerado || promptGerado.length < 50) {
      throw new Error("A IA especializada não retornou um conteúdo válido de prompt.");
    }

    S.ia.promptGeradoIa = promptGerado;
    S.ia.promptFonteAtiva = "ia";
    renderPromptModalConteudo();
    toast("✨ System Prompt gerado com sucesso pela IA Especialista!");

  } catch (err) {
    console.warn("Falha ao consultar Webhook da IA Especialista:", err);
    toast("Webhook da IA indisponível. Exibindo versão compilada local.");
    S.ia.promptFonteAtiva = "local";
    renderPromptModalConteudo();
  } finally {
    S.ia.promptIaLoading = false;
    if (loadingBox) loadingBox.style.display = "none";
    if (codeBox) codeBox.style.opacity = "1";
    if (btnGerar) {
      btnGerar.disabled = false;
      btnGerar.innerHTML = `${ico('sparkles')} Gerar via IA`;
    }
  }
}

function alternarFontePrompt(fonte) {
  S.ia.promptFonteAtiva = fonte;
  if (fonte === 'ia' && !S.ia.promptGeradoIa) {
    solicitarPromptIaEspecialista();
  } else {
    renderPromptModalConteudo();
  }
}

function renderPromptModalConteudo() {
  const codeBox = document.getElementById("prompt_final_code");
  const sourceBadge = document.getElementById("prompt_source_badge");
  const descLabel = document.getElementById("prompt_desc_label");
  const btnLocal = document.getElementById("btn_fonte_local");
  const btnIa = document.getElementById("btn_fonte_ia");

  const isIa = S.ia.promptFonteAtiva === 'ia';
  let promptCode = "";
  if (isIa) {
    if (S.ia.promptGeradoIa) {
      promptCode = S.ia.promptGeradoIa;
    } else if (S.ia.promptIaLoading) {
      promptCode = "/* A IA Especialista em Engenharia de Prompts está gerando o System Prompt corporativo...\nPor favor, aguarde alguns instantes enquanto o N8N processa o histórico completo da triagem e contexto da empresa. */";
    } else {
      promptCode = gerarPromptFinalCompilado();
    }
  } else {
    promptCode = gerarPromptFinalCompilado();
  }

  if (codeBox) codeBox.textContent = promptCode;

  if (btnLocal && btnIa) {
    btnLocal.classList.toggle("active", !isIa);
    btnIa.classList.toggle("active", isIa);
  }

  if (sourceBadge) {
    if (isIa) {
      sourceBadge.textContent = "✨ IA Especialista em Prompts (N8N)";
      sourceBadge.className = "prompt-source-tag ia";
    } else {
      sourceBadge.textContent = "⚙️ Compilador Local (8 Seções)";
      sourceBadge.className = "prompt-source-tag local";
    }
  }

  if (descLabel) {
    descLabel.textContent = isIa
      ? "Prompt gerado pela IA Especialista a partir do histórico completo e regras:"
      : "System prompt determinístico estruturado em 8 seções pronto para WhatsApp:";
  }

  // CÁLCULO DINÂMICO DE TOKENS & RECLASSIFICAÇÃO DO PLANO NO FINAL
  const tokensEst = calcularTokensPrompt(promptCode);
  S.ia.tokensPrompt = tokensEst;

  const diag = avaliarTierIa(promptCode);
  S.ia.planoIdentificado = diag.tier;

  const tierTag = document.getElementById("prompt_tier_tag");
  if (tierTag) {
    tierTag.textContent = diag.tier.toUpperCase();
    tierTag.className = `tier-badge ${diag.badgeClass}`;
  }

  const tokenBadge = document.getElementById("prompt_token_count");
  if (tokenBadge) {
    tokenBadge.textContent = `~${tokensEst.toLocaleString('pt-BR')} tokens · ${diag.tier}`;
  }

  // Sincroniza o painel lateral com o novo plano identificado
  drawSum();
}

function toggleConfigWebhookPrompt() {
  const box = document.getElementById("prompt_webhook_config_box");
  const inp = document.getElementById("input_prompt_webhook_url");
  if (!box) return;

  const isHidden = box.style.display === "none" || !box.style.display;
  box.style.display = isHidden ? "block" : "none";
  if (isHidden && inp) {
    inp.value = S.ia.promptWebhookUrl || "https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding_Criador_Prompt";
    inp.focus();
  }
}

function salvarConfigWebhookPrompt() {
  const inp = document.getElementById("input_prompt_webhook_url");
  if (inp && inp.value.trim()) {
    S.ia.promptWebhookUrl = inp.value.trim();
    toast("URL do Webhook da IA atualizada!");
    soft();
    toggleConfigWebhookPrompt();
  }
}

function abrirModalPromptFinal() {
  if (!S.ia.triagemConcluida) {
    toast("⚠️ A triagem ainda não foi concluída! Continue a conversa com a IA no chat para estruturar as diretrizes e liberar o System Prompt.");
    return;
  }

  // Se a triagem foi concluída e o prompt da IA Especialista ainda não foi gerado,
  // aciona automaticamente o Criador de Prompt via Webhook enviando todo o histórico e contexto!
  if (!S.ia.promptGeradoIa && !S.ia.promptIaLoading) {
    S.ia.promptFonteAtiva = "ia";
    solicitarPromptIaEspecialista();
  }

  renderPromptModalConteudo();
  document.getElementById("modal_prompt_backdrop").classList.add("open");
  if (window.lucide) {
    try { window.lucide.createIcons(); } catch(e){}
  }
}

function fecharModalPromptFinal() {
  document.getElementById("modal_prompt_backdrop").classList.remove("open");
}

function copiarPromptFinal() {
  const code = document.getElementById("prompt_final_code").textContent;
  navigator.clipboard.writeText(code).then(() => {
    toast("Prompt copiado para a área de transferência!");
  }).catch(() => {
    toast("Prompt selecionado!");
  });
}

function baixarPromptTxt() {
  const code = document.getElementById("prompt_final_code").textContent;
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `system-prompt-${(S.ia.nome || 'orpen').toLowerCase()}.txt`;
  a.click();
  toast("Arquivo do System Prompt baixado!");
}

function otimizarIaAuditora() {
  if (!S.ia.restricoes || S.ia.restricoes.length < 20) {
    S.ia.restricoes = "- Proibido dar parecer médico, diagnósticos ou interpretar exames\n- Não confirmar cobertura sem consulta à operadora\n- Não prometer procedimentos cirúrgicos ou descontos fora da tabela";
  }
  loadIaTemplates();
  if (!S.ia.fluxosPreAtendimento || !S.ia.fluxosPreAtendimento.length) {
    loadPreAtendSaude();
  }
  draw();
  toast("Regras e guardrails otimizados pela Auditora!");
}
