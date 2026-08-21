/* ============================================================
   ESTADO GLOBAL, TEMPLATES E HELPERS
   ============================================================ */

const S = {
  contrato: {
    razaoSocial: "Hospital Exemplo Ltda.",
    cnpj: "12.345.678/0001-90",
    cidade: "Porto Alegre / RS",
    am: "Filipe Oliveira",
    confirmado: false,
    correcao: "",
    canais: ["WhatsApp", "Voz"],
    implantacao: "Nuvem",
    licAgente: 15,
    licGestor: 3,
    numerosWhats: 1,
    integracao: true,
    ia: true
  },
  contatos: {
    projNome: "", projEmail: "", projTel: "", projCargo: "",
    finNome: "", finEmail: "", finTel: "",
    legNome: "", legEmail: "", legTel: "",
    tiNome: "", tiEmail: "", tiTel: ""
  },
  operacao: {
    jornada: "comercial",
    diasSem: "",
    sabado: "",
    domingo: "",
    feriado: "forahorario",
    setores: []
  },
  equipe: {
    agentes: [],
    gestores: [],
    nomeVisivel: true
  },
  classif: {
    tabulacoes: [],
    pausas: [],
    pesquisa: true,
    pesquisaQuando: "sempre",
    pesquisaTexto: "Por favor, avalie o atendimento digitando uma das opções abaixo:\n5 - Muito satisfeito\n4 - Satisfeito\n3 - Regular\n2 - Insatisfeito\n1 - Muito insatisfeito"
  },
  whats: {
    numero: "",
    emUso: "",
    dataAtivacao: "",
    m01: "",
    m02: "",
    avisarFim: true,
    m03: "Atendimento finalizado. Obrigado pelo contato!",
    foraHorario: "fila",
    pre: { backup: false, grupos: false, exclusao: false, contatos: false },
    preResp: { backup: "", grupos: "", exclusao: "", contatos: "" }
  },
  bot: {
    opcoes: []
  },
  voz: {
    operadora: "",
    simultaneas: "",
    entroncamento: "sip",
    unica: "sim",
    coexistencia: "",
    ura: "sim",
    uraNiveis: "2",
    destinoSemUra: "",
    agentesWeb: "",
    ramais: "",
    callback: false,
    whatsback: false
  },
  ia: {
    nome: "Luna",
    extensaoResp: "curta",
    tom: ["Cordial e acolhedor", "Direto e objetivo"],
    emojiUso: "moderado",
    emojisPermitidos: "💙, 👋, 🏥, ✅",
    publicoAlvo: "Pacientes e clientes buscando agendamento, exames e orientações gerais.",
    problema: "Alto tempo de espera no WhatsApp e dúvidas repetitivas sobre preparo e convênios.",
    kpis: "Resolução rápida no 1º contato (>40%) e redução da fila de espera.",
    habilidades: "- Horários de funcionamento e endereços das unidades\n- Relação de convênios atendidos\n- Orientações e preparos básicos de exames\n- Envio de links de agendamento online",
    restricoes: "- Proibido fornecer diagnóstico médico ou prescrever condutas\n- Não confirmar cobertura sem checagem de plano\n- Não prometer procedimentos cirúrgicos",
    foraEscopo: "Política, receitas caseiras, conselhos pessoais não médicos.",
    smartJump: [],
    preAtendimento: [],
    tentativasErro: "3",
    inatTempo: "10",
    inatAcao: "finalizar",
    inatFila: "",
    baseUrl: "https://hospitalexemplo.com.br",
    faqFreq: "semanal",
    faqResp: ""
  },
  integ: {
    sistema: "Tasy",
    temApi: "sim",
    docUrl: "",
    contatoNome: "",
    contatoEmail: "",
    contatoTel: "",
    casos: ["Consultar agendamentos do paciente", "Identificar o cliente pelo telefone"]
  },
  obs: { texto: "" }
};

