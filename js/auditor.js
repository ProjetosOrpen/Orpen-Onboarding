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
    <button type="button" class="chat-quick-chip" onclick="abrirModalPromptFinal()">Ver System Prompt</button>
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
          <button type="button" class="auditor-chip" onclick="abrirModalPromptFinal()">Ver System Prompt Compilado</button>
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
        <button class="btn btn-p" onclick="abrirModalPromptFinal()">Ver System Prompt Compilado</button>
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
   DIAGNÓSTICO E COMPLEXIDADE DO PROMPT
   ============================================================ */
function avaliarTierIa() {
  const temInteg = S.contrato.integracao && S.integ.sistema;
  const temApi = S.integ.temApi === 'sim';
  const temCasosComplexos = S.integ.casos.some(c => /marcar|remarcar|laudo|exame/i.test(c));
  const temSmartJump = S.ia.smartJump && S.ia.smartJump.length >= 2;
  const totalPassosFluxos = (S.ia.fluxosPreAtendimento || []).reduce((acc, f) => acc + (f.passos || []).filter(Boolean).length, 0);
  const temPreColeta = totalPassosFluxos >= 2;
  const temRestricoes = (S.ia.restricoes || "").length > 20;
  const temBaseExtensa = (S.ia.habilidades || "").length > 100 || (S.ia.faqTexto || "").length > 100;
  const temArquivosOuLinks = (S.ia.arquivos && S.ia.arquivos.length > 0) || (S.ia.linksAdicionais && S.ia.linksAdicionais.length > 0);

  let score = 20;
  if (S.ia.nome) score += 5;
  if (S.ia.tom && S.ia.tom.length > 1) score += 5;
  if (S.ia.idiomas && S.ia.idiomas.length > 1) score += 5;
  if (temRestricoes) score += 10;
  if (temSmartJump) score += 15;
  if (temPreColeta) score += 15;
  if (temBaseExtensa || temArquivosOuLinks) score += 10;
  if (temInteg) score += 15;
  if (score > 100) score = 100;

  let complexidadeNivel = "Baixa";
  if (score > 35) complexidadeNivel = "Moderada";
  if (score > 65) complexidadeNivel = "Avançada";
  if (score > 85) complexidadeNivel = "Alta Densidade";

  const ambiguidades = [];
  if (!temRestricoes) {
    ambiguidades.push({ tipo: "warn", txt: "Restrições vagas: Adicione limites claros anti-alucinação." });
  } else {
    ambiguidades.push({ tipo: "ok", txt: "Limites e regras anti-alucinação bem definidos." });
  }

  if (!temSmartJump) {
    ambiguidades.push({ tipo: "warn", txt: "Transbordo sensível: Poucos gatilhos de Smart Jump cadastrados." });
  } else {
    ambiguidades.push({ tipo: "ok", txt: `${S.ia.smartJump.length} regras de transbordo inteligente ativas.` });
  }

  if (!temPreColeta) {
    ambiguidades.push({ tipo: "warn", txt: "Sem pré-qualificação: Nenhum passo configurado nos fluxos de triagem." });
  } else {
    ambiguidades.push({ tipo: "ok", txt: `${(S.ia.fluxosPreAtendimento || []).length} fluxo(s) de pré-atendimento com ${totalPassosFluxos} passo(s) ao todo.` });
  }

  if (temInteg && temCasosComplexos && temBaseExtensa && temPreColeta && temSmartJump) {
    return {
      tier: "Plano Diamante+",
      badgeClass: "tier-consultor",
      score,
      complexidadeNivel,
      ambiguidades,
      desc: "Arquitetura com integração a ERP/APIs em tempo real, transbordo multi-departamental e validação contínua."
    };
  }
  if (temInteg || temApi || temCasosComplexos) {
    return {
      tier: "Plano Diamante",
      badgeClass: "tier-diamante",
      score,
      complexidadeNivel,
      ambiguidades,
      desc: "Capacidade transacional com chamadas de ferramentas/APIs, consulta a bancos de dados e roteamento prioritário."
    };
  }
  if (temBaseExtensa || S.ia.baseUrl || temSmartJump || temArquivosOuLinks) {
    return {
      tier: "Plano Gold",
      badgeClass: "tier-gold",
      score,
      complexidadeNivel,
      ambiguidades,
      desc: "Estrutura com base de conhecimento (RAG), regras anti-alucinação e triagem inteligente para múltiplos setores."
    };
  }
  return {
    tier: "Plano Prata",
    badgeClass: "tier-prata",
    score,
    complexidadeNivel,
    ambiguidades,
    desc: "Atendimento direto alimentado com regras ágeis de triagem e respostas em system prompt."
  };
}

