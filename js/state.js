/* ============================================================
   ESTADO GLOBAL, TEMPLATES E HELPERS
   ============================================================ */

const S = {
  contrato: {
    razaoSocial: "",
    cnpj: "",
    cidade: "",
    am: "",
    confirmado: false,
    correcao: "",
    canais: ["WhatsApp"],
    implantacao: "Nuvem",
    licAgente: 1,
    licGestor: 1,
    numerosWhats: 1,
    integracao: false,
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
    pesquisaPergunta: "Como você avalia o nosso atendimento hoje?",
    pesquisaOpcoes: [
      { rotulo: "1 - ⭐⭐⭐⭐⭐ Excelente", valor: "5" },
      { rotulo: "2 - ⭐⭐⭐ Regular", valor: "3" },
      { rotulo: "3 - ⭐ Insatisfeito", valor: "1" }
    ],
    pesquisaTexto: "Como você avalia o nosso atendimento hoje?\n\n1 - ⭐⭐⭐⭐⭐ Excelente\n2 - ⭐⭐⭐ Regular\n3 - ⭐ Insatisfeito"
  },
  whats: {
    numero: "",
    emUso: "sim",
    dataAtivacao: "",
    m01: "",
    m02: "",
    avisarFim: true,
    m03: "Atendimento finalizado. Obrigado pelo contato!",
    foraHorario: "fila",
    pre: { backup: false, exclusao: false },
    preResp: { backup: "", exclusao: "" }
  },
  canaisConfig: {
    webchat: {
      url: "",
      corPrimaria: "#0A2540",
      logoUrl: "",
      posicao: "bottom-right",
      preChat: true,
      mensagemBoasVindas: "Olá! Como podemos te ajudar hoje?"
    },
    teams: {
      tenantId: "",
      appId: "",
      clientSecret: "",
      canalPadrao: "",
      suporteTecnico: false
    },
    telegram: {
      botUsername: "",
      botToken: ""
    },
    instagram: {
      perfil: "",
      metaBusinessId: ""
    },
    facebook: {
      paginaNome: "",
      paginaId: ""
    }
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
    _version: "v2", // "v1" para formulário estruturado, "v2" para entrevista interativa via N8N
    _etapa: 1, // Sub-etapa ativa (1 a 6) para a Versão 1
    v2WebhookUrl: "https://automate.orpen.com.br/webhook/Orpen_IA_Onboarding",
    v2SessionId: "",
    v2Messages: [],

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
        ],
        destino: "Recepção / Agendamento"
      },
      {
        nome: "Exames e Laudos",
        passos: [
          "Qual exame você precisa realizar?",
          "Você já possui o pedido médico em mãos?",
          "Qual o convênio para realização do exame?",
          "Qual a unidade de preferência?"
        ],
        destino: "Recepção / Agendamento"
      },
      {
        nome: "Remarcações e Cancelamentos",
        passos: [
          "Qual o nome completo e CPF cadastrado?",
          "Qual consulta ou exame você deseja remarcar ou cancelar?",
          "Qual a nova data ou horário de sua preferência?"
        ],
        destino: "Recepção / Agendamento"
      },
      {
        nome: "Financeiro e Faturamento",
        passos: [
          "Qual o número da fatura, guia ou boleto?",
          "Qual o nome e CPF do titular responsável?",
          "Qual a dúvida ou solicitação sobre o pagamento?"
        ],
        destino: "Financeiro"
      }
    ],
    filaFallback: "Recepção / Agendamento",
    tentativasErro: "3",

    // 5. Inatividade e Encerramento
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
    desejaIntegrar: "nao", // "sim" | "nao"
    sistema: "",
    descricao: "",
    contatoNome: "",
    contatoEmail: "",
    contatoTel: "",
    temApi: "sim",
    docUrl: "",
    casos: []
  },
  obs: { texto: "" }
};

const TPL = {
  saude: {
    setores: [
      { nome: "Agendamento", dac: "7001" },
      { nome: "Recepção / Triagem", dac: "7002" },
      { nome: "Resultados de exames", dac: "7003" },
      { nome: "Faturamento / Convênios", dac: "7004" }
    ],
    tabulacoes: ["Agendamento realizado", "Reagendamento", "Cancelamento", "Dúvida sobre convênio", "Resultado de exame", "Cliente não respondeu", "Fora do escopo"],
    pausas: ["Almoço", "Lanche", "Banheiro", "Reunião", "Treinamento", "Feedback"]
  },
  generico: {
    setores: [
      { nome: "Atendimento", dac: "7001" },
      { nome: "Comercial", dac: "7002" },
      { nome: "Suporte", dac: "7003" },
      { nome: "Financeiro", dac: "7004" }
    ],
    tabulacoes: ["Resolvido no primeiro contato", "Encaminhado para outro setor", "Cliente não respondeu", "Solicitação de orçamento", "Reclamação", "Fora do escopo"],
    pausas: ["Almoço", "Lanche", "Banheiro", "Reunião", "Treinamento"]
  }
};