const TPL = {
  saude: {
    setores: [
      { nome: "Agendamento", dac: "7001", horario: "07:00–19:00" },
      { nome: "Recepção / Triagem", dac: "7002", horario: "07:00–19:00" },
      { nome: "Resultados de exames", dac: "7003", horario: "08:00–18:00" },
      { nome: "Faturamento / Convênios", dac: "7004", horario: "08:00–17:00" }
    ],
    tabulacoes: ["Agendamento realizado", "Reagendamento", "Cancelamento", "Dúvida sobre convênio", "Resultado de exame", "Cliente não respondeu", "Fora do escopo"],
    pausas: ["Almoço", "Lanche", "Banheiro", "Reunião", "Treinamento", "Feedback"]
  },
  generico: {
    setores: [
      { nome: "Atendimento", dac: "7001", horario: "08:00–18:00" },
      { nome: "Comercial", dac: "7002", horario: "08:00–18:00" },
      { nome: "Suporte", dac: "7003", horario: "08:00–18:00" },
      { nome: "Financeiro", dac: "7004", horario: "08:00–17:00" }
    ],
    tabulacoes: ["Resolvido no primeiro contato", "Encaminhado para outro setor", "Cliente não respondeu", "Solicitação de orçamento", "Reclamação", "Fora do escopo"],
    pausas: ["Almoço", "Lanche", "Banheiro", "Reunião", "Treinamento"]
  }
};

const has = c => S.contrato.canais.includes(c);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function get(p) { return p.split(".").reduce((o, k) => o?.[k], S); }
function set(p, v) { const k = p.split("."), l = k.pop(); k.reduce((o, x) => o[x], S)[l] = v; }

const vEmail = v => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v || "");
const vTel = v => (v || "").replace(/\D/g, "").length >= 10;
const vLogin = v => /^[1-9]\d{2,}$/.test(v || "");

/* ---------- componentes de formulário ---------- */
function ro(l, v) { return `<div class="f"><label>${l}</label><input type="text" value="${esc(v)}" readonly style="background:var(--surface-2);color:var(--muted)"></div>`; }
function fi(l, p, t = "text", ph = "") {
  const v = get(p) ?? "";
  return `<div class="f"><label>${l}</label><input type="${t === 'email' ? 'text' : t}" data-path="${p}" value="${esc(v)}" placeholder="${esc(ph)}"></div>`;
}
function fin(p, ph) { return `<input type="text" data-path="${p}" value="${esc(get(p) ?? "")}" placeholder="${esc(ph)}">`; }
function fta(p, ph) { return `<textarea data-path="${p}" placeholder="${esc(ph)}">${esc(get(p) ?? "")}</textarea>`; }
function tagBox(p, ph) {
  const arr = get(p) || [];
  return `<div class="tags">${arr.map((t, i) => `<span class="tag">${esc(t)}<button onclick="delTag('${p}',${i})">×</button></span>`).join("") || '<span class="hint">nada ainda</span>'}</div>
  <input type="text" placeholder="${ph} — digite e aperte Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();addTag('${p}',this.value);this.value=''}">`;
}
function nav() {
  const v = visible(), i = v.findIndex(b => b.id === cur);
  return `<div class="navrow" style="margin-top:24px">
    ${i > 0 ? `<button class="btn btn-s" onclick="go('${v[i - 1].id}')">Voltar</button>` : ""}
    ${i < v.length - 1 ? `<button class="btn btn-p sp" onclick="go('${v[i + 1].id}')">Continuar</button>` : ""}</div>`;
}

