/* ============================================================
   DEFINIÇÃO DOS BLOCOS DO FORMULÁRIO (ORPEN SETUP)
   ============================================================ */

function renderBlockHeader({ badge, title, desc, pendList }) {
  const pCount = (pendList || []).length;
  const isDone = pCount === 0;
  const statusHtml = isDone
    ? `<span class="block-status-pill done">${ico('check')} 100% Concluído</span>`
    : `<span class="block-status-pill part">${pCount} ${pCount === 1 ? 'pendência' : 'pendências'}</span>`;

  return `
    <div class="block-hero-header">
      <div class="block-hero-top">
        <div class="block-badge-group">
          <span class="block-badge">${badge}</span>
          <h2 class="block-hero-title">${title}</h2>
        </div>
        ${statusHtml}
      </div>
      <p class="block-hero-desc">${desc}</p>
    </div>
  `;
}

function subCard({ kicker, title, desc, content, note, actions, style }) {
  return `
    <div class="sub-card" ${style ? `style="${style}"` : ''}>
      <div class="sub-card-header-box">
        <div class="sub-card-header-main">
          ${kicker ? `<span class="sub-card-kicker">${kicker}</span>` : ''}
          <h3 class="sub-card-title">${title}</h3>
          ${desc ? `<p class="sub-card-desc">${desc}</p>` : ''}
        </div>
        ${actions ? `<div class="sub-card-actions">${actions}</div>` : ''}
      </div>
      <div class="sub-card-body">
        ${content || ''}
      </div>
      ${note ? `<div class="sub-card-note">${note}</div>` : ''}
    </div>
  `;
}

