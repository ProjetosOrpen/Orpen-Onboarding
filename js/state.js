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
    _etapa: 1, // Sub-etapa ativa (1 a 7)

    // 1. Alinhamento de Expectativas
    processoOtimizar: "Atendimento inicial, triagem ágil de agendamentos e esclarecimento de dúvidas frequentes sobre convênios e preparo de exames.",
    kpis: "Resolução rápida no 1º contato (>40%), redução do tempo médio de espera e dados 100% qualificados antes do transbordo.",

    // 2. Persona
    nome: "Luna",
    extensaoResp: "curta",
    tom: ["Cordial e acolhedor", "Direto e objetivo"],
    idiomas: ["Português (Brasil)"],
    emojiUso: "moderado",
    emojisPermitidos: "💙, 👋, 🏥, ✅",

    // 3. Contexto do Negócio e Objetivos
    habilidades: "- Horários de funcionamento e endereços das unidades\n- Relação de convênios atendidos\n- Orientações e preparos básicos de exames\n- Envio de links de agendamento online",
    topicosTransbordo: [
      "Consultas e Agendamentos",
      "Exames e Laudos",
      "Remarcações e Cancelamentos",
      "Financeiro e Faturamento"
    ],
    restricoes: "- Proibido fornecer diagnóstico médico ou prescrever condutas\n- Não confirmar cobertura sem checagem de plano\n- Não prometer procedimentos cirúrgicos ou horários sem confirmação",
    publicoAlvo: "Pacientes e clientes buscando agendamento, exames e orientações gerais.",
    problema: "Alto tempo de espera no WhatsApp e dúvidas repetitivas sobre preparo e convênios.",
    foraEscopo: "Política, receitas caseiras, conselhos pessoais não médicos.",

    // 4. Fluxos de Atendimento (por Assunto / Tópico)
    fluxosPreAtendimento: [
      {
        nome: "Consultas e Agendamentos",
        passos: [
          "Qual a especialidade desejada ou médico de preferência?",
          "Qual o nome completo e CPF do paciente?",
          "Qual o convênio ou prefere atendimento particular?",
          "Qual a preferência de data e período (manhã/tarde)?"
        ]
      },
      {
        nome: "Exames e Laudos",
        passos: [
          "Qual exame você precisa realizar?",
          "Você já possui o pedido médico em mãos?",
          "Qual o convênio para realização do exame?",
          "Qual a unidade de preferência?"
        ]
      },
      {
        nome: "Remarcações e Cancelamentos",
        passos: [
          "Qual o nome completo e CPF cadastrado?",
          "Qual consulta ou exame você deseja remarcar ou cancelar?",
          "Qual a nova data ou horário de sua preferência?"
        ]
      }
    ],
    filaFallback: "",
    tentativasErro: "3",

    // 6. Inatividade e Encerramento
    inatTempo: "10",
    inatAcao: "finalizar",
    inatFila: "",
    msgFinalizacao: "Atendimento finalizado por inatividade. Caso precise de mais alguma informação, basta nos enviar uma nova mensagem! Tenha um ótimo dia. 😊",

    // 7. Base de Conhecimento e Governança
    baseUrl: "https://hospitalexemplo.com.br",
    linksAdicionais: [
      "https://hospitalexemplo.com.br/convenios",
      "https://hospitalexemplo.com.br/preparo-de-exames"
    ],
    faqTexto: "Horário de Coleta de Exames: Segunda a Sexta, das 06:30 às 11:00. Sábados das 07:00 às 10:30.\nEstacionamento gratuito no local por até 1h para pacientes em atendimento.",
    arquivos: [
      { nome: "Guia_de_Preparo_Exames_2026.pdf", tamanho: "1.4 MB" }
    ],
    faqFreq: "semanal",
    faqRespNome: "Mariana Souza",
    faqRespEmail: "mariana.souza@hospitalexemplo.com.br",
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
function setIaSubStep(n) {
  S.ia._etapa = Math.max(1, Math.min(6, n));
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function isIaStepDone(n) {
  const a = S.ia;
  if (n === 1) return !!(a.processoOtimizar && a.processoOtimizar.trim() && a.kpis && a.kpis.trim());
  if (n === 2) return !!(a.nome && a.nome.trim() && a.tom && a.tom.length && a.extensaoResp);
  if (n === 3) return !!(a.habilidades && a.habilidades.trim() && (a.topicosTransbordo && a.topicosTransbordo.length) && a.restricoes && a.restricoes.trim());
  if (n === 4) return !!(a.fluxosPreAtendimento && a.fluxosPreAtendimento.length && a.filaFallback);
  if (n === 5) return !!(a.inatTempo && a.inatAcao);
  if (n === 6) return !!(a.baseUrl || (a.arquivos && a.arquivos.length) || (a.faqTexto && a.faqTexto.trim()) || a.faqRespNome);
  return false;
}

// Gerenciamento de Tópicos de Transbordo (que geram os fluxos de atendimento)
function addIaTopicoTransbordo(nome) {
  if (!nome || !nome.trim()) return;
  const limpo = nome.trim();
  if (!S.ia.topicosTransbordo) S.ia.topicosTransbordo = [];
  if (!S.ia.topicosTransbordo.includes(limpo)) {
    S.ia.topicosTransbordo.push(limpo);
  }
  // Sincroniza criando automaticamente o fluxo na Etapa 4 se ainda não existir
  if (!S.ia.fluxosPreAtendimento) S.ia.fluxosPreAtendimento = [];
  const jaExiste = S.ia.fluxosPreAtendimento.some(f => f.nome.toLowerCase() === limpo.toLowerCase());
  if (!jaExiste) {
    S.ia.fluxosPreAtendimento.push({
      nome: limpo,
      passos: [
        "Qual o seu nome completo e CPF do paciente?",
        "Qual o convênio ou particular?",
        "Qual a especialidade ou procedimento desejado?"
      ]
    });
  }
  draw();
  toast(`Assunto "${limpo}" adicionado e sincronizado aos fluxos!`);
}

function setIaTopicoTransbordo(idx, val) {
  if (!S.ia.topicosTransbordo) S.ia.topicosTransbordo = [];
  const antigo = S.ia.topicosTransbordo[idx];
  S.ia.topicosTransbordo[idx] = val;
  if (S.ia.fluxosPreAtendimento) {
    const fl = S.ia.fluxosPreAtendimento.find(f => f.nome === antigo);
    if (fl) fl.nome = val;
  }
  soft();
}

function delIaTopicoTransbordo(idx) {
  if (S.ia.topicosTransbordo && S.ia.topicosTransbordo[idx] !== undefined) {
    const nome = S.ia.topicosTransbordo[idx];
    S.ia.topicosTransbordo.splice(idx, 1);
    S.ia.fluxosPreAtendimento = (S.ia.fluxosPreAtendimento || []).filter(f => f.nome !== nome);
    draw();
    toast("Assunto e fluxo correspondente removidos.");
  }
}

function togIaTom(t) { const a = S.ia.tom, i = a.indexOf(t); i < 0 ? a.push(t) : a.splice(i, 1); draw(); }
function togIaIdioma(l) { const a = S.ia.idiomas || (S.ia.idiomas = []); const i = a.indexOf(l); i < 0 ? a.push(l) : a.splice(i, 1); draw(); }
function addIaIdiomaCustom(v) { v = v.trim(); if (!v) return; const a = S.ia.idiomas || (S.ia.idiomas = []); if (!a.includes(v)) a.push(v); draw(); }

function appendIaField(path, text) {
  const current = get(path) || "";
  const sep = current.trim() ? (current.includes("\n") ? "\n" : ", ") : "";
  set(path, current + sep + text);
  draw();
  toast("Sugestão adicionada!");
}

// Gerenciamento de Fluxos de Pré-Atendimento
function addIaFluxo() {
  if (!S.ia.fluxosPreAtendimento) S.ia.fluxosPreAtendimento = [];
  S.ia.fluxosPreAtendimento.push({ nome: `Novo Fluxo ${S.ia.fluxosPreAtendimento.length + 1}`, passos: [""] });
  draw();
  toast("Novo fluxo adicionado!");
}
function delIaFluxo(i) {
  S.ia.fluxosPreAtendimento.splice(i, 1);
  draw();
  toast("Fluxo removido!");
}
function setIaFluxoNome(i, val) {
  if (S.ia.fluxosPreAtendimento[i]) {
    S.ia.fluxosPreAtendimento[i].nome = val;
    soft();
  }
}
function addIaPasso(fi) {
  if (S.ia.fluxosPreAtendimento[fi]) {
    S.ia.fluxosPreAtendimento[fi].passos.push("");
    draw();
  }
}
function delIaPasso(fi, pi) {
  if (S.ia.fluxosPreAtendimento[fi]) {
    S.ia.fluxosPreAtendimento[fi].passos.splice(pi, 1);
    draw();
  }
}
function setIaPasso(fi, pi, val) {
  if (S.ia.fluxosPreAtendimento[fi] && S.ia.fluxosPreAtendimento[fi].passos[pi] !== undefined) {
    S.ia.fluxosPreAtendimento[fi].passos[pi] = val;
    soft();
  }
}

// Links Adicionais e Arquivos da Base de Conhecimento
function addIaLink() {
  if (!S.ia.linksAdicionais) S.ia.linksAdicionais = [];
  S.ia.linksAdicionais.push("");
  draw();
}
function delIaLink(i) {
  S.ia.linksAdicionais.splice(i, 1);
  draw();
}
function setIaLink(i, val) {
  if (S.ia.linksAdicionais) {
    S.ia.linksAdicionais[i] = val;
    soft();
  }
}
function addIaArquivo(nome, tamanho) {
  if (!S.ia.arquivos) S.ia.arquivos = [];
  S.ia.arquivos.push({ nome: nome || "Documento.pdf", tamanho: tamanho || "500 KB" });
  draw();
  toast("Arquivo adicionado à Base de Conhecimento!");
}
function delIaArquivo(i) {
  if (S.ia.arquivos) {
    S.ia.arquivos.splice(i, 1);
    draw();
    toast("Arquivo removido.");
  }
}

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
  S.ia.fluxosPreAtendimento = [
    {
      nome: "Consultas e Agendamentos",
      passos: [
        "Qual a especialidade desejada ou médico de preferência?",
        "Qual o nome completo e CPF do paciente?",
        "Qual o convênio ou prefere atendimento particular?",
        "Qual a preferência de data e período (manhã/tarde)?"
      ]
    },
    {
      nome: "Exames e Laudos",
      passos: [
        "Qual exame você precisa realizar?",
        "Você já possui o pedido médico em mãos?",
        "Qual o convênio para realização do exame?",
        "Qual a unidade de preferência?"
      ]
    },
    {
      nome: "Remarcações e Cancelamentos",
      passos: [
        "Qual o nome completo e CPF cadastrado?",
        "Qual consulta ou exame você deseja remarcar ou cancelar?",
        "Qual a nova data ou horário de sua preferência?"
      ]
    }
  ];
  draw(); toast("Fluxos de triagem de saúde carregados!");
}