const has = c => S.contrato.canais.includes(c);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ico = (name, extraClass = "") => `<i data-lucide="${name}" class="ui-icon ${extraClass}"></i>`;

function get(p) { return p.split(".").reduce((o, k) => o?.[k], S); }
function set(p, v) { const k = p.split("."), l = k.pop(); k.reduce((o, x) => o[x], S)[l] = v; }

const vEmail = v => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v || "");
const vEmailOuId = v => {
  const str = String(v || "").trim();
  if (!str) return false;
  if (str.includes("@")) return vEmail(str);
  return str.length >= 2;
};
const vTel = v => (v || "").replace(/\D/g, "").length >= 10;
const vLogin = v => /^[1-9]\d{2,}$/.test(v || "");

function mascaraTelefone(el) {
  let v = el.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 10) {
    el.value = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (v.length > 6) {
    el.value = v.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, "($1) $2-$3");
  } else if (v.length > 2) {
    el.value = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
  } else if (v.length > 0) {
    el.value = v.replace(/^(\d*)$/, "($1");
  }
}

/* ---------- componentes de formulário ---------- */
function ro(l, v) { return `<div class="f"><label>${l}</label><input type="text" value="${esc(v)}" readonly style="background:var(--surface-2);color:var(--muted)"></div>`; }
function fi(l, p, t = "text", ph = "", extra = "") {
  const v = get(p) ?? "";
  const isTel = t === "tel" || p.toLowerCase().includes("tel") || l.toLowerCase().includes("telefone") || l.toLowerCase().includes("whatsapp");
  const maskAttr = isTel ? 'oninput="mascaraTelefone(this)" maxlength="15"' : '';
  const phFinal = ph || (isTel ? "(11) 99999-9999" : "");
  return `<div class="f"><label>${l}</label><input type="${t === 'email' ? 'text' : (isTel ? 'tel' : t)}" data-path="${p}" value="${esc(v)}" placeholder="${esc(phFinal)}" ${maskAttr} ${extra}></div>`;
}
function fin(p, ph) { return `<input type="text" data-path="${p}" value="${esc(get(p) ?? "")}" placeholder="${esc(ph)}">`; }
function fta(p, ph) { return `<textarea data-path="${p}" placeholder="${esc(ph)}">${esc(get(p) ?? "")}</textarea>`; }
function tagBox(p, ph) {
  const arr = get(p) || [];
  const placeholderText = ph.includes("Enter") ? ph : `${ph} — digite e aperte Enter`;
  return `<div class="tags">${arr.map((t, i) => `<span class="tag">${esc(t)}<button onclick="delTag('${p}',${i})">×</button></span>`).join("") || '<span class="hint">nada ainda</span>'}</div>
  <input type="text" placeholder="${esc(placeholderText)}" onkeydown="if(event.key==='Enter'){event.preventDefault();addTag('${p}',this.value);this.value=''}">`;
}
function nav() {
  const v = visible(), i = v.findIndex(b => b.id === cur);
  return `<div class="navrow" style="margin-top:24px">
    ${i > 0 ? `<button class="btn btn-s" onclick="go('${v[i - 1].id}')">Voltar</button>` : ""}
    ${i < v.length - 1 ? `<button class="btn btn-p sp" onclick="go('${v[i + 1].id}')">Continuar</button>` : ""}</div>`;
}

function next() {
  const v = visible(), i = v.findIndex(b => b.id === cur);
  if (i < v.length - 1) go(v[i + 1].id);
}

