/* Sistema absoluto de posições — espinha dorsal:
   em pé → passagem para meia-guarda → consolidação → montada →
   finalização (lapela, armlock, kata-gatame) ou costas.
   Cada nó: objetivo, pegadas, caminho principal, árvore de reações e erros comuns. */

const FASES = [
  { id: 'pe', nome: '1. Em pé' },
  { id: 'abertura', nome: '2. Abertura / entrada' },
  { id: 'meia', nome: '3. Meia-guarda (posição-âncora)' },
  { id: 'consolidacao', nome: '4. Consolidação' },
  { id: 'montada', nome: '5. Montada' },
  { id: 'finalizacao', nome: '6. Finalização' }
];

const SISTEMA = [
  /* ---------- fase: em pé ---------- */
  {
    id: 'pe-pegada',
    fase: 'pe',
    nome: 'Pegada e postura em pé',
    objetivo: 'Estabelecer pegada dominante e quebrar a postura dele antes de qualquer tentativa de passagem.',
    pegadas: [
      'Sua mão dominante na gola cruzada (colar), altura da clavícula',
      'Outra mão na manga do mesmo lado (controle de dois pontos)',
      'Cabeça alinhada, cotovelos colados, quadril atrás dos ombros'
    ],
    caminho: [
      'Domine a pegada primeiro: quem pega primeiro dita o ritmo',
      'Puxe a gola pra baixo e quebre a postura dele',
      'Circule pra fora do pé de apoio dele (ângulo, nunca de frente)',
      'Entre em body lock ou snapdown para derrubar / forçar ele a sentar'
    ],
    reacoes: [
      { se: 'Ele puxa guarda fechada', entao: 'Aceite, feche a base e vá para a abertura em pé', proximo: 'abertura-pe' },
      { se: 'Ele senta e abre a guarda (aberta/DLR)', entao: 'Controle os joelhos e entre no leg drag / toreando', proximo: 'entrada-legdrag' },
      { se: 'Ele tenta single/double leg', entao: 'Sprawl, cross-face e circule para o topo', proximo: 'consolidacao-lateral' },
      { se: 'Ele fica em pé recuando', entao: 'Snapdown + front headlock e vá para as costas', proximo: 'costas' }
    ],
    erros: [
      'Ficar de frente com postura ereta: convida puxada de guarda e desequilíbrio',
      'Passar sem quebrar a postura dele primeiro'
    ]
  },
  {
    id: 'bodylock-pe',
    fase: 'pe',
    nome: 'Body lock em pé',
    objetivo: 'Colar quadril no quadril dele, eliminar as pernas como arma e levar ao chão já em posição de passagem.',
    pegadas: [
      'Mãos travadas nas costas dele, na altura do cinto (gable grip ou S-grip)',
      'Cabeça de um lado só (cross-face antecipado), peito colado',
      'Um pé por dentro das pernas dele para bloquear a guarda'
    ],
    caminho: [
      'Quebre a postura e feche o body lock sem espaço entre os quadris',
      'Ande na direção do lado da cabeça dele até tirar a base',
      'Leve ao chão mantendo o lock — não solte para amortecer',
      'No chão, deslize o joelho por cima da coxa: você já está na meia-guarda por cima'
    ],
    reacoes: [
      { se: 'Ele senta e tenta colocar ganchos', entao: 'Afunde o quadril, mate o gancho de fora e siga pro knee slide', proximo: 'entrada-kneecut' },
      { se: 'Ele defende com frame no seu bíceps', entao: 'Troque de lado do body lock e volte pelo outro lado' },
      { se: 'Ele consegue meia-guarda profunda', entao: 'Sente no seu quadril, whizzer forte e passe por cima', proximo: 'meia-topo' }
    ],
    erros: ['Soltar o lock na queda', 'Levantar o quadril e dar espaço para ele girar']
  },

  /* ---------- fase: abertura / entrada ---------- */
  {
    id: 'abertura-pe',
    fase: 'abertura',
    nome: 'Abertura da guarda fechada em pé',
    objetivo: 'Abrir as pernas dele sem ser raspado nem finalizado, chegando com o joelho no meio.',
    pegadas: [
      'Duas mãos na faixa/calça na altura do quadril dele',
      'Cotovelos por dentro dos joelhos dele',
      'Costas retas, quadril baixo'
    ],
    caminho: [
      'Suba um pé, depois o outro, empurrando o quadril dele pra baixo',
      'Fique em pé com o quadril à frente: as pernas dele abrem pela gravidade',
      'Assim que abrir, coloque o joelho no centro e trave uma perna dele com a canela',
      'Vá direto para a passagem: knee cut ou leg drag'
    ],
    reacoes: [
      { se: 'Ele levanta o quadril para armlock/triângulo', entao: 'Postura, cotovelo colado, empurre o joelho dele pro chão' },
      { se: 'Ele senta na sua perna (guarda fechada alta)', entao: 'Sacuda o quadril, gire de lado e desça a perna dele' },
      { se: 'Ele abre e engancha DLR', entao: 'Vá para o leg drag', proximo: 'entrada-legdrag' }
    ],
    erros: ['Abrir de joelhos contra alguém forte de guarda', 'Deixar o cotovelo longe do corpo (convite ao armlock)']
  },
  {
    id: 'entrada-kneecut',
    fase: 'abertura',
    nome: 'Knee cut (entrada principal para meia-guarda)',
    objetivo: 'Cortar por cima da coxa dele para chegar na meia-guarda por cima já com cross-face e underhook.',
    pegadas: [
      'Underhook no braço do lado que você corta',
      'Mão de fora controlando a gola/ombro ou a manga do braço de baixo',
      'Joelho cortando na coxa, canela colada, pé de fora com dedos no chão (base tripé)'
    ],
    caminho: [
      'Trave a perna de baixo dele com o seu joelho (cortando na coxa)',
      'Ganhe o underhook e cole o peito no peito dele',
      'Cross-face girando a cabeça dele para longe',
      'Deslize o joelho até o chão: agora você está na meia-guarda por cima',
      'Não corra para a montada ainda — consolide primeiro'
    ],
    reacoes: [
      { se: 'Ele coloca whizzer (overhook) forte', entao: 'Solte o corte e passe para o outro lado (back step) ou vá de over-under' },
      { se: 'Ele coloca frame nos seus ombros e recompõe a guarda', entao: 'Afunde o cross-face e re-passe pelo mesmo lado' },
      { se: 'Ele engancha a sua perna (meia-guarda travada)', entao: 'Aceite: você está na meia-guarda por cima — consolide', proximo: 'meia-topo' },
      { se: 'Ele expõe as costas ao girar', entao: 'Seatbelt imediato e vá para as costas', proximo: 'costas' }
    ],
    erros: ['Cortar sem underhook (você é raspado)', 'Quadril alto durante o corte']
  },
  {
    id: 'entrada-legdrag',
    fase: 'abertura',
    nome: 'Leg drag / toreando',
    objetivo: 'Arrastar a perna dele para o outro lado, matando a guarda aberta e caindo em meia-guarda ou lateral.',
    pegadas: [
      'Duas mãos nas panturrilhas/calça (toreando)',
      'No leg drag: perna dele atravessada no seu quadril, mão na lapela dele'
    ],
    caminho: [
      'Empurre os joelhos dele para um lado e circule para o outro',
      'Arraste a perna dele através do seu corpo e afunde o quadril nela',
      'Cole o peito e busque o underhook ou a lapela',
      'Progrida para meia-guarda por cima ou lateral'
    ],
    reacoes: [
      { se: 'Ele recompõe a guarda (recoloca a perna)', entao: 'Reencaixe o toreando e mude o lado do arrasto' },
      { se: 'Ele inverte e busca a sua perna (leglock)', entao: 'Aponte o joelho pro chão, mate a pegada e passe por cima' },
      { se: 'Ele gira e dá as costas', entao: 'Seatbelt e vá para as costas', proximo: 'costas' }
    ],
    erros: ['Ficar de pé alto e lento', 'Não afundar o quadril na perna arrastada']
  },

  /* ---------- fase: meia-guarda por cima ---------- */
  {
    id: 'meia-topo',
    fase: 'meia',
    nome: 'Meia-guarda por cima (sua posição-âncora)',
    objetivo: 'Ser irraspável aqui: matar o underhook dele, isolar o braço e liberar a perna presa.',
    pegadas: [
      'Cross-face profundo (seu braço passando pelo rosto, mão no ombro/lapela dele)',
      'Underhook no braço de baixo dele — nunca deixe ele ter o underhook',
      'Base larga, quadril pesado e baixo, cabeça do lado oposto ao da perna presa'
    ],
    caminho: [
      'Primeiro: peso. Peito no peito, quadril no chão',
      'Mate o whizzer dele empurrando o braço para o chão',
      'Liberação da perna: cruze o pé livre e escave (pry) ou use o joelho para abrir',
      'Ou use o kimura trap para travar o braço e liberar a perna',
      'Só progrida quando ele estiver plano de costas'
    ],
    reacoes: [
      { se: 'Ele coloca whizzer e busca as costas', entao: 'Cabeça no chão do lado do whizzer, gire para o outro lado (roll under) ou vá pro norte-sul' },
      { se: 'Ele tenta meia-guarda profunda (deep half)', entao: 'Sente no quadril dele, whizzer, e pule pro outro lado do corpo' },
      { se: 'Ele empurra seu joelho para recompor a guarda', entao: 'Cross-face mais forte e knee slide de novo' },
      { se: 'Perna liberada, ele plano de costas', entao: 'Consolide na lateral', proximo: 'consolidacao-lateral' },
      { se: 'Ele expõe o braço de longe', entao: 'Kata-gatame (arm triangle) já daqui', proximo: 'fin-katagatame' }
    ],
    erros: [
      'Tentar passar antes de matar o underhook dele',
      'Levantar o peito para "trabalhar" — é aí que você é raspado',
      'Cabeça do lado errado (dá o whizzer de graça)'
    ]
  },

  /* ---------- fase: consolidação ---------- */
  {
    id: 'consolidacao-lateral',
    fase: 'consolidacao',
    nome: 'Cem quilos / lateral (side control pesado)',
    objetivo: 'Zerar a mobilidade dele por 15-20 segundos antes de subir para a montada.',
    pegadas: [
      'Cross-face + underhook (controle de bloco único)',
      'Quadril colado no dele, joelhos apertando (um no quadril, um na axila)',
      'Peito no esterno dele, dedos dos pés no chão para pressão'
    ],
    caminho: [
      'Respire e afunde o peso: a posição precisa "morrer" antes de progredir',
      'Mate os frames dele: empurre o cotovelo dele pra dentro, controle o punho',
      'Escolha o caminho: montada (passando o joelho pelo abdômen ou por cima) ou joelho na barriga',
      'Se ele empurrar o seu quadril, ele te dá as costas — troque para o seatbelt'
    ],
    reacoes: [
      { se: 'Ele faz frame e faz shrimp para recuperar guarda', entao: 'Sprawl no quadril, cross-face e volte para o controle' },
      { se: 'Ele empurra o seu joelho e gira de lado', entao: 'Vá para as costas', proximo: 'costas' },
      { se: 'Ele fica plano e passivo', entao: 'Suba para a montada', proximo: 'montada-controle' },
      { se: 'Ele empurra o seu rosto com o braço estendido', entao: 'Americana ou kata-gatame', proximo: 'fin-katagatame' }
    ],
    erros: ['Correr para a montada sem matar os frames', 'Perder o cross-face na transição']
  },

  /* ---------- fase: montada ---------- */
  {
    id: 'montada-controle',
    fase: 'montada',
    nome: 'Montada — controle antes de atacar',
    objetivo: 'Montada alta e estável, braços dele isolados, antes de qualquer ataque.',
    pegadas: [
      'Joelhos altos na axila dele, quadril à frente',
      'Cross-face ou controle de gola cruzada',
      'Um braço dele isolado acima da linha da cabeça'
    ],
    caminho: [
      'Suba pra montada alta e sente no peito, não no abdômen',
      'Mate as fugas: elbow escape (grapevine / ganchos) e ponte (peso na direção da ponte)',
      'Isole um braço acima da cabeça dele: aí abrem todas as finalizações',
      'Escolha: lapela cruzada, armlock, kata-gatame ou costas'
    ],
    reacoes: [
      { se: 'Ele faz ponte forte', entao: 'Acompanhe a ponte com o peso e trave o braço do lado da ponte' },
      { se: 'Ele faz elbow escape (recuperando meia-guarda)', entao: 'Coloque grapevine ou suba para a montada alta / troque para S-mount' },
      { se: 'Ele gira de barriga para baixo', entao: 'Seatbelt e vá para as costas', proximo: 'costas' },
      { se: 'Ele empurra seu peito com os braços', entao: 'Armlock ou kata-gatame', proximo: 'fin-armlock' },
      { se: 'Ele mantém os braços colados e defende o colarinho', entao: 'S-mount e ataque o braço de longe', proximo: 'fin-armlock' }
    ],
    erros: ['Montada baixa (no abdômen) — fácil de raspar', 'Atacar antes de isolar o braço']
  },
  {
    id: 'costas',
    fase: 'montada',
    nome: 'Costas (seatbelt + ganchos)',
    objetivo: 'Controle de seatbelt com ganchos ou body triangle, sem deixar ele voltar de frente.',
    pegadas: [
      'Seatbelt: um braço por cima do ombro, outro por baixo da axila, mãos travadas',
      'Ganchos nos quadris ou body triangle',
      'Cabeça do lado do braço de baixo (regra de segurança)'
    ],
    caminho: [
      'Trave o seatbelt antes dos ganchos',
      'Fique do lado do braço de baixo (side sitting) — não deixe ele te esmagar contra o chão',
      'Puxe o ombro dele para trás e busque o mata-leão ou a lapela',
      'Se ele defender bem, ameace bow and arrow para forçar a abertura'
    ],
    reacoes: [
      { se: 'Ele defende o pescoço com as duas mãos', entao: 'Ataque a lapela (bow and arrow) ou use o joelho para tirar a mão dele' },
      { se: 'Ele gira para dentro do braço de baixo', entao: 'Gire com ele e recupere as costas do outro lado' },
      { se: 'Ele consegue voltar de frente', entao: 'Aceite o topo e volte para a lateral', proximo: 'consolidacao-lateral' }
    ],
    erros: ['Colocar ganchos antes do seatbelt', 'Ficar do lado errado (do braço de cima)']
  },

  /* ---------- fase: finalização ---------- */
  {
    id: 'fin-lapela',
    fase: 'finalizacao',
    nome: 'Estrangulamento de lapela cruzada (montada)',
    objetivo: 'Finalizar com a lapela dele, usando a pressão da montada — a finalização mais previsível.',
    pegadas: ['Mão profunda na lapela cruzada, dedos por dentro', 'Segunda mão na outra lapela por cima'],
    caminho: [
      'Pegada profunda na lapela cruzada (a partir da montada alta)',
      'Cotovelo no chão, peito pressionando',
      'Segunda pegada, gire os punhos e expanda o peito',
      'Sente o peso: o aperto vem da postura, não da força do braço'
    ],
    reacoes: [
      { se: 'Ele puxa sua pegada', entao: 'Isole o braço acima da cabeça e vá para armlock', proximo: 'fin-armlock' },
      { se: 'Ele vira de lado', entao: 'Siga para as costas mantendo a pegada', proximo: 'costas' }
    ],
    erros: ['Pegada rasa', 'Levantar o peito e perder a montada']
  },
  {
    id: 'fin-armlock',
    fase: 'finalizacao',
    nome: 'Armlock da montada (S-mount)',
    objetivo: 'Atacar o braço que ele estende para te empurrar.',
    pegadas: ['Braço dele isolado, seu peito no cotovelo dele', 'Mão dele apontando para o teto', 'Joelho colado na cabeça dele'],
    caminho: [
      'Isole o braço acima da cabeça e passe para S-mount',
      'Cole o joelho na orelha dele e sente no ombro',
      'Gire e deite devagar, joelhos colados, quadril à frente',
      'Se ele girar o braço para escapar, siga para o kata-gatame'
    ],
    reacoes: [
      { se: 'Ele junta as mãos (defesa de armlock)', entao: 'Pressão no cotovelo, chute o braço ou troque para kata-gatame', proximo: 'fin-katagatame' },
      { se: 'Ele gira para escapar', entao: 'Solte e recupere a montada ou as costas', proximo: 'montada-controle' }
    ],
    erros: ['Cair para trás rápido (ele escapa girando)', 'Joelhos abertos']
  },
  {
    id: 'fin-katagatame',
    fase: 'finalizacao',
    nome: 'Kata-gatame (arm triangle)',
    objetivo: 'Estrangular com o braço dele e o seu ombro — funciona do topo, da lateral e da montada.',
    pegadas: ['Braço dele cruzado no próprio pescoço', 'Sua cabeça colada no braço dele', 'Mãos em gable grip'],
    caminho: [
      'Aproveite quando ele empurra seu rosto ou defende o armlock',
      'Empurre o braço dele para o outro lado do pescoço dele com a sua cabeça',
      'Gable grip, aperte cabeça e ombro',
      'Deslize para o lado (fora da montada) mantendo o aperto — daqui a finalização vem'
    ],
    reacoes: [
      { se: 'Ele defende puxando o cotovelo', entao: 'Suba o joelho e caminhe para o norte-sul' },
      { se: 'Ele gira de barriga pra baixo', entao: 'Mantenha o aperto e vá para as costas', proximo: 'costas' }
    ],
    erros: ['Descer da montada antes de travar o aperto', 'Cabeça longe do braço dele']
  },
  {
    id: 'fin-mataleao',
    fase: 'finalizacao',
    nome: 'Mata-leão / bow and arrow (costas)',
    objetivo: 'Fechar a luta a partir das costas.',
    pegadas: ['Braço por baixo do queixo, mão no bíceps oposto', 'Ou lapela dele + perna na cabeça (bow and arrow)'],
    caminho: [
      'Puxe o ombro dele para trás para criar espaço no queixo',
      'Deslize a mão por baixo do queixo (nunca por cima)',
      'Trave a segunda mão e expanda o peito',
      'Se ele defender bem, troque para bow and arrow com a lapela'
    ],
    reacoes: [
      { se: 'Ele protege o queixo', entao: 'Use a lapela: bow and arrow' },
      { se: 'Ele tenta girar', entao: 'Body triangle e continue atacando' }
    ],
    erros: ['Forçar a mão por cima do queixo', 'Perder o seatbelt ao atacar']
  }
];

