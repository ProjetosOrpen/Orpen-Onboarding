/* ============================================================
   IA AUDITORA (OPENAI 5.6 SOL) & GERADOR DE SYSTEM PROMPT
   ============================================================ */

let AUDITOR_CHAT_MESSAGES = [
  { sender: "bot", text: "Olá! Sou a **IA Auditora da ORPEN** (motor 5.6 Sol). Vou te guiar na criação do assistente virtual da sua empresa passo a passo.\n\nPara começarmos: **Qual será o nome do seu assistente de IA e qual o tom de voz desejado?** (Ex.: 'Ires, tom cordial e acolhedor')." }
];

let AUDITOR_STEP = 0; // 0: Nome/Tom, 1: Público/Objetivo, 2: Habilidades, 3: Restrições, 4: Smart Jump, 5: Conclusão

function getOpenAIKey() {
  try { return localStorage.getItem("orpen_openai_sk") || ""; } catch (e) { return ""; }
}

function salvarOpenAIKey(k) {
  try { localStorage.setItem("orpen_openai_sk", k.trim()); } catch (e) { }
  toast("Chave OpenAI salva para a Auditora!");
}

function renderChatMessages() {
  return AUDITOR_CHAT_MESSAGES.map(m => `
    <div class="chat-bubble ${m.sender}">
      <div class="chat-avatar">${m.sender === 'bot' ? '🤖' : '👤'}</div>
      <div class="chat-text">${m.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</div>
    </div>
  `).join("");
}