/* ---------- ações auxiliares ---------- */
function togCanal(c) {
  if (!S.contrato.canais) S.contrato.canais = [];
  const i = S.contrato.canais.indexOf(c);
  if (i >= 0) S.contrato.canais.splice(i, 1);
  else S.contrato.canais.push(c);
  draw();
}
function stepLic(path, delta, min = 1) {
  let curr = parseInt(get(path), 10) || 0;
  curr = Math.max(min, curr + delta);
  set(path, curr);
  draw();
}
function setLic(path, val) {
  set(path, val);
  draw();
}
function addTag(p, v) { v = v.trim(); if (!v) return; const a = get(p); if (!a.includes(v)) a.push(v); draw(); }
function delTag(p, i) { get(p).splice(i, 1); draw(); }
function loadTpl(k, f) {
  const d = TPL[k][f];
  if (f === "setores") S.operacao.setores = JSON.parse(JSON.stringify(d));
  else S.classif[f] = [...new Set([...S.classif[f], ...d])];
  draw(); toast("Modelo aplicado — ajuste o que quiser");
}

/* Funções da Pesquisa de Satisfação (Formato WhatsApp) */
function addPesquisaOpcao() {
  if (!S.classif.pesquisaOpcoes) S.classif.pesquisaOpcoes = [];
  const idx = S.classif.pesquisaOpcoes.length + 1;
  S.classif.pesquisaOpcoes.push({ rotulo: `${idx} - ⭐ Opção ${idx}`, valor: String(idx) });
  atualizarPesquisaTexto();
  draw();
  toast("Nova opção adicionada à pesquisa");
}
function delPesquisaOpcao(i) {
  if (S.classif.pesquisaOpcoes && S.classif.pesquisaOpcoes.length > 1) {
    S.classif.pesquisaOpcoes.splice(i, 1);
    atualizarPesquisaTexto();
    draw();
  } else {
    toast("A pesquisa precisa de ao menos uma opção");
  }
}
function setPesquisaOpcao(i, val) {
  if (S.classif.pesquisaOpcoes && S.classif.pesquisaOpcoes[i]) {
    S.classif.pesquisaOpcoes[i].rotulo = val;
    atualizarPesquisaTexto();
    soft();
  }
}
function setPesquisaPergunta(val) {
  S.classif.pesquisaPergunta = val;
  atualizarPesquisaTexto();
  soft();
}
function atualizarPesquisaTexto() {
  const p = S.classif.pesquisaPergunta || "Como você avalia o nosso atendimento hoje?";
  const opts = (S.classif.pesquisaOpcoes || []).map(o => o.rotulo).join("\n");
  S.classif.pesquisaTexto = `${p}\n\n${opts}`;
}
function addSetor() { const n = 7001 + S.operacao.setores.length; S.operacao.setores.push({ nome: "", dac: String(n) }); draw(); }
function addAgente() { S.equipe.agentes.push({ login: nextLogin(), nome: "", email: "", setor: "", setores: [] }); draw(); }
function addGestor() { S.equipe.gestores.push({ nome: "", email: "", setor: "" }); draw(); }
function nextLogin() { const used = S.equipe.agentes.map(a => +a.login).filter(Boolean); let n = 101; while (used.includes(n)) n++; return String(n); }

/* ---------- Multi-select de Setores para Agentes ---------- */
function formatMsTags(setores) {
  if (!setores || !setores.length) {
    return `<span class="ms-placeholder">Selecione as filas…</span>`;
  }
  if (setores.length <= 2) {
    return setores.map(st => `<span class="ms-pill">${esc(st)}</span>`).join("");
  }
  return `<span class="ms-pill">${esc(setores[0])}</span> <span class="ms-pill">+${setores.length - 1} filas</span>`;
}

function toggleAgenteSetor(agenteIdx, setorNome) {
  const ag = S.equipe.agentes[agenteIdx];
  if (!ag) return;
  if (!Array.isArray(ag.setores)) {
    ag.setores = ag.setor ? ag.setor.split(",").map(s => s.trim()).filter(Boolean) : [];
  }
  const idx = ag.setores.indexOf(setorNome);
  if (idx >= 0) {
    ag.setores.splice(idx, 1);
  } else {
    ag.setores.push(setorNome);
  }
  ag.setor = ag.setores.join(", ");

  const tagsEl = document.getElementById(`ms_tags_${agenteIdx}`);
  if (tagsEl) {
    tagsEl.innerHTML = formatMsTags(ag.setores);
  }
  const trigger = document.getElementById(`ms_trigger_${agenteIdx}`);
  if (trigger) {
    trigger.title = ag.setores.length ? ag.setores.join(", ") : "Clique para selecionar as filas";
  }
  const safeKey = setorNome.replace(/[^a-zA-Z0-9]/g, '_');
  const itemEl = document.getElementById(`ms_item_${agenteIdx}_${safeKey}`);
  if (itemEl) {
    itemEl.classList.toggle("checked", ag.setores.includes(setorNome));
  }
  const chk = document.getElementById(`chk_ag_${agenteIdx}_${safeKey}`);
  if (chk) {
    chk.checked = ag.setores.includes(setorNome);
  }
  soft();
}