const BLOCKS = [
  {
    id: "contrato", nome: "Contrato", when: () => true,
    check() {
      const p = [], c = S.contrato, ct = S.contatos;
      if (!c.razaoSocial || !String(c.razaoSocial).trim()) p.push("Razão Social da empresa");
      if (!c.cnpj || !String(c.cnpj).trim()) p.push("CNPJ da empresa");

      // Contato Principal do Projeto
      if (!ct.projNome && !ct.projEmail) {
        p.push("Contato do projeto (nome e e-mail)");
      } else if (!ct.projNome || !String(ct.projNome).trim()) {
        p.push("Nome do contato do projeto");
      } else if (!vEmail(ct.projEmail)) {
        p.push("E-mail corporativo do contato do projeto");
      }

      // Responsável Financeiro
      const finNome = ct.finMesmoProj ? (ct.projNome || ct.finNome) : ct.finNome;
      const finEmail = ct.finMesmoProj ? (ct.projEmail || ct.finEmail) : ct.finEmail;
      if (!finNome && !finEmail) {
        p.push("Responsável financeiro (nome e e-mail)");
      } else if (!finNome || !String(finNome).trim()) {
        p.push("Nome do responsável financeiro");
      } else if (!vEmail(finEmail)) {
        p.push("E-mail do responsável financeiro");
      }

      // Responsável pela Assinatura
      const legNome = ct.legMesmoProj ? (ct.projNome || ct.legNome) : ct.legNome;
      const legEmail = ct.legMesmoProj ? (ct.projEmail || ct.legEmail) : ct.legEmail;
      if (!legNome && !legEmail) {
        p.push("Responsável pela assinatura (nome e e-mail)");
      } else if (!legNome || !String(legNome).trim()) {
        p.push("Nome do responsável pela assinatura");
      } else if (!vEmail(legEmail)) {
        p.push("E-mail do responsável pela assinatura");
      }

      return p;
    },
    render() {
      const c = S.contrato, ct = S.contatos;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Contrato & Escopo",
          title: "Dados Cadastrais, Escopo e Responsáveis",
          desc: "Preencha ou confira os dados cadastrais da empresa, canais contratados, licenças e os responsáveis pela implantação.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Identificação",
          title: "Dados da Empresa *",
          desc: "Informações cadastrais e localização da sua instituição.",
          content: `
            <div class="grid2">
              ${fi("Razão Social *", "contrato.razaoSocial", "text", "Ex.: Hospital Santa Clara Ltda.")}
              ${fi("CNPJ *", "contrato.cnpj", "text", "00.000.000/0001-00")}
              ${fi("Cidade / UF", "contrato.cidade", "text", "Ex.: São Paulo / SP")}
              ${fi("Account Manager ORPEN", "contrato.am", "text", "Ex.: Filipe Oliveira")}
            </div>
          `
        })}
        ${subCard({
          kicker: "Escopo Contratual",
          title: "Canais, Licenças e Módulos",
          desc: "Configure os canais digitais ativos, capacidade operacional e modelo de implantação da sua equipe.",
          content: `
            <div class="f">
              <label>Canais de Atendimento Ativos</label>
              <div class="opts" style="flex-wrap:wrap;gap:8px">
                <button type="button" class="opt sm" aria-pressed="${has('WhatsApp')}" onclick="togCanal('WhatsApp')">${ico('message-square')} WhatsApp</button>
                <button type="button" class="opt sm" aria-pressed="${has('Voz')}" onclick="togCanal('Voz')">${ico('phone')} Voz / Telefonia</button>
                <button type="button" class="opt sm" aria-pressed="${has('Webchat')}" onclick="togCanal('Webchat')">${ico('globe')} Webchat</button>
                <button type="button" class="opt sm" aria-pressed="${has('Instagram')}" onclick="togCanal('Instagram')">${ico('instagram')} Instagram</button>
                <button type="button" class="opt sm" aria-pressed="${has('Facebook')}" onclick="togCanal('Facebook')">${ico('facebook')} Facebook</button>
                <button type="button" class="opt sm" aria-pressed="${has('Teams')}" onclick="togCanal('Teams')">${ico('users')} Microsoft Teams</button>
                <button type="button" class="opt sm" aria-pressed="${has('Telegram')}" onclick="togCanal('Telegram')">${ico('send')} Telegram</button>
              </div>
            </div>

            <div class="lic-grid">
              <!-- Card 1: Licenças de Agente -->
              <div class="lic-card">
                <div class="lic-card-top">
                  <div class="lic-badge-row">
                    <span class="lic-badge-kicker">Operação</span>
                    <span class="lic-badge-pill">Atendimento</span>
                  </div>
                  <h4 class="lic-card-title">Licenças de Agente</h4>
                  <p class="lic-card-desc">Atendentes operando simultaneamente nos canais digitais.</p>
                </div>
                <div class="lic-card-bottom">
                  <div class="lic-counter-wrap">
                    <button type="button" class="lic-btn-step" onclick="stepLic('contrato.licAgente', -1, 1)" title="Diminuir">−</button>
                    <div class="lic-value-box">
                      <input type="number" class="lic-number-input" data-path="contrato.licAgente" value="${c.licAgente || 1}" min="1">
                    </div>
                    <button type="button" class="lic-btn-step" onclick="stepLic('contrato.licAgente', 1, 1)" title="Aumentar">+</button>
                  </div>
                  <div class="lic-presets-grid">
                    ${[5, 10, 15, 20].map(n => `
                      <button type="button" class="lic-preset-btn ${c.licAgente == n ? 'active' : ''}" onclick="setLic('contrato.licAgente', ${n})">${n}</button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Card 2: Licenças de Gestor -->
              <div class="lic-card">
                <div class="lic-card-top">
                  <div class="lic-badge-row">
                    <span class="lic-badge-kicker">Gestão</span>
                    <span class="lic-badge-pill">Supervisão</span>
                  </div>
                  <h4 class="lic-card-title">Licenças de Gestor</h4>
                  <p class="lic-card-desc">Supervisores com acesso a relatórios e monitoria em tempo real.</p>
                </div>
                <div class="lic-card-bottom">
                  <div class="lic-counter-wrap">
                    <button type="button" class="lic-btn-step" onclick="stepLic('contrato.licGestor', -1, 1)" title="Diminuir">−</button>
                    <div class="lic-value-box">
                      <input type="number" class="lic-number-input" data-path="contrato.licGestor" value="${c.licGestor || 1}" min="1">
                    </div>
                    <button type="button" class="lic-btn-step" onclick="stepLic('contrato.licGestor', 1, 1)" title="Aumentar">+</button>
                  </div>
                  <div class="lic-presets-grid">
                    ${[1, 2, 3, 5].map(n => `
                      <button type="button" class="lic-preset-btn ${c.licGestor == n ? 'active' : ''}" onclick="setLic('contrato.licGestor', ${n})">${n}</button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Card 3: Números de WhatsApp -->
              <div class="lic-card">
                <div class="lic-card-top">
                  <div class="lic-badge-row">
                    <span class="lic-badge-kicker">Conexão</span>
                    <span class="lic-badge-pill">WhatsApp</span>
                  </div>
                  <h4 class="lic-card-title">Linhas de WhatsApp</h4>
                  <p class="lic-card-desc">Linhas oficiais conectadas e ativas na API do WhatsApp.</p>
                </div>
                <div class="lic-card-bottom">
                  <div class="lic-counter-wrap">
                    <button type="button" class="lic-btn-step" onclick="stepLic('contrato.numerosWhats', -1, 1)" title="Diminuir">−</button>
                    <div class="lic-value-box">
                      <input type="number" class="lic-number-input" data-path="contrato.numerosWhats" value="${c.numerosWhats || 1}" min="1">
                    </div>
                    <button type="button" class="lic-btn-step" onclick="stepLic('contrato.numerosWhats', 1, 1)" title="Aumentar">+</button>
                  </div>
                  <div class="lic-presets-grid">
                    ${[1, 2, 3, 4].map(n => `
                      <button type="button" class="lic-preset-btn ${c.numerosWhats == n ? 'active' : ''}" onclick="setLic('contrato.numerosWhats', ${n})">${n}</button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <div class="grid2" style="margin-top:16px">
              <div class="scope-options-box">
                <span class="scope-options-label">Tipo de Implantação</span>
                <div class="opts">
                  <button type="button" class="opt sm" aria-pressed="${c.implantacao === 'Nuvem'}" onclick="S.contrato.implantacao='Nuvem';draw()">Nuvem</button>
                  <button type="button" class="opt sm" aria-pressed="${c.implantacao === 'Híbrida'}" onclick="S.contrato.implantacao='Híbrida';draw()">Híbrida</button>
                  <button type="button" class="opt sm" aria-pressed="${c.implantacao === 'On-Premise'}" onclick="S.contrato.implantacao='On-Premise';draw()">On-Premise</button>
                </div>
              </div>

              <div class="scope-options-box">
                <span class="scope-options-label">Módulos Adicionais Contratados</span>
                <div class="opts">
                  <button type="button" class="opt sm" aria-pressed="${c.integracao}" onclick="S.contrato.integracao=!S.contrato.integracao;draw()">Integração API/CRM</button>
                  <button type="button" class="opt sm" aria-pressed="${c.ia}" onclick="S.contrato.ia=!S.contrato.ia;draw()">Assistente de IA</button>
                </div>
              </div>
            </div>
          `
        })}
        ${subCard({
          kicker: "Confirmação",
          title: "Validação do Contrato",
          desc: "Confirme se os dados estão corretos ou indique apontamentos para seu Account Manager.",
          content: `
            <div class="opts" style="margin-bottom:14px">
              <button type="button" class="opt" aria-pressed="${c.confirmado}" onclick="S.contrato.confirmado=true;draw()">Sim, confirmo os dados</button>
              <button type="button" class="opt" aria-pressed="${c.confirmado === false && c.correcao.length > 0}" onclick="S.contrato.confirmado=false;draw()">Preciso corrigir algo</button>
            </div>
            <div class="f">
              <label>Observações ou ajustes para o Account Manager</label>
              <textarea data-path="contrato.correcao" placeholder="Ex.: Ajustes adicionais, observações sobre faturamento...">${esc(c.correcao)}</textarea>
            </div>
          `
        })}
        ${subCard({
          kicker: "Responsáveis",
          title: "Responsáveis pelo Projeto",
          desc: "Cada responsável receberá apenas os alinhamentos e convites pertinentes à sua área.",
          content: `
            <div style="display:flex;flex-direction:column;gap:16px">
              <div class="contact-section-box">
                <h4 class="contact-section-title">Contato Principal do Projeto (Operação & Implantação) *</h4>
                <p class="contact-section-desc">Pessoa chave que acompanha os alinhamentos e homologação do dia a dia com a ORPEN.</p>
                <div class="grid2">
                  ${fi("Nome Completo *", "contatos.projNome")}
                  ${fi("Cargo / Função", "contatos.projCargo")}
                  ${fi("E-mail Corporativo *", "contatos.projEmail", "email")}
                  ${fi("Telefone / WhatsApp (Opcional)", "contatos.projTel", "tel")}
                </div>
              </div>

              <div class="contact-section-box">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
                  <div>
                    <h4 class="contact-section-title">Responsável Financeiro *</h4>
                    <p class="contact-section-desc">Recebe o espelho de faturamento, boletos e trata eventuais reajustes ou aditivos.</p>
                  </div>
                  <button type="button" class="btn-text-tpl" onclick="copiarContato('proj','fin')">${ico('copy')} Copiar do Contato Principal</button>
                </div>
                <div style="margin:4px 0 10px 0">
                  <label style="font-size:12px;color:var(--color-fg-2);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                    <input type="checkbox" ${ct.finMesmoProj ? 'checked' : ''} onchange="togglarMesmoProj('fin')">
                    Mesma pessoa do Contato Principal
                  </label>
                </div>
                <div class="grid2">
                  ${fi("Nome Completo *", "contatos.finNome", "text", "", ct.finMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                  ${fi("Cargo / Área", "contatos.finCargo", "text", "", ct.finMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                  ${fi("E-mail Financeiro *", "contatos.finEmail", "email", "", ct.finMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                  ${fi("Telefone / WhatsApp (Opcional)", "contatos.finTel", "tel", "", ct.finMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                </div>
              </div>

              <div class="contact-section-box">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
                  <div>
                    <h4 class="contact-section-title">Responsável pela Assinatura do Contrato *</h4>
                    <p class="contact-section-desc">Representante legal com poderes contratuais e assinatura digital.</p>
                  </div>
                  <button type="button" class="btn-text-tpl" onclick="copiarContato('proj','leg')">${ico('copy')} Copiar do Contato Principal</button>
                </div>
                <div style="margin:4px 0 10px 0">
                  <label style="font-size:12px;color:var(--color-fg-2);cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                    <input type="checkbox" ${ct.legMesmoProj ? 'checked' : ''} onchange="togglarMesmoProj('leg')">
                    Mesma pessoa do Contato Principal
                  </label>
                </div>
                <div class="grid2">
                  ${fi("Nome Completo *", "contatos.legNome", "text", "", ct.legMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                  ${fi("Cargo / Função", "contatos.legCargo", "text", "", ct.legMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                  ${fi("E-mail Corporativo *", "contatos.legEmail", "email", "", ct.legMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                  ${fi("Telefone / WhatsApp (Opcional)", "contatos.legTel", "tel", "", ct.legMesmoProj ? "readonly style='background:var(--color-surface-2)'" : "")}
                </div>
              </div>

              ${has("Voz") || has("Teams") || S.contrato.integracao ? `
                <div class="contact-section-box">
                  <h4 class="contact-section-title">Contato de TI / Infraestrutura & Redes</h4>
                  <p class="contact-section-desc">Responsável por portas de firewall, apontamento SIP de voz e homologação da API.</p>
                  <div class="grid2">
                    ${fi("Nome do Técnico/Gestor de TI", "contatos.tiNome")}
                    ${fi("E-mail de TI", "contatos.tiEmail", "email")}
                    ${fi("Telefone / WhatsApp (Opcional)", "contatos.tiTel", "tel")}
                    ${fi("Horário / Plantão (Opcional)", "contatos.tiHorario")}
                  </div>
                </div>
              ` : ""}
            </div>
          `
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "licencas",
    nome: "Licenças",
    when: () => true,
    check() {
      const p = [], e = S.equipe, o = S.operacao;
      if (!o.setores.length) p.push("Cadastrar ao menos um setor / fila");
      if (o.setores.some(s => !s.nome || !String(s.nome).trim())) p.push("Setor sem nome cadastrado");
      if (!e.agentes.length) p.push("Cadastrar os operadores de atendimento");
      if (e.agentes.some(a => !vLogin(a.login) || !a.nome || !String(a.nome).trim() || (String(a.email || "").trim() && !vEmail(a.email)))) p.push("Corrigir operadores com dados inválidos (login e nome obrigatórios)");
      return p;
    },
    render() {
      const e = S.equipe, o = S.operacao, c = S.contrato;
      const pend = this.check();
      const agCad = e.agentes.length;
      const gestCad = e.gestores.length;
      const agMax = c.licAgente || 1;
      const gestMax = c.licGestor || 1;
      const agOver = agCad > agMax;
      const gestOver = gestCad > gestMax;
      const isOver = agOver || gestOver;
      const setOpts = v => `<option value="">— Selecione o setor —</option>` + o.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)}</option>`).join("");

      return `<div class="card">
        ${renderBlockHeader({
          badge: "Equipe & Licenças",
          title: "Dimensionamento de Licenças, Filas e Atendentes",
          desc: "Cadastre as filas de atendimento (DAC), operadores simultâneos, regras de identificação e supervisores da plataforma.",
          pendList: pend
        })}

        <!-- Lembrete Dinâmico de Quantidade de Licenças -->
        <div class="lic-quota-banner ${isOver ? 'quota-warn' : 'quota-ok'}" style="margin-bottom:20px">
          <div class="lic-quota-info">
            <div class="lic-quota-icon">${ico(isOver ? 'alert-triangle' : 'users')}</div>
            <div>
              <div class="lic-quota-title">
                <b>Lembrete de Licenças:</b> Operadores: <b>${agCad}/${agMax}</b> · Administradores: <b>${gestCad}/${gestMax}</b>
              </div>
              <div class="lic-quota-sub">
                ${agOver
                  ? `Atenção: ${agCad} operadores para ${agMax} licenças contratadas. Usuários adicionais serão faturados como excedente ou necessitam aditivo.`
                  : `Controle em tempo real de licenças contratadas no Contrato.`}
              </div>
            </div>
          </div>
          <div class="lic-quota-badges">
            <span class="lic-quota-pill ${agOver ? 'pill-warn' : 'pill-ok'}">${agCad}/${agMax} Operadores</span>
            <span class="lic-quota-pill ${gestOver ? 'pill-warn' : 'pill-ok'}">${gestCad}/${gestMax} ADMs</span>
          </div>
        </div>

        ${subCard({
          kicker: "Filas de Atendimento",
          title: "Setores e Filas de Atendimento (DAC) *",
          desc: "Cada setor recebe um código numérico DAC (3 a 5 dígitos) para roteamento nas filas e relatórios.",
          actions: `<button type="button" class="btn btn-p" onclick="addSetor()">${ico('plus')} Adicionar Setor</button>`,
          content: o.setores.length ? `
            <table>
              <thead><tr><th>Nome do Setor / Fila</th><th style="width:180px">Código DAC</th><th style="width:36px"></th></tr></thead>
              <tbody>
                ${o.setores.map((s, i) => `<tr>
                  <td><input type="text" value="${esc(s.nome)}" placeholder="Ex.: Agendamento de Consultas" oninput="S.operacao.setores[${i}].nome=this.value;soft()"></td>
                  <td><input type="text" class="mono ${/^\d{3,5}$/.test(s.dac || "") ? "" : "bad"}" placeholder="Ex.: 7001" value="${esc(s.dac)}" oninput="S.operacao.setores[${i}].dac=this.value;soft()"></td>
                  <td><button class="rowdel" title="Excluir setor" onclick="S.operacao.setores.splice(${i},1);draw()">×</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
            <div class="sectors-table-footer">
              <div class="sectors-tpl-quickload">
                <span class="tpl-label">Modelos prontos:</span>
                <button type="button" class="btn-text-tpl" onclick="loadTpl('saude','setores')">${ico('heart-pulse')} Modelo Saúde</button>
                <span class="tpl-sep">•</span>
                <button type="button" class="btn-text-tpl" onclick="loadTpl('generico','setores')">${ico('building-2')} Modelo Geral</button>
              </div>
            </div>
          ` : `
            <div class="empty-sectors-card">
              <h4 class="empty-sectors-title">Nenhum setor cadastrado</h4>
              <p class="empty-sectors-desc">Adicione os setores de atendimento da sua empresa pelo botão acima ou comece importando uma estrutura sugerida.</p>
              <div class="empty-sectors-tpl-row">
                <span class="tpl-note">Ou preencha com um modelo pronto:</span>
                <button type="button" class="btn-tpl-pill" onclick="loadTpl('saude','setores')">${ico('heart-pulse')} Modelo Saúde</button>
                <button type="button" class="btn-tpl-pill" onclick="loadTpl('generico','setores')">${ico('building-2')} Modelo Geral</button>
              </div>
            </div>
          `
        })}

        ${subCard({
          kicker: "Operadores",
          title: `Operadores e Agentes de Atendimento (${agCad} de ${agMax}) *`,
          desc: "Cadastre os usuários que atenderão as filas. Os logins numéricos (101, 102...) são gerados automaticamente.",
          actions: `
            <button type="button" class="btn btn-p" onclick="addAgente()">${ico('plus')} Adicionar Operador</button>
            <button type="button" class="btn btn-s" onclick="document.getElementById('import_agentes_file').click()">${ico('upload')} Importar em Lote</button>
            <input type="file" id="import_agentes_file" accept=".xlsx, .xls, .csv, .txt" style="display:none" onchange="importarArquivoAgentes(event)">
          `,
          content: e.agentes.length ? `
            <table>
              <thead><tr><th style="width:75px">Login</th><th style="width:28%">Nome Completo</th><th style="width:26%">E-mail (Opcional)</th><th>Filas / Setores</th><th style="width:36px"></th></tr></thead>
              <tbody>
                ${e.agentes.map((a, i) => `<tr>
                  <td><input type="text" class="mono ${vLogin(a.login) ? "" : "bad"}" style="width:60px;text-align:center" value="${esc(a.login)}" oninput="S.equipe.agentes[${i}].login=this.value;soft()"></td>
                  <td><input type="text" value="${esc(a.nome)}" placeholder="Ex.: Mariana Silva" oninput="S.equipe.agentes[${i}].nome=this.value;soft()"></td>
                  <td><input type="email" class="${(a.email && !vEmail(a.email)) ? "bad" : ""}" placeholder="email@empresa.com" value="${esc(a.email)}" oninput="S.equipe.agentes[${i}].email=this.value;soft()"></td>
                  <td>${renderAgenteSetoresSelector(i, a, o.setores)}</td>
                  <td><button class="rowdel" title="Excluir operador" onclick="S.equipe.agentes.splice(${i},1);draw()">×</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          ` : `
            <div class="empty-sectors-card">
              <h4 class="empty-sectors-title">Nenhum operador cadastrado ainda</h4>
              <p class="empty-sectors-desc">Cadastre manualmente pelo botão acima ou importe uma planilha em lote.</p>
            </div>
          `,
          note: agOver ? `<div class="note warn" style="margin-top:14px"><b>Atenção: ${agCad} operadores cadastrados para ${agMax} licenças contratadas.</b> Ajuste a quantidade ou consulte seu Account Manager.</div>` : ""
        })}

        ${subCard({
          kicker: "Identificação dos Agentes",
          title: "Identificação dos Agentes nas Mensagens (Sim / Não)",
          desc: "Defina se o nome do atendente será exibido para o cliente nas mensagens enviadas.",
          content: `
            <div class="opts">
              <button type="button" class="opt" aria-pressed="${e.nomeVisivel}" onclick="S.equipe.nomeVisivel=true;draw()">Sim, exibir identificação do atendente</button>
              <button type="button" class="opt" aria-pressed="${!e.nomeVisivel}" onclick="S.equipe.nomeVisivel=false;draw()">Não, manter atendimento corporativo anônimo</button>
            </div>
            <span class="hint" style="margin-top:8px;display:block">
              Quando ativado, o nome do atendente será exibido no início da mensagem para o cliente final, ex: <i>"[João]: Olá, como posso ajudar?"</i>.
            </span>
          `
        })}

        ${subCard({
          kicker: "Supervisão",
          title: `Supervisores e Administradores (${gestCad} cadastrados)`,
          desc: "Supervisores com acesso a dashboards em tempo real, monitoria de filas, relatórios e gravação.",
          actions: `
            <span class="badge-tag-nolimit" style="display:inline-flex;align-items:center;gap:4px;background:var(--color-success-soft);color:var(--color-success);padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600">
              ${ico('check')} Sem limite de licenças
            </span>
            <button type="button" class="btn btn-p" onclick="addGestor()">${ico('plus')} Adicionar Supervisor</button>
          `,
          content: e.gestores.length ? `
            <table>
              <thead><tr><th style="width:32%">Nome Completo</th><th style="width:36%">E-mail Corporativo</th><th>Setor Supervisionado</th><th style="width:36px"></th></tr></thead>
              <tbody>
                ${e.gestores.map((g, i) => `<tr>
                  <td><input type="text" value="${esc(g.nome)}" oninput="S.equipe.gestores[${i}].nome=this.value;soft()"></td>
                  <td><input type="email" class="${(g.email && !vEmail(g.email)) ? "bad" : ""}" placeholder="email@empresa.com" value="${esc(g.email)}" oninput="S.equipe.gestores[${i}].email=this.value;soft()"></td>
                  <td><select onchange="S.equipe.gestores[${i}].setor=this.value;soft()">${setOpts(g.setor)}</select></td>
                  <td><button class="rowdel" title="Excluir gestor" onclick="S.equipe.gestores.splice(${i},1);draw()">×</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          ` : `<div class="note info">Nenhum supervisor cadastrado. Adicione os supervisores da operação (sem limite de licenças).</div>`
        })}

        ${nav()}
      </div>`;
    }
  },

  {
    id: "jornada",
    nome: "Jornada do Atendimento",
    when: () => true,
    check() {
      const p = [], o = S.operacao, c = S.classif;
      if (o.jornada !== "24x7" && !String(o.diasSem || "").trim()) p.push("Horário de atendimento em dias úteis");
      if (!c.tabulacoes || c.tabulacoes.length === 0) p.push("Cadastrar ao menos uma tabulação de atendimento");
      if (!c.pausas || c.pausas.length === 0) p.push("Definir os motivos de pausa dos atendentes");
      return p;
    },
    render() {
      const o = S.operacao, c = S.classif, w = S.whats;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Jornada & Qualidade",
          title: "Calendário, Horários, Tabulações e Pesquisa",
          desc: "Defina os horários de operação da empresa, motivos de pausa, tabulações de encerramento e a pesquisa de satisfação em formato WhatsApp.",
          pendList: pend
        })}

        ${subCard({
          kicker: "Calendário & Horários",
          title: "Calendário de Atendimento e Horários de Expediente *",
          desc: "Selecione o modelo geral de horário da sua empresa e mensagens de recepção e fora de horário.",
          content: `
            <div class="f"><label>Modelo de Atendimento</label><div class="opts">
              ${["comercial|Comercial (Seg a Sex)", "estendido|Estendido (Inclui Sábado)", "24x7|24 Horas (Todos os dias)", "custom|Personalizado por Setor"].map(x => {
                const [v, l] = x.split("|");
                return `<button type="button" class="opt" aria-pressed="${o.jornada === v}" onclick="S.operacao.jornada='${v}';draw()">${l}</button>`;
              }).join("")}
            </div></div>
            ${o.jornada !== "24x7" ? `<div class="grid3" style="margin-top:14px">
              ${fi("Segunda a Sexta *", "operacao.diasSem", "text", "07:30–18:00")}
              ${o.jornada !== "comercial" ? fi("Sábado", "operacao.sabado", "text", "08:00–12:00") : ""}
              ${fi("Domingo e Feriados", "operacao.domingo", "text", "Não atende")}
            </div>` : ""}

            <div class="grid2" style="margin-top:16px">
              <div class="f">
                <label>Mensagem de Recepção Dentro do Horário</label>
                <textarea data-path="whats.m01" placeholder="Olá! Seja bem-vindo à nossa Central de Atendimento...">${esc(w.m01)}</textarea>
                <div style="display:flex;justify-content:flex-end;margin-top:6px">
                  <button type="button" class="btn-text-tpl" onclick="sugerirM01()">${ico('sparkles')} Montar sugestão a partir dos setores</button>
                </div>
              </div>
              <div class="f">
                <label>Mensagem Fora do Horário de Atendimento</label>
                <textarea data-path="whats.m02" placeholder="Nosso horário de atendimento é de segunda a sexta...">${esc(w.m02)}</textarea>
                <div style="display:flex;justify-content:flex-end;margin-top:6px">
                  <button type="button" class="btn-text-tpl" onclick="sugerirM02()">${ico('sparkles')} Montar sugestão a partir do horário</button>
                </div>
              </div>
            </div>
            <div class="grid2" style="margin-top:10px">
              <div class="f"><label>Ação fora do horário</label><div class="opts">
                <button type="button" class="opt sm" aria-pressed="${w.foraHorario === 'fila'}" onclick="S.whats.foraHorario='fila';draw()">Guardar na fila p/ dia seguinte</button>
                <button type="button" class="opt sm" aria-pressed="${w.foraHorario === 'encerra'}" onclick="S.whats.foraHorario='encerra';draw()">Encerrar após a mensagem</button>
              </div></div>
              <div class="f"><label>Avisar encerramento ao cliente?</label><div class="opts">
                <button type="button" class="opt sm" aria-pressed="${w.avisarFim}" onclick="S.whats.avisarFim=true;draw()">Sim</button>
                <button type="button" class="opt sm" aria-pressed="${!w.avisarFim}" onclick="S.whats.avisarFim=false;draw()">Não</button>
              </div></div>
            </div>
          `
        })}

        ${subCard({
          kicker: "Tabulações",
          title: "Tabulações de Atendimento (Motivos de Encerramento) *",
          desc: "Opções que o agente seleciona ao finalizar a conversa. Recomendamos de 4 a 10 opções claras.",
          content: `
            ${tagBox("classif.tabulacoes", "Digite a tabulação e pressione Enter...")}
            <div style="display:flex;justify-content:flex-end;margin-top:10px">
              <div class="sectors-tpl-quickload">
                <span class="tpl-label">Modelos prontos:</span>
                <button type="button" class="btn-text-tpl" onclick="loadTpl('saude','tabulacoes')">${ico('heart-pulse')} Modelo Saúde</button>
                <span class="tpl-sep">•</span>
                <button type="button" class="btn-text-tpl" onclick="loadTpl('generico','tabulacoes')">${ico('building-2')} Modelo Geral</button>
              </div>
            </div>
          `
        })}

        ${subCard({
          kicker: "Pausas",
          title: "Motivos de Pausa dos Atendentes *",
          desc: "Status que os agentes escolhem quando precisam se ausentar das filas de atendimento.",
          content: `
            ${tagBox("classif.pausas", "Digite o motivo de pausa e pressione Enter...")}
            <div style="display:flex;justify-content:flex-end;margin-top:10px">
              <div class="sectors-tpl-quickload">
                <span class="tpl-label">Modelos prontos:</span>
                <button type="button" class="btn-text-tpl" onclick="loadTpl('saude','pausas')">${ico('heart-pulse')} Modelo Saúde</button>
                <span class="tpl-sep">•</span>
                <button type="button" class="btn-text-tpl" onclick="loadTpl('generico','pausas')">${ico('building-2')} Modelo Geral</button>
              </div>
            </div>
          `
        })}

        ${subCard({
          kicker: "Pesquisa de Satisfação",
          title: "Pesquisa de Satisfação (Menu Interativo no Formato WhatsApp)",
          desc: "Configure as regras de envio e personalize o texto da pergunta e as opções interativas com visualização de tela do WhatsApp em tempo real.",
          content: `
            <div class="opts" style="margin-bottom:14px">
              <button type="button" class="opt" aria-pressed="${c.pesquisa}" onclick="S.classif.pesquisa=true;draw()">Aplicar pesquisa de satisfação</button>
              <button type="button" class="opt" aria-pressed="${!c.pesquisa}" onclick="S.classif.pesquisa=false;draw()">Não aplicar pesquisa</button>
            </div>

            ${c.pesquisa ? `
              <div class="f" style="margin-bottom:14px">
                <label>Frequência de Envio</label>
                <div class="opts">
                  <button type="button" class="opt sm" aria-pressed="${c.pesquisaQuando === 'sempre'}" onclick="S.classif.pesquisaQuando='sempre';draw()">A cada encerramento de ticket</button>
                  <button type="button" class="opt sm" aria-pressed="${c.pesquisaQuando === '7dias'}" onclick="S.classif.pesquisaQuando='7dias';draw()">Máximo 1x a cada 7 dias por cliente</button>
                  <button type="button" class="opt sm" aria-pressed="${c.pesquisaQuando === '24h'}" onclick="S.classif.pesquisaQuando='24h';draw()">Máximo 1x por dia por cliente</button>
                  <button type="button" class="opt sm" aria-pressed="${c.pesquisaQuando === 'amostra'}" onclick="S.classif.pesquisaQuando='amostra';draw()">Por amostragem (20%)</button>
                </div>
              </div>

              <!-- Editor e Preview WhatsApp -->
              <div class="wa-survey-builder">
                <div class="wa-survey-editor">
                  <h4 class="wa-survey-subhead">${ico('edit-3')} Configuração dos Textos e Opções</h4>
                  <div class="f">
                    <label>Texto da Pergunta / Enunciado</label>
                    <input type="text" value="${esc(c.pesquisaPergunta || 'Como você avalia o nosso atendimento hoje?')}" oninput="setPesquisaPergunta(this.value)" placeholder="Digite a pergunta da pesquisa...">
                  </div>

                  <div class="f">
                    <label>Opções de Resposta do Menu (Botões / Itens):</label>
                    <div class="wa-survey-options-list">
                      ${(c.pesquisaOpcoes || []).map((op, oi) => `
                        <div class="wa-survey-opt-row">
                          <span class="wa-survey-opt-num">${oi + 1}</span>
                          <input type="text" value="${esc(op.rotulo)}" placeholder="Ex.: 1 - Excelente" oninput="setPesquisaOpcao(${oi}, this.value)">
                          <button type="button" class="rowdel" title="Excluir opção" onclick="delPesquisaOpcao(${oi})">×</button>
                        </div>
                      `).join("")}
                    </div>
                    <button type="button" class="btn btn-s" style="margin-top:8px" onclick="addPesquisaOpcao()">
                      ${ico('plus')} Adicionar Opção
                    </button>
                  </div>
                </div>

                <div class="wa-survey-preview-wrap">
                  <div class="wa-preview-header">
                    <span class="wa-preview-badge">${ico('message-circle')} Prévia no WhatsApp</span>
                    <span class="wa-preview-status">Tempo Real</span>
                  </div>
                  <div class="wa-chat-container">
                    <div class="wa-msg-balloon">
                      <div class="wa-msg-body">
                        <p class="wa-msg-question">${esc(c.pesquisaPergunta || 'Como você avalia o nosso atendimento hoje?')}</p>
                        <div class="wa-msg-btn-group">
                          ${(c.pesquisaOpcoes || []).map(op => `
                            <div class="wa-msg-btn-item">
                              ${esc(op.rotulo)}
                            </div>
                          `).join("")}
                        </div>
                      </div>
                      <div class="wa-msg-meta">
                        <span>12:00</span>
                        <span class="wa-checks">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ` : ""}
          `
        })}

        ${nav()}
      </div>`;
    }
  },

  /* ------------------------------------------------------------
     4. CANAIS DE ATENDIMENTO
     ------------------------------------------------------------ */
  {
    id: "canais",
    nome: "Canais de Atendimento",
    when: () => S.contrato.canais && S.contrato.canais.length > 0,
    check() {
      const p = [], w = S.whats, v = S.voz, cc = S.canaisConfig;
      if (has("WhatsApp")) {
        const numWhats = (w.numero || "").replace(/\D/g, "");
        if (numWhats.length < 10 || numWhats.length > 13) p.push("Número do WhatsApp");
        if (!w.emUso) p.push("Informar se o número de WhatsApp está em uso");
      }
      if (has("Voz")) {
        if (!v.operadora) p.push("Operadora de telefonia");
        if (!v.entroncamento) p.push("Tipo de entroncamento de voz");
      }
      if (has("Webchat") && !cc.webchat.url) {
        p.push("URL do site para instalação do Webchat");
      }
      if (has("Telegram") && !cc.telegram.botToken) {
        p.push("Token do bot do Telegram");
      }
      return p;
    },
    render() {
      const w = S.whats, v = S.voz, cc = S.canaisConfig, b = S.bot;
      const pend = this.check();
      const setOpts = val => `<option value="">Escolha o setor…</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${val === s.nome ? "selected" : ""}>${esc(s.nome)} · DAC ${esc(s.dac)}</option>`).join("");

      return `<div class="card">
        ${renderBlockHeader({
          badge: "Canais Digitais & Telefonia",
          title: "Configuração dos Canais de Atendimento",
          desc: "Preencha os dados técnicos e operacionais específicos de cada canal contratado no Bloco Contrato.",
          pendList: pend
        })}

        ${has("WhatsApp") ? subCard({
          kicker: "WhatsApp Oficial (WABA)",
          title: "Canal WhatsApp Oficial *",
          desc: "Configuração da linha corporativa homologada na API Oficial da Meta / ORPEN.",
          content: `
            <div class="grid2">
              ${fi("Número WhatsApp (DDD + Número) *", "whats.numero", "tel", "51 3000-0000")}
              <div class="f"><label>Este número já está em uso ativo no WhatsApp? <span class="req">*</span></label><div class="opts">
                <button type="button" class="opt" aria-pressed="${w.emUso === 'nao'}" onclick="S.whats.emUso='nao';draw()">Não, é um número novo</button>
                <button type="button" class="opt" aria-pressed="${w.emUso === 'sim'}" onclick="S.whats.emUso='sim';draw()">Sim, já está em uso</button>
              </div></div>
            </div>
            ${w.emUso === "sim" ? `
              <div class="note warn" style="margin-top:12px"><b>Atenção para a virada do número:</b> Na data de ativação a conta atual do celular é excluída para vinculação na API Oficial. Verifique os pré-requisitos:</div>
              ${[["backup", "Fazer backup de segurança das conversas", "O histórico anterior não migra para a API Oficial."],
                 ["exclusao", "Excluir a conta do WhatsApp na data combinada", "Realizado em conjunto com a equipe de suporte da ORPEN."]]
                .map(([k, t, s]) => `<div class="pre">
                  <input type="checkbox" ${w.pre[k] ? "checked" : ""} onchange="S.whats.pre.${k}=this.checked;draw()">
                  <div><p>${t}</p><p class="sub">${s}</p></div>
                  <input type="text" placeholder="Responsável" value="${esc(w.preResp[k])}" oninput="S.whats.preResp.${k}=this.value;soft()">
                </div>`).join("")}
              <div class="f" style="margin-top:14px"><label>Data desejada para a virada oficial</label>
                <input type="date" value="${esc(w.dataAtivacao)}" oninput="S.whats.dataAtivacao=this.value;soft()" style="max-width:220px"></div>
            ` : ""}
          `
        }) : ""}

        ${has("WhatsApp") ? subCard({
          kicker: "Menu do Bot (WhatsApp)",
          title: "Menu Interativo do Chatbot (URA de WhatsApp)",
          desc: "Estruture o menu de autoatendimento que o cliente visualiza ao entrar em contato pelo WhatsApp.",
          actions: `<button type="button" class="btn btn-p" onclick="addOpcao()">${ico('plus')} Adicionar Opção</button>`,
          content: b.opcoes.length ? `
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px">
              ${b.opcoes.map((o, i) => `
                <div class="node">
                  <div class="hd"><span class="keycap">${i + 1}</span>
                    <input type="text" placeholder="Rótulo da opção. Ex.: Agendamento de Consultas" value="${esc(o.rotulo)}" oninput="S.bot.opcoes[${i}].rotulo=this.value;soft()">
                    <button class="rowdel" title="Excluir opção" onclick="S.bot.opcoes.splice(${i},1);draw()">×</button>
                  </div>
                  <div class="opts" style="margin-bottom:9px">
                    ${["transferir|Transferir para setor", "submenu|Abrir submenu", "mensagem|Responder e encerrar"].map(x => {
                      const [v, l] = x.split("|");
                      return `<button type="button" class="opt sm" aria-pressed="${o.acao === v}" onclick="S.bot.opcoes[${i}].acao='${v}';draw()">${l}</button>`;
                    }).join("")}
                  </div>
                  ${o.acao === "transferir" ? `<select onchange="S.bot.opcoes[${i}].destino=this.value;soft()">${setOpts(o.destino)}</select>` : ""}
                  ${o.acao === "mensagem" ? `<textarea placeholder="Resposta enviada ao cliente" oninput="S.bot.opcoes[${i}].texto=this.value;soft()">${esc(o.texto || "")}</textarea>` : ""}
                  ${o.acao === "submenu" ? `
                    <div class="sub-node">
                      <textarea placeholder="Pergunta / Instrução do submenu" oninput="S.bot.opcoes[${i}].texto=this.value;soft()">${esc(o.texto || "")}</textarea>
                      ${(o.filhos || []).map((f, j) => `
                        <div class="hd" style="margin-top:8px"><span class="keycap">${i + 1}.${j + 1}</span>
                          <input type="text" placeholder="Opção do submenu" value="${esc(f.rotulo)}" oninput="S.bot.opcoes[${i}].filhos[${j}].rotulo=this.value;soft()">
                          <select onchange="S.bot.opcoes[${i}].filhos[${j}].destino=this.value;soft()" style="max-width:230px">${setOpts(f.destino)}</select>
                          <button class="rowdel" title="Excluir item" onclick="S.bot.opcoes[${i}].filhos.splice(${j},1);draw()">×</button>
                        </div>
                      `).join("")}
                      <button type="button" class="btn-text-tpl" style="margin-top:8px" onclick="addFilho(${i})">${ico('plus')} Adicionar opção no submenu</button>
                    </div>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          ` : `
            <div class="empty-sectors-card">
              <h4 class="empty-sectors-title">Nenhuma opção no menu do chatbot</h4>
              <p class="empty-sectors-desc">Adicione opções manualmente pelo botão acima ou gere automaticamente as opções a partir dos setores configurados.</p>
              ${S.operacao.setores.length ? `
                <div class="empty-sectors-tpl-row">
                  <button type="button" class="btn-tpl-pill" onclick="botFromSetores()">${ico('zap')} Gerar a partir dos setores</button>
                </div>
              ` : ""}
            </div>
          `
        }) : ""}

        ${has("Voz") ? subCard({
          kicker: "Telefonia & Voz",
          title: "Estrutura de Telefonia e Entroncamento SIP *",
          desc: "Defina como as linhas telefônicas da operadora serão conectadas à central Orpen e a estrutura da URA de voz.",
          content: `
            <div class="grid2">
              ${fi("Operadora de Telefonia Atual *", "voz.operadora", "text", "Ex.: Vivo, Algar, Directcall, Embratel")}
              ${fi("Canais Simultâneos Contratados", "voz.simultaneas", "text", "Ex.: 15 canais")}
            </div>
            <div class="f"><label>Tipo de Entroncamento com a ORPEN <span class="req">*</span></label><div class="opts">
              <button type="button" class="opt" aria-pressed="${v.entroncamento === 'sip'}" onclick="S.voz.entroncamento='sip';draw()">SIP Trunk Direto da Operadora</button>
              <button type="button" class="opt" aria-pressed="${v.entroncamento === 'legada'}" onclick="S.voz.entroncamento='legada';draw()">SIP com PABX / Central Existente</button>
              <button type="button" class="opt" aria-pressed="${v.entroncamento === 'nsei'}" onclick="S.voz.entroncamento='nsei';draw()">Não sei — Apoio técnico ORPEN</button>
            </div></div>
            <div class="f" style="margin-top:12px"><label>Haverá URA de atendimento automático? <span class="req">*</span></label><div class="opts">
              <button type="button" class="opt" aria-pressed="${v.ura === 'sim'}" onclick="S.voz.ura='sim';draw()">Sim, terá URA de voz</button>
              <button type="button" class="opt" aria-pressed="${v.ura === 'nao'}" onclick="S.voz.ura='nao';draw()">Não, toque direto nas filas</button>
            </div></div>
            <div class="grid2" style="margin-top:12px">
              ${fi("Agentes de Voz Web (Fullchannel)", "voz.agentesWeb", "text", "Ex.: 15")}
              ${fi("Ramais Comuns (Aparelhos IP)", "voz.ramais", "text", "Ex.: 20")}
            </div>
            <div class="f" style="margin-top:12px"><label>Recursos Avançados de Telefonia</label><div class="opts">
              <button type="button" class="opt sm" aria-pressed="${v.callback}" onclick="S.voz.callback=!S.voz.callback;draw()">Callback (Retorno na fila)</button>
              <button type="button" class="opt sm" aria-pressed="${v.whatsback}" onclick="S.voz.whatsback=!S.voz.whatsback;draw()">Whatsback (Transbordo WhatsApp)</button>
            </div></div>
          `
        }) : ""}

        ${has("Webchat") ? subCard({
          kicker: "Webchat para Site",
          title: "Requisitos de Instalação do Webchat *",
          desc: "Widget de atendimento online para inserção em seu website institucional ou portal de clientes.",
          content: `
            <div class="grid2">
              ${fi("URL / Domínio do Site *", "canaisConfig.webchat.url", "text", "https://suaempresa.com.br")}
              <div class="f">
                <label>Cor Primária do Chat (HEX)</label>
                <div style="display:flex;gap:10px;align-items:center">
                  <input type="color" value="${esc(cc.webchat.corPrimaria || '#0A2540')}" onchange="S.canaisConfig.webchat.corPrimaria=this.value;soft()" style="width:46px;height:38px;padding:2px;cursor:pointer;border-radius:6px;border:1.5px solid var(--color-border)">
                  <input type="text" value="${esc(cc.webchat.corPrimaria || '#0A2540')}" oninput="S.canaisConfig.webchat.corPrimaria=this.value;soft()" placeholder="#0A2540" style="font-family:var(--font-mono)">
                </div>
              </div>
            </div>
            <div class="grid2" style="margin-top:12px">
              <div class="f"><label>Posição do Widget na Tela</label><div class="opts">
                <button type="button" class="opt sm" aria-pressed="${cc.webchat.posicao === 'bottom-right'}" onclick="S.canaisConfig.webchat.posicao='bottom-right';draw()">Canto Inferior Direito</button>
                <button type="button" class="opt sm" aria-pressed="${cc.webchat.posicao === 'bottom-left'}" onclick="S.canaisConfig.webchat.posicao='bottom-left';draw()">Canto Inferior Esquerdo</button>
              </div></div>
              <div class="f"><label>Formulário Pré-chat (Coleta de Dados)</label><div class="opts">
                <button type="button" class="opt sm" aria-pressed="${cc.webchat.preChat}" onclick="S.canaisConfig.webchat.preChat=true;draw()">Sim, pedir Nome e E-mail</button>
                <button type="button" class="opt sm" aria-pressed="${!cc.webchat.preChat}" onclick="S.canaisConfig.webchat.preChat=false;draw()">Não, iniciar conversa direto</button>
              </div></div>
            </div>
            <div class="f" style="margin-top:12px">
              ${fi("URL da Logo ou Avatar do Chat (Opcional)", "canaisConfig.webchat.logoUrl", "text", "https://suaempresa.com.br/logo.png")}
            </div>
            <div class="f" style="margin-top:12px">
              ${fi("Mensagem Inicial de Boas-Vindas", "canaisConfig.webchat.mensagemBoasVindas", "text", "Olá! Como podemos te ajudar hoje?")}
            </div>
          `
        }) : ""}

        ${has("Teams") ? subCard({
          kicker: "Microsoft Teams",
          title: "Integração com Microsoft Teams *",
          desc: "Conecte a central de atendimento diretamente ao Microsoft 365 e canais corporativos do Teams.",
          content: `
            <div class="opts" style="margin-bottom:14px">
              <button type="button" class="opt sm" aria-pressed="${!cc.teams.suporteTecnico}" onclick="S.canaisConfig.teams.suporteTecnico=false;draw()">Preencher Chaves do Azure</button>
              <button type="button" class="opt sm" aria-pressed="${cc.teams.suporteTecnico}" onclick="S.canaisConfig.teams.suporteTecnico=true;draw()">Solicitar Apoio Técnico ORPEN</button>
            </div>
            ${!cc.teams.suporteTecnico ? `
              <div class="grid2">
                ${fi("Tenant ID (Diretório M365)", "canaisConfig.teams.tenantId", "text", "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")}
                ${fi("Application (Client) ID", "canaisConfig.teams.appId", "text", "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")}
                ${fi("Client Secret (Valor do Segredo)", "canaisConfig.teams.clientSecret", "password", "Segredo gerado no Azure")}
                ${fi("Nome da Equipe / Canal de Atendimento", "canaisConfig.teams.canalPadrao", "text", "Ex.: Atendimento Suporte")}
              </div>
            ` : `
              <div class="note info">
                <b>Apoio Técnico da ORPEN Ativado:</b> Não se preocupe caso não tenha acesso de administrador ao portal Azure. Nossa equipe de engenharia agendará uma sessão de 15 minutos com o seu administrador de TI para homologar o aplicativo na organização.
              </div>
            `}
          `
        }) : ""}

        ${has("Telegram") ? subCard({
          kicker: "Telegram Bot",
          title: "Configuração do Bot no Telegram *",
          desc: "Crie um bot oficial no Telegram para receber atendimentos centralizados na plataforma.",
          content: `
            <div class="grid2">
              ${fi("Nome de Usuário do Bot (@username) *", "canaisConfig.telegram.botUsername", "text", "Ex.: @meu_atendimento_bot")}
              ${fi("Token de Acesso da API (BotFather) *", "canaisConfig.telegram.botToken", "password", "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ")}
            </div>
            <div class="note info" style="margin-top:12px">
              <b>Como gerar o token em 3 passos:</b><br>
              1. No Telegram, procure por <b>@BotFather</b> e envie o comando <code>/newbot</code>.<br>
              2. Digite o nome de exibição e depois o @username do bot (obrigatoriamente terminado em <i>bot</i>).<br>
              3. O BotFather fornecerá o token de API. Cole-o no campo acima.
            </div>
          `
        }) : ""}

        ${has("Instagram") ? subCard({
          kicker: "Instagram Direct",
          title: "Integração Oficial com Instagram Direct",
          desc: "Atendimento de mensagens diretas e comentários do perfil oficial da empresa.",
          content: `
            <div class="grid2">
              ${fi("Perfil do Instagram (@perfil)", "canaisConfig.instagram.perfil", "text", "@suaempresa")}
              ${fi("ID do Meta Business Manager (Opcional)", "canaisConfig.instagram.metaBusinessId", "text", "Ex.: 123456789012345")}
            </div>
            <span class="hint" style="margin-top:8px;display:block">
              O perfil precisa ser uma <b>Conta Comercial / Profissional</b> vinculada a uma Página do Facebook.
            </span>
          `
        }) : ""}

        ${has("Facebook") ? subCard({
          kicker: "Facebook Messenger",
          title: "Integração com Facebook Messenger",
          desc: "Receba mensagens da página do Facebook diretamente na fila dos atendentes.",
          content: `
            <div class="grid2">
              ${fi("Nome da Página no Facebook", "canaisConfig.facebook.paginaNome", "text", "Ex.: Minha Empresa")}
              ${fi("ID da Página (Page ID)", "canaisConfig.facebook.paginaId", "text", "Ex.: 1029384756")}
            </div>
          `
        }) : ""}

        ${nav()}
      </div>`;
    }
  },

  /* ------------------------------------------------------------
     5. ASSISTENTE DE IA (VERSÃO 2)
     ------------------------------------------------------------ */
  {
    id: "ia",
    nome: "Assistente de IA",
    when: () => S.contrato.ia,
    check() {
      const p = [];
      if (!S.ia.v2Messages || S.ia.v2Messages.length === 0) {
        p.push("Iniciar entrevista com a IA");
      } else if (!S.ia.triagemConcluida) {
        p.push("Concluir triagem com a IA");
      }
      return p;
    },
    render() {
      return renderIaV2Chat();
    }
  },

  /* ------------------------------------------------------------
     6. INTEGRAÇÕES
     ------------------------------------------------------------ */
  {
    id: "integ",
    nome: "Integrações",
    when: () => S.contrato.integracao,
    check() {
      const p = [], g = S.integ;
      if (!g.sistema || !String(g.sistema).trim()) p.push("Nome do sistema / ERP a integrar");
      if (!g.contatoNome && !g.contatoEmail) {
        p.push("Contato técnico da integração (nome e e-mail)");
      } else if (!g.contatoNome || !String(g.contatoNome).trim()) {
        p.push("Nome do contato técnico da integração");
      } else if (!vEmail(g.contatoEmail)) {
        p.push("E-mail do contato técnico da integração");
      }
      return p;
    },
    render() {
      const g = S.integ;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Sistemas & Engenharia",
          title: "Integração com Sistemas Externos (CRM / ERP)",
          desc: "Conexão com plataformas legadas, CRMs e ERPs para automação de processos e consulta de dados.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Alinhamento Técnico",
          title: "Configuração do Sistema / ERP *",
          desc: "Especifique o software que será integrado e os dados do responsável técnico da sua empresa.",
          actions: `<button type="button" class="btn-text-tpl" onclick="copiarContatoParaInteg()">${ico('copy')} Copiar do Contato de TI / Projeto</button>`,
          content: `
            <div class="grid2">
              ${fi("Nome do Sistema / Software *", "integ.sistema", "text", "Ex.: Salesforce, Tasy, MV, HubSpot, Totvs, Bling")}
              ${fi("O que a integração precisa fazer?", "integ.descricao", "text", "Ex.: Consultar cadastro, agendamentos, registrar tickets")}
            </div>
            <div class="grid3" style="margin-top:14px">
              ${fi("Nome do Responsável Técnico *", "integ.contatoNome", "text", "Ex.: Carlos TI")}
              ${fi("E-mail Técnico *", "integ.contatoEmail", "email", "carlos@suaempresa.com.br")}
              ${fi("Telefone / WhatsApp", "integ.contatoTel", "tel", "(11) 99999-9999")}
            </div>
            <div class="note info" style="margin-top:14px">
              <b>Alinhamento com a Engenharia ORPEN:</b> A equipe de integrações da ORPEN entrará em contato diretamente com o responsável técnico indicado para realizar a homologação e a validação de escopo sob medida.
            </div>
          `
        })}
        ${nav()}
      </div>`;
    }
  },

  /* ------------------------------------------------------------
     7. REVISÃO
     ------------------------------------------------------------ */
  {
    id: "revisao",
    nome: "Revisão",
    when: () => true,
    check() { return []; },
    render() {
      const pend = allPending();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Conclusão & Envio",
          title: "Revisão Geral e Envio para Homologação",
          desc: "Verifique o status do preenchimento de todos os tópicos antes do envio para o time de implantação da ORPEN.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Diagnóstico",
          title: pend.length ? `Pendências Identificadas (${pend.length})` : "Tudo Pronto para o Provisionamento!",
          desc: pend.length ? "Você pode enviar mesmo com pendências — o time iniciará as etapas prontas e solicitará o restante." : "Todos os tópicos obrigatórios foram concluídos com sucesso.",
          content: pend.length ? `
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
              ${pend.map(p => `
                <div class="pre">
                  <input type="checkbox" disabled>
                  <div style="flex:1"><p style="font-weight:600;color:var(--ink)">${esc(p.txt)}</p><p class="sub">${esc(p.bloco)}</p></div>
                  <button type="button" class="btn btn-s" style="padding:4px 10px;font-size:12px" onclick="go('${p.id}')">Preencher Agora</button>
                </div>
              `).join("")}
            </div>
          ` : `<div class="note info">Ambiente 100% configurado! Ao enviar, a ORPEN iniciará o provisionamento automático e liberará o acesso aos testes.</div>`
        })}
        ${subCard({
          kicker: "Documentação Complementar",
          title: "Anexos & Documentação Complementar",
          desc: "Envie arquivos adicionais úteis para o setup (planilhas de contatos, áudios da URA, manuais).",
          content: `
            <div class="file-upload-zone" onclick="document.getElementById('rev_file_upload').click()">
              <input type="file" id="rev_file_upload" multiple style="display:none">
              <b>Clique para anexar arquivos</b>
              <span class="hint">Suporta múltiplos formatos: PDF, DOCX, XLSX, MP3, WAV</span>
            </div>
          `
        })}
        ${subCard({
          kicker: "Observações Finais",
          title: "Observações Adicionais para a Equipe de Implantação",
          desc: "Informações extras, prazos desejados ou particularidades operacionais.",
          content: `<div class="f">${fta("obs.texto", "Ex.: Gostaríamos de priorizar a ativação do WhatsApp Comercial antes do Suporte...")}</div>`
        })}
        <div class="navrow" style="margin-top:20px;padding-top:16px;border-top:1.5px solid var(--color-border)">
          <button type="button" class="btn btn-p" onclick="enviar()">Enviar para a ORPEN</button>
          <button type="button" class="btn btn-s" onclick="baixarJSON()">Baixar JSON do Setup</button>
          <span class="hint sp">Provisionamento automático ORPEN.</span>
        </div>
      </div>`;
    }
  }
];