function renderChatQuickChips() {
  if (AUDITOR_STEP === 0) {
    return `
      <button class="c-chip" onclick="responderRapido('Ires, tom cordial, acolhedor e direto.')">💡 Ires (Cordial e Direto)</button>
      <button class="c-chip" onclick="responderRapido('Sofia, tom formal e institucional.')">💡 Sofia (Formal / Corporativo)</button>
      <button class="c-chip" onclick="responderRapido('Max, tom consultivo e focado em vendas.')">💡 Max (Comercial / Vendas)</button>
    `;
  }
  if (AUDITOR_STEP === 1) {
    return `
      <button class="c-chip" onclick="responderRapido('Atender pacientes e convênios para agendamento e reduzir filas.')">💡 Pacientes e Agendamento</button>
      <button class="c-chip" onclick="responderRapido('Qualificar leads comerciais B2B que chegam pelo WhatsApp.')">💡 Qualificar Leads Comerciais</button>
    `;
  }
  if (AUDITOR_STEP === 2) {
    return `
      <button class="c-chip" onclick="responderRapido('Ela deve tirar dúvidas de endereço, convênios aceitos e enviar links de agendamento.')">💡 FAQs, Convênios e Agendamento</button>
      <button class="c-chip" onclick="responderRapido('Ela resolve qualquer dúvida de clientes sem restrições.')">⚠️ Ela resolve tudo (Testar Indagação)</button>
    `;
  }
  if (AUDITOR_STEP === 3) {
    return `
      <button class="c-chip" onclick="responderRapido('Nunca fornecer diagnóstico médico, nem confirmar cobertura sem autorização prévia.')">💡 Proibir Diagnósticos e Laudos</button>
      <button class="c-chip" onclick="responderRapido('Não dar descontos sem autorização e não assinar contratos.')">💡 Proibir Descontos sem Aprovação</button>
    `;
  }
  if (AUDITOR_STEP === 4) {
    return `
      <button class="c-chip" onclick="responderRapido('Casos de dor forte e emergência transferem imediatamente para Recepção / Triagem.')">💡 Emergência → Recepção</button>
      <button class="c-chip" onclick="responderRapido('Dúvidas de boletos e notas fiscais transferem para o Financeiro.')">💡 Boletos → Financeiro</button>
    `;
  }
  return `<button class="c-chip" onclick="reiniciarChatAuditora()">↺ Reiniciar Conversa</button>`;
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
      botReply = `⚠️ **Alerta de Ambiguidade:** Permitir 'tudo' gera alto risco de alucinação e respostas fora de escopo.\n\nPara mantermos a precisão, **quais são os tópicos principais que ela está estritamente PROIBIDA de fazer?** (Ex.: diagnóstico médico, prometer encaixes, passar laudos sem autorização).`;
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
    botReply = `🎉 **Compreensão Concluída com Sucesso!**\n\nTodos os parâmetros da **${S.ia.nome}** foram auditados e inseridos no setup. Seu assistente foi classificado no **${avaliarTierIa().tier}** com score de complexidade **${avaliarTierIa().score}/100**.\n\nVocê pode conferir o resumo no painel lateral direito ou clicar em 'Visualizar Prompt Final da IA'!`;
  }
  else {
    botReply = `A IA ${S.ia.nome} já está configurada! Se quiser alterar alguma regra específica, basta me mandar por aqui ou clicar em '↺ Reiniciar Conversa'.`;
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
  const temSmartJump = S.ia.smartJump.length >= 2;
  const temPreColeta = S.ia.preAtendimento.length >= 2;
  const temRestricoes = (S.ia.restricoes || "").length > 20;
  const temBaseExtensa = (S.ia.habilidades || "").length > 100;

  let score = 20;
  if (S.ia.nome) score += 5;
  if (S.ia.tom.length > 1) score += 5;
  if (temRestricoes) score += 10;
  if (temSmartJump) score += 15;
  if (temPreColeta) score += 15;
  if (temBaseExtensa) score += 10;
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

  if (S.ia.smartJump.length < 2) {
    ambiguidades.push({ tipo: "warn", txt: "Transbordo sensível: Poucos gatilhos de Smart Jump cadastrados." });
  } else {
    ambiguidades.push({ tipo: "ok", txt: `${S.ia.smartJump.length} regras de transbordo inteligente ativas.` });
  }

  if (S.ia.preAtendimento.length === 0) {
    ambiguidades.push({ tipo: "warn", txt: "Sem pré-qualificação: O atendente humano receberá o lead sem triagem prévia." });
  } else {
    ambiguidades.push({ tipo: "ok", txt: `${S.ia.preAtendimento.length} etapa(s) de qualificação sequencial configurada(s).` });
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
  if (temBaseExtensa || S.ia.baseUrl || temSmartJump) {
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
  const emoji = S.ia.emojiUso === 'nenhum' ? "Não utilize emojis." : `Utilize emojis com moderação (${S.ia.emojisPermitidos || '💙, 👋, 🏥, ✅'}).`;
  const extensao = S.ia.extensaoResp === 'curta' ? "Respostas curtas e objetivas (máximo 2 a 3 frases)." : "Respostas estruturadas e concisas.";

  let prompt = `### PERSONA E PAPEL DO ASSISTENTE
Você é ${nome}, o assistente virtual oficial de atendimento da empresa ${empresa}.
Seu objetivo principal é atender clientes no WhatsApp de forma ágil, resolutiva e profissional.

### DIRETRIZES DE COMUNICAÇÃO
- Tom de voz: ${tom}.
- Formato: ${extensao}
- Emojis: ${emoji}
- Linguagem: Português do Brasil, claro, sem termos técnicos desnecessários.

### CONTEXTO E OBJETIVOS DO NEGÓCIO
${S.ia.publicoAlvo ? `- Público-alvo: ${S.ia.publicoAlvo}` : '- Público-alvo: Clientes e pacientes em atendimento'}
${S.ia.problema ? `- Foco de resolução: ${S.ia.problema}` : ''}
${S.ia.kpis ? `- Métricas prioritárias: ${S.ia.kpis}` : ''}

### ESCOPO E HABILIDADES (AUTONOMIA TOTAL)
Você está autorizado a resolver diretamente os seguintes tópicos:
${S.ia.habilidades ? S.ia.habilidades : '- Fornecer informações gerais e tirar dúvidas frequentes da empresa'}

### RESTRIÇÕES CRÍTICAS (ANTI-ALUCINAÇÃO)
${S.ia.restricoes ? S.ia.restricoes : '- Não forneça informações fora do escopo institucional da empresa\n- Não prometa prazos ou valores sem confirmação oficial'}
${S.ia.foraEscopo ? `- Assuntos fora de escopo (recuse educadamente): ${S.ia.foraEscopo}` : ''}
`;

  if (S.ia.smartJump && S.ia.smartJump.length > 0) {
    prompt += `\n### REGRAS DE ROTEAMENTO E TRANSBORDO (SMART JUMP)\nSe o cliente mencionar os seguintes gatilhos, encerre a triagem e transfira IMEDIATAMENTE para a fila humana correspondente:\n`;
    S.ia.smartJump.forEach((r, idx) => {
      prompt += `${idx + 1}. [${r.categoria || 'Geral'}]: Gatilhos ("${r.gatilhos || ''}") -> Transferir para ${r.destino || 'Fila de Atendimento'}\n`;
    });
  }

  if (S.ia.preAtendimento && S.ia.preAtendimento.length > 0) {
    prompt += `\n### ROTEIRO DE QUALIFICAÇÃO PRÉ-TRANSBORDO\nAntes de concluir o agendamento ou transbordo, colete os seguintes dados de forma SEQUENCIAL (uma pergunta por vez):\n`;
    S.ia.preAtendimento.forEach((p, idx) => {
      prompt += `Passo ${idx + 1} [${p.fluxo || 'Qualificação'}]: "${p.pergunta || ''}"\n`;
    });
  }

  if (S.ia.baseUrl) {
    prompt += `\n### BASE DE CONHECIMENTO E CONSULTA\nFonte oficial de informações: ${S.ia.baseUrl}\n`;
  }

  prompt += `\n### POLÍTICA DE SEGURANÇA E FALLBACK\n- Caso não compreenda a solicitação do usuário após ${S.ia.tentativasErro || '3'} tentativas, solicite desculpas e transfira para um atendente humano.\n- NUNCA invente links, telefones ou procedimentos não cadastrados acima.`;

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