function toggleMultiSelect(agenteIdx, event) {
  if (event) event.stopPropagation();
  const allMenus = document.querySelectorAll(".ms-menu");
  const menu = document.getElementById(`ms_menu_${agenteIdx}`);
  const trigger = document.getElementById(`ms_trigger_${agenteIdx}`) || document.getElementById(`ms_wrap_${agenteIdx}`);
  const isOpen = menu && menu.classList.contains("open");

  allMenus.forEach(m => {
    m.classList.remove("open");
    m.style.display = "none";
  });
  document.querySelectorAll(".multi-select-trigger.active").forEach(t => t.classList.remove("active"));

  if (menu && !isOpen && trigger) {
    const rect = trigger.getBoundingClientRect();
    menu.style.position = "fixed";

    // Auto-posicionamento inteligente (se não couber embaixo, abre pra cima)
    const menuHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      menu.style.top = (rect.top - menuHeight - 4) + "px";
    } else {
      menu.style.top = (rect.bottom + 4) + "px";
    }

    const menuWidth = Math.max(260, Math.min(320, rect.width + 40));
    let leftPos = rect.left;
    if (leftPos + menuWidth > window.innerWidth - 16) {
      leftPos = Math.max(16, window.innerWidth - menuWidth - 16);
    }
    menu.style.left = leftPos + "px";
    menu.style.width = menuWidth + "px";
    menu.style.zIndex = "99999";
    menu.style.display = "block";
    menu.classList.add("open");
    trigger.classList.add("active");
  }
}

function fecharMultiSelect(agenteIdx, event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById(`ms_menu_${agenteIdx}`);
  const trigger = document.getElementById(`ms_trigger_${agenteIdx}`) || document.getElementById(`ms_wrap_${agenteIdx}`);
  if (menu) {
    menu.classList.remove("open");
    menu.style.display = "none";
  }
  if (trigger) trigger.classList.remove("active");
  soft();
}

function marcarTodosSetoresAgente(agenteIdx, marcar) {
  const ag = S.equipe.agentes[agenteIdx];
  if (!ag) return;
  ag.setores = marcar ? S.operacao.setores.map(s => s.nome) : [];
  ag.setor = ag.setores.join(", ");

  const tagsEl = document.getElementById(`ms_tags_${agenteIdx}`);
  if (tagsEl) {
    tagsEl.innerHTML = formatMsTags(ag.setores);
  }
  const trigger = document.getElementById(`ms_trigger_${agenteIdx}`);
  if (trigger) {
    trigger.title = ag.setores.length ? ag.setores.join(", ") : "Clique para selecionar as filas";
  }
  S.operacao.setores.forEach(s => {
    const safeKey = s.nome.replace(/[^a-zA-Z0-9]/g, '_');
    const itemEl = document.getElementById(`ms_item_${agenteIdx}_${safeKey}`);
    if (itemEl) itemEl.classList.toggle("checked", marcar);
    const chk = document.getElementById(`chk_ag_${agenteIdx}_${safeKey}`);
    if (chk) chk.checked = marcar;
  });
  soft();
}

