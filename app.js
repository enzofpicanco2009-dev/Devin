/* Caminho da Faixa Preta — app de treino de jiu-jitsu
   Foco do atleta: passagem de guarda sistemática + top pressure irraspável.
   Dados persistidos em localStorage. */

const STORE = 'cfp_dados_v1';

const PADRAO = {
  perfil: { nome: '', faixa: 'Branca', dias: '4', peso: 67, pesoMeta: 70, inicio: hoje(), objetivo: 'Ser o melhor passador de guarda e ficar irraspável no top' },
  treinos: [],
  tecnicas: {}
};

let dados = carregar();

/* ---------- persistência ---------- */
function carregar() {
  try {
    const bruto = localStorage.getItem(STORE);
    if (!bruto) return structuredClone(PADRAO);
    return Object.assign(structuredClone(PADRAO), JSON.parse(bruto));
  } catch (e) {
    return structuredClone(PADRAO);
  }
}
function salvar() { localStorage.setItem(STORE, JSON.stringify(dados)); }
function hoje() { return new Date().toISOString().slice(0, 10); }

/* ---------- biblioteca técnica (prioridade: top game / passagem) ---------- */
const BIBLIOTECA = [
  {
    grupo: 'Passagem de guarda — sistema de entrada',
    tecnicas: [
      'Controle de pernas (leg drag) a partir do De La Riva',
      'Body lock pass em pé (quebra de postura + queda)',
      'Body lock pass no chão (pressão lateral)',
      'Knee cut clássico com underhook',
      'Knee cut com controle de cabeça (Danaher style)',
      'Toreando (bullfighter) com quebra de ângulo',
      'Over-under pass (pressão longa)',
      'Stack pass contra guarda fechada',
      'X-pass com pressão nos joelhos',
      'Smash pass contra half guard'
    ]
  },
  {
    grupo: 'Abertura de guarda fechada',
    tecnicas: [
      'Abertura em pé com controle de quadril',
      'Abertura de joelhos (log split)',
      'Quebra de postura defensiva do adversário',
      'Neutralizar armlock/triângulo durante a abertura'
    ]
  },
  {
    grupo: 'Neutralizar guardas específicas',
    tecnicas: [
      'De La Riva: remoção do gancho + leg drag',
      'Lasso: quebra do laço com pressão do cotovelo',
      'Aranha: quebra pelo joelho na biceps',
      'Meia-guarda profunda (deep half): defesa e recuperação de topo',
      'Butterfly: neutralizar ganchos e passar por cima',
      'Guarda X / single leg X: sair e passar',
      'K-guard e false reap: prevenção de entrada em leglock'
    ]
  },
  {
    grupo: 'Top pressure — ser irraspável',
    tecnicas: [
      'Base tripod e distribuição de peso na montada',
      'Cross-face + underhook (controle de 100kg)',
      'Kesa gatame e side control heavy',
      'Reagir à raspagem de ponte (bridge & roll)',
      'Reagir à recuperação de guarda (framing) com re-passagem',
      'Grapevine (ganchos) na montada contra elbow escape',
      'Transição montada → norte-sul → costas sem perder pressão',
      'Knee on belly móvel com controle de quadril',
      'Sprawl e pressão contra single/double leg',
      'Manter topo com adversário puxando meia-guarda'
    ]
  },
  {
    grupo: 'Finalizações do topo',
    tecnicas: [
      'Estrangulamento de lapela cruzada da montada',
      'Armlock da montada',
      'Americana do side control',
      'Kimura do side control',
      'Mata-leão com controle de seatbelt',
      'Bow and arrow das costas',
      'Estrangulamento de braço (arm triangle) do topo'
    ]
  },
  {
    grupo: 'Fundamentos de sobrevivência (base de faixa branca)',
    tecnicas: [
      'Fuga do side control (frames + shrimp)',
      'Fuga da montada (elbow escape)',
      'Defesa de mata-leão e retirada de seatbelt',
      'Postura de guarda fechada e defesa de passagem',
      'Recuperação de guarda a partir do half',
      'Quedas e amortecimento (ukemi)'
    ]
  },
  {
    grupo: 'Wrestling e stand-up',
    tecnicas: [
      'Single leg com pressão na cabeça',
      'Double leg em nível baixo',
      'Arrastão (arm drag) para as costas',
      'Snapdown + front headlock',
      'Defesa de puxada de guarda (passar direto)',
      'Pegadas de kimono e quebra de pegada'
    ]
  }
];