function loadPreAtendComercial() {
  S.ia.fluxosPreAtendimento = [
    {
      nome: "Novo Contrato / Proposta B2B",
      passos: [
        "Qual a razão social ou nome da sua empresa?",
        "Qual o CNPJ da empresa?",
        "Quantos operadores / atendentes utilizarão a plataforma?",
        "Qual o seu cargo ou papel na decisão?"
      ]
    },
    {
      nome: "Demonstração e Dúvidas de Planos",
      passos: [
        "Quais canais sua empresa precisa integrar (WhatsApp, Telefonia, E-mail)?",
        "Você já utiliza algum sistema de atendimento ou CRM hoje?",
        "Qual o melhor e-mail e telefone para envio da proposta?"
      ]
    }
  ];
  draw(); toast("Fluxos de qualificação comercial carregados!");
}

function aplicarPerfilClinica() {
  S.ia.nome = "Ires";
  S.ia.processoOtimizar = "Agendamento rápido de consultas, esclarecimento de dúvidas sobre convênios/preparos e redução do tempo de espera no WhatsApp.";
  S.ia.kpis = "Taxa de resolução superior a 50% no 1º contato, CSAT acima de 4.6 e transbordo qualificado com especialidade e exames identificados.";
  S.ia.idiomas = ["Português (Brasil)"];
  S.ia.publicoAlvo = "Pacientes particulares e conveniados buscando agendamentos, preparos de exames e orientações hospitalares.";
  S.ia.problema = "Tempo de espera elevado na recepção e dúvidas repetitivas sobre convênios e laudos de exames.";
  S.ia.habilidades = "- Consulta de unidades, horários e rotas de atendimento\n- Lista de convênios aceitos e orientações de preparo de exames\n- Envio de link seguro para agendamento online e confirmações";
  S.ia.assuntosTransbordo = "- Casos de dor aguda, sangramento ou emergência médica\n- Autorizações de guias negadas pelo convênio\n- Solicitações de cancelamento com reembolso financeiro\n- Dúvidas de resultados de biópsias ou laudos críticos";
  S.ia.restricoes = "- Proibido dar parecer médico, diagnósticos ou interpretar resultados de exames\n- Não confirmar cobertura sem consultar a tabela vigente da operadora\n- Não prometer encaixes ou horários cirúrgicos sem confirmação da regulação";
  loadIaTemplates();
  loadPreAtendSaude();
  draw();
  toast("Modelo Clínicas / Saúde aplicado com sucesso!");
}