const porId = id => SISTEMA.find(n => n.id === id);

let noSel = 'pe-pegada';

function renderSistema() {
  const mapa = document.getElementById('mapaSistema');
  if (!mapa) return;
  mapa.innerHTML = FASES.map(f => `
    <div class="fase">
      <h4>${f.nome}</h4>
      ${SISTEMA.filter(n => n.fase === f.id).map(n =>
        `<div class="no${n.id === noSel ? ' sel' : ''}" data-no="${n.id}">${n.nome}</div>`).join('')}
    </div>`).join('');
  renderNo();
}

function renderNo() {
  const n = porId(noSel);
  const el = document.getElementById('detalheNo');
  if (!n || !el) return;
  const nivel = dados.tecnicas[n.nome] || 0;
  el.innerHTML = `
    <h3>${n.nome}</h3>
    <p><b>Objetivo:</b> ${n.objetivo}</p>
    <div class="grid2">
      <div>
        <h3 class="mt">Pegadas</h3>
        <ul class="bullets">${n.pegadas.map(p => `<li>${p}</li>`).join('')}</ul>
        <h3 class="mt">Caminho principal</h3>
        <ol class="bullets">${n.caminho.map(p => `<li>${p}</li>`).join('')}</ol>
      </div>
      <div>
        <h3 class="mt">Árvore de reações</h3>
        <div class="reacoes">
          ${n.reacoes.map(r => `
            <div class="reacao">
              <div class="se">Se: ${r.se}</div>
              <div class="entao">→ ${r.entao}</div>
              ${r.proximo ? `<button class="link" data-ir="${r.proximo}">ir para: ${porId(r.proximo)?.nome || r.proximo}</button>` : ''}
            </div>`).join('')}
        </div>
        <h3 class="mt">Erros que te fazem perder a posição</h3>
        <ul class="bullets erros">${n.erros.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="mt">
      <span class="muted small">Seu nível nesta posição:</span>
      <span class="niveis">${NIVEIS.map((x, i) =>
        `<button data-nivelno="${i}" class="${nivel === i ? 'on' : ''}">${x}</button>`).join('')}</span>
    </div>`;
}

document.addEventListener('click', e => {
  const no = e.target.closest('#mapaSistema .no');
  if (no) { noSel = no.dataset.no; renderSistema(); return; }
  const ir = e.target.closest('#detalheNo button[data-ir]');
  if (ir) { noSel = ir.dataset.ir; renderSistema(); return; }
  const nv = e.target.closest('#detalheNo button[data-nivelno]');
  if (nv) {
    dados.tecnicas[porId(noSel).nome] = Number(nv.dataset.nivelno);
    salvar();
    renderNo();
  }
});

renderSistema();
