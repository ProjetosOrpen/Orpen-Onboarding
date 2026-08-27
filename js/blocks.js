/* ============================================================
   DEFINIÇÃO DOS BLOCOS DO FORMULÁRIO (ORPEN SETUP)
   ============================================================ */

const BLOCKS = [
  {
    id: "contrato", nome: "Contrato", when: () => true,
    check() { const p = []; if (!S.contrato.confirmado) p.push("Confirmar os dados do contrato"); return p; },
    render() {
      const c = S.contrato;
      return `<div class="card">
        <p class="eyebrow">Bloco 1 de ${visible().length}</p>
        <h2>Confirme o que está no contrato</h2>
        <p class="lede">Estes dados já vieram do seu contrato com a ORPEN. Você só precisa conferir — se algo estiver diferente, escreva no campo abaixo e seu AM ajusta.</p>
        <div class="grid2">
          ${ro("Razão social", c.razaoSocial)}${ro("CNPJ", c.cnpj)}
          ${ro("Cidade", c.cidade)}${ro("Account Manager", c.am)}
          ${ro("Canais contratados", c.canais.join(" · "))}${ro("Implantação", c.implantacao)}
          ${ro("Licenças de agente", c.licAgente)}${ro("Licenças de gestor", c.licGestor)}
          ${ro("Números de WhatsApp", c.numerosWhats)}${ro("Extras", [c.integracao ? "Integração com sistema" : null, c.ia ? "Assistente de IA" : null].filter(Boolean).join(" · ") || "—")}
        </div>
        <div class="sect"><h3>Está tudo certo?</h3></div>
        <div class="opts" style="margin-bottom:14px">
          <button class="opt" aria-pressed="${c.confirmado}" onclick="S.contrato.confirmado=true;draw()">Sim, confirmo</button>
          <button class="opt" aria-pressed="${c.confirmado === false && c.correcao.length > 0}" onclick="S.contrato.confirmado=false;draw()">Preciso corrigir algo</button>
        </div>
        <div class="f"><label>O que precisa mudar</label>
          <textarea data-path="contrato.correcao" placeholder="Ex.: são 18 agentes, não 15.">${esc(c.correcao)}</textarea>
          <span class="hint">Seu AM recebe isso na hora e responde por aqui mesmo.</span></div>
        ${nav()}</div>`;
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
      return `<div class="card">
        <p class="eyebrow">Pessoas</p><h2>Quem responde por cada frente</h2>
        <p class="lede">Cada uma dessas pessoas recebe só a parte que é dela. Ninguém precisa preencher o formulário inteiro.</p>
        <div class="sect"><h3>Contato do projeto <span class="req">*</span></h3><p>Quem acompanha a implantação com a ORPEN no dia a dia.</p></div>
        <div class="grid2">${fi("Nome", "contatos.projNome")}${fi("Cargo", "contatos.projCargo")}${fi("E-mail", "contatos.projEmail", "email")}${fi("Telefone", "contatos.projTel", "tel")}</div>
        <div class="sect"><h3>Responsável financeiro <span class="req">*</span></h3><p>Recebe a fatura e trata reajustes.</p></div>
        <div class="grid3">${fi("Nome", "contatos.finNome")}${fi("E-mail", "contatos.finEmail", "email")}${fi("Telefone", "contatos.finTel", "tel")}</div>
        <div class="sect"><h3>Assinatura do contrato <span class="req">*</span></h3><p>Quem tem poderes para assinar.</p></div>
        <div class="grid3">${fi("Nome", "contatos.legNome")}${fi("E-mail", "contatos.legEmail", "email")}${fi("Telefone", "contatos.legTel", "tel")}</div>
        ${has("Voz") || S.contrato.integracao ? `<div class="sect"><h3>TI / infraestrutura</h3><p>Necessário para liberar firewall, apontar SIP e tratar a integração.</p></div>
        <div class="grid3">${fi("Nome", "contatos.tiNome")}${fi("E-mail", "contatos.tiEmail", "email")}${fi("Telefone", "contatos.tiTel", "tel")}</div>` : ""}
        ${nav()}</div>`;
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
      return `<div class="card">
        <p class="eyebrow">Operação</p><h2>Quando vocês atendem e por quais filas</h2>
        <p class="lede">Os setores que você cadastrar aqui viram as filas (DAC) do ambiente — e vão aparecer sozinhos nos menus do chatbot, no cadastro dos agentes e nas regras da IA.</p>
        <div class="f"><label>Jornada</label><div class="opts">
          ${["comercial|Comercial (seg a sex)", "estendido|Estendido (inclui sábado)", "24x7|24 horas, todos os dias", "custom|Cada setor tem o seu"].map(x => {
            const [v, l] = x.split("|");
            return `<button class="opt" aria-pressed="${o.jornada === v}" onclick="S.operacao.jornada='${v}';draw()">${l}</button>`;
          }).join("")}
        </div></div>
        ${o.jornada !== "24x7" ? `<div class="grid3">
          ${fi("Segunda a sexta", "operacao.diasSem", "text", "07:30–18:00")}
          ${o.jornada !== "comercial" ? fi("Sábado", "operacao.sabado", "text", "08:00–12:00") : ""}
          ${o.jornada === "24x7" ? "" : fi("Domingo e feriados", "operacao.domingo", "text", "não atende")}
        </div>` : ""}
        <div class="sect"><h3>Setores / filas <span class="req">*</span></h3><p>O código DAC é o número da fila dentro da plataforma. Se não souber, deixe a sugestão.</p></div>
        ${o.setores.length ? `<table><thead><tr><th style="width:44%">Setor</th><th style="width:20%">DAC</th><th>Horário</th><th style="width:36px"></th></tr></thead><tbody>
          ${o.setores.map((s, i) => `<tr>
            <td><input type="text" value="${esc(s.nome)}" oninput="S.operacao.setores[${i}].nome=this.value;soft()"></td>
            <td><input type="text" class="mono ${/^\d{3,5}$/.test(s.dac || "") ? "" : "bad"}" value="${esc(s.dac)}" oninput="S.operacao.setores[${i}].dac=this.value;soft()"></td>
            <td><input type="text" value="${esc(s.horario)}" oninput="S.operacao.setores[${i}].horario=this.value;soft()"></td>
            <td><button class="rowdel" onclick="S.operacao.setores.splice(${i},1);draw()">×</button></td></tr>`).join("")}
        </tbody></table>` : `<div class="note info">Nenhum setor ainda. Comece por um modelo pronto e ajuste o que quiser.</div>`}
        <div class="navrow" style="margin-top:12px">
          <button class="btn btn-s" onclick="addSetor()">+ Setor</button>
          <button class="btn-g" onclick="loadTpl('saude','setores')">Usar modelo de saúde</button>
          <button class="btn-g" onclick="loadTpl('generico','setores')">Usar modelo genérico</button>
        </div>
        ${nav()}</div>`;
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
      const setOpts = v => `<option value="">—</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)}</option>`).join("");
      return `<div class="card">
        <p class="eyebrow">Equipe</p><h2>Quem vai atender</h2>
        <p class="lede">Cole direto do seu Excel ou RH — uma pessoa por linha, com nome, e-mail e setor separados por tabulação, vírgula ou ponto e vírgula. Os logins são gerados e validados na hora.</p>
        <div class="f"><label>Colar lista de agentes</label>
          <textarea id="bulk" placeholder="Maria Souza	maria@empresa.com.br	Agendamento\nJoão Lima	joao@empresa.com.br	Recepção / Triagem"></textarea>
          <div class="navrow"><button class="btn btn-p" onclick="parseBulk()">Importar lista</button>
          <button class="btn btn-s" onclick="addAgente()">+ Adicionar um</button></div></div>
        ${over ? `<div class="note warn"><b>${e.agentes.length} agentes para ${S.contrato.licAgente} licenças.</b> Remova ${e.agentes.length - S.contrato.licAgente} ou fale com seu AM sobre licenças adicionais.</div>` : ""}
        ${e.agentes.length ? `<table><thead><tr><th style="width:15%">Login</th><th style="width:28%">Nome</th><th style="width:30%">E-mail</th><th>Setor</th><th style="width:36px"></th></tr></thead><tbody>
          ${e.agentes.map((a, i) => `<tr>
            <td><input type="text" class="mono ${vLogin(a.login) ? "" : "bad"}" value="${esc(a.login)}" oninput="S.equipe.agentes[${i}].login=this.value;soft()"></td>
            <td><input type="text" value="${esc(a.nome)}" oninput="S.equipe.agentes[${i}].nome=this.value;soft()"></td>
            <td><input type="text" class="${vEmail(a.email) ? "" : "bad"}" value="${esc(a.email)}" oninput="S.equipe.agentes[${i}].email=this.value;soft()"></td>
            <td><select onchange="S.equipe.agentes[${i}].setor=this.value;soft()">${setOpts(a.setor)}</select></td>
            <td><button class="rowdel" onclick="S.equipe.agentes.splice(${i},1);draw()">×</button></td></tr>`).join("")}
        </tbody></table>
        <p class="hint" style="margin-top:8px">Login: só números, não pode começar com 0, mínimo de 3 dígitos.</p>` : ""}
        <div class="sect"><h3>Gestores <span class="req">*</span></h3><p>Acessam relatórios, monitoram filas e configuram o ambiente. ${S.contrato.licGestor} licenças no contrato.</p></div>
        ${e.gestores.length ? `<table><thead><tr><th style="width:32%">Nome</th><th style="width:36%">E-mail</th><th>Setor</th><th style="width:36px"></th></tr></thead><tbody>
          ${e.gestores.map((g, i) => `<tr>
            <td><input type="text" value="${esc(g.nome)}" oninput="S.equipe.gestores[${i}].nome=this.value;soft()"></td>
            <td><input type="text" class="${vEmail(g.email) ? "" : "bad"}" value="${esc(g.email)}" oninput="S.equipe.gestores[${i}].email=this.value;soft()"></td>
            <td><select onchange="S.equipe.gestores[${i}].setor=this.value;soft()">${setOpts(g.setor)}</select></td>
            <td><button class="rowdel" onclick="S.equipe.gestores.splice(${i},1);draw()">×</button></td></tr>`).join("")}
        </tbody></table>` : ""}
        <div class="navrow" style="margin-top:10px"><button class="btn btn-s" onclick="addGestor()">+ Gestor</button></div>
        <div class="sect"><h3>O nome do agente aparece para o cliente?</h3></div>
        <div class="opts">
          <button class="opt" aria-pressed="${e.nomeVisivel}" onclick="S.equipe.nomeVisivel=true;draw()">Sim</button>
          <button class="opt" aria-pressed="${!e.nomeVisivel}" onclick="S.equipe.nomeVisivel=false;draw()">Não</button></div>
        ${nav()}</div>`;
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
      return `<div class="card">
        <p class="eyebrow">Classificação e qualidade</p><h2>Como cada atendimento é encerrado</h2>
        <div class="note info">A tabulação é o que o agente escolhe ao fechar a conversa. É de onde saem quase todos os relatórios.</div>
        <div class="sect"><h3>Tabulações <span class="req">*</span></h3><p>Comece por um modelo e ajuste. Evite mais de 12 opções.</p></div>
        ${tagBox("classif.tabulacoes", "Ex.: Agendamento realizado")}
        <div class="navrow"><button class="btn-g" onclick="loadTpl('saude','tabulacoes')">Modelo de saúde</button>
          <button class="btn-g" onclick="loadTpl('generico','tabulacoes')">Modelo genérico</button></div>
        <div class="sect"><h3>Pausas <span class="req">*</span></h3><p>Motivos que o agente pode selecionar ao sair do atendimento.</p></div>
        ${tagBox("classif.pausas", "Ex.: Almoço")}
        <div class="navrow"><button class="btn-g" onclick="loadTpl('saude','pausas')">Modelo de saúde</button>
          <button class="btn-g" onclick="loadTpl('generico','pausas')">Modelo genérico</button></div>
        <div class="sect"><h3>Pesquisa de satisfação</h3></div>
        <div class="opts" style="margin-bottom:14px">
          <button class="opt" aria-pressed="${c.pesquisa}" onclick="S.classif.pesquisa=true;draw()">Aplicar pesquisa</button>
          <button class="opt" aria-pressed="${!c.pesquisa}" onclick="S.classif.pesquisa=false;draw()">Não aplicar</button></div>
        ${c.pesquisa ? `<div class="f"><label>Quando enviar</label><div class="opts">
          <button class="opt sm" aria-pressed="${c.pesquisaQuando === 'sempre'}" onclick="S.classif.pesquisaQuando='sempre';draw()">A cada atendimento</button>
          <button class="opt sm" aria-pressed="${c.pesquisaQuando === 'amostra'}" onclick="S.classif.pesquisaQuando='amostra';draw()">Em parte deles</button>
          <button class="opt sm" aria-pressed="${c.pesquisaQuando === '24h'}" onclick="S.classif.pesquisaQuando='24h';draw()">No máximo 1× por dia por cliente</button>
        </div></div>
        <div class="f"><label>Texto da pesquisa</label><textarea data-path="classif.pesquisaTexto" style="min-height:130px">${esc(c.pesquisaTexto)}</textarea>
        <span class="hint">Padrão ORPEN pré-carregado. Edite se desejar.</span></div>` : ""}
        ${nav()}</div>`;
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
      return `<div class="card">
        <p class="eyebrow">Canal</p><h2>WhatsApp</h2>
        <div class="grid2">
          ${fi("Número para a plataforma (DDD + número)", "whats.numero", "tel", "51 3000-0000")}
          <div class="f"><label>Esse número já está em uso no WhatsApp? <span class="req">*</span></label><div class="opts">
            <button class="opt" aria-pressed="${w.emUso === 'nao'}" onclick="S.whats.emUso='nao';draw()">Não, é novo</button>
            <button class="opt" aria-pressed="${w.emUso === 'sim'}" onclick="S.whats.emUso='sim';draw()">Sim, está ativo</button>
          </div></div></div>
        ${w.emUso === "sim" ? `
        <div class="note warn"><b>Atenção: o número precisa ser preparado antes da virada.</b> No dia da ativação a conta atual é excluída e o histórico não vem junto. Marque cada item quando concluído:</div>
        ${[["backup", "Fazer backup das conversas do celular", "O histórico anterior não é importado para a plataforma."],
           ["grupos", "Sair de todos os grupos desse número", "Grupos não funcionam na API Oficial."],
           ["exclusao", "Excluir a conta WhatsApp na data da ativação", "Feito junto com a ORPEN, no horário combinado."],
           ["contatos", "Exportar a agenda de contatos", "Opcional — permite importar os contatos para a plataforma."]]
          .map(([k, t, s]) => `<div class="pre">
            <input type="checkbox" ${w.pre[k] ? "checked" : ""} onchange="S.whats.pre.${k}=this.checked;draw()">
            <div><p>${t}</p><p class="sub">${s}</p></div>
            <input type="text" placeholder="Responsável" value="${esc(w.preResp[k])}" oninput="S.whats.preResp.${k}=this.value;soft()">
          </div>`).join("")}
        <div class="f" style="margin-top:16px"><label>Data desejada para a virada</label>
          <input type="date" value="${esc(w.dataAtivacao)}" oninput="S.whats.dataAtivacao=this.value;soft()" style="max-width:220px"></div>` : ""}
        <div class="sect"><h3>Mensagens do canal</h3></div>
        <div class="f"><label>M01 · Recepção dentro do horário <span class="req">*</span></label>
          <textarea data-path="whats.m01" placeholder="Olá! Bem-vindo ao ...">${esc(w.m01)}</textarea>
          <button class="btn-g" onclick="sugerirM01()">Montar a partir dos meus setores</button></div>
        <div class="f"><label>M02 · Fora do horário <span class="req">*</span></label>
          <textarea data-path="whats.m02" placeholder="Nosso atendimento funciona de ...">${esc(w.m02)}</textarea>
          <button class="btn-g" onclick="sugerirM02()">Montar a partir do meu horário</button></div>
        <div class="f"><label>O que fazer com uma conversa nova fora do horário</label><div class="opts">
          <button class="opt sm" aria-pressed="${w.foraHorario === 'fila'}" onclick="S.whats.foraHorario='fila';draw()">Guardar na fila para o dia seguinte</button>
          <button class="opt sm" aria-pressed="${w.foraHorario === 'encerra'}" onclick="S.whats.foraHorario='encerra';draw()">Encerrar após a mensagem</button>
        </div></div>
        <div class="f"><label>Avisar o cliente quando o atendimento for finalizado?</label><div class="opts">
          <button class="opt sm" aria-pressed="${w.avisarFim}" onclick="S.whats.avisarFim=true;draw()">Sim</button>
          <button class="opt sm" aria-pressed="${!w.avisarFim}" onclick="S.whats.avisarFim=false;draw()">Não</button></div></div>
        ${w.avisarFim ? `<div class="f"><label>M03 · Atendimento finalizado</label><textarea data-path="whats.m03">${esc(w.m03)}</textarea></div>` : ""}
        ${nav()}</div>`;
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
      const setOpts = v => `<option value="">Escolha o setor…</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)} · DAC ${esc(s.dac)}</option>`).join("");
      return `<div class="card">
        <p class="eyebrow">Jornada</p><h2>O menu que o cliente vê</h2>
        <p class="lede">Cada opção do menu leva a um setor, a um submenu ou a uma resposta pronta.</p>
        ${!S.operacao.setores.length ? `<div class="note warn">Cadastre os setores primeiro — as opções de transferência vêm de lá.</div>` : ""}
        ${b.opcoes.map((o, i) => `<div class="node">
          <div class="hd"><span class="keycap">${i + 1}</span>
            <input type="text" placeholder="Rótulo da opção. Ex.: Agendar consulta" value="${esc(o.rotulo)}" oninput="S.bot.opcoes[${i}].rotulo=this.value;soft()">
            <button class="rowdel" onclick="S.bot.opcoes.splice(${i},1);draw()">×</button></div>
          <div class="opts" style="margin-bottom:9px">
            ${["transferir|Transferir para setor", "submenu|Abrir submenu", "mensagem|Responder e encerrar"].map(x => {
              const [v, l] = x.split("|");
              return `<button class="opt sm" aria-pressed="${o.acao === v}" onclick="S.bot.opcoes[${i}].acao='${v}';draw()">${l}</button>`;
            }).join("")}
          </div>
          ${o.acao === "transferir" ? `<select onchange="S.bot.opcoes[${i}].destino=this.value;soft()">${setOpts(o.destino)}</select>` : ""}
          ${o.acao === "mensagem" ? `<textarea placeholder="Resposta enviada ao cliente" oninput="S.bot.opcoes[${i}].texto=this.value;soft()">${esc(o.texto || "")}</textarea>` : ""}
          ${o.acao === "submenu" ? `<div class="sub-node">
            <textarea placeholder="Pergunta do submenu" oninput="S.bot.opcoes[${i}].texto=this.value;soft()">${esc(o.texto || "")}</textarea>
            ${(o.filhos || []).map((f, j) => `<div class="hd" style="margin-top:8px"><span class="keycap">${i + 1}.${j + 1}</span>
              <input type="text" placeholder="Opção do submenu" value="${esc(f.rotulo)}" oninput="S.bot.opcoes[${i}].filhos[${j}].rotulo=this.value;soft()">
              <select onchange="S.bot.opcoes[${i}].filhos[${j}].destino=this.value;soft()" style="max-width:230px">${setOpts(f.destino)}</select>
              <button class="rowdel" onclick="S.bot.opcoes[${i}].filhos.splice(${j},1);draw()">×</button></div>`).join("")}
            <button class="btn-g" onclick="addFilho(${i})">+ opção do submenu</button>
          </div>` : ""}
        </div>`).join("")}
        <div class="navrow"><button class="btn btn-s" onclick="addOpcao()">+ Opção do menu</button>
          ${S.operacao.setores.length ? `<button class="btn-g" onclick="botFromSetores()">Gerar menu a partir dos setores</button>` : ""}</div>
        ${b.opcoes.length ? `<div class="sect"><h3>Prévia da conversa</h3></div>
        <div class="note info" style="white-space:pre-wrap;font-family:'IBM Plex Sans'">${esc(previewBot())}</div>` : ""}
        ${nav()}</div>`;
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
      return `<div class="card">
        <p class="eyebrow">Canal</p><h2>Telefonia</h2>
        <div class="grid2">
          ${fi("Operadora atual", "voz.operadora", "text", "Algar, Directcall, Vivo…")}
          ${fi("Chamadas simultâneas contratadas", "voz.simultaneas", "text", "Ex.: 10")}</div>
        <div class="f"><label>Como a ORPEN se conecta à sua telefonia <span class="req">*</span></label><div class="opts">
          <button class="opt" aria-pressed="${v.entroncamento === 'sip'}" onclick="S.voz.entroncamento='sip';draw()">SIP direto com a operadora</button>
          <button class="opt" aria-pressed="${v.entroncamento === 'legada'}" onclick="S.voz.entroncamento='legada';draw()">SIP com a central que já temos</button>
          <button class="opt" aria-pressed="${v.entroncamento === 'nsei'}" onclick="S.voz.entroncamento='nsei';draw()">Não sei — quero ajuda da ORPEN</button></div></div>
        ${v.entroncamento === 'nsei' ? `<div class="note warn">Marcamos uma call técnica de 30 minutos com seu time de TI e a operadora.</div>` : ""}
        <div class="f"><label>A ORPEN será a única central telefônica? <span class="req">*</span></label><div class="opts">
          <button class="opt" aria-pressed="${v.unica === 'sim'}" onclick="S.voz.unica='sim';draw()">Sim</button>
          <button class="opt" aria-pressed="${v.unica === 'nao'}" onclick="S.voz.unica='nao';draw()">Não, vai coexistir com outra</button></div></div>
        ${v.unica === 'nao' ? `<div class="f">${fi("Qual central permanece e para quê", "voz.coexistencia", "text", "Ex.: PABX do bloco cirúrgico")}</div>` : ""}
        <div class="f"><label>Vai ter URA (atendimento automático)? <span class="req">*</span></label><div class="opts">
          <button class="opt" aria-pressed="${v.ura === 'sim'}" onclick="S.voz.ura='sim';draw()">Sim</button>
          <button class="opt" aria-pressed="${v.ura === 'nao'}" onclick="S.voz.ura='nao';draw()">Não</button></div></div>
        ${v.ura === 'sim' ? `<div class="f"><label>Tamanho da URA</label><div class="opts">
            ${["1|1 nível", "2|2 níveis", "3|3 ou mais níveis"].map(x => {
              const [k, l] = x.split("|");
              return `<button class="opt sm" aria-pressed="${v.uraNiveis === k}" onclick="S.voz.uraNiveis='${k}';draw()">${l}</button>`;
            }).join("")}
          </div></div>` : ""}
        ${v.ura === 'nao' ? fi("Para onde vão as chamadas de entrada", "voz.destinoSemUra", "text", "Ex.: direto para a fila Recepção") : ""}
        <div class="grid2">${fi("Agentes de voz (Fullchannel)", "voz.agentesWeb", "text", "Ex.: 15")}${fi("Ramais comuns, só voz", "voz.ramais", "text", "Ex.: 20")}</div>
        <div class="f"><label>Recursos adicionais</label><div class="opts">
          <button class="opt sm" aria-pressed="${v.callback}" onclick="S.voz.callback=!S.voz.callback;draw()">Callback</button>
          <button class="opt sm" aria-pressed="${v.whatsback}" onclick="S.voz.whatsback=!S.voz.whatsback;draw()">Whatsback</button></div></div>
        ${nav()}</div>`;
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
      const etapa = a._etapa || 1;
      const setOpts = v => `<option value="">Escolha a fila / DAC…</option>` + S.operacao.setores.map(s => `<option value="${esc(s.nome)}" ${v === s.nome ? "selected" : ""}>${esc(s.nome)} · DAC ${esc(s.dac)}</option>`).join("");
      const idi = a.idiomas || ["Português (Brasil)"];
      const fluxos = a.fluxosPreAtendimento || [];
      const links = a.linksAdicionais || [];
      const arquivos = a.arquivos || [];
      const topicos = a.topicosTransbordo || [];

      const subSteps = [
        { n: 1, lbl: "1. Expectativas", full: "1. Alinhamento de Expectativas", desc: "Qual o objetivo central e qual indicador define o sucesso do projeto." },
        { n: 2, lbl: "2. Persona", full: "2. Identidade, Persona e Comunicação", desc: "Como o assistente se apresenta, quais idiomas fala e como formata mensagens." },
        { n: 3, lbl: "3. Contexto & Regras", full: "3. Contexto do Negócio e Objetivos", desc: "Defina o que a IA resolve com autonomia total, os assuntos de transbordo e o que ela nunca deve fazer." },
        { n: 4, lbl: "4. Fluxos", full: "4. Fluxos de Atendimento", desc: "Roteiro de perguntas sequenciais (uma por vez) que a IA realiza para qualificar o atendimento antes de transferir ao atendente, estruturado por cada fluxo." },
        { n: 5, lbl: "5. Inatividade", full: "5. Inatividade e Encerramento", desc: "Controle de tempo e ação quando o cliente para de responder." },
        { n: 6, lbl: "6. Conhecimento", full: "6. Base de Conhecimento e Governança", desc: "Fontes de dados oficiais, procedimentos, arquivos anexos e responsáveis de contato." }
      ];
      const curStep = subSteps[etapa - 1] || subSteps[0];

      let contentHtml = "";

      if (etapa === 1) {
        contentHtml = `
          <div class="f">
            <label>Qual processo você gostaria de otimizar com a IA? <span class="req">*</span></label>
            ${fta("ia.processoOtimizar", "Ex.: Atendimento inicial no WhatsApp, esclarecimento de dúvidas repetitivas de convênios/preparo de exames e triagem prévia de agendamento antes de transferir para a equipe humana.")}
            <div class="chip-row">
              <span class="chip-label">Sugestões rápidas:</span>
              <button type="button" class="btn-chip" onclick="appendIaField('ia.processoOtimizar','Reduzir o tempo de espera no WhatsApp e triar pacientes')">💡 Triagem de Pacientes</button>
              <button type="button" class="btn-chip" onclick="appendIaField('ia.processoOtimizar','Qualificar leads comerciais e agendar demonstrações')">💡 Qualificação de Leads</button>
              <button type="button" class="btn-chip" onclick="appendIaField('ia.processoOtimizar','Atendimento de dúvidas frequentes 24/7 sem sobrecarregar a recepção')">💡 Atendimento 24/7</button>
            </div>
          </div>
          <div class="f">
            <label>Qual métrica de sucesso você deseja atingir com essa implementação? <span class="req">*</span></label>
            ${fta("ia.kpis", "Ex.: Taxa de resolução no 1º contato acima de 40%, redução do Tempo Médio de Espera (TME) em 50%, nota CSAT/NPS superior a 4.5 e zero transbordos sem qualificação prévia.")}
          </div>

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
            <button class="btn btn-s" onclick="prev()">← Bloco Anterior</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(2)">Continuar: 2. Persona & Comunicação →</button>
          </div>
        `;
      } else if (etapa === 2) {
        contentHtml = `
          <div class="grid2">
            ${fi("Nome da IA", "ia.nome", "text", "Ex.: Luna, Ires, Sofia, Max")}
            <div class="f"><label>Tamanho médio das respostas <span class="req">*</span></label><div class="opts">
              ${["curta|Curta (2 a 3 frases)", "media|Média (4 a 6 linhas)", "flexivel|Flexível"].map(x => {
                const [v, l] = x.split("|");
                return `<button class="opt sm" aria-pressed="${a.extensaoResp === v}" onclick="S.ia.extensaoResp='${v}';draw()">${l}</button>`;
              }).join("")}
            </div></div>
          </div>
          <div class="f"><label>Tom de Voz <span class="req">*</span></label><div class="opts">
            ${["Cordial e acolhedor", "Formal e institucional", "Direto e objetivo", "Técnico e consultivo"].map(t =>
              `<button class="opt sm" aria-pressed="${(a.tom || []).includes(t)}" onclick="togIaTom('${t}')">${t}</button>`).join("")}
          </div></div>

          <div class="f">
            <label>Idiomas falados pela IA</label>
            <div class="opts" style="margin-bottom:8px">
              ${["Português (Brasil)", "Inglês", "Espanhol", "Francês"].map(lang =>
                `<button class="opt sm" aria-pressed="${idi.includes(lang)}" onclick="togIaIdioma('${lang}')">${lang}</button>`).join("")}
            </div>
            <input type="text" placeholder="Outro idioma — digite e pressione Enter para adicionar" onkeydown="if(event.key==='Enter'){event.preventDefault();addIaIdiomaCustom(this.value);this.value=''}">
          </div>

          <div class="grid2">
            <div class="f"><label>Uso de Emojis</label><div class="opts">
              ${["nenhum|Sem emojis", "moderado|Moderado (máx 1)", "livre|Humanizado / Livre"].map(x => {
                const [v, l] = x.split("|");
                return `<button class="opt sm" aria-pressed="${a.emojiUso === v}" onclick="S.ia.emojiUso='${v}';draw()">${l}</button>`;
              }).join("")}
            </div></div>
            ${a.emojiUso !== "nenhum" ? fi("Emojis permitidos / restrições", "ia.emojisPermitidos", "text", "Ex.: Permitidos: 💙, 👋, 🏥, ✅ | Proibidos: ❤️, 😂") : ""}
          </div>

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
            <button class="btn btn-s" onclick="setIaSubStep(1)">← 1. Expectativas</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(3)">Continuar: 3. Contexto & Regras →</button>
          </div>
        `;
      } else if (etapa === 3) {
        contentHtml = `
          <div class="f"><label>Tópicos que a IA resolve sozinha (Autonomia Total) <span class="req">*</span></label>
            ${fta("ia.habilidades", "Ex.:\n- Endereço e horários de funcionamento das unidades\n- Relação de convênios atendidos e planos aceitos\n- Orientações e preparos básicos de exames\n- Envio de links seguros para agendamento online")}
            <span class="hint">Assuntos em que a IA responde e conclui a dúvida do cliente sem precisar de atendente.</span>
          </div>

          <div class="f">
            <label>Quais assuntos ela deve passar ao atendente? (Transbordo Humano) <span class="req">*</span></label>
            <span class="hint" style="margin-bottom:8px;display:block">Adicione os assuntos que exigem transferência para um atendente humano. Cada assunto gera automaticamente um fluxo na próxima etapa (Fluxos de Atendimento).</span>

            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
              ${topicos.map((topico, ti) => `
                <div class="step-item">
                  <span class="step-num-badge">📌</span>
                  <input type="text" value="${esc(topico)}" placeholder="Ex.: Consultas e Agendamentos" oninput="setIaTopicoTransbordo(${ti}, this.value)">
                  <button class="rowdel" title="Remover assunto" onclick="delIaTopicoTransbordo(${ti})">×</button>
                </div>
              `).join("")}
            </div>

            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
              <input type="text" id="novo_topico_input" placeholder="Digite um novo assunto e pressione Enter..." onkeydown="if(event.key==='Enter'){event.preventDefault();addIaTopicoTransbordo(this.value);this.value='';}">
              <button type="button" class="btn btn-s" onclick="const inp=document.getElementById('novo_topico_input');if(inp.value.trim()){addIaTopicoTransbordo(inp.value.trim());inp.value='';}">➕ Adicionar Assunto</button>
            </div>

            <div class="chip-row">
              <span class="chip-label">Sugestões rápidas:</span>
              <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Consultas e Agendamentos')">💡 Consultas e Agendamentos</button>
              <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Exames e Preparos')">💡 Exames e Preparos</button>
              <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Remarcações e Cancelamentos')">💡 Remarcações e Cancelamentos</button>
              <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Financeiro e Faturamento')">💡 Financeiro e Faturamento</button>
              <button type="button" class="btn-chip" onclick="addIaTopicoTransbordo('Cirurgias e Procedimentos')">💡 Cirurgias e Procedimentos</button>
            </div>
          </div>

          <div class="grid2">
            <div class="f"><label>O que ela NUNCA deve fazer (Restrições / Anti-Alucinação) <span class="req">*</span></label>
              ${fta("ia.restricoes", "Ex.:\n- Proibido dar parecer médico, diagnósticos ou interpretar exames\n- Não confirmar cobertura sem consulta à operadora\n- Não prometer procedimentos cirúrgicos ou descontos fora da tabela")}
              <span class="hint">Regra mandatória de segurança jurídica e operacional.</span>
            </div>
            <div class="f"><label>Assuntos Fora de Escopo (Filtro Anti-Ruído)</label>
              ${fta("ia.foraEscopo", "Ex.: Política, futebol, receitas caseiras, assuntos pessoais não relacionados à instituição.")}
              <span class="hint">A IA recusa educadamente assuntos sem relação com o negócio.</span>
            </div>
          </div>

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
            <button class="btn btn-s" onclick="setIaSubStep(2)">← 2. Persona</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(4)">Continuar: 4. Fluxos de Atendimento →</button>
          </div>
        `;
      } else if (etapa === 4) {
        contentHtml = `
          ${!S.operacao.setores.length ? `<div class="note warn" style="margin-bottom:14px">Cadastre os setores no bloco de Horário e Filas para vinculá-los aqui como destinos de transbordo.</div>` : ""}
          <div style="margin-bottom:20px">
            ${fluxos.map((f, fi) => `
              <div class="flow-card">
                <div class="flow-card-head">
                  <div style="display:flex;align-items:center;gap:10px;flex:1">
                    <span style="font-size:18px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:var(--signal-soft);color:var(--signal-deep);flex-shrink:0">🔀</span>
                    <div style="flex:1">
                      <label style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:700;margin-bottom:2px;display:block">Nome do Fluxo ${fi + 1}</label>
                      <input type="text" class="flow-title-input" value="${esc(f.nome)}" placeholder="Ex.: Consultas, Exames, Remarcações, Financeiro" oninput="setIaFluxoNome(${fi}, this.value)">
                    </div>
                  </div>
                  <button class="rowdel" title="Excluir fluxo inteiro" onclick="delIaFluxo(${fi})" style="font-size:18px;margin-top:14px">×</button>
                </div>

                <div style="margin-bottom:12px">
                  <label style="font-size:11.5px;font-weight:600;color:var(--ink-2);margin-bottom:6px;display:block">Perguntas Sequenciais (coletadas uma a uma pela IA antes do transbordo):</label>
                  ${(f.passos || []).map((step, pi) => `
                    <div class="step-item">
                      <span class="step-num-badge">${pi + 1}</span>
                      <input type="text" value="${esc(step)}" placeholder="Ex.: Qual o CPF do paciente? / Qual o convênio?" oninput="setIaPasso(${fi}, ${pi}, this.value)">
                      <button class="rowdel" title="Remover este passo" onclick="delIaPasso(${fi}, ${pi})">×</button>
                    </div>
                  `).join("")}
                </div>

                <button type="button" class="btn-add-step" onclick="addIaPasso(${fi})">
                  <span>➕</span> Adicionar Passo a este fluxo
                </button>

                <div style="margin-top:16px;padding-top:14px;border-top:1.5px dashed var(--line);background:#FBFBFE;margin-left:-16px;margin-right:-16px;margin-bottom:-16px;padding:14px 16px;border-bottom-left-radius:8px;border-bottom-right-radius:8px">
                  <div style="margin-bottom:4px">
                    <label style="font-size:12px;font-weight:700;color:var(--signal-deep);display:flex;align-items:center;gap:6px;margin:0">
                      Fila de Destino da Transferência <span class="req">*</span>
                    </label>
                  </div>
                  <p style="font-size:11.5px;color:var(--muted);margin:0 0 8px">
                    Para qual setor / fila humana o cliente será transferido automaticamente após responder às perguntas deste fluxo?
                  </p>
                  <select onchange="setIaFluxoDestino(${fi}, this.value)" style="background:#fff;border:1.5px solid ${f.destino ? 'var(--line)' : 'var(--amber)'}">
                    ${setOpts(f.destino)}
                  </select>
                  ${!f.destino ? `<span style="font-size:11.5px;color:var(--amber);margin-top:4px;display:block;font-weight:600">⚠ Selecione a fila de transbordo para este fluxo para avançar.</span>` : ""}
                </div>
              </div>
            `).join("")}

            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding:12px 14px;background:#fff;border:1.5px solid var(--line);border-radius:8px">
              <button type="button" class="btn btn-s" onclick="addIaFluxo()" style="font-weight:600">
                <span>➕</span> Adicionar Novo Fluxo
              </button>
              <div class="chip-row" style="margin-top:0">
                <span class="chip-label">Modelos Prontos:</span>
                <button type="button" class="btn-chip template" onclick="loadPreAtendSaude()">✨ Modelo de Saúde (Clínica/Hospital)</button>
                <button type="button" class="btn-chip template" onclick="loadPreAtendComercial()">✨ Modelo Comercial / Vendas</button>
              </div>
            </div>
          </div>

          <div class="f" style="background:#FFF8E8;border:1.5px solid #F5D485;border-radius:8px;padding:14px 16px;margin-top:18px">
            <label style="color:#7C4A03;font-size:13px">Para qual fila levamos o cliente se a IA não identificar o assunto ou tiver alguma falha? <span class="req">*</span></label>
            <p style="font-size:12px;color:#855C08;margin:0 0 8px">Fila de transbordo padrão caso o cliente fique fora dos fluxos previstos ou a IA não entenda a solicitação.</p>
            <select onchange="S.ia.filaFallback=this.value;soft()" style="background:#fff">${setOpts(a.filaFallback)}</select>
          </div>

          <div class="f" style="margin-top:14px"><label>Tentativas sem entender antes de transferir por falha (Catch-All)</label><div class="opts">
            ${["1|1 tentativa (imediato)", "2|2 tentativas", "3|3 tentativas (recomendado)"].map(x => {
              const [v, l] = x.split("|");
              return `<button class="opt sm" aria-pressed="${a.tentativasErro === v}" onclick="S.ia.tentativasErro='${v}';draw()">${l}</button>`;
            }).join("")}
          </div></div>

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
            <button class="btn btn-s" onclick="setIaSubStep(3)">← 3. Contexto & Regras</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(5)">Continuar: 5. Inatividade & Encerramento →</button>
          </div>
        `;
      } else if (etapa === 5) {
        contentHtml = `
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
          <div class="f" style="margin-top:8px">
            <label>Mensagem de finalização de atendimento (Opcional)</label>
            ${fta("ia.msgFinalizacao", "Ex.: Atendimento finalizado por inatividade. Caso precise de mais alguma informação, basta nos enviar uma nova mensagem! Tenha um ótimo dia. 😊")}
            <span class="hint">Enviada automaticamente caso o atendimento seja encerrado pela IA.</span>
          </div>

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
            <button class="btn btn-s" onclick="setIaSubStep(4)">← 4. Fluxos de Atendimento</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="setIaSubStep(6)">Continuar: 6. Base de Conhecimento →</button>
          </div>
        `;
      } else if (etapa === 6) {
        contentHtml = `
          <div class="grid2">
            ${fi("Site ou página com as informações oficiais", "ia.baseUrl", "text", "https://suaempresa.com.br")}
            <div class="f"><label>Qual a frequência de atualização da FAQ?</label><div class="opts">
              ${["diaria|Diária", "semanal|Semanal / Quinzenal", "mensal|Mensal", "demanda|Sob Demanda", "api|Tempo Real (API)"].map(x => {
                const [v, l] = x.split("|");
                return `<button class="opt sm" aria-pressed="${a.faqFreq === v}" onclick="S.ia.faqFreq='${v}';draw()">${l}</button>`;
              }).join("")}
            </div></div>
          </div>

          <div class="f">
            <label>Links adicionais de consulta</label>
            ${links.map((l, li) => `
              <div style="display:flex;gap:8px;margin-bottom:6px">
                <input type="text" value="${esc(l)}" placeholder="https://suaempresa.com.br/preparo-de-exames" oninput="setIaLink(${li}, this.value)">
                <button class="rowdel" title="Remover link" onclick="delIaLink(${li})">×</button>
              </div>
            `).join("")}
            <button type="button" class="btn-chip" style="margin-top:4px" onclick="addIaLink()">➕ Adicionar Link Adicional</button>
          </div>

          <div class="f">
            <label>Texto escrito / Procedimentos e FAQ Manual</label>
            ${fta("ia.faqTexto", "Insira aqui textos informativos, listas de exames, tabelas de valores particulares, rotinas de preparo ou respostas prontas para perguntas frequentes...")}
            <span class="hint">Textos inseridos aqui são incorporados diretamente ao conhecimento da IA.</span>
          </div>

          <div class="f">
            <label>Upload de arquivos (Documentos, Manuais, Tabelas e PDFs)</label>
            <div class="file-upload-zone" onclick="document.getElementById('ia_file_upload_input').click()">
              <input type="file" id="ia_file_upload_input" style="display:none" onchange="if(this.files[0]){addIaArquivo(this.files[0].name, Math.round(this.files[0].size/1024)+' KB');this.value=''}">
              <span style="font-size:24px;display:block;margin-bottom:4px">📁</span>
              <b>Clique para selecionar arquivos</b> (PDFs, Tabelas, Manuais, Documentos)
              <span class="hint">Suporta arquivos PDF, DOCX, XLSX ou TXT para treinamento e consulta do assistente</span>
            </div>
            ${arquivos.length ? `
              <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">
                ${arquivos.map((arq, ai) => `
                  <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid var(--line);border-radius:6px;padding:6px 12px;font-size:12.5px">
                    <span>📄 <b>${esc(arq.nome)}</b> <small style="color:var(--muted)">(${esc(arq.tamanho)})</small></span>
                    <button class="rowdel" title="Remover arquivo" onclick="delIaArquivo(${ai})">×</button>
                  </div>
                `).join("")}
              </div>
            ` : ""}
          </div>

          <div class="sect"><h3>Responsável interno para dúvidas de FAQ</h3><p>Pessoa de contato na sua empresa caso o time da ORPEN precise tirar dúvidas sobre as respostas da IA.</p></div>
          <div class="grid2">
            ${fi("Nome do Responsável", "ia.faqRespNome", "text", "Ex.: Mariana Souza")}
            ${fi("E-mail do Responsável", "ia.faqRespEmail", "email", "Ex.: mariana.souza@hospitalexemplo.com.br")}
          </div>

          <div class="navrow" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
            <button class="btn btn-s" onclick="setIaSubStep(5)">← 5. Inatividade</button>
            <div class="sp"></div>
            <button class="btn btn-p" onclick="next()">Concluir Assistente de IA e Avançar →</button>
          </div>
        `;
      }

      return `<div class="card">
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
                <span class="ia-mini-step-dot">${isIaStepDone(s.n) ? '✓' : s.n}</span>
                <span class="ia-mini-step-name">${esc(s.lbl.replace(/^\d+\.\s*/, ''))}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <p class="lede" style="margin-top:-6px;margin-bottom:18px;font-size:13px">${curStep.desc}</p>

        ${contentHtml}
      </div>`;
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
      return `<div class="card">
        <p class="eyebrow">Sistemas</p><h2>Integração com o sistema de vocês</h2>
        <div class="grid2">${fi("Sistema a integrar", "integ.sistema", "text", "Ex.: IRIS, Tasy, MV, Protheus")}
        <div class="f"><label>Ele tem API disponível? <span class="req">*</span></label><div class="opts">
          <button class="opt sm" aria-pressed="${g.temApi === 'sim'}" onclick="S.integ.temApi='sim';draw()">Sim</button>
          <button class="opt sm" aria-pressed="${g.temApi === 'nao'}" onclick="S.integ.temApi='nao';draw()">Não</button>
          <button class="opt sm" aria-pressed="${g.temApi === 'nsei'}" onclick="S.integ.temApi='nsei';draw()">Não sei</button></div></div></div>
        ${g.temApi === 'nao' ? `<div class="note warn">Sem API aberta, a integração depende de uma conversa com o fornecedor do sistema.</div>` : ""}
        ${g.temApi === 'sim' ? fi("Link da documentação", "integ.docUrl", "text", "https://…") : ""}
        <div class="sect"><h3>Contato técnico <span class="req">*</span></h3><p>Quem conhece o sistema — pode ser do fornecedor.</p></div>
        <div class="grid3">${fi("Nome", "integ.contatoNome")}${fi("E-mail", "integ.contatoEmail", "email")}${fi("Telefone", "integ.contatoTel", "tel")}</div>
        <div class="sect"><h3>O que a integração precisa fazer <span class="req">*</span></h3></div>
        <div class="opts">
          ${["Consultar agendamentos do paciente", "Marcar ou remarcar consulta", "Consultar status de exame", "Identificar o cliente pelo telefone", "Enviar documento ou laudo", "Registrar o atendimento no sistema"].map(c =>
            `<button class="opt sm" aria-pressed="${g.casos.includes(c)}" onclick="togCaso('${c}')">${c}</button>`).join("")}
        </div>
        <div class="note info" style="margin-top:18px"><b>Credenciais não entram neste formulário.</b> Quando a integração for aprovada, a ORPEN envia um link seguro, de uso único, para o contato técnico registrar chave e endpoint.</div>
        ${nav()}</div>`;
    }
  },

  {
    id: "revisao", nome: "Revisão", when: () => true,
    check() { return []; },
    render() {
      const pend = allPending();
      return `<div class="card">
        <p class="eyebrow">Último passo</p><h2>Revisão e envio</h2>
        ${pend.length ? `<div class="note warn"><b>Faltam ${pend.length} ${pend.length === 1 ? "item" : "itens"}.</b> Você pode enviar assim mesmo — a ORPEN começa a configurar o que já está pronto e cobra o resto por aqui.</div>
          ${pend.map(p => `<div class="pre"><input type="checkbox" disabled><div><p>${esc(p.txt)}</p><p class="sub">${esc(p.bloco)}</p></div>
            <button class="btn btn-s" onclick="go('${p.id}')">Preencher</button></div>`).join("")}`
          : `<div class="note info"><b>Tudo preenchido.</b> Ao enviar, a ORPEN provisiona o ambiente e devolve o acesso de homologação.</div>`}
        <div class="sect"><h3>Anexos</h3><p>Contatos para importar, áudios da URA, tabela de convênios, manuais.</p></div>
        <div class="f"><input type="file" multiple style="border:1.5px dashed var(--line);padding:16px;background:var(--surface-2)"></div>
        <div class="f"><label>Alguma observação para o time de implantação?</label>${fta("obs.texto", "Prazos, restrições, quem não pode ser incomodado em determinado horário…")}</div>
        <div class="navrow" style="margin-top:20px">
          <button class="btn btn-p" onclick="enviar()">Enviar para a ORPEN</button>
          <button class="btn btn-s" onclick="baixarJSON()">Baixar o JSON do setup</button>
          <span class="hint sp">O JSON é o que alimenta o provisionamento automático.</span></div>
      </div>`;
    }
  }
];