function aplicarPerfilComercial() {
  S.ia.nome = "Max";
  S.ia.processoOtimizar = "Qualificação automática de leads que chegam pelo WhatsApp e agendamento de demonstrações com executivos de vendas.";
  S.ia.kpis = "Tempo de primeira resposta inferior a 10s, taxa de conversão para reunião > 35% e qualificação de CNPJ/volume em 100% dos leads.";
  S.ia.idiomas = ["Português (Brasil)", "Inglês"];
  S.ia.publicoAlvo = "Novos clientes e empresas interessadas em contratação e orçamentos B2B.";
  S.ia.problema = "Perda de leads fora do horário comercial e demora na qualificação de propostas.";
  S.ia.habilidades = "- Apresentação dos planos e módulos da plataforma\n- Envio de cases de sucesso e catálogo de serviços\n- Agendamento de demonstração com o time comercial";
  S.ia.assuntosTransbordo = "- Propostas customizadas acima de 50 licenças (Enterprise)\n- Negociações contratuais com solicitação de minuta jurídica\n- Pedido explícito para falar com um executivo de contas";
  S.ia.restricoes = "- Não conceder descontos acima da tabela padrão sem autorização da diretoria\n- Não firmar contratos sem assinatura jurídica\n- Não divulgar informações financeiras de outros clientes";
  const defSetor = S.operacao.setores[0]?.nome || "";
  const comSetor = S.operacao.setores.find(s => /comercial|vendas/i.test(s.nome))?.nome || defSetor;
  S.ia.smartJump = [
    { categoria: "Orçamento Grande / Enterprise", gatilhos: "proposta personalizada, mais de 50 agentes, enterprise", destino: comSetor },
    { categoria: "Falar com Consultor", gatilhos: "consultor comercial, vendedor, negociar, proposta", destino: comSetor }
  ];
  loadPreAtendComercial();
  draw();
  toast("Modelo Comercial / Vendas aplicado com sucesso!");
}