function renderAgenteSetoresSelector(i, ag, todosSetores) {
  const selecionados = Array.isArray(ag.setores) ? ag.setores : (ag.setor ? ag.setor.split(",").map(s => s.trim()).filter(Boolean) : []);
  ag.setores = selecionados;

  return `
    <div class="multi-select-wrap" id="ms_wrap_${i}">
      <div class="multi-select-trigger" id="ms_trigger_${i}" onclick="toggleMultiSelect(${i}, event)" title="${selecionados.length ? esc(selecionados.join(', ')) : 'Clique para selecionar as filas'}">
        <div class="ms-tags-container" id="ms_tags_${i}">
          ${formatMsTags(selecionados)}
        </div>
        <span class="ms-chevron">▾</span>
      </div>
      <div class="ms-menu" id="ms_menu_${i}" onclick="event.stopPropagation()">
        <div class="ms-menu-header">
          <span class="ms-menu-title">Filas de Atendimento</span>
          <div style="display:flex;gap:4px;align-items:center">
            <button type="button" class="ms-btn-link" onclick="marcarTodosSetoresAgente(${i}, true)">Todas</button>
            <span style="color:var(--color-border)">|</span>
            <button type="button" class="ms-btn-link" onclick="marcarTodosSetoresAgente(${i}, false)">Limpar</button>
            <button type="button" class="ms-btn-done" onclick="fecharMultiSelect(${i}, event)">OK</button>
          </div>
        </div>
        <div class="ms-menu-body">
          ${todosSetores.length ? todosSetores.map(s => {
            const checked = selecionados.includes(s.nome);
            const safeKey = s.nome.replace(/[^a-zA-Z0-9]/g, '_');
            const chkId = `chk_ag_${i}_${safeKey}`;
            return `
              <label class="ms-item ${checked ? 'checked' : ''}" id="ms_item_${i}_${safeKey}" for="${chkId}">
                <input type="checkbox" id="${chkId}" ${checked ? 'checked' : ''} onchange="toggleAgenteSetor(${i}, '${esc(s.nome)}')">
                <span class="ms-item-name">${esc(s.nome)}</span>
                <span class="ms-item-dac">DAC ${esc(s.dac)}</span>
              </label>
            `;
          }).join("") : `<div class="ms-item-empty">Nenhum setor cadastrado em 2.1</div>`}
        </div>
      </div>
    </div>
  `;
}

// Fechar multi-select ao clicar fora ou rolar
if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("click", e => {
    if (!e.target.closest(".multi-select-wrap") && !e.target.closest(".ms-menu")) {
      document.querySelectorAll(".ms-menu.open").forEach(m => {
        m.classList.remove("open");
        m.style.display = "none";
      });
      document.querySelectorAll(".multi-select-trigger.active").forEach(t => t.classList.remove("active"));
    }
  });
}
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("scroll", () => {
    document.querySelectorAll(".ms-menu.open").forEach(m => {
      m.classList.remove("open");
      m.style.display = "none";
    });
    document.querySelectorAll(".multi-select-trigger.active").forEach(t => t.classList.remove("active"));
  }, { passive: true });
}

async function importarArquivoAgentes(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const fileName = file.name || "";
  const ext = fileName.split(".").pop().toLowerCase();

  try {
    let linhas = [];

    if ((ext === "xlsx" || ext === "xls") && typeof XLSX !== "undefined") {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      linhas = data.map(row => (Array.isArray(row) ? row.map(c => String(c ?? "").trim()) : []));
    } else {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      linhas = lines.map(l => l.split(/[\t;,]/).map(c => c.trim()));
    }

    let importados = 0;
    for (const cols of linhas) {
      const filtered = cols.filter(Boolean);
      if (!filtered.length) continue;

      const joined = filtered.join(" ").toLowerCase();
      // Pular cabeçalho
      if ((joined.includes("nome") || joined.includes("name")) && (joined.includes("email") || joined.includes("e-mail") || joined.includes("id") || joined.includes("setor") || joined.includes("fila"))) {
        continue;
      }

      const emailMatch = filtered.find(x => x.includes("@")) || "";
      const nome = filtered.find(x => !x.includes("@") && !/^\d+$/.test(x)) || "";

      const matchedSetores = [];
      filtered.forEach(x => {
        const parts = x.split(/[,/]/).map(p => p.trim().toLowerCase());
        S.operacao.setores.forEach(s => {
          if (parts.includes(s.nome.trim().toLowerCase()) && !matchedSetores.includes(s.nome)) {
            matchedSetores.push(s.nome);
          }
        });
      });
      const setorNome = matchedSetores.join(", ");

      if (nome || emailMatch) {
        S.equipe.agentes.push({
          login: nextLogin(),
          nome: nome || (emailMatch ? emailMatch.split("@")[0] : `Agente ${nextLogin()}`),
          email: emailMatch,
          setor: setorNome,
          setores: matchedSetores
        });
        importados++;
      }
    }

    if (importados > 0) {
      toast(`${importados} agente(s) importado(s) de "${fileName}"!`);
      draw();
    } else {
      toast("Nenhum agente válido encontrado no arquivo.");
    }
  } catch (err) {
    console.error("Erro ao importar arquivo:", err);
    toast("Erro ao ler o arquivo. Verifique o formato.");
  } finally {
    if (event.target) event.target.value = "";
  }
}