/* ---------- ações auxiliares ---------- */
function addTag(p, v) { v = v.trim(); if (!v) return; const a = get(p); if (!a.includes(v)) a.push(v); draw(); }
function delTag(p, i) { get(p).splice(i, 1); draw(); }
function loadTpl(k, f) {
  const d = TPL[k][f];
  if (f === "setores") S.operacao.setores = JSON.parse(JSON.stringify(d));
  else S.classif[f] = [...new Set([...S.classif[f], ...d])];
  draw(); toast("Modelo aplicado — ajuste o que quiser");
}
function addSetor() { const n = 7001 + S.operacao.setores.length; S.operacao.setores.push({ nome: "", dac: String(n), horario: S.operacao.diasSem || "" }); draw(); }
function addAgente() { S.equipe.agentes.push({ login: nextLogin(), nome: "", email: "", setor: "" }); draw(); }
function addGestor() { S.equipe.gestores.push({ nome: "", email: "", setor: "" }); draw(); }
function nextLogin() { const used = S.equipe.agentes.map(a => +a.login).filter(Boolean); let n = 101; while (used.includes(n)) n++; return String(n); }
function parseBulk() {
  const raw = document.getElementById("bulk").value.trim(); if (!raw) return;
  let n = 0;
  raw.split(/\n/).forEach(line => {
    const c = line.split(/\t|;|,/).map(s => s.trim()).filter(Boolean); if (!c.length) return;
    const email = c.find(x => x.includes("@")) || "";
    const nome = c.find(x => !x.includes("@") && !/^\d+$/.test(x)) || "";
    const setorMatch = c.slice(1).find(x => S.operacao.setores.some(s => s.nome.toLowerCase() === x.toLowerCase()));
    S.equipe.agentes.push({ login: nextLogin(), nome, email, setor: setorMatch || "" }); n++;
  });
  document.getElementById("bulk").value = ""; draw(); toast(n + " agente(s) importado(s)");
}
function addOpcao() { S.bot.opcoes.push({ rotulo: "", acao: "transferir", destino: "", texto: "", filhos: [] }); draw(); }
function addFilho(i) { S.bot.opcoes[i].filhos = S.bot.opcoes[i].filhos || []; S.bot.opcoes[i].filhos.push({ rotulo: "", destino: "" }); draw(); }
function botFromSetores() { S.bot.opcoes = S.operacao.setores.map(s => ({ rotulo: s.nome, acao: "transferir", destino: s.nome, filhos: [] })); draw(); toast("Menu gerado a partir dos setores"); }
function previewBot() {
  const cab = S.whats.m01 || "Olá! Escolha uma das opções abaixo:";
  return cab + "\n" + S.bot.opcoes.map((o, i) => `${i + 1} - ${o.rotulo || "…"}`).join("\n");
}
function sugerirM01() {
  S.whats.m01 = `Olá! Você está falando com o ${S.contrato.razaoSocial}. 😊\nEscolha uma das opções abaixo para continuar:`; draw();
}
function sugerirM02() {
  S.whats.m02 = `Olá! Nosso atendimento funciona ${S.operacao.diasSem ? "de segunda a sexta, das " + S.operacao.diasSem : "em horário comercial"}.\nDeixe sua mensagem que retornamos no próximo dia útil.`; draw();
}
function togCaso(c) { const a = S.integ.casos, i = a.indexOf(c); i < 0 ? a.push(c) : a.splice(i, 1); draw(); }

function togIaTom(t) { const a = S.ia.tom, i = a.indexOf(t); i < 0 ? a.push(t) : a.splice(i, 1); draw(); }
function appendIaField(path, text) {
  const current = get(path) || "";
  const sep = current.trim() ? (current.includes("\n") ? "\n" : ", ") : "";
  set(path, current + sep + text);
  draw();
  toast("Sugestão adicionada!");
}
function addSmartJump() { S.ia.smartJump.push({ categoria: "", gatilhos: "", destino: "" }); draw(); }
function addPreAtendimento() { S.ia.preAtendimento.push({ fluxo: "", pergunta: "" }); draw(); }

