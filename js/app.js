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
  const line = (k, v, dim) => `<div class="sline"><span class="k">${k}</span><span class="v ${dim ? "dim" : ""}">${esc(v)}</span></div>`;

  if (c.ia) {
    // Assistente de IA selecionado -> Exibe os diagnósticos e métricas da IA
    const diag = avaliarTierIa();
    const totalFluxos = (S.ia.fluxosPreAtendimento || []).length;
    const totalPassos = (S.ia.fluxosPreAtendimento || []).reduce((acc, f) => acc + (f.passos || []).filter(Boolean).length, 0);

    sumEl.innerHTML = `
      <h3>Assistente de IA</h3>
      <p class="cli">${esc(c.razaoSocial || "Cliente ORPEN")}</p>

      <div class="tier-box">
        <span style="font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#C4B5FD;font-weight:700;display:block;margin-bottom:4px">Plano Compreendido</span>
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
          <span>Transbordo: ${(S.ia.smartJump || []).length} regras</span>
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
      ${line("Roteamento Inteligente", `${(S.ia.smartJump || []).length} regra(s)`, !(S.ia.smartJump || []).length)}
      ${line("Fluxos de Triagem", `${totalFluxos} fluxo(s) · ${totalPassos} passo(s)`, !totalPassos)}
      ${line("Base Conhecimento", S.ia.baseUrl ? "Vinculada" : "Pendente", !S.ia.baseUrl)}
      ${line("Integração de Sistema", S.contrato.integracao ? (S.integ.sistema || "Aguardando") : "Não contratado", !S.integ.sistema)}

      <button class="btn btn-p" style="width:100%;margin-top:12px;background:linear-gradient(135deg,#9333EA,#7C3AED);border:0;display:flex;align-items:center;justify-content:center;gap:6px" onclick="abrirModalPromptFinal()">
        👁️ Visualizar Prompt Final da IA
      </button>

      ${pend.length ? `
        <div class="pend">
          <h4>Falta preencher (${pend.length})</h4>
          ${pend.slice(0, 5).map(p => `<button onclick="go('${p.id}')">→ ${esc(p.txt)}</button>`).join("")}
          ${pend.length > 5 ? `<button onclick="go('revisao')">→ e mais ${pend.length - 5}…</button>` : ""}
        </div>
      ` : `
        <div class="done-box">Tudo pronto! Setup 100% preenchido.</div>
      `}
    `;
  } else {
    // Assistente de IA NÃO contratado -> Mostra apenas o resumo dos módulos e o feedback do que falta preencher
    const modulos = [];
    if (c.whats) modulos.push("WhatsApp");
    if (c.voz) modulos.push("Voz / Telefonia");
    if (c.integracao) modulos.push("Integração");

    sumEl.innerHTML = `
      <h3>Resumo do Onboarding</h3>
      <p class="cli">${esc(c.razaoSocial || "Cliente ORPEN")}</p>

      ${line("Módulos Ativos", modulos.length ? modulos.join(", ") : "Nenhum selecionado", !modulos.length)}
      ${c.whats ? line("WhatsApp", S.whats.wabaTipo === 'cloud' ? 'Cloud API' : 'On-Premises', false) : ""}
      ${c.voz ? line("Voz / Telefonia", S.voz.ura === 'sim' ? 'Com URA' : 'Sem URA', false) : ""}
      ${c.integracao ? line("Integração", S.integ.sistema || "Aguardando", !S.integ.sistema) : ""}

      ${pend.length ? `
        <div class="pend">
          <h4>Falta preencher (${pend.length})</h4>
          ${pend.slice(0, 5).map(p => `<button onclick="go('${p.id}')">→ ${esc(p.txt)}</button>`).join("")}
          ${pend.length > 5 ? `<button onclick="go('revisao')">→ e mais ${pend.length - 5}…</button>` : ""}
        </div>
      ` : `
        <div class="done-box">Tudo pronto! Setup 100% preenchido.</div>
      `}
    `;
  }
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
