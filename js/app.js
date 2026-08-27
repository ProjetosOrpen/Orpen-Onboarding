/* ============================================================
   ORPEN SETUP — MAIN APPLICATION CONTROLLER
   ============================================================ */

let cur = "contrato";

const visible = () => BLOCKS.filter(b => b.when());

function allPending() {
  const out = [];
  visible().forEach(b => b.check().forEach(t => out.push({ id: b.id, bloco: b.nome, txt: t })));
  return out;
}

function progress() {
  const v = visible().filter(b => b.id !== "revisao");
  const tot = v.length;
  const ok = v.filter(b => !b.check().length).length;
  return Math.round(ok / tot * 100);
}

function go(id) {
  cur = id;
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function draw() {
  const v = visible();
  const topCli = document.getElementById("topcli");
  if (topCli) topCli.textContent = S.contrato.razaoSocial;

  const rail = document.getElementById("rail");
  if (rail) {
    rail.innerHTML = '<p class="kicker">Blocos</p>' +
      v.map((b, i) => {
        const p = b.check().length;
        const st = b.id === "revisao" ? "" : (p === 0 ? "done" : "part");
        return `<button class="step ${b.id === cur ? "on" : ""} ${st}" onclick="go('${b.id}')">
          <span class="mk">${st === "done" ? "✓" : i + 1}</span>
          <span class="lbl">${b.nome}</span>
        </button>`;
      }).join("") +
      `<p class="railnote">Blocos que não se aplicam ao seu contrato ficam ocultos. Você pode enviar cada bloco para uma pessoa diferente.</p>`;
  }

  const main = document.getElementById("main");
  const currentBlock = BLOCKS.find(b => b.id === cur);
  if (main && currentBlock) {
    main.innerHTML = currentBlock.render();
  }

  soft();
}

function soft() {
  const pc = progress();
  const pbar = document.getElementById("pbar");
  const ppct = document.getElementById("ppct");
  if (pbar) pbar.style.width = pc + "%";
  if (ppct) ppct.textContent = pc + "%";
  drawSum();
}

function drawSum() {
  const sumEl = document.getElementById("sum");
  if (!sumEl) return;

  const c = S.contrato;
  const pend = allPending();
  const pc = progress();
  const line = (k, v, dim) => `<div class="sline"><span class="k">${k}</span><span class="v ${dim ? "dim" : ""}">${esc(v)}</span></div>`;

  let contextCardHtml = "";

  if (cur === "ia" && c.ia) {
    const diag = avaliarTierIa();
    const totalFluxos = (S.ia.fluxosPreAtendimento || []).length;
    const totalPassos = (S.ia.fluxosPreAtendimento || []).reduce((acc, f) => acc + (f.passos || []).filter(Boolean).length, 0);

    contextCardHtml = `
      <div class="tier-box">
        <span class="side-context-kicker">Plano Compreendido</span>
        <span class="tier-badge ${diag.badgeClass}">${diag.tier}</span>
        <p style="margin-top:4px">${diag.desc}</p>
      </div>

      <div style="background:#281452;border:1px solid #3D1F75;border-radius:8px;padding:11px 12px;margin:10px 0">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#C4B5FD;font-weight:600">
          <span>Complexidade do Prompt</span>
          <span style="color:#C084FC">${diag.complexidadeNivel} · ${diag.score}/100</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width:${diag.score}%"></div>
        </div>
        <div style="font-size:11px;color:#A78BFA;display:flex;justify-content:space-between">
          <span>Densidade: ${S.ia.habilidades.length > 120 ? 'Alta' : 'Moderada'}</span>
          <span>Transbordo: ${(S.ia.topicosTransbordo || []).length} assuntos</span>
        </div>
      </div>

      <div style="background:#221045;border:1px solid #361B66;border-radius:8px;padding:11px 12px;margin:10px 0">
        <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#C4B5FD;font-weight:700;margin-bottom:6px">Diagnóstico de Ambiguidades</div>
        ${diag.ambiguidades.map(a => `
          <div class="ambig-item">
            <span class="${a.tipo === 'ok' ? 'ambig-ok' : 'ambig-warn'}">${a.tipo === 'ok' ? '✓' : '⚠'}</span>
            <span style="color:${a.tipo === 'ok' ? '#EDE9FE' : '#FDE68A'}">${esc(a.txt)}</span>
          </div>
        `).join("")}
        <button class="btn-g" style="color:#C084FC;font-size:12px;margin-top:6px;padding:0" onclick="otimizarIaAuditora()">✨ Otimizar regras com a Auditora</button>
      </div>

      ${line("Nome do Agente", S.ia.nome || "—", !S.ia.nome)}
      ${line("Assuntos de Transbordo", `${(S.ia.topicosTransbordo || []).length} cadastrado(s)`, !(S.ia.topicosTransbordo && S.ia.topicosTransbordo.length))}
      ${line("Fluxos de Atendimento", `${totalFluxos} fluxo(s) · ${totalPassos} passo(s)`, !totalPassos)}
      ${line("Base Conhecimento", S.ia.baseUrl ? "Vinculada" : "Pendente", !S.ia.baseUrl)}
      ${line("Integração", S.contrato.integracao ? (S.integ.sistema || "Aguardando") : "Não contratado", !S.integ.sistema)}

      <button class="btn btn-p" style="width:100%;margin-top:12px;background:linear-gradient(135deg,#9333EA,#7C3AED);border:0;display:flex;align-items:center;justify-content:center;gap:6px" onclick="abrirModalPromptFinal()">
        👁️ Visualizar Prompt Final da IA
      </button>
    `;
  } else if (cur === "contrato") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Resumo do Contrato</span>
        ${line("Canais", c.canais.join(" · "))}
        ${line("Licenças Agente", c.licAgente)}
        ${line("Licenças Gestor", c.licGestor)}
        ${line("WhatsApp", `${c.numerosWhats} número(s)`)}
        ${line("Status", c.confirmado ? "Confirmado ✓" : "Aguardando confirmação", !c.confirmado)}
      </div>
    `;
  } else if (cur === "contatos") {
    const preenchidos = [S.contatos.projNome, S.contatos.finNome, S.contatos.legNome, (has("Voz")||c.integracao ? S.contatos.tiNome : true)].filter(Boolean).length;
    const total = has("Voz") || c.integracao ? 4 : 3;
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Responsáveis do Projeto</span>
        ${line("Contatos Definidos", `${preenchidos} de ${total}`)}
        ${line("Projeto", S.contatos.projNome || "Pendente", !S.contatos.projNome)}
        ${line("Financeiro", S.contatos.finNome || "Pendente", !S.contatos.finNome)}
        ${line("Assinatura", S.contatos.legNome || "Pendente", !S.contatos.legNome)}
        ${has("Voz") || c.integracao ? line("TI / Redes", S.contatos.tiNome || "Pendente", !S.contatos.tiNome) : ""}
      </div>
    `;
  } else if (cur === "operacao") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Estrutura de Filas</span>
        ${line("Jornada", S.operacao.jornada === '24x7' ? '24 Horas' : (S.operacao.jornada === 'estendido' ? 'Seg a Sáb' : 'Comercial'))}
        ${line("Filas / DACs", `${S.operacao.setores.length} cadastrada(s)`)}
        ${line("Horário Úteis", S.operacao.diasSem || "Pendente", !S.operacao.diasSem)}
      </div>
    `;
  } else if (cur === "equipe") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Dimensionamento de Equipe</span>
        ${line("Agentes", `${S.equipe.agentes.length} / ${c.licAgente} licença(s)`)}
        ${line("Gestores", `${S.equipe.gestores.length} / ${c.licGestor} licença(s)`)}
        ${line("Identificação", S.equipe.nomeVisivel ? "Nome Visível" : "Anônimo")}
      </div>
    `;
  } else if (cur === "classif") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Qualidade & Encerramento</span>
        ${line("Tabulações", `${S.classif.tabulacoes.length} criada(s)`)}
        ${line("Pausas", `${S.classif.pausas.length} criada(s)`)}
        ${line("Pesquisa CSAT", S.classif.pesquisa ? "Ativa" : "Desativada")}
      </div>
    `;
  } else if (cur === "whats") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Canal WhatsApp</span>
        ${line("Número", S.whats.numero || "Pendente", !S.whats.numero)}
        ${line("Status Atual", S.whats.emUso === 'sim' ? 'Em uso (Virada)' : (S.whats.emUso === 'nao' ? 'Número Novo' : 'Pendente'))}
        ${line("Recepção M01", S.whats.m01 ? "Configurada ✓" : "Pendente", !S.whats.m01)}
        ${line("Fora Horário M02", S.whats.m02 ? "Configurada ✓" : "Pendente", !S.whats.m02)}
      </div>
    `;
  } else if (cur === "bot") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Autoatendimento (Bot)</span>
        ${line("Opções do Menu", `${S.bot.opcoes.length} configurada(s)`)}
        ${line("Destinos DAC", `${S.bot.opcoes.filter(o => o.acao === 'transferir').length} transferências`)}
      </div>
    `;
  } else if (cur === "voz") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Telefonia & Voz</span>
        ${line("Operadora", S.voz.operadora || "Pendente", !S.voz.operadora)}
        ${line("Entroncamento", S.voz.entroncamento === 'sip' ? 'SIP Direto' : (S.voz.entroncamento === 'legada' ? 'Central Legada' : 'Apoio ORPEN'))}
        ${line("Agentes Voz", S.voz.agentesWeb || "—")}
        ${line("URA de Voz", S.voz.ura === 'sim' ? `${S.voz.uraNiveis || 1} nível(is)` : "Sem URA")}
      </div>
    `;
  } else if (cur === "integ") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Integração de Sistemas</span>
        ${line("Software", S.integ.sistema || "Pendente", !S.integ.sistema)}
        ${line("Suporte a API", S.integ.temApi === 'sim' ? 'Disponível' : (S.integ.temApi === 'nao' ? 'Sem API' : 'Não informado'))}
        ${line("Casos de Uso", `${S.integ.casos.length} selecionado(s)`)}
      </div>
    `;
  } else if (cur === "revisao") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Status de Envio</span>
        ${line("Conclusão Geral", `${pc}%`)}
        ${line("Pendências", `${pend.length} item(ns)`)}
      </div>
    `;
  }

  sumEl.innerHTML = `
    <h3>Resumo do Setup</h3>
    <p class="cli">${esc(c.razaoSocial || "Hospital Exemplo Ltda.")}</p>

    <div style="background:#281452;border:1px solid #3D1F75;border-radius:8px;padding:10px 12px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#C4B5FD;font-weight:600;margin-bottom:4px">
        <span>Progresso Geral</span>
        <span style="color:#10B981;font-weight:700">${pc}%</span>
      </div>
      <div class="meter-track" style="margin:2px 0 0">
        <div class="meter-fill" style="width:${pc}%"></div>
      </div>
    </div>

    ${contextCardHtml}

    ${pend.length ? `
      <div class="pend" style="margin-top:10px">
        <h4>Falta preencher (${pend.length})</h4>
        ${pend.slice(0, 5).map(p => `<button onclick="go('${p.id}')">→ ${esc(p.txt)}</button>`).join("")}
        ${pend.length > 5 ? `<button onclick="go('revisao')">→ e mais ${pend.length - 5}…</button>` : ""}
      </div>
    ` : `
      <div class="done-box">Tudo pronto! Setup 100% preenchido.</div>
    `}
  `;
}

function toast(m) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("on"), 2600);
}

document.addEventListener("input", e => {
  const p = e.target.dataset.path;
  if (!p) return;
  set(p, e.target.value);
  soft();
});

function enviar() {
  const p = allPending();
  toast(p.length ? `Enviado com ${p.length} item(ns) pendente(s) — a ORPEN vai cobrar por aqui.` : "Setup enviado. A ORPEN inicia o provisionamento.");
}

function baixarJSON() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `orpen-setup-${(S.contrato.razaoSocial || 'cliente').toLowerCase().replace(/\s+/g, '-')}.json`;
  a.click();
  toast("JSON do setup baixado com sucesso!");
}

// Inicialização automática
document.addEventListener("DOMContentLoaded", () => {
  draw();
});