function loadIaTemplates() {
  const defSetor = S.operacao.setores[0]?.nome || "";
  const finSetor = S.operacao.setores.find(s => /financ|fatur/i.test(s.nome))?.nome || defSetor;
  const supSetor = S.operacao.setores.find(s => /suporte|recep|triag/i.test(s.nome))?.nome || defSetor;
  S.ia.smartJump = [
    { categoria: "Emergência / Risco à Vida", gatilhos: "dor no peito, falta de ar, infarto, sangramento, socorro, desmaio", destino: supSetor },
    { categoria: "Financeiro / Faturas", gatilhos: "boleto, nota fiscal, 2ª via, faturamento, pagar, cobrança", destino: finSetor },
    { categoria: "Envio de Arquivos / Guias", gatilhos: "mandar a guia, foto da receita, enviar requisição, comprovante", destino: defSetor },
    { categoria: "Pedido Explícito de Humano", gatilhos: "falar com atendente, humano, pessoa, falar com gente", destino: supSetor }
  ];
  draw(); toast("Regras de Smart Jump carregadas!");
}

function loadPreAtendSaude() {
  S.ia.preAtendimento = [
    { fluxo: "Agendamento de Consulta", pergunta: "Qual a especialidade desejada?" },
    { fluxo: "Agendamento de Consulta", pergunta: "Qual o CPF do paciente?" },
    { fluxo: "Agendamento de Consulta", pergunta: "Qual o nome completo do paciente?" },
    { fluxo: "Agendamento de Consulta", pergunta: "Qual a data de nascimento?" },
    { fluxo: "Agendamento de Consulta", pergunta: "O atendimento é Particular ou por Convênio?" }
  ];
  draw(); toast("Roteiro de qualificação de saúde carregado!");
}

function aplicarPerfilClinica() {
  S.ia.nome = "Ires";
  S.ia.publicoAlvo = "Pacientes particulares e conveniados buscando agendamentos, preparos de exames e orientações hospitalares.";
  S.ia.problema = "Tempo de espera elevado na recepção e dúvidas repetitivas sobre convênios e laudos de exames.";
  S.ia.kpis = "Taxa de resolução superior a 50% no 1º contato e transbordo qualificado com especialidade identificada.";
  S.ia.habilidades = "- Consulta de unidades, horários e rotas de atendimento\n- Lista de convênios aceitos e orientações de preparo\n- Envio de link seguro para agendamento online";
  S.ia.restricoes = "- Proibido dar parecer médico, diagnósticos ou interpretar exames\n- Não prometer horários cirúrgicos sem confirmação da regulação";
  loadIaTemplates();
  loadPreAtendSaude();
  draw();
  toast("Modelo Clínicas / Saúde aplicado com sucesso!");
}

function aplicarPerfilComercial() {
  S.ia.nome = "Max";
  S.ia.publicoAlvo = "Novos clientes e empresas interessadas em contratação e orçamentos B2B.";
  S.ia.problema = "Perda de leads fora do horário comercial e demora na qualificação de propostas.";
  S.ia.kpis = "Agilidade na resposta (< 10s) e coleta obrigatória de CNPJ, volume de usuários e decisor.";
  S.ia.habilidades = "- Apresentação dos planos e módulos da plataforma\n- Envio de cases de sucesso e catálogo de serviços\n- Agendamento de demonstração com o time comercial";
  S.ia.restricoes = "- Não conceder descontos acima da tabela padrão sem autorização da diretoria\n- Não firmar contratos sem assinatura jurídica";
  const defSetor = S.operacao.setores[0]?.nome || "";
  const comSetor = S.operacao.setores.find(s => /comercial|vendas/i.test(s.nome))?.nome || defSetor;
  S.ia.smartJump = [
    { categoria: "Orçamento Grande / Enterprise", gatilhos: "proposta personalizada, mais de 50 agentes, enterprise", destino: comSetor },
    { categoria: "Falar com Consultor", gatilhos: "consultor comercial, vendedor, negociar, proposta", destino: comSetor }
  ];
  S.ia.preAtendimento = [
    { fluxo: "Qualificação Comercial", pergunta: "Qual o nome da sua empresa?" },
    { fluxo: "Qualificação Comercial", pergunta: "Quantos operadores vão utilizar a plataforma?" },
    { fluxo: "Qualificação Comercial", pergunta: "Qual o seu cargo na empresa?" }
  ];
  draw();
  toast("Modelo Comercial / Vendas aplicado com sucesso!");
}
