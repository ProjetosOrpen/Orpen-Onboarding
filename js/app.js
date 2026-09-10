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
          <span class="mk">${st === "done" ? ico('check') : i + 1}</span>
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

  if (typeof document !== "undefined" && document.body) {
    document.body.classList.toggle("is-ia-view", cur === "ia");
  }

  if (cur === "ia") {
    setTimeout(() => {
      const stream = document.getElementById("ia_v2_chat_stream");
      if (stream) stream.scrollTop = stream.scrollHeight;
      const input = document.getElementById("ia_v2_input");
      if (input && typeof input.focus === "function") input.focus();
    }, 40);
  }

  soft();
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
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

  if ((cur === "ia" || cur === "ia_v2") && c.ia) {
    const diag = avaliarTierIa();

    contextCardHtml = `
      <div class="tier-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span class="side-context-kicker" style="margin:0">Plano do Cliente</span>
          <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--color-muted-2)">~${(diag.tokens || 0).toLocaleString('pt-BR')} tokens</span>
        </div>
        <span class="tier-badge ${diag.badgeClass}">${diag.tier}</span>
        <p style="margin-top:6px;font-size:12px;line-height:1.4">${diag.desc}</p>
        ${diag.criterio ? `
          <div style="margin-top:8px;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.14);font-size:10.5px;color:var(--color-muted-2)">
            <b>Critério:</b> ${diag.criterio}
          </div>
        ` : ''}
      </div>

      <div class="side-context-card" style="margin:10px 0">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--color-muted);font-weight:600">
          <span>Complexidade do Prompt</span>
          <span style="color:var(--color-brand-primary);font-weight:700">${diag.complexidadeNivel} · ${diag.score}/100</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width:${diag.score}%"></div>
        </div>
        <div style="font-size:11px;color:var(--color-muted);display:flex;justify-content:space-between">
          <span>Densidade: ${S.ia.habilidades.length > 120 ? 'Alta' : 'Moderada'}</span>
          <span>Transbordo: ${(S.ia.topicosTransbordo || []).length} assuntos</span>
        </div>
      </div>

      <div class="side-context-card" style="margin:10px 0">
        <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-brand-primary);font-family:'IBM Plex Mono',monospace;font-weight:700;margin-bottom:6px">Diagnóstico de Ambiguidades</div>
        ${diag.ambiguidades.map(a => `
          <div class="ambig-item">
            <span class="${a.tipo === 'ok' ? 'ambig-ok' : 'ambig-warn'}">${a.tipo === 'ok' ? '✓' : '!'}</span>
            <span style="color:${a.tipo === 'ok' ? 'var(--color-fg-1)' : 'var(--color-warning)'}">${esc(a.txt)}</span>
          </div>
        `).join("")}
        <button class="btn-g" style="color:var(--color-brand-primary);font-size:12px;margin-top:6px;padding:0" onclick="otimizarIaAuditora()">Otimizar regras com a Auditora</button>
      </div>

      ${S.ia.triagemConcluida ? `
        <button class="btn btn-p" style="width:100%;margin-top:12px;justify-content:center;" onclick="abrirModalPromptFinal()">
          ${ico('sparkles')} Visualizar Prompt Final da IA
        </button>
      ` : `
        <button class="btn btn-s" style="width:100%;margin-top:12px;justify-content:center;opacity:0.75;" onclick="toast('⚠️ Conclua a triagem no chat da IA para estruturar as informações e liberar o System Prompt.')" title="Disponível após a conclusão da triagem">
          ${ico('lock')} Prompt Bloqueado (Aguardando Triagem)
        </button>
      `}
    `;
  } else if (cur === "contrato") {
    const preenchidos = [S.contatos.projNome, S.contatos.finNome, S.contatos.legNome, (has("Voz")||c.integracao ? S.contatos.tiNome : true)].filter(Boolean).length;
    const totalResp = has("Voz") || c.integracao ? 4 : 3;
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Resumo do Contrato</span>
        ${line("Canais", c.canais.join(" · ") || "Nenhum selecionado", !c.canais.length)}
        ${line("Licenças Agente", c.licAgente)}
        ${line("Licenças Gestor", c.licGestor)}
        ${line("Responsáveis", `${preenchidos} de ${totalResp} definidos`, preenchidos < totalResp)}
        ${line("Status", c.confirmado ? "Confirmado" : "Aguardando confirmação", !c.confirmado)}
      </div>
    `;
  } else if (cur === "licencas") {
    const qtdAg = S.equipe.agentes.length;
    const maxAg = c.licAgente || 0;
    const qtdGest = S.equipe.gestores.length;
    const maxGest = c.licGestor || 0;
    const qtdSup = (S.equipe.supervisores || []).length;
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Estrutura & Licenças</span>
        ${line("Filas / DACs", `${S.operacao.setores.length} cadastrada(s)`, !S.operacao.setores.length)}
        ${line("Operadores", `${qtdAg} / ${maxAg} ${qtdAg > maxAg ? '(! Acima da cota)' : 'alocados'}`, qtdAg === 0 || qtdAg > maxAg)}
        ${line("Gestores (ADMs)", `${qtdGest} / ${maxGest} ${qtdGest > maxGest ? '(! Acima da cota)' : 'alocados'}`, qtdGest === 0 || qtdGest > maxGest)}
        ${line("Supervisores", `${qtdSup} cadastrado(s) (Ilimitado)`)}
        ${line("Identificação", S.equipe.nomeVisivel ? "Nome Visível" : "Nome Oculto")}
      </div>
    `;
  } else if (cur === "jornada") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Jornada do Atendimento</span>
        ${line("Calendário", S.operacao.jornada === '24x7' ? '24 Horas' : (S.operacao.jornada === 'estendido' ? 'Seg a Sáb' : 'Comercial'))}
        ${line("Horários", S.operacao.diasSem || "Pendente", !S.operacao.diasSem)}
        ${line("Tabulações", `${S.classif.tabulacoes.length} cadastrada(s)`, !S.classif.tabulacoes.length)}
        ${line("Motivos de Pausa", `${S.classif.pausas.length} cadastrado(s)`, !S.classif.pausas.length)}
        ${line("Pesquisa CSAT", S.classif.pesquisa ? "Ativa (WhatsApp)" : "Desativada")}
      </div>
    `;
  } else if (cur === "canais") {
    const canaisAtivos = c.canais || [];
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Canais de Atendimento</span>
        ${line("Canais Ativos", canaisAtivos.join(" · ") || "Nenhum", !canaisAtivos.length)}
        ${has("WhatsApp") ? line("WhatsApp", S.whats.numero || "Pendente", !S.whats.numero) : ""}
        ${has("Voz") ? line("Voz / Telefonia", S.voz.operadora || "Pendente", !S.voz.operadora) : ""}
        ${has("Webchat") ? line("Webchat", S.canaisConfig?.webchat?.urlSite || "Configurado", !S.canaisConfig?.webchat?.urlSite) : ""}
        ${has("Teams") ? line("Teams", S.canaisConfig?.teams?.tenantId ? "Configurado" : "Pendente", !S.canaisConfig?.teams?.tenantId) : ""}
        ${has("Telegram") ? line("Telegram", S.canaisConfig?.telegram?.botUsername || "Pendente", !S.canaisConfig?.telegram?.botUsername) : ""}
        ${has("Instagram") ? line("Instagram", S.canaisConfig?.instagram?.perfil || "Pendente", !S.canaisConfig?.instagram?.perfil) : ""}
        ${has("Facebook") ? line("Facebook", S.canaisConfig?.facebook?.pagina || "Pendente", !S.canaisConfig?.facebook?.pagina) : ""}
      </div>
    `;
  } else if (cur === "integ") {
    contextCardHtml = `
      <div class="side-context-card">
        <span class="side-context-kicker">Integrações de Sistemas</span>
        ${line("Deseja Integrar", S.integ.desejaIntegrar === 'sim' ? 'Sim (Sob Medida)' : (S.integ.desejaIntegrar === 'nao' ? 'Não no momento' : 'Não informado'), !S.integ.desejaIntegrar)}
        ${S.integ.desejaIntegrar === 'sim' ? line("Sistema / ERP", S.integ.sistema || "Pendente", !S.integ.sistema) : ""}
        ${S.integ.desejaIntegrar === 'sim' ? line("Contato Técnico", S.integ.contatoNome || "Pendente", !S.integ.contatoNome) : ""}
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

    <div class="side-context-card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--color-muted);font-weight:600;margin-bottom:4px">
        <span>Progresso Geral</span>
        <span style="color:var(--color-brand-primary);font-weight:700">${pc}%</span>
      </div>
      <div class="meter-track" style="margin:2px 0 0">
        <div class="meter-fill" style="width:${pc}%"></div>
      </div>
    </div>

    ${contextCardHtml}

    ${(cur === "ia" || cur === "ia_v2") ? "" : (pend.length ? `
      <div class="pend" style="margin-top:10px">
        <h4>Falta preencher (${pend.length})</h4>
        ${pend.slice(0, 5).map(p => `<button onclick="go('${p.id}')">→ ${esc(p.txt)}</button>`).join("")}
        ${pend.length > 5 ? `<button onclick="go('revisao')">→ e mais ${pend.length - 5}…</button>` : ""}
      </div>
    ` : `
      <div class="done-box">Tudo pronto! Setup 100% preenchido.</div>
    `)}
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

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (typeof fecharModalPromptFinal === "function") fecharModalPromptFinal();
    if (typeof fecharModalImportAgentes === "function") fecharModalImportAgentes();
  }
});