const NIVEIS = ['—', 'Aprendendo', 'Consolidada'];

/* ---------- periodização de 12 semanas ---------- */
const BLOCOS = [
  { nome: 'Bloco 1 — Base e sobrevivência', semanas: [1, 2, 3], foco: [
      'Fundamentos de fuga: side control e montada (sobreviver primeiro)',
      'Abertura de guarda fechada em pé com base sólida',
      'Knee cut clássico: mecânica lenta e repetição',
      'Base e postura: aprender a não ser raspado'
    ], mental: 'Ego zero: perder posição no treino é informação, não derrota. Meta = 200 repetições limpas por técnica.' },
  { nome: 'Bloco 2 — Sistema de passagem', semanas: [4, 5, 6], foco: [
      'Body lock pass (em pé e no chão) — sua passagem âncora',
      'Leg drag e toreando: conectar entradas em cadeia',
      'Neutralizar De La Riva, aranha e lasso',
      'Prevenção de leglock ao passar (false reap, K-guard)'
    ], mental: 'Pense como Gordon: cada passagem tem uma reação prevista. Escreva a árvore de decisão de cada posição.' },
  { nome: 'Bloco 3 — Pressão irraspável', semanas: [7, 8, 9], foco: [
      'Cross-face + underhook: controle antes de progredir',
      'Reagir a ponte, framing e recuperação de guarda',
      'Transições topo → norte-sul → costas sem perder pressão',
      'Finalizações do topo: arm triangle, mata-leão, armlock'
    ], mental: 'Regra do bloco: em toda rola, 3 minutos apenas mantendo o topo sem finalizar. Consolidar antes de atacar.' },
  { nome: 'Bloco 4 — Aplicação e criatividade', semanas: [10, 11, 12], foco: [
      'Rolas temáticas: começar sempre passando guarda',
      'Improvisar entradas fora do roteiro (estilo Mica)',
      'Simulação de luta: 3 rounds de 5-6 min em ritmo de competição',
      'Ajuste de peso e afinamento para competir'
    ], mental: 'Sistema virou instinto. Agora arrisque: teste uma entrada nova por rola e anote o resultado.' }
];

function blocoDaSemana(s) { return BLOCOS.find(b => b.semanas.includes(s)) || BLOCOS[0]; }