/* ============================================================
   GERADOR DO SYSTEM PROMPT FINAL
   ============================================================ */
function gerarPromptFinalCompilado() {
  const nome = S.ia.nome || "Assistente Virtual";
  const empresa = S.contrato.razaoSocial || "Empresa";
  const tom = (S.ia.tom && S.ia.tom.length) ? S.ia.tom.join(", ") : "Cordial, acolhedor e direto";
  const idiomas = (S.ia.idiomas && S.ia.idiomas.length) ? S.ia.idiomas.join(", ") : "Português (Brasil)";
  const emoji = S.ia.emojiUso === 'nenhum' ? "Não utilize emojis." : `Utilize linguagem clara e profissional (${S.ia.emojisPermitidos || 'pontuais e profissionais'}).`;
  const extensao = S.ia.extensaoResp === 'curta' ? "Respostas curtas e objetivas (máximo 2 a 3 frases por mensagem)." : (S.ia.extensaoResp === 'media' ? "Respostas médias (4 a 6 linhas estruturadas)." : "Respostas flexíveis e bem contextualizadas.");

  let prompt = `### 1. PERSONA E PAPEL DO ASSISTENTE
Você é ${nome}, o assistente virtual oficial de atendimento da empresa ${empresa}.
Seu papel é recepcionar clientes no WhatsApp com excelência, tirar dúvidas frequentes e qualificar a conversa antes de qualquer encaminhamento humano.

### 2. DIRETRIZES DE COMUNICAÇÃO
- Tom de voz: ${tom}.
- Extensão das respostas: ${extensao}
- Idiomas atendidos: ${idiomas}.
- Diretrizes de Emojis: ${emoji}
- Clareza: Use linguagem acolhedora, objetiva e sem jargões técnicos desnecessários.

### 3. ALINHAMENTO DE EXPECTATIVAS E OBJETIVOS
${S.ia.processoOtimizar ? `- Processo a otimizar: ${S.ia.processoOtimizar}` : '- Processo: Triagem ágil e redução de espera'}
${S.ia.kpis ? `- Métricas e KPIs de sucesso: ${S.ia.kpis}` : ''}
${S.ia.publicoAlvo ? `- Perfil do público-alvo: ${S.ia.publicoAlvo}` : ''}

### 4. ESCOPO E AUTONOMIA TOTAL
Você tem AUTONOMIA TOTAL para resolver diretamente os seguintes assuntos:
${S.ia.habilidades ? S.ia.habilidades : '- Fornecer informações institucionais, horários e orientações gerais'}

### 5. GATILHOS DE TRANSBORDO HUMANO
Transfira o atendimento para um atendente humano quando houver:
${S.ia.assuntosTransbordo ? S.ia.assuntosTransbordo : '- Solicitação explícita de atendente ou casos complexos fora de escopo'}

### 6. RESTRIÇÕES CRÍTICAS (ANTI-ALUCINAÇÃO & GUARDRAILS)
${S.ia.restricoes ? S.ia.restricoes : '- NUNCA forneça informações não confirmadas oficialmente pela empresa\n- NUNCA invente procedimentos, prazos ou valores'}
${S.ia.foraEscopo ? `- Assuntos fora de escopo (recusar cordialmente): ${S.ia.foraEscopo}` : ''}
`;

  if (S.ia.smartJump && S.ia.smartJump.length > 0) {
    prompt += `\n### 7. REGRAS DE ROTEAMENTO IMEDIATO (SMART JUMP)\nSe o cliente mencionar algum dos gatilhos abaixo, interrompa a triagem e transfira IMEDIATAMENTE para a fila indicada:\n`;
    S.ia.smartJump.forEach((r, idx) => {
      prompt += `${idx + 1}. [${r.categoria || 'Intenção'}]: Gatilhos ("${r.gatilhos || ''}") -> Transferir para Fila: ${r.destino || 'Atendimento Geral'}\n`;
    });
  }

  if (S.ia.fluxosPreAtendimento && S.ia.fluxosPreAtendimento.length > 0) {
    prompt += `\n### 8. PRÉ-ATENDIMENTO E COLETA SEQUENCIAL POR FLUXO\nIdentifique o fluxo correspondente à solicitação do cliente e realize a coleta de dados de forma SEQUENCIAL (uma pergunta por vez):\n`;
    S.ia.fluxosPreAtendimento.forEach((f, idx) => {
      prompt += `\n▶ FLUXO ${idx + 1}: ${f.nome || 'Geral'}\n`;
      (f.passos || []).forEach((passo, pIdx) => {
        if (passo.trim()) {
          prompt += `   Passo ${pIdx + 1}: "${passo.trim()}"\n`;
        }
      });
    });
    if (S.ia.filaFallback) {
      prompt += `\n* Se a IA não identificar o fluxo do cliente ou houver falha de compreensão, encaminhar para a Fila de Contingência: ${S.ia.filaFallback}.\n`;
    }
  }

  if (S.ia.baseUrl || (S.ia.linksAdicionais && S.ia.linksAdicionais.length) || S.ia.faqTexto || (S.ia.arquivos && S.ia.arquivos.length)) {
    prompt += `\n### 9. BASE DE CONHECIMENTO E GOVERNANÇA\n`;
    if (S.ia.baseUrl) prompt += `- Site oficial: ${S.ia.baseUrl}\n`;
    if (S.ia.linksAdicionais && S.ia.linksAdicionais.length) {
      const validLinks = S.ia.linksAdicionais.filter(Boolean);
      if (validLinks.length) prompt += `- Links adicionais de consulta: ${validLinks.join(" | ")}\n`;
    }
    if (S.ia.faqTexto) {
      prompt += `- Informações e Procedimentos Oficiais:\n${S.ia.faqTexto}\n`;
    }
    if (S.ia.arquivos && S.ia.arquivos.length) {
      prompt += `- Documentos e Manuais de Referência: ${S.ia.arquivos.map(a => a.nome).join(", ")}\n`;
    }
    if (S.ia.faqFreq) {
      prompt += `- Governança de atualização: Frequência ${S.ia.faqFreq}.\n`;
    }
    if (S.ia.faqRespNome || S.ia.faqRespEmail) {
      prompt += `- Responsável interno: ${S.ia.faqRespNome || ''} (${S.ia.faqRespEmail || ''})\n`;
    }
  }

  prompt += `\n### 10. POLÍTICA DE INATIVIDADE, ERROS E ENCERRAMENTO
- Tentativas sem entender: Após ${S.ia.tentativasErro || '3'} mensagens sem compreensão, peça desculpas e transfira para o atendente humano na fila de contingência.
- Inatividade: Após ${S.ia.inatTempo || '10'} minutos sem retorno do cliente, ${S.ia.inatAcao === 'transferir' ? `transfira para a fila ${S.ia.inatFila || 'de espera'}` : 'encerre o atendimento'}.
${S.ia.msgFinalizacao ? `- Mensagem de encerramento: "${S.ia.msgFinalizacao}"` : ''}
- NUNCA invente números de protocolo, telefones ou informações fora da base de conhecimento oficial.`;

  return prompt;
}

function abrirModalPromptFinal() {
  const promptCode = gerarPromptFinalCompilado();
  document.getElementById("prompt_final_code").textContent = promptCode;
  const diag = avaliarTierIa();
  document.getElementById("prompt_tier_tag").textContent = diag.tier.toUpperCase();
  document.getElementById("prompt_tier_tag").className = `tier-badge ${diag.badgeClass}`;
  const tokensEst = Math.round(promptCode.length / 4);
  document.getElementById("prompt_token_count").textContent = `~${tokensEst} tokens`;
  document.getElementById("modal_prompt_backdrop").classList.add("open");
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
