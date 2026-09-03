/* ============================================================
   DEFINIÇÃO DOS BLOCOS DO FORMULÁRIO (ORPEN SETUP)
   ============================================================ */

function renderBlockHeader({ badge, title, desc, pendList }) {
  const pCount = (pendList || []).length;
  const isDone = pCount === 0;
  const statusHtml = isDone
    ? `<span class="block-status-pill done">✅ 100% Concluído</span>`
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
      const p = [], c = S.contrato;
      if (!c.razaoSocial) p.push("Razão Social da empresa");
      if (!c.cnpj) p.push("CNPJ da empresa");
      if (!c.confirmado) p.push("Confirmar os dados do contrato");
      return p;
    },
    render() {
      const c = S.contrato;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Contrato & Escopo",
          title: "Dados Cadastrais e Escopo Contratado",
          desc: "Preencha ou confira os dados cadastrais da empresa, canais contratados, licenças e módulos da operação.",
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
          desc: "Configure os canais de atendimento, licenças de usuários e modelo de implantação.",
          content: `
            <div class="f">
              <label>Canais de Atendimento Ativos</label>
              <div class="opts">
                <button type="button" class="opt sm" aria-pressed="${has('WhatsApp')}" onclick="togCanal('WhatsApp')">WhatsApp</button>
                <button type="button" class="opt sm" aria-pressed="${has('Voz')}" onclick="togCanal('Voz')">Voz / Telefonia</button>
              </div>
            </div>

            <div class="grid3" style="margin-top:14px">
              ${fi("Licenças de Agente", "contrato.licAgente", "number", "15")}
              ${fi("Licenças de Gestor", "contrato.licGestor", "number", "3")}
              ${fi("Números de WhatsApp", "contrato.numerosWhats", "number", "1")}
            </div>

            <div class="grid2" style="margin-top:14px">
              <div class="f">
                <label>Tipo de Implantação</label>
                <div class="opts">
                  <button type="button" class="opt sm" aria-pressed="${c.implantacao === 'Nuvem'}" onclick="S.contrato.implantacao='Nuvem';draw()">Nuvem</button>
                  <button type="button" class="opt sm" aria-pressed="${c.implantacao === 'Híbrida'}" onclick="S.contrato.implantacao='Híbrida';draw()">Híbrida</button>
                  <button type="button" class="opt sm" aria-pressed="${c.implantacao === 'On-Premise'}" onclick="S.contrato.implantacao='On-Premise';draw()">On-Premise</button>
                </div>
              </div>

              <div class="f">
                <label>Módulos Adicionais Contratados</label>
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
        ${nav()}
      </div>`;
    }
  },

  {
    id: "contatos", nome: "Quem responde", when: () => true,
    check() {
      const p = [], c = S.contatos;
      if (!c.projNome || !vEmail(c.projEmail)) p.push("Contato do projeto (nome e e-mail)");
      if (!c.finNome || !vEmail(c.finEmail)) p.push("Responsável financeiro");
      if (!c.legNome || !vEmail(c.legEmail)) p.push("Responsável pela assinatura");
      if (S.contrato.canais.includes("Voz") && (!c.tiNome || !vEmail(c.tiEmail))) p.push("Contato de TI / rede");
      return p;
    },
    render() {
      const c = S.contatos;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Pessoas & Responsáveis",
          title: "Quem responde por cada frente do projeto",
          desc: "Cada responsável receberá apenas os alinhamentos e convites pertinentes à sua área. Não é necessário preencher tudo sozinho.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Operação & Implantação",
          title: "Contato Principal do Projeto (Operação & Implantação) *",
          desc: "Pessoa chave que acompanha os alinhamentos e homologação do dia a dia com a ORPEN.",
          content: `<div class="grid2">${fi("Nome Completo", "contatos.projNome")}${fi("Cargo / Função", "contatos.projCargo")}${fi("E-mail Corporativo", "contatos.projEmail", "email")}${fi("Telefone / WhatsApp", "contatos.projTel", "tel")}</div>`
        })}
        ${subCard({
          kicker: "Faturamento",
          title: "Responsável Financeiro *",
          desc: "Recebe o espelho de faturamento, boletos e trata eventuais reajustes ou aditivos.",
          content: `<div class="grid3">${fi("Nome Completo", "contatos.finNome")}${fi("E-mail Financeiro", "contatos.finEmail", "email")}${fi("Telefone", "contatos.finTel", "tel")}</div>`
        })}
        ${subCard({
          kicker: "Jurídico",
          title: "Responsável pela Assinatura do Contrato *",
          desc: "Representante legal com poderes contratuais e assinatura digital.",
          content: `<div class="grid3">${fi("Nome Completo", "contatos.legNome")}${fi("E-mail Corporativo", "contatos.legEmail", "email")}${fi("Telefone", "contatos.legTel", "tel")}</div>`
        })}
        ${has("Voz") || S.contrato.integracao ? subCard({
          kicker: "Infraestrutura",
          title: "Contato de TI / Infraestrutura & Redes",
          desc: "Responsável por liberação de portas de firewall, apontamento SIP de voz e homologação da API.",
          content: `<div class="grid3">${fi("Nome do Técnico/Gestor de TI", "contatos.tiNome")}${fi("E-mail de TI", "contatos.tiEmail", "email")}${fi("Telefone / Ramal", "contatos.tiTel", "tel")}</div>`
        }) : ""}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "operacao", nome: "Horário e filas", when: () => true,
    check() {
      const p = [];
      if (!S.operacao.diasSem) p.push("Horário de atendimento em dias úteis");
      if (!S.operacao.setores.length) p.push("Cadastrar ao menos um setor / fila");
      if (S.operacao.setores.some(s => !s.nome || !/^\d{3,5}$/.test(s.dac || ""))) p.push("Setor sem nome ou com DAC inválido");
      return p;
    },
    render() {
      const o = S.operacao;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Operação & Filas",
          title: "Jornada de Atendimento e Filas (DAC)",
          desc: "Os setores e códigos DAC cadastrados aqui alimentam automaticamente as filas de transbordo da IA, menus do bot e distribuição dos atendentes.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Jornada",
          title: "Jornada de Atendimento",
          desc: "Selecione o modelo geral de horário da sua empresa.",
          content: `
            <div class="f"><label>Modelo de Atendimento</label><div class="opts">
              ${["comercial|Comercial (Seg a Sex)", "estendido|Estendido (Inclui Sábado)", "24x7|24 Horas (Todos os dias)", "custom|Personalizado por Setor"].map(x => {
                const [v, l] = x.split("|");
                return `<button class="opt" aria-pressed="${o.jornada === v}" onclick="S.operacao.jornada='${v}';draw()">${l}</button>`;
              }).join("")}
            </div></div>
            ${o.jornada !== "24x7" ? `<div class="grid3" style="margin-top:14px">
              ${fi("Segunda a Sexta", "operacao.diasSem", "text", "07:30–18:00")}
              ${o.jornada !== "comercial" ? fi("Sábado", "operacao.sabado", "text", "08:00–12:00") : ""}
              ${o.jornada === "24x7" ? "" : fi("Domingo e Feriados", "operacao.domingo", "text", "Não atende")}
            </div>` : ""}
          `
        })}
        ${subCard({
          kicker: "Filas DAC",
          title: "Setores e Filas de Atendimento (DAC) *",
          desc: "Cada setor recebe um código numérico DAC (3 a 5 dígitos) para roteamento nas filas e relatórios.",
          actions: `
            <button class="btn btn-s" onclick="addSetor()">+ Adicionar Setor</button>
            <button class="btn-g" onclick="loadTpl('saude','setores')">Modelo Saúde</button>
            <button class="btn-g" onclick="loadTpl('generico','setores')">Modelo Geral</button>
          `,
          content: o.setores.length ? `
            <table>
              <thead><tr><th style="width:45%">Nome do Setor / Fila</th><th style="width:20%">Código DAC</th><th>Horário Específico</th><th style="width:36px"></th></tr></thead>
              <tbody>
                ${o.setores.map((s, i) => `<tr>
                  <td><input type="text" value="${esc(s.nome)}" placeholder="Ex.: Agendamento de Consultas" oninput="S.operacao.setores[${i}].nome=this.value;soft()"></td>
                  <td><input type="text" class="mono ${/^\d{3,5}$/.test(s.dac || "") ? "" : "bad"}" placeholder="Ex.: 101" value="${esc(s.dac)}" oninput="S.operacao.setores[${i}].dac=this.value;soft()"></td>
                  <td><input type="text" value="${esc(s.horario)}" placeholder="Seg a Sex 08:00–18:00" oninput="S.operacao.setores[${i}].horario=this.value;soft()"></td>
                  <td><button class="rowdel" title="Excluir setor" onclick="S.operacao.setores.splice(${i},1);draw()">×</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          ` : `<div class="note info">Nenhum setor cadastrado. Clique em "+ Adicionar Setor" ou escolha um dos modelos prontos acima.</div>`
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "equipe", nome: "Equipe", when: () => true,
    check() {
      const p = [], e = S.equipe;
      if (!e.agentes.length) p.push("Cadastrar os agentes");
      if (e.agentes.some(a => !vLogin(a.login) || !a.nome || !vEmail(a.email))) p.push("Corrigir agentes com dado inválido");
      if (e.agentes.length > S.contrato.licAgente) p.push(`Agentes acima das ${S.contrato.licAgente} licenças`);
      if (!e.gestores.length) p.push("Cadastrar ao menos um gestor");
      return p;
    },
    render() {
      const e = S.equipe, over = e.agentes.length > S.contrato.licAgente;
      const pend = this.check();
      const setOpts = v => `<option value="">— Selecione o setor —</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)}</option>`).join("");
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Equipe & Licenças",
          title: "Cadastro de Agentes e Gestores",
          desc: "Importe ou cadastre os usuários que atenderão e gerenciarão as filas. Os logins são validados na hora com controle de licenças contratadas.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Importação",
          title: "Importação Rápida de Agentes",
          desc: "Cole uma lista do Excel ou RH: uma pessoa por linha com Nome, E-mail e Setor separados por tabulação ou vírgula.",
          content: `
            <div class="f">
              <textarea id="bulk" placeholder="Maria Souza	maria@empresa.com.br	Agendamento\nJoão Lima	joao@empresa.com.br	Recepção"></textarea>
              <div class="navrow" style="margin-top:8px">
                <button class="btn btn-p" onclick="parseBulk()">Importar Lista</button>
                <button class="btn btn-s" onclick="addAgente()">+ Adicionar Manual</button>
                <span class="hint sp">Contrato: ${S.contrato.licAgente} licenças de agentes.</span>
              </div>
            </div>
          `
        })}
        ${over ? `<div class="note warn"><b>Atenção: ${e.agentes.length} agentes para ${S.contrato.licAgente} licenças contratadas.</b> Remova ${e.agentes.length - S.contrato.licAgente} ou solicite licenças adicionais ao seu Account Manager.</div>` : ""}
        ${subCard({
          kicker: "Operadores",
          title: `Agentes Cadastrados (${e.agentes.length} de ${S.contrato.licAgente})`,
          desc: "Login: apenas números (mínimo de 3 dígitos, sem começar com 0).",
          content: e.agentes.length ? `
            <table>
              <thead><tr><th style="width:16%">Login</th><th style="width:28%">Nome Completo</th><th style="width:30%">E-mail</th><th>Fila / Setor</th><th style="width:36px"></th></tr></thead>
              <tbody>
                ${e.agentes.map((a, i) => `<tr>
                  <td><input type="text" class="mono ${vLogin(a.login) ? "" : "bad"}" value="${esc(a.login)}" oninput="S.equipe.agentes[${i}].login=this.value;soft()"></td>
                  <td><input type="text" value="${esc(a.nome)}" oninput="S.equipe.agentes[${i}].nome=this.value;soft()"></td>
                  <td><input type="text" class="${vEmail(a.email) ? "" : "bad"}" value="${esc(a.email)}" oninput="S.equipe.agentes[${i}].email=this.value;soft()"></td>
                  <td><select onchange="S.equipe.agentes[${i}].setor=this.value;soft()">${setOpts(a.setor)}</select></td>
                  <td><button class="rowdel" title="Excluir agente" onclick="S.equipe.agentes.splice(${i},1);draw()">×</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          ` : `<div class="note info">Nenhum agente cadastrado ainda. Use a importação rápida acima para começar.</div>`
        })}
        ${subCard({
          kicker: "Supervisão",
          title: `Gestores e Supervisores (${e.gestores.length} de ${S.contrato.licGestor}) *`,
          desc: "Acessam dashboards em tempo real, relatórios gerenciais, gravação e monitoria de filas.",
          actions: `<button class="btn btn-s" onclick="addGestor()">+ Adicionar Gestor</button>`,
          content: e.gestores.length ? `
            <table>
              <thead><tr><th style="width:32%">Nome Completo</th><th style="width:36%">E-mail Corporativo</th><th>Setor Supervisionado</th><th style="width:36px"></th></tr></thead>
              <tbody>
                ${e.gestores.map((g, i) => `<tr>
                  <td><input type="text" value="${esc(g.nome)}" oninput="S.equipe.gestores[${i}].nome=this.value;soft()"></td>
                  <td><input type="text" class="${vEmail(g.email) ? "" : "bad"}" value="${esc(g.email)}" oninput="S.equipe.gestores[${i}].email=this.value;soft()"></td>
                  <td><select onchange="S.equipe.gestores[${i}].setor=this.value;soft()">${setOpts(g.setor)}</select></td>
                  <td><button class="rowdel" title="Excluir gestor" onclick="S.equipe.gestores.splice(${i},1);draw()">×</button></td>
                </tr>`).join("")}
              </tbody>
            </table>
          ` : `<div class="note info">Nenhum gestor cadastrado. Adicione ao menos um gestor responsável.</div>`
        })}
        ${subCard({
          kicker: "Identificação",
          title: "Identificação dos Agentes no Chat",
          desc: "Defina se o nome do atendente será exibido para o cliente nas mensagens.",
          content: `
            <div class="opts">
              <button class="opt" aria-pressed="${e.nomeVisivel}" onclick="S.equipe.nomeVisivel=true;draw()">Sim, exibir nome do atendente</button>
              <button class="opt" aria-pressed="${!e.nomeVisivel}" onclick="S.equipe.nomeVisivel=false;draw()">Não, manter atendimento corporativo anônimo</button>
            </div>
          `
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "classif", nome: "Classificação", when: () => true,
    check() {
      const p = [];
      if (S.classif.tabulacoes.length < 3) p.push("Definir ao menos 3 tabulações");
      if (!S.classif.pausas.length) p.push("Definir as pausas dos agentes");
      return p;
    },
    render() {
      const c = S.classif;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Classificação & Qualidade",
          title: "Tabulações de Encerramento, Pausas e CSAT",
          desc: "As tabulações padronizam o encerramento de cada conversa, alimentando relatórios gerenciais e pesquisas de satisfação pós-atendimento.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Tabulações",
          title: "Tabulações de Atendimento (Motivos de Encerramento) *",
          desc: "Opções que o agente seleciona ao finalizar a conversa. Recomendamos de 4 a 10 opções claras.",
          actions: `
            <button class="btn-g" onclick="loadTpl('saude','tabulacoes')">Modelo Saúde</button>
            <button class="btn-g" onclick="loadTpl('generico','tabulacoes')">Modelo Geral</button>
          `,
          content: tagBox("classif.tabulacoes", "Digite a tabulação e pressione Enter...")
        })}
        ${subCard({
          kicker: "Pausas",
          title: "Motivos de Pausa dos Atendentes *",
          desc: "Status que os agentes escolhem quando precisam se ausentar das filas de atendimento.",
          actions: `
            <button class="btn-g" onclick="loadTpl('saude','pausas')">Modelo Saúde</button>
            <button class="btn-g" onclick="loadTpl('generico','pausas')">Modelo Geral</button>
          `,
          content: tagBox("classif.pausas", "Digite o motivo de pausa e pressione Enter...")
        })}
        ${subCard({
          kicker: "Pesquisa",
          title: "Pesquisa de Satisfação (CSAT / NPS)",
          desc: "Envio automático de questionário de avaliação para o cliente após a conclusão do atendimento.",
          content: `
            <div class="opts" style="margin-bottom:14px">
              <button class="opt" aria-pressed="${c.pesquisa}" onclick="S.classif.pesquisa=true;draw()">Aplicar pesquisa de satisfação</button>
              <button class="opt" aria-pressed="${!c.pesquisa}" onclick="S.classif.pesquisa=false;draw()">Não aplicar pesquisa</button>
            </div>
            ${c.pesquisa ? `
              <div class="f"><label>Frequência de Envio</label><div class="opts">
                <button class="opt sm" aria-pressed="${c.pesquisaQuando === 'sempre'}" onclick="S.classif.pesquisaQuando='sempre';draw()">A cada encerramento</button>
                <button class="opt sm" aria-pressed="${c.pesquisaQuando === 'amostra'}" onclick="S.classif.pesquisaQuando='amostra';draw()">Por amostragem (20%)</button>
                <button class="opt sm" aria-pressed="${c.pesquisaQuando === '24h'}" onclick="S.classif.pesquisaQuando='24h';draw()">Máximo 1x por dia por cliente</button>
              </div></div>
              <div class="f"><label>Mensagem da Pesquisa</label><textarea data-path="classif.pesquisaTexto" style="min-height:100px">${esc(c.pesquisaTexto)}</textarea>
              <span class="hint">Texto personalizável com escala numérica de 1 a 5 ou 0 a 10.</span></div>
            ` : ""}
          `
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "whats", nome: "WhatsApp", when: () => has("WhatsApp"),
    check() {
      const p = [], w = S.whats;
      if (!/^\d{10,11}$/.test((w.numero || "").replace(/\D/g, ""))) p.push("Número do WhatsApp");
      if (!w.emUso) p.push("Informar se o número já está em uso");
      if (!w.m01) p.push("Mensagem de recepção (M01)");
      if (!w.m02) p.push("Mensagem fora do horário (M02)");
      if (w.emUso === "sim" && !Object.values(w.pre).every(Boolean)) p.push("Pré-requisitos do número em uso");
      return p;
    },
    render() {
      const w = S.whats;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "WhatsApp Oficial (WABA)",
          title: "Configuração do Canal WhatsApp",
          desc: "Número corporativo oficial, mensagens automáticas de recepção e diretrizes para a virada e ativação do canal.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Homologação",
          title: "Número Oficial e Status Atual *",
          desc: "Informe o número que será homologado na API Oficial da Meta / Orpen.",
          content: `
            <div class="grid2">
              ${fi("Número WhatsApp (DDD + Número)", "whats.numero", "tel", "51 3000-0000")}
              <div class="f"><label>Este número já está em uso ativo no WhatsApp? <span class="req">*</span></label><div class="opts">
                <button class="opt" aria-pressed="${w.emUso === 'nao'}" onclick="S.whats.emUso='nao';draw()">Não, é um número novo</button>
                <button class="opt" aria-pressed="${w.emUso === 'sim'}" onclick="S.whats.emUso='sim';draw()">Sim, já está em uso</button>
              </div></div>
            </div>
            ${w.emUso === "sim" ? `
              <div class="note warn" style="margin-top:12px"><b>Atenção para a virada do número:</b> Na data de ativação a conta atual do celular é excluída para vinculação na API Oficial. Verifique os pré-requisitos:</div>
              ${[["backup", "Fazer backup de segurança das conversas", "O histórico anterior não migra para a API."],
                 ["grupos", "Sair de todos os grupos do número", "Grupos não são suportados na API Oficial da Meta."],
                 ["exclusao", "Excluir a conta do WhatsApp na data combinada", "Realizado em conjunto com o suporte ORPEN."],
                 ["contatos", "Exportar a agenda de contatos", "Permite importação em massa na plataforma."]]
                .map(([k, t, s]) => `<div class="pre">
                  <input type="checkbox" ${w.pre[k] ? "checked" : ""} onchange="S.whats.pre.${k}=this.checked;draw()">
                  <div><p>${t}</p><p class="sub">${s}</p></div>
                  <input type="text" placeholder="Responsável" value="${esc(w.preResp[k])}" oninput="S.whats.preResp.${k}=this.value;soft()">
                </div>`).join("")}
              <div class="f" style="margin-top:14px"><label>Data desejada para a virada oficial</label>
                <input type="date" value="${esc(w.dataAtivacao)}" oninput="S.whats.dataAtivacao=this.value;soft()" style="max-width:220px"></div>
            ` : ""}
          `
        })}
        ${subCard({
          kicker: "Respostas Automáticas",
          title: "Mensagens Automáticas de Atendimento *",
          desc: "Mensagens de saudação inicial dentro e fora do horário de expediente.",
          content: `
            <div class="f">
              <label>M01 · Mensagem de Recepção Dentro do Horário <span class="req">*</span></label>
              <textarea data-path="whats.m01" placeholder="Olá! Seja bem-vindo à nossa Central de Atendimento...">${esc(w.m01)}</textarea>
              <button class="btn-g" onclick="sugerirM01()">Montar sugestão a partir dos setores</button>
            </div>
            <div class="f">
              <label>M02 · Mensagem Fora do Horário de Atendimento <span class="req">*</span></label>
              <textarea data-path="whats.m02" placeholder="Nosso horário de atendimento é de segunda a sexta...">${esc(w.m02)}</textarea>
              <button class="btn-g" onclick="sugerirM02()">Montar sugestão a partir do horário</button>
            </div>
            <div class="grid2">
              <div class="f"><label>Ação fora do horário</label><div class="opts">
                <button class="opt sm" aria-pressed="${w.foraHorario === 'fila'}" onclick="S.whats.foraHorario='fila';draw()">Guardar na fila p/ dia seguinte</button>
                <button class="opt sm" aria-pressed="${w.foraHorario === 'encerra'}" onclick="S.whats.foraHorario='encerra';draw()">Encerrar após a mensagem</button>
              </div></div>
              <div class="f"><label>Avisar encerramento ao cliente?</label><div class="opts">
                <button class="opt sm" aria-pressed="${w.avisarFim}" onclick="S.whats.avisarFim=true;draw()">Sim</button>
                <button class="opt sm" aria-pressed="${!w.avisarFim}" onclick="S.whats.avisarFim=false;draw()">Não</button>
              </div></div>
            </div>
            ${w.avisarFim ? `<div class="f" style="margin-top:10px"><label>M03 · Mensagem de Atendimento Finalizado</label><textarea data-path="whats.m03">${esc(w.m03)}</textarea></div>` : ""}
          `
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "bot", nome: "Menu do bot", when: () => has("WhatsApp"),
    check() {
      const p = [];
      if (!S.bot.opcoes.length) p.push("Montar o menu do chatbot");
      if (S.bot.opcoes.some(o => !o.rotulo || (o.acao === "transferir" && !o.destino))) p.push("Opção do menu sem rótulo ou destino");
      return p;
    },
    render() {
      const b = S.bot;
      const pend = this.check();
      const setOpts = v => `<option value="">Escolha o setor…</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)} · DAC ${esc(s.dac)}</option>`).join("");
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Árvore de Atendimento",
          title: "Menu Interativo do Chatbot (URA)",
          desc: "Estruture o menu de autoatendimento que o cliente visualiza ao entrar em contato pelo WhatsApp.",
          pendList: pend
        })}
        ${!S.operacao.setores.length ? `<div class="note warn">Cadastre os setores primeiro na aba Operação para vincular as transferências.</div>` : ""}
        ${subCard({
          kicker: "Navegação",
          title: "Opções do Menu Principal",
          desc: "Cada opção pode transferir para uma fila humana (DAC), abrir um submenu de perguntas ou responder com texto pronto.",
          actions: `
            <button class="btn btn-s" onclick="addOpcao()">+ Adicionar Opção</button>
            ${S.operacao.setores.length ? `<button class="btn-g" onclick="botFromSetores()">Gerar a partir dos setores</button>` : ""}
          `,
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
                      return `<button class="opt sm" aria-pressed="${o.acao === v}" onclick="S.bot.opcoes[${i}].acao='${v}';draw()">${l}</button>`;
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
                      <button class="btn-g" style="margin-top:6px" onclick="addFilho(${i})">+ Adicionar opção no submenu</button>
                    </div>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          ` : `<div class="note info">Nenhuma opção no menu. Clique em "+ Adicionar Opção" ou gere automaticamente a partir dos seus setores.</div>`
        })}
        ${b.opcoes.length ? subCard({
          kicker: "Simulação",
          title: "Prévia Visual da URA no WhatsApp",
          desc: "Simulação de como a mensagem de boas-vindas com o menu interativo será exibida.",
          content: `<div class="note info" style="white-space:pre-wrap;font-family:'IBM Plex Sans';background:#fff;border:1.5px solid var(--color-border)">${esc(previewBot())}</div>`
        }) : ""}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "voz", nome: "Voz", when: () => has("Voz"),
    check() {
      const p = [], v = S.voz;
      if (!v.operadora) p.push("Operadora de telefonia");
      if (!v.entroncamento) p.push("Tipo de entroncamento");
      if (!v.unica) p.push("Se a ORPEN será a única central");
      if (!v.ura) p.push("Se haverá URA");
      if (v.ura === "nao" && !v.destinoSemUra) p.push("Destino das chamadas de entrada");
      if (!v.agentesWeb) p.push("Quantidade de agentes de voz");
      return p;
    },
    render() {
      const v = S.voz;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Telefonia & Voz",
          title: "Estrutura de Telefonia e Entroncamento",
          desc: "Defina como as linhas telefônicas da operadora serão conectadas à central Orpen e a estrutura da URA de voz.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Operadora & SIP",
          title: "Operadora e Entroncamento SIP *",
          desc: "Conexão com a sua operadora de telefonia.",
          content: `
            <div class="grid2">
              ${fi("Operadora de Telefonia Atual", "voz.operadora", "text", "Ex.: Vivo, Algar, Directcall, Embratel")}
              ${fi("Canais Simultâneos Contratados", "voz.simultaneas", "text", "Ex.: 15 canais")}
            </div>
            <div class="f"><label>Tipo de Entroncamento com a ORPEN <span class="req">*</span></label><div class="opts">
              <button class="opt" aria-pressed="${v.entroncamento === 'sip'}" onclick="S.voz.entroncamento='sip';draw()">SIP Trunk Direto da Operadora</button>
              <button class="opt" aria-pressed="${v.entroncamento === 'legada'}" onclick="S.voz.entroncamento='legada';draw()">SIP com PABX / Central Existente</button>
              <button class="opt" aria-pressed="${v.entroncamento === 'nsei'}" onclick="S.voz.entroncamento='nsei';draw()">Não sei — Apoio técnico ORPEN</button>
            </div></div>
            ${v.entroncamento === 'nsei' ? `<div class="note warn">Agendaremos uma call técnica de 30 minutos com seu suporte de TI e a operadora.</div>` : ""}
            <div class="f" style="margin-top:12px"><label>A ORPEN será a central telefônica única da empresa? <span class="req">*</span></label><div class="opts">
              <button class="opt" aria-pressed="${v.unica === 'sim'}" onclick="S.voz.unica='sim';draw()">Sim, central única</button>
              <button class="opt" aria-pressed="${v.unica === 'nao'}" onclick="S.voz.unica='nao';draw()">Não, coexistirá com outra central</button>
            </div></div>
            ${v.unica === 'nao' ? `<div class="f" style="margin-top:10px">${fi("Qual central permanece e qual o escopo", "voz.coexistencia", "text", "Ex.: PABX legado para ramais administrativos")}</div>` : ""}
          `
        })}
        ${subCard({
          kicker: "URA & Dimensionamento",
          title: "URA de Voz e Dimensionamento de Agentes *",
          desc: "Roteamento das chamadas de entrada e quantidade de posições de atendimento.",
          content: `
            <div class="f"><label>Haverá URA de atendimento automático? <span class="req">*</span></label><div class="opts">
              <button class="opt" aria-pressed="${v.ura === 'sim'}" onclick="S.voz.ura='sim';draw()">Sim, terá URA de voz</button>
              <button class="opt" aria-pressed="${v.ura === 'nao'}" onclick="S.voz.ura='nao';draw()">Não, toque direto nas filas</button>
            </div></div>
            ${v.ura === 'sim' ? `<div class="f"><label>Profundidade da URA</label><div class="opts">
              ${["1|1 Nível (Menu simples)", "2|2 Níveis (Com submenus)", "3|3 ou mais níveis"].map(x => {
                const [k, l] = x.split("|");
                return `<button class="opt sm" aria-pressed="${v.uraNiveis === k}" onclick="S.voz.uraNiveis='${k}';draw()">${l}</button>`;
              }).join("")}
            </div></div>` : ""}
            ${v.ura === 'nao' ? fi("Para qual fila direcionar as chamadas", "voz.destinoSemUra", "text", "Ex.: Fila Recepção Geral") : ""}
            <div class="grid2" style="margin-top:12px">
              ${fi("Agentes de Voz Web (Fullchannel)", "voz.agentesWeb", "text", "Ex.: 15")}
              ${fi("Ramais Comuns (Aparelhos IP)", "voz.ramais", "text", "Ex.: 20")}
            </div>
            <div class="f" style="margin-top:12px"><label>Recursos Avançados de Telefonia</label><div class="opts">
              <button class="opt sm" aria-pressed="${v.callback}" onclick="S.voz.callback=!S.voz.callback;draw()">Callback (Retorno de chamada na fila)</button>
              <button class="opt sm" aria-pressed="${v.whatsback}" onclick="S.voz.whatsback=!S.voz.whatsback;draw()">Whatsback (Transbordo p/ WhatsApp)</button>
            </div></div>
          `
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "ia", nome: "Assistente de IA", when: () => S.contrato.ia,
    check() {
      const p = [], a = S.ia;
      if (!a.nome) p.push("Nome do assistente de IA");
      if (!a.tom || !a.tom.length) p.push("Tom de voz da IA");
      if (!a.habilidades) p.push("Tópicos que a IA resolve sozinha");
      if (!a.topicosTransbordo || !a.topicosTransbordo.length) p.push("Assuntos de transbordo humano");
      if (!a.restricoes) p.push("O que a IA está proibida de fazer (Restrições)");
      if (!a.fluxosPreAtendimento || !a.fluxosPreAtendimento.length) p.push("Ao menos um fluxo de atendimento");
      if ((a.fluxosPreAtendimento || []).some(f => !f.destino)) p.push("Fila de transferência de todos os fluxos");
      if (!a.filaFallback) p.push("Fila de transbordo / contingência da IA");
      return p;
    },
    render() {
      const a = S.ia;
      const pend = this.check();
      const isChat = a._mode === "chat";
      const etapa = a._etapa || 1;
      const setOpts = v => `<option value="">Escolha a fila / DAC…</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)} · DAC ${esc(s.dac)}</option>`).join("");
      const idi = a.idiomas || ["Português (Brasil)"];
      const fluxos = a.fluxosPreAtendimento || [];
      const links = a.linksAdicionais || [];
      const arquivos = a.arquivos || [];
      const topicos = a.topicosTransbordo || [];

      const subSteps = [
        { n: 1, lbl: "1. Expectativas", full: "1. Alinhamento de Expectativas", desc: "Qual o objetivo central e qual indicador define o sucesso do assistente de IA." },
        { n: 2, lbl: "2. Persona", full: "2. Identidade, Persona e Comunicação", desc: "Como o assistente se apresenta, tom de voz, idiomas e formatação das mensagens." },
        { n: 3, lbl: "3. Contexto & Regras", full: "3. Contexto do Negócio e Objetivos", desc: "Defina o que a IA resolve com autonomia total, os assuntos de transbordo e o que ela nunca deve fazer." },
        { n: 4, lbl: "4. Fluxos", full: "4. Fluxos de Atendimento", desc: "Roteiro de perguntas sequenciais (uma por vez) que a IA realiza para qualificar o atendimento antes de transferir ao atendente." },
        { n: 5, lbl: "5. Inatividade", full: "5. Inatividade e Encerramento", desc: "Controle de tempo e ação quando o cliente para de responder." },
        { n: 6, lbl: "6. Conhecimento", full: "6. Base de Conhecimento e Governança", desc: "Fontes de dados oficiais, procedimentos, arquivos anexos e responsáveis de contato." }
      ];
      const curStep = subSteps[etapa - 1] || subSteps[0];

      let contentHtml = "";

      if (isChat) {
        contentHtml = renderAuditorChatBox();
      } else if (etapa === 1) {
        contentHtml = `
          ${subCard({
            kicker: "Alinhamento",
            title: "Processo Principal a Otimizar *",
            desc: "Descreva a rotina ou gargalo de atendimento que a IA deve absorver no WhatsApp e canais digitais.",
            content: `
              <div class="f">
                ${fta("ia.processoOtimizar", "Ex.: Atendimento inicial no WhatsApp, esclarecimento de dúvidas repetitivas de convênios/preparo de exames e triagem prévia de agendamento antes de transferir para a equipe humana.")}
                <div class="chip-row">
                  <span class="chip-label">Sugestões rápidas:</span>
                  <button type="button" class="btn-chip" onclick="appendIaField('ia.processoOtimizar','Reduzir o tempo de espera no WhatsApp e triar pacientes')">Triagem de Pacientes</button>
                  <button type="button" class="btn-chip" onclick="appendIaField('ia.processoOtimizar','Qualificar leads comerciais e agendar demonstrações')">Qualificação de Leads</button>
                  <button type="button" class="btn-chip" onclick="appendIaField('ia.processoOtimizar','Atendimento de dúvidas frequentes 24/7 sem sobrecarregar a recepção')">Atendimento 24/7</button>
                </div>
              </div>
            `
          })}

          ${subCard({
            kicker: "Performance & KPIs",
            title: "Métricas de Sucesso e KPIs Desejados *",
            desc: "Indicadores operacionais que definirão a performance e o retorno da implementação.",
            content: `
              <div class="f">
                ${fta("ia.kpis", "Ex.: Taxa de resolução no 1º contato acima de 40%, redução do Tempo Médio de Espera (TME) em 50%, nota CSAT/NPS superior a 4.5 e zero transbordos sem qualificação prévia.")}
              </div>
            `
          })}

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1.5px solid var(--color-border)">
            <button class="btn btn-s" onclick="prev()">← Bloco Anterior</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(2)">Continuar: 2. Persona & Comunicação →</button>
          </div>
        `;
      } else if (etapa === 2) {
        contentHtml = `
          ${subCard({
            kicker: "Identidade",
            title: "Identidade & Tom de Voz *",
            desc: "Como o assistente virtual deve se comportar e dialogar com seus clientes.",
            content: `
              <div class="grid2">
                ${fi("Nome do Assistente de IA", "ia.nome", "text", "Ex.: Luna, Ires, Sofia, Max")}
                <div class="f"><label>Tamanho médio das respostas <span class="req">*</span></label><div class="opts">
                  ${["curta|Curta (2 a 3 frases)", "media|Média (4 a 6 linhas)", "flexivel|Flexível"].map(x => {
                    const [v, l] = x.split("|");
                    return `<button class="opt sm" aria-pressed="${a.extensaoResp === v}" onclick="S.ia.extensaoResp='${v}';draw()">${l}</button>`;
                  }).join("")}
                </div></div>
              </div>

              <div class="f" style="margin-top:12px"><label>Tom de Voz <span class="req">*</span></label><div class="opts">
                ${["Cordial e acolhedor", "Formal e institucional", "Direto e objetivo", "Técnico e consultivo"].map(t =>
                  `<button class="opt sm" aria-pressed="${(a.tom || []).includes(t)}" onclick="togIaTom('${t}')">${t}</button>`).join("")}
              </div></div>
            `
          })}

          ${subCard({
            kicker: "Comunicação",
            title: "Idiomas e Formatação de Mensagens",
            desc: "Linguagens suportadas e diretrizes de uso de emojis.",
            content: `
              <div class="f">
                <label>Idiomas Falados pela IA</label>
                <div class="opts" style="margin-bottom:8px">
                  ${["Português (Brasil)", "Inglês", "Espanhol", "Francês"].map(lang =>
                    `<button class="opt sm" aria-pressed="${idi.includes(lang)}" onclick="togIaIdioma('${lang}')">${lang}</button>`).join("")}
                </div>
                <input type="text" placeholder="Outro idioma — digite e pressione Enter para adicionar" onkeydown="if(event.key==='Enter'){event.preventDefault();addIaIdiomaCustom(this.value);this.value=''}">
              </div>

              <div class="grid2" style="margin-top:14px">
                <div class="f"><label>Uso de Emojis</label><div class="opts">
                  ${["nenhum|Sem emojis", "moderado|Moderado (máx 1)", "livre|Humanizado / Livre"].map(x => {
                    const [v, l] = x.split("|");
                    return `<button class="opt sm" aria-pressed="${a.emojiUso === v}" onclick="S.ia.emojiUso='${v}';draw()">${l}</button>`;
                  }).join("")}
                </div></div>
                ${a.emojiUso !== "nenhum" ? fi("Emojis permitidos / restrições", "ia.emojisPermitidos", "text", "Ex.: Permitidos: 💙, 👋, 🏥, ✅ | Proibidos: ❤️, 😂") : ""}
              </div>
            `
          })}

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1.5px solid var(--color-border)">
            <button class="btn btn-s" onclick="setIaSubStep(1)">← 1. Expectativas</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(3)">Continuar: 3. Contexto & Regras →</button>
          </div>
        `;
      } else if (etapa === 3) {
        contentHtml = `
          ${subCard({
            kicker: "Autonomia",
            title: "Autonomia Total (Resolução Direta) *",
            desc: "Assuntos em que a IA responde e conclui a dúvida do cliente sem precisar de atendente humano.",
            content: `
              <div class="f">
                ${fta("ia.habilidades", "Ex.:\n- Endereço e horários de funcionamento das unidades\n- Relação de convênios atendidos e planos aceitos\n- Orientações e preparos básicos de exames\n- Envio de links seguros para agendamento online")}
                <span class="hint">Tópicos determinísticos com respostas baseadas exclusivamente na documentação oficial.</span>
              </div>
            `
          })}

          ${subCard({
            kicker: "Transbordo",
            title: "Assuntos de Transbordo Humano *",
            desc: "Adicione os temas que exigem transferência para um atendente humano. Cada assunto gera automaticamente um fluxo na próxima etapa.",
            content: `
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
                ${topicos.map((topico, ti) => `
                  <div class="step-item">
                    <span class="step-num-badge">${ti + 1}</span>
                    <input type="text" value="${esc(topico)}" placeholder="Ex.: Consultas e Agendamentos" oninput="setIaTopicoTransbordo(${ti}, this.value)">
                    <button class="rowdel" title="Remover assunto" onclick="delIaTopicoTransbordo(${ti})">×</button>
                  </div>
                `).join("")}
              </div>

              <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
                <input type="text" id="novo_topico_input" placeholder="Digite um novo assunto e pressione Enter..." onkeydown="if(event.key==='Enter'){event.preventDefault();addIaTopicoTransbordo(this.value);this.value='';}">
                <button type="button" class="btn btn-s" onclick="const inp=document.getElementById('novo_topico_input');if(inp.value.trim()){addIaTopicoTransbordo(inp.value.trim());inp.value='';}">+ Adicionar Assunto</button>
              </div>

              <div class="chip-row">
                <span class="chip-label">Sugestões rápidas:</span>
                <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Consultas e Agendamentos')">Consultas e Agendamentos</button>
                <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Exames e Preparos')">Exames e Preparos</button>
                <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Remarcações e Cancelamentos')">Remarcações e Cancelamentos</button>
                <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Financeiro e Faturamento')">Financeiro e Faturamento</button>
                <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Cirurgias e Procedimentos')">Cirurgias e Procedimentos</button>
              </div>
            `
          })}

          ${subCard({
            kicker: "Guardrails",
            title: "Guardrails & Segurança Anti-Alucinação *",
            desc: "Regras mandatárias de segurança jurídica, operacional e filtro anti-ruído.",
            content: `
              <div class="grid2">
                <div class="f"><label>O que ela NUNCA deve fazer (Restrições Críticas) <span class="req">*</span></label>
                  ${fta("ia.restricoes", "Ex.:\n- Proibido dar parecer médico, diagnósticos ou interpretar exames\n- Não confirmar cobertura sem consulta à operadora\n- Não prometer procedimentos cirúrgicos ou descontos fora da tabela")}
                  <span class="hint">Blindagem contra alucinações e respostas imprecisas.</span>
                </div>
                <div class="f"><label>Assuntos Fora de Escopo (Filtro Anti-Ruído)</label>
                  ${fta("ia.foraEscopo", "Ex.: Política, futebol, receitas caseiras, assuntos pessoais não relacionados à instituição.")}
                  <span class="hint">A IA recusa educadamente assuntos sem relação com o negócio.</span>
                </div>
              </div>
            `
          })}

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1.5px solid var(--color-border)">
            <button class="btn btn-s" onclick="setIaSubStep(2)">← 2. Persona</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(4)">Continuar: 4. Fluxos de Atendimento →</button>
          </div>
        `;
      } else if (etapa === 4) {
        contentHtml = `
          ${!S.operacao.setores.length ? `<div class="note warn" style="margin-bottom:14px">Cadastre os setores no bloco de Horário e Filas para vinculá-los aqui como destinos de transbordo.</div>` : ""}
          
          ${subCard({
            kicker: "Triagem Prévia",
            title: "Fluxos de Qualificação e Triagem Prévia *",
            desc: "Roteiro de perguntas sequenciais (uma por vez) que a IA realiza para qualificar a conversa antes de transferir ao setor correto.",
            actions: `
              <button type="button" class="btn btn-s" onclick="addIaFluxo()">+ Adicionar Fluxo</button>
              <button type="button" class="btn-chip template" onclick="loadPreAtendSaude()">Modelo Saúde</button>
              <button type="button" class="btn-chip template" onclick="loadPreAtendComercial()">Modelo Comercial</button>
            `,
            content: `
              <div style="margin-bottom:16px">
                ${fluxos.map((f, fi) => `
                  <div class="flow-card">
                    <div class="flow-card-head">
                      <div style="display:flex;align-items:center;gap:10px;flex:1">
                        <div style="flex:1">
                          <label style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--color-muted);font-weight:700;margin-bottom:2px;display:block">Nome do Fluxo ${fi + 1}</label>
                          <input type="text" class="flow-title-input" value="${esc(f.nome)}" placeholder="Ex.: Consultas, Exames, Remarcações, Financeiro" oninput="setIaFluxoNome(${fi}, this.value)">
                        </div>
                      </div>
                      <button class="rowdel" title="Excluir fluxo inteiro" onclick="delIaFluxo(${fi})" style="font-size:18px;margin-top:14px">×</button>
                    </div>

                    <div style="margin-bottom:12px">
                      <label style="font-size:11.5px;font-weight:600;color:var(--color-fg-2);margin-bottom:6px;display:block">Perguntas Sequenciais (coletadas uma a uma pela IA antes do transbordo):</label>
                      ${(f.passos || []).map((step, pi) => `
                        <div class="step-item">
                          <span class="step-num-badge">${pi + 1}</span>
                          <input type="text" value="${esc(step)}" placeholder="Ex.: Qual o CPF do paciente? / Qual o convênio?" oninput="setIaPasso(${fi}, ${pi}, this.value)">
                          <button class="rowdel" title="Remover este passo" onclick="delIaPasso(${fi}, ${pi})">×</button>
                        </div>
                      `).join("")}
                    </div>

                    <button type="button" class="btn-add-step" onclick="addIaPasso(${fi})">
                      + Adicionar Passo a este fluxo
                    </button>

                    <div style="margin-top:16px;padding:14px 16px;background:var(--color-surface-3);border-radius:8px;border:1px solid var(--color-border)">
                      <label style="font-size:12px;font-weight:700;color:var(--color-brand-primary);display:flex;align-items:center;gap:6px;margin:0 0 4px">
                        Fila de Destino da Transferência <span class="req">*</span>
                      </label>
                      <p style="font-size:11.5px;color:var(--color-muted);margin:0 0 8px">
                        Para qual setor / fila humana o cliente será transferido automaticamente após responder a este fluxo?
                      </p>
                      <select onchange="setIaFluxoDestino(${fi}, this.value)" style="background:#fff;border:1.5px solid ${f.destino ? 'var(--color-border)' : 'var(--color-warning)'}">
                        ${setOpts(f.destino)}
                      </select>
                      ${!f.destino ? `<span style="font-size:11.5px;color:var(--color-warning);margin-top:4px;display:block;font-weight:600">Atenção: Selecione a fila de transbordo para este fluxo para avançar.</span>` : ""}
                    </div>
                  </div>
                `).join("")}
              </div>
            `
          })}

          ${subCard({
            kicker: "Contingência",
            title: "Fila de Contingência & Fallback (Catch-All) *",
            desc: "Destino padrão caso o cliente fique fora dos fluxos previstos ou a IA não entenda a solicitação.",
            content: `
              <div class="grid2">
                <div class="f">
                  <label>Fila de transbordo por falha de entendimento <span class="req">*</span></label>
                  <select onchange="S.ia.filaFallback=this.value;soft()" style="background:#fff">${setOpts(a.filaFallback)}</select>
                </div>
                <div class="f">
                  <label>Tentativas sem entender antes de transferir</label>
                  <div class="opts">
                    ${["1|1 tentativa (imediato)", "2|2 tentativas", "3|3 tentativas (recomendado)"].map(x => {
                      const [v, l] = x.split("|");
                      return `<button class="opt sm" aria-pressed="${a.tentativasErro === v}" onclick="S.ia.tentativasErro='${v}';draw()">${l}</button>`;
                    }).join("")}
                  </div>
                </div>
              </div>
            `
          })}

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1.5px solid var(--color-border)">
            <button class="btn btn-s" onclick="setIaSubStep(3)">← 3. Contexto & Regras</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(5)">Continuar: 5. Inatividade & Encerramento →</button>
          </div>
        `;
      } else if (etapa === 5) {
        contentHtml = `
          ${subCard({
            kicker: "Inatividade",
            title: "Regras de Tempo Limite e Inatividade *",
            desc: "Ação executada quando o usuário deixa de responder a conversa no WhatsApp.",
            content: `
              <div class="grid3">
                <div class="f"><label>Tempo limite de inatividade</label><div class="opts">
                  ${["5|5 min", "10|10 min", "15|15 min", "30|30 min"].map(x => {
                    const [v, l] = x.split("|");
                    return `<button class="opt sm" aria-pressed="${a.inatTempo === v}" onclick="S.ia.inatTempo='${v}';draw()">${l}</button>`;
                  }).join("")}
                </div></div>
                <div class="f"><label>Ação ao esgotar o tempo</label><div class="opts">
                  ${["finalizar|Encerrar atendimento", "transferir|Transferir para fila"].map(x => {
                    const [v, l] = x.split("|");
                    return `<button class="opt sm" aria-pressed="${a.inatAcao === v}" onclick="S.ia.inatAcao='${v}';draw()">${l}</button>`;
                  }).join("")}
                </div></div>
                ${a.inatAcao === "transferir" ? `<div class="f"><label>Fila de destino</label><select onchange="S.ia.inatFila=this.value;soft()">${setOpts(a.inatFila)}</select></div>` : ""}
              </div>

              <div class="f" style="margin-top:14px">
                <label>Mensagem de finalização de atendimento (Opcional)</label>
                ${fta("ia.msgFinalizacao", "Ex.: Atendimento finalizado por inatividade. Caso precise de mais alguma informação, basta nos enviar uma nova mensagem! Tenha um ótimo dia. 😊")}
                <span class="hint">Enviada automaticamente caso o atendimento seja encerrado pela IA.</span>
              </div>
            `
          })}

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1.5px solid var(--color-border)">
            <button class="btn btn-s" onclick="setIaSubStep(4)">← 4. Fluxos de Atendimento</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(6)">Continuar: 6. Base de Conhecimento →</button>
          </div>
        `;
      } else if (etapa === 6) {
        contentHtml = `
          ${subCard({
            kicker: "Fontes Oficiais",
            title: "Fontes de Consulta Oficiais & Links",
            desc: "Páginas oficiais da instituição utilizadas como fonte de verdade pelo assistente.",
            content: `
              <div class="grid2">
                ${fi("Site ou página com as informações oficiais", "ia.baseUrl", "text", "https://suaempresa.com.br")}
                <div class="f"><label>Qual a frequência de atualização da FAQ?</label><div class="opts">
                  ${["diaria|Diária", "semanal|Semanal / Quinzenal", "mensal|Mensal", "demanda|Sob Demanda", "api|Tempo Real (API)"].map(x => {
                    const [v, l] = x.split("|");
                    return `<button class="opt sm" aria-pressed="${a.faqFreq === v}" onclick="S.ia.faqFreq='${v}';draw()">${l}</button>`;
                  }).join("")}
                </div></div>
              </div>

              <div class="f" style="margin-top:12px">
                <label>Links adicionais de consulta</label>
                ${links.map((l, li) => `
                  <div style="display:flex;gap:8px;margin-bottom:6px">
                    <input type="text" value="${esc(l)}" placeholder="https://suaempresa.com.br/preparo-de-exames" oninput="setIaLink(${li}, this.value)">
                    <button class="rowdel" title="Remover link" onclick="delIaLink(${li})">×</button>
                  </div>
                `).join("")}
                <button type="button" class="btn-chip" style="margin-top:4px" onclick="addIaLink()">+ Adicionar Link Adicional</button>
              </div>

              <div class="f" style="margin-top:12px">
                <label>Texto escrito / Procedimentos e FAQ Manual</label>
                ${fta("ia.faqTexto", "Insira aqui textos informativos, listas de exames, tabelas de valores particulares, rotinas de preparo ou respostas prontas para perguntas frequentes...")}
                <span class="hint">Textos inseridos aqui são incorporados diretamente ao conhecimento da IA.</span>
              </div>
            `
          })}

          ${subCard({
            kicker: "Documentos",
            title: "Upload de Documentos e Manuais de Treinamento",
            desc: "Anexe arquivos em PDF, DOCX, XLSX ou TXT para a base de conhecimento RAG da IA.",
            content: `
              <div class="file-upload-zone" onclick="document.getElementById('ia_file_upload_input').click()">
                <input type="file" id="ia_file_upload_input" style="display:none" onchange="if(this.files[0]){addIaArquivo(this.files[0].name, Math.round(this.files[0].size/1024)+' KB');this.value=''}">
                <b>Clique para selecionar arquivos</b> (PDFs, Tabelas, Manuais, Documentos)
                <span class="hint">Suporta arquivos PDF, DOCX, XLSX ou TXT para treinamento e consulta do assistente</span>
              </div>
              ${arquivos.length ? `
                <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">
                  ${arquivos.map((arq, ai) => `
                    <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--color-border);border-radius:6px;padding:6px 12px;font-size:12.5px">
                      <span><b>${esc(arq.nome)}</b> <small style="color:var(--color-muted)">(${esc(arq.tamanho)})</small></span>
                      <button class="rowdel" title="Remover arquivo" onclick="delIaArquivo(${ai})">×</button>
                    </div>
                  `).join("")}
                </div>
              ` : ""}
            `
          })}

          ${subCard({
            kicker: "Governança",
            title: "Governança & Responsável Interno",
            desc: "Pessoa de contato na sua empresa caso o time da ORPEN precise alinhar respostas da IA.",
            content: `
              <div class="grid2">
                ${fi("Nome do Responsável", "ia.faqRespNome", "text", "Ex.: Mariana Souza")}
                ${fi("E-mail do Responsável", "ia.faqRespEmail", "email", "Ex.: mariana.souza@hospitalexemplo.com.br")}
              </div>
            `
          })}

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1.5px solid var(--color-border)">
            <button class="btn btn-s" onclick="setIaSubStep(5)">← 5. Inatividade</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="next()">Concluir Assistente de IA e Avançar →</button>
          </div>
        `;
      }

      return `<div class="card">
        ${renderBlockHeader({
          badge: "Assistente de IA",
          title: "Configuração do Agente Virtual Inteligente",
          desc: "Defina o comportamento, autonomia, personas, guardrails e fluxos de atendimento do seu assistente de IA para WhatsApp e canais digitais.",
          pendList: pend
        })}

        ${!isChat ? `
          <div class="ia-step-header">
            <div class="ia-step-header-top">
              <div class="ia-step-badge-group">
                <span class="ia-step-tag">Etapa ${etapa} de 6</span>
                <h2 class="ia-step-title-text">${curStep.full}</h2>
              </div>
              <div class="ia-step-progress-container" title="${Math.round((etapa / 6) * 100)}% concluído">
                <div class="ia-step-line-track">
                  <div class="ia-step-line-fill" style="width: ${Math.round((etapa / 6) * 100)}%"></div>
                </div>
                <span class="ia-step-pct-val">${Math.round((etapa / 6) * 100)}%</span>
              </div>
            </div>

            <div class="ia-mini-steps">
              ${subSteps.map(s => `
                <button type="button" class="ia-mini-step-btn ${etapa === s.n ? 'active' : ''} ${isIaStepDone(s.n) ? 'done' : ''}" onclick="setIaSubStep(${s.n})" title="${esc(s.full)}">
                  <span class="ia-mini-step-dot">${isIaStepDone(s.n) ? '✅' : s.n}</span>
                  <span class="ia-mini-step-name">${esc(s.lbl.replace(/^\d+\.\s*/, ''))}</span>
                </button>
              `).join("")}
            </div>
          </div>
          <p class="lede" style="margin-top:-6px;margin-bottom:18px;font-size:13px;color:var(--color-muted)">${curStep.desc}</p>
        ` : ""}

        ${contentHtml}
      </div>`;
    }
  },

  {
    id: "ia_v2", nome: "Assistente de IA (V2)", when: () => S.contrato.ia,
    check() {
      const p = [];
      if (!S.ia.v2Messages || S.ia.v2Messages.length <= 1) {
        p.push("Iniciar entrevista com a IA");
      }
      return p;
    },
    render() {
      return renderIaV2Chat();
    }
  },

  {
    id: "integ", nome: "Integração", when: () => S.contrato.integracao,
    check() {
      const p = [], g = S.integ;
      if (!g.sistema) p.push("Nome do sistema a integrar");
      if (!g.temApi) p.push("Informar se o sistema tem API");
      if (!g.contatoNome || !vEmail(g.contatoEmail)) p.push("Contato técnico da integração");
      if (!g.casos.length) p.push("O que a integração precisa fazer");
      return p;
    },
    render() {
      const g = S.integ;
      const pend = this.check();
      return `<div class="card">
        ${renderBlockHeader({
          badge: "Sistemas & APIs",
          title: "Integração com Sistema de Gestão / CRM",
          desc: "Conexão com ERPs, CRMs e sistemas legados para consulta de dados, agendamento de consultas ou atualização de cadastros.",
          pendList: pend
        })}
        ${subCard({
          kicker: "Conexão",
          title: "Sistema e Documentação de API *",
          desc: "Identificação da plataforma e disponibilidade de endpoints.",
          content: `
            <div class="grid2">
              ${fi("Nome do Sistema / Software", "integ.sistema", "text", "Ex.: IRIS, Tasy, MV, Protheus, Totvs, Salesforce")}
              <div class="f"><label>Possui API REST / Webhook disponível? <span class="req">*</span></label><div class="opts">
                <button class="opt sm" aria-pressed="${g.temApi === 'sim'}" onclick="S.integ.temApi='sim';draw()">Sim, tem API aberta</button>
                <button class="opt sm" aria-pressed="${g.temApi === 'nao'}" onclick="S.integ.temApi='nao';draw()">Não tem API</button>
                <button class="opt sm" aria-pressed="${g.temApi === 'nsei'}" onclick="S.integ.temApi='nsei';draw()">Não sei</button>
              </div></div>
            </div>
            ${g.temApi === 'nao' ? `<div class="note warn" style="margin-top:10px">Sem API aberta, a viabilidade técnica será analisada diretamente com o fornecedor do software.</div>` : ""}
            ${g.temApi === 'sim' ? `<div style="margin-top:10px">${fi("Link da Documentação Técnica da API", "integ.docUrl", "text", "https://api.seusistema.com.br/docs")}</div>` : ""}
          `
        })}
        ${subCard({
          kicker: "Automação",
          title: "Casos de Uso Desejados na Integração *",
          desc: "Selecione quais ações automáticas devem ser integradas ao fluxo da ORPEN e da IA.",
          content: `
            <div class="opts">
              ${["Consultar agendamentos do paciente", "Marcar ou remarcar consulta", "Consultar status de exame", "Identificar o cliente pelo telefone", "Enviar documento ou laudo", "Registrar o atendimento no sistema"].map(c =>
                `<button class="opt sm" aria-pressed="${g.casos.includes(c)}" onclick="togCaso('${c}')">${c}</button>`).join("")}
            </div>
            <div class="note info" style="margin-top:14px"><b>Segurança e Credenciais:</b> Chaves de API e senhas não devem ser enviadas neste formulário. A ORPEN disponibilizará um cofre seguro e temporário para o time de TI homologar os tokens.</div>
          `
        })}
        ${subCard({
          kicker: "Suporte Técnico",
          title: "Contato Técnico do Fornecedor / Sistema *",
          desc: "Especialista técnico ou suporte do software responsável pela liberação das APIs.",
          content: `<div class="grid3">${fi("Nome Completo", "integ.contatoNome")}${fi("E-mail Técnico", "integ.contatoEmail", "email")}${fi("Telefone", "integ.contatoTel", "tel")}</div>`
        })}
        ${nav()}
      </div>`;
    }
  },

  {
    id: "revisao", nome: "Revisão", when: () => true,
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
                  <button class="btn btn-s" style="padding:4px 10px;font-size:12px" onclick="go('${p.id}')">Preencher Agora</button>
                </div>
              `).join("")}
            </div>
          ` : `<div class="note info">Ambiente 100% configurado! Ao enviar, a ORPEN iniciará o provisionamento automático e liberará o acesso aos testes.</div>`
        })}
        ${subCard({
          kicker: "Documentação Suplementar",
          title: "Anexos & Documentação Suplementar",
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
          <button class="btn btn-p" onclick="enviar()">Enviar para a ORPEN</button>
          <button class="btn btn-s" onclick="baixarJSON()">Baixar JSON do Setup</button>
          <span class="hint sp">Provisionamento automático ORPEN.</span>
        </div>
      </div>`;
    }
  }
];