function sessoesDaSemana(semana, dias) {
  const bloco = blocoDaSemana(semana);
  const deload = semana % 4 === 0;
  const base = [
    { titulo: 'Drill técnico — passagem', tipo: 'Drill técnico', dur: 75, itens: [
        'Aquecimento específico: 10 min de movimentação de quadril e base',
        `Bloco técnico: ${bloco.foco[0]}`,
        '6 x 2 min de drill com resistência progressiva (30% → 70%)',
        'Rola posicional: você passa, parceiro defende (5 x 3 min)'
      ] },
    { titulo: 'Aula de fundamentos + rolas', tipo: 'Fundamentos', dur: 90, itens: [
        'Seguir a aula da academia com atenção total aos detalhes',
        `Aplicar o foco da semana: ${bloco.foco[1]}`,
        '5 a 6 rolas de 5 min',
        'Após o treino: anotar 1 acerto e 1 erro por rola'
      ] },
    { titulo: 'Top pressure + finalizações', tipo: 'Sparring (rolas)', dur: 90, itens: [
        `Bloco posicional: ${bloco.foco[2]}`,
        'Jogo de manutenção: 4 x 3 min começando no side control (só manter)',
        'Finalizar apenas depois de 60s de controle estável',
        'Duas rolas livres no final'
      ] },
    { titulo: 'Físico + wrestling', tipo: 'Físico / condicionamento', dur: 60, itens: [
        'Força: agachamento, levantamento terra ou variação — 4 x 5 pesado',
        'Puxada/remada 4 x 8 (pegada é passagem que não escapa)',
        'Wrestling: 10 min de entradas de single/double leg e sprawl',
        'Core anti-rotação: 3 x 45s prancha lateral'
      ] },
    { titulo: 'Rolas livres — volume', tipo: 'Sparring (rolas)', dur: 90, itens: [
        'Aquecimento leve 10 min',
        '8 rolas de 5 min com parceiros variados (pesados e leves)',
        `Regra do dia: sempre começar em pé e ${bloco.foco[3]}`,
        'Anotar quantas passagens você completou'
      ] },
    { titulo: 'Mobilidade e recuperação', tipo: 'Mobilidade / recuperação', dur: 40, itens: [
        'Mobilidade de quadril e coluna 20 min',
        'Respiração nasal 5 min (controle de gás na rola)',
        'Revisar anotações da semana e assistir 1 estudo de caso (Gordon/Mica)',
        'Dormir 8h — recuperação é treino'
      ] }
  ];
  let sessoes = base.slice(0, Math.max(2, Math.min(6, Number(dias))));
  if (deload) {
    sessoes = sessoes.map(s => ({ ...s, dur: Math.round(s.dur * 0.7), itens: [...s.itens, 'Semana de deload: intensidade máxima 60%, foco em técnica limpa'] }));
  }
  return sessoes;
}

function semanaAtual() {
  const inicio = dados.perfil.inicio || hoje();
  const diff = Math.floor((new Date(hoje()) - new Date(inicio)) / 86400000);
  if (isNaN(diff) || diff < 0) return 1;
  return Math.min(12, Math.floor(diff / 7) + 1);
}

/* ---------- navegação ---------- */
document.getElementById('tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  mostrar(btn.dataset.view);
});
function mostrar(view) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + view));
  if (view === 'progresso') renderProgresso();
  if (view === 'treinos') renderHistorico();
}

/* ---------- view: hoje ---------- */
function renderHoje() {
  const s = semanaAtual();
  const bloco = blocoDaSemana(s);
  const sessoes = sessoesDaSemana(s, dados.perfil.dias);
  const idx = dados.treinos.length % sessoes.length;
  const sessao = sessoes[idx];

  document.getElementById('semanaAtual').textContent = s;
  document.getElementById('blocoAtual').textContent = bloco.nome;
  document.getElementById('tituloHoje').textContent = sessao.titulo;
  document.getElementById('descHoje').textContent = `${sessao.tipo} · ${sessao.dur} min`;
  document.getElementById('streakNum').textContent = calcStreak();

  document.getElementById('checklistHoje').innerHTML = sessao.itens
    .map((i, n) => `<li><input type="checkbox" id="ck${n}" /><label for="ck${n}">${i}</label></li>`).join('');
  document.getElementById('focoSemana').innerHTML = bloco.foco.map(f => `<li>${f}</li>`).join('');
  document.getElementById('metaMental').textContent = bloco.mental;
}
document.getElementById('irRegistrar').addEventListener('click', () => mostrar('treinos'));