function abrirModalImportAgentes() {
  const fi = document.getElementById("import_agentes_file");
  if (fi) fi.click();
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
  S.ia._mode = "form";
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setIaViewMode(mode) {
  S.ia._mode = mode;
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchIaVersion(v) {
  S.ia._version = v === "v1" ? "v1" : "v2";
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
  toast(S.ia._version === "v2" ? "Versão 2 (Chat com IA N8N) ativada" : "Versão 1 (Formulário Estruturado) ativada");
}

function isIaStepDone(n) {
  const a = S.ia;
  if (n === 1) return !!(a.processoOtimizar && a.processoOtimizar.trim() && a.kpis && a.kpis.trim());
  if (n === 2) return !!(a.nome && a.nome.trim() && a.tom && a.tom.length && a.extensaoResp);
  if (n === 3) return !!(a.habilidades && a.habilidades.trim() && (a.topicosTransbordo && a.topicosTransbordo.length) && a.restricoes && a.restricoes.trim());
  if (n === 4) return !!(a.fluxosPreAtendimento && a.fluxosPreAtendimento.length && a.fluxosPreAtendimento.every(f => f.destino) && a.filaFallback);
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
    const defSetor = S.operacao.setores[0]?.nome || "";
    S.ia.fluxosPreAtendimento.push({
      nome: limpo,
      passos: [
        "Qual o seu nome completo e CPF do paciente?",
        "Qual o convênio ou particular?",
        "Qual a especialidade ou procedimento desejado?"
      ],
      destino: defSetor
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
  const defSetor = S.operacao.setores[0]?.nome || "";
  S.ia.fluxosPreAtendimento.push({ nome: `Novo Fluxo ${S.ia.fluxosPreAtendimento.length + 1}`, passos: [""], destino: defSetor });
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
function setIaFluxoDestino(i, val) {
  if (S.ia.fluxosPreAtendimento[i]) {
    S.ia.fluxosPreAtendimento[i].destino = val;
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
  const defSetor = S.operacao.setores[0]?.nome || "Fila de Atendimento";
  const consultaSetor = S.operacao.setores.find(s => /consulta/i.test(s.nome))?.nome || "Fila de Consultas";
  const exameSetor = S.operacao.setores.find(s => /exame|atend/i.test(s.nome))?.nome || defSetor;

  S.ia.fluxosPreAtendimento = [
    {
      nome: "Agendamento de Consulta",
      passos: [
        "Qual especialidade ou profissional deseja?",
        "É para o próprio paciente ou para outra pessoa?",
        "Nome completo e data de nascimento do paciente.",
        "Convênio ou particular? Se convênio, qual?",
        "É primeira consulta ou retorno?",
        "Preferência de data e turno."
      ],
      destino: consultaSetor
    },
    {
      nome: "Agendamento de Exame",
      passos: [
        "Qual é o nome do exame?",
        "O paciente possui pedido médico/guia?",
        "Nome completo e data de nascimento do paciente.",
        "Convênio ou particular? Se convênio, qual?",
        "Preferência de data e turno.",
        "Há alguma necessidade de acessibilidade ou orientação adicional?"
      ],
      destino: exameSetor
    },
    {
      nome: "Remarcações e Cancelamentos",
      passos: [
        "Qual o nome completo e CPF cadastrado?",
        "Qual consulta ou exame você deseja remarcar ou cancelar?",
        "Qual a nova data ou horário de sua preferência?"
      ],
      destino: exameSetor
    }
  ];
  draw(); toast("Fluxos de triagem de saúde carregados!");
}

function loadPreAtendComercial() {
  const defSetor = S.operacao.setores[0]?.nome || "";
  const comSetor = S.operacao.setores.find(s => /comercial|vendas/i.test(s.nome))?.nome || defSetor;
  S.ia.fluxosPreAtendimento = [
    {
      nome: "Novo Contrato / Proposta B2B",
      passos: [
        "Qual a razão social ou nome da sua empresa?",
        "Qual o CNPJ da empresa?",
        "Quantos operadores / atendentes utilizarão a plataforma?",
        "Qual o seu cargo ou papel na decisão?"
      ],
      destino: comSetor
    },
    {
      nome: "Demonstração e Dúvidas de Planos",
      passos: [
        "Quais canais sua empresa precisa integrar (WhatsApp, Telefonia, E-mail)?",
        "Você já utiliza algum sistema de atendimento ou CRM hoje?",
        "Qual o melhor e-mail e telefone para envio da proposta?"
      ],
      destino: comSetor
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