function calcStreak() {
  const datas = new Set(dados.treinos.map(t => t.data));
  let streak = 0;
  const d = new Date(hoje());
  // tolera 1 dia de descanso entre treinos
  for (let i = 0; i < 400; i++) {
    const chave = d.toISOString().slice(0, 10);
    if (datas.has(chave)) streak++;
    else if (i > 0 && streak > 0) {
      const ant = new Date(d); ant.setDate(ant.getDate() - 1);
      if (!datas.has(ant.toISOString().slice(0, 10))) break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ---------- view: plano ---------- */
let semanaSel = null;
function renderPlano() {
  const atual = semanaAtual();
  document.getElementById('listaSemanas').innerHTML = Array.from({ length: 12 }, (_, i) => {
    const s = i + 1;
    const sel = s === (semanaSel || atual) ? ' sel' : '';
    return `<div class="semana${sel}" data-semana="${s}"><b>S${s}</b><span>${s % 4 === 0 ? 'deload' : 'carga'}</span></div>`;
  }).join('');
  renderDetalheSemana(semanaSel || atual);
}
document.getElementById('listaSemanas').addEventListener('click', e => {
  const el = e.target.closest('.semana');
  if (!el) return;
  semanaSel = Number(el.dataset.semana);
  renderPlano();
});
function renderDetalheSemana(s) {
  const bloco = blocoDaSemana(s);
  const sessoes = sessoesDaSemana(s, dados.perfil.dias);
  document.getElementById('detalheSemana').innerHTML =
    `<h3>Semana ${s} — ${bloco.nome}</h3>` +
    `<p class="muted small">${bloco.mental}</p>` +
    sessoes.map(x => `
      <div class="sessao">
        <h4>${x.titulo}</h4>
        <div><span class="tag">${x.tipo}</span><span class="tag">${x.dur} min</span></div>
        <ul class="bullets mt">${x.itens.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>`).join('');
}

/* ---------- view: treinos ---------- */
const formTreino = document.getElementById('formTreino');
formTreino.data.value = hoje();
formTreino.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(formTreino);
  dados.treinos.push({
    id: Date.now(),
    data: f.get('data'),
    tipo: f.get('tipo'),
    duracao: Number(f.get('duracao')) || 0,
    rolas: Number(f.get('rolas')) || 0,
    fin: Number(f.get('fin')) || 0,
    sofridas: Number(f.get('sofridas')) || 0,
    intensidade: Number(f.get('intensidade')) || 0,
    tecnicas: f.get('tecnicas') || '',
    notas: f.get('notas') || ''
  });
  dados.treinos.sort((a, b) => b.data.localeCompare(a.data));
  salvar();
  formTreino.reset();
  formTreino.data.value = hoje();
  renderHistorico();
  renderHoje();
});

function renderHistorico() {
  const el = document.getElementById('historico');
  document.getElementById('contadorTreinos').textContent = `(${dados.treinos.length})`;
  if (!dados.treinos.length) { el.innerHTML = '<p class="vazio">Nenhum treino registrado ainda.</p>'; return; }
  el.innerHTML = dados.treinos.map(t => `
    <div class="item">
      <div class="top">
        <span class="data">${formatarData(t.data)} · ${t.tipo}</span>
        <button class="btn ghost" data-del="${t.id}">remover</button>
      </div>
      <div class="muted small">${t.duracao} min · ${t.rolas} rolas · ${t.fin} finalizações · ${t.sofridas} sofridas · intensidade ${t.intensidade}/10</div>
      ${t.tecnicas ? `<div class="small">Técnicas: ${t.tecnicas}</div>` : ''}
      ${t.notas ? `<div class="small muted">“${t.notas}”</div>` : ''}
    </div>`).join('');
}
document.getElementById('historico').addEventListener('click', e => {
  const id = e.target.dataset?.del;
  if (!id) return;
  dados.treinos = dados.treinos.filter(t => String(t.id) !== id);
  salvar();
  renderHistorico();
  renderHoje();
});
function formatarData(d) {
  const [a, m, dia] = d.split('-');
  return `${dia}/${m}/${a}`;
}

/* ---------- view: técnicas ---------- */
function renderBiblioteca() {
  document.getElementById('biblioteca').innerHTML = BIBLIOTECA.map(g => `
    <div class="grupo">
      <h4>${g.grupo}</h4>
      ${g.tecnicas.map(t => {
        const nivel = dados.tecnicas[t] || 0;
        return `<div class="tec">
          <span>${t}</span>
          <span class="niveis">${NIVEIS.map((n, i) =>
            `<button data-tec="${encodeURIComponent(t)}" data-nivel="${i}" class="${nivel === i ? 'on' : ''}">${n}</button>`).join('')}</span>
        </div>`;
      }).join('')}
    </div>`).join('');
}
document.getElementById('biblioteca').addEventListener('click', e => {
  const b = e.target.closest('button[data-tec]');
  if (!b) return;
  dados.tecnicas[decodeURIComponent(b.dataset.tec)] = Number(b.dataset.nivel);
  salvar();
  renderBiblioteca();
});

/* ---------- view: progresso ---------- */
function renderProgresso() {
  const t = dados.treinos;
  const min = t.reduce((s, x) => s + x.duracao, 0);
  const rolas = t.reduce((s, x) => s + x.rolas, 0);
  const fin = t.reduce((s, x) => s + x.fin, 0);
  const sof = t.reduce((s, x) => s + x.sofridas, 0);
  const saldo = sof ? (fin / sof).toFixed(2) : (fin ? '∞' : '—');

  document.getElementById('kpis').innerHTML = `
    <div class="kpi"><b>${t.length}</b><span>treinos registrados</span></div>
    <div class="kpi"><b>${(min / 60).toFixed(1)}h</b><span>tempo no tatame</span></div>
    <div class="kpi"><b>${rolas}</b><span>rolas</span></div>
    <div class="kpi"><b>${saldo}</b><span>finalizações aplicadas / sofridas</span></div>`;

  const semanas = {};
  t.forEach(x => {
    const chave = chaveSemana(x.data);
    semanas[chave] = (semanas[chave] || 0) + x.duracao;
  });
  const chaves = Object.keys(semanas).sort().slice(-12);
  const max = Math.max(1, ...chaves.map(k => semanas[k]));
  document.getElementById('grafico').innerHTML = chaves.length
    ? chaves.map(k => `<div class="bar" style="height:${(semanas[k] / max) * 100}%" title="${semanas[k]} min"><span>${k.slice(5)}</span></div>`).join('')
    : '<p class="vazio">Registre treinos para ver seu volume semanal.</p>';

  document.getElementById('progressoTecnico').innerHTML = BIBLIOTECA.map(g => {
    const total = g.tecnicas.length;
    const cons = g.tecnicas.filter(x => dados.tecnicas[x] === 2).length;
    const apr = g.tecnicas.filter(x => dados.tecnicas[x] === 1).length;
    const pct = Math.round((cons / total) * 100);
    return `<div class="progresso-linha">
      <div class="small">${g.grupo} — <b>${cons}</b>/${total} consolidadas · ${apr} aprendendo</div>
      <div class="barra"><i style="width:${pct}%"></i></div>
    </div>`;
  }).join('');
}
function chaveSemana(d) {
  const dt = new Date(d);
  const dia = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - dia);
  return dt.toISOString().slice(0, 10);
}

/* ---------- view: perfil ---------- */
const formPerfil = document.getElementById('formPerfil');
function renderPerfil() {
  Object.entries(dados.perfil).forEach(([k, v]) => {
    if (formPerfil.elements[k]) formPerfil.elements[k].value = v;
  });
}
formPerfil.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(formPerfil);
  dados.perfil = {
    nome: f.get('nome'), faixa: f.get('faixa'), dias: f.get('dias'),
    peso: Number(f.get('peso')) || 0, pesoMeta: Number(f.get('pesoMeta')) || 0,
    inicio: f.get('inicio') || hoje(), objetivo: f.get('objetivo')
  };
  salvar();
  renderHoje();
  renderPlano();
  mostrar('hoje');
});
document.getElementById('exportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'caminho-faixa-preta.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ---------- init ---------- */
renderPerfil();
renderHoje();
renderPlano();
renderBiblioteca();
renderHistorico();
