/* Sistema absoluto de posições — espinha dorsal:
   em pé → passagem para meia-guarda → consolidação → montada →
   finalização (lapela, armlock, kata-gatame) ou costas.
   Cada nó: objetivo, pegadas, condições específicas, caminho principal,
   microdicas, árvore de reações e erros comuns. */

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
    condicoes: [
      'Ele sente o peso no calcanhar e a cabeça inclinada para frente (postura quebrada)',
      'Seus cotovelos estão colados e as mãos pegam antes das mãos dele',
      'Você consegue andar de lado sem ele readjustar os pés primeiro'
    ],
    dicas: [
      'Micro-dica: mão na gola nunca frouxa; se ela ceder 2 cm, ele respira e recupera a postura.',
      'Micro-dica: circule no momento em que ele está ocupado ajustando a própria pegada.',
      'Conceito chave: postura quebrada = metade da passagem já feita.'
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
    condicoes: [
      'Não existe espaço entre os seus quadris e os dele',
      'A cabeça dele virada para o lado do seu peito',
      'Peso dele carregado em uma perna só'
    ],
    dicas: [
      'Micro-dica: antes de cair, amarre a canela dele com a sua canela (controla a perna de fora).',
      'Micro-dica: não puxe com os braços para baixo — empurre com o quadril para frente.',
      'Conceito chave: body lock bem feito já é metade da passagem.'
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
    condicoes: [
      'Ele não consegue subir os quadris acima da linha do seu quadril',
      'Seus cotovelos estão dentro dos joelhos dele (evita pendurar triângulo)',
      'Você sobe um pé de cada vez mantendo o quadril à frente'
    ],
    dicas: [
      'Micro-dica: empurre o quadril dele para baixo com as mãos, não apenas para longe.',
      'Micro-dica: se ele abraçar sua cabeça, abaixe o queixo e segure a gola dele para trás.',
      'Conceito chave: a abertura é feita pela altura do seu quadril, não pela força dos braços.'
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
    erros: [
      'Abrir de joelhos contra alguém forte de guarda',
      'Deixar o cotovelo longe do corpo (convite ao armlock)'
    ]
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
    condicoes: [
      'A ponta do joelho dele aponta para cima (não para você) — ele não pode colocar whizzer ainda',
      'Sua mão de fora empurra o joelho dele para baixo',
      'Você tem o underhook antes de colocar o peso no corte'
    ],
    dicas: [
      'Micro-dica: corte com o joelho e a canela, não com o pé; o pé fica no chão para a base.',
      'Micro-dica: se ele tenta colocar o whizzer, abraçe a cabeça dele e vire o rosto para o outro lado.',
      'Conceito chave: underhook + cross-face = você passa; falta um dos dois = você é raspado.'
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
    condicoes: [
      'Seus dois cotovelos estão colados ao corpo — ele não consegue colocar armlock/triângulo',
      'A perna arrastada cruza o corpo dele, travando o quadril',
      'Você cai com o peito colado na perna dele'
    ],
    dicas: [
      'Micro-dica: no toreando, empurre os joelhos e ande na diagonal — nunca em linha reta por cima.',
      'Micro-dica: leg drag exige afundar o quadril na coxa dele antes de virar; senão ele só recompõe.',
      'Conceito chave: depois de arrastar, o próximo passo é o underhook, não a montada.'
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
    condicoes: [
      'Ele não consegue virar o rosto para você porque o cross-face é profundo',
      'Seu quadril está mais baixo que o dele',
      'A perna dele que está presa não consegue encontrar o gancho na sua perna'
    ],
    dicas: [
      'Micro-dica: use o ombro/queixo no rosto dele para virar a cabeça — não precisa forçar com o braço.',
      'Micro-dica: se ele pega o underhook, abaixe o quadril e puxe o braço dele para o chão antes de qualquer coisa.',
      'Micro-dica: para liberar a perna, cruze o pé livre e faça uma alavanca com o joelho, não puxe.',
      'Conceito chave: cabeça do lado oposto da perna presa elimina o whizzer e o underhook dele.'
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
    condicoes: [
      'A cabeça dele vira para longe do seu quadril',
      'Seu quadril está exatamente acima do quadril dele (não na barriga)',
      'O braço de baixo dele está preso entre o seu peito e o chão'
    ],
    dicas: [
      'Micro-dica: jogue seu peso no ombro do cross-face, não na mão — mão é alvo de kimura.',
      'Micro-dica: quando ele faz frames, não tente passar por cima; remova o frame primeiro empurrando o cotovelo para dentro.',
      'Micro-dica: para subir para montada, primeiro deslize seu joelho que está no quadril até a linha do umbigo.',
      'Conceito chave: posição morta = ele não gira. Se ele gira, você ainda não consolidou.'
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
    condicoes: [
      'Ele não consegue fazer ponte porque seus joelhos travam os quadris',
      'Seu quadril está na linha do esterno, não na barriga',
      'Um braço dele está fora da linha do corpo (acima da cabeça)'
    ],
    dicas: [
      'Micro-dica: na montada alta, incline-se levemente para frente para bloquear a ponte, não para trás.',
      'Micro-dica: para isolar o braço, empurre o cotovelo dele para cima enquanto você desliza o joelho para o S-mount.',
      'Micro-dica: se ele tenta elbow escape, coloque grapevine (gancho) na perna do mesmo lado da fuga.',
      'Conceito chave: montada é posição de controle; finalização é consequência, não objetivo.'
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
    condicoes: [
      'Uma costa dele está no chão e o outro ombro aponta para cima',
      'Sua cabeça está do lado do braço de baixo (não do de cima)',
      'Você conseguiu travar ganchos ou body triangle'
    ],
    dicas: [
      'Micro-dica: body triangle é um controle defensivo; ganchos nas coxas permitem atacar mais rápido.',
      'Micro-dica: para puxar o ombro dele para trás, empurre com a perna de baixo, não só com as mãos.',
      'Micro-dica: se ele defende o mata-leão com a mão, use a mão de cima para arrancar a defesa primeiro.',
      'Conceito chave: seatbelt antes dos ganchos — se você perde o seatbelt, perde as costas.'
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
    condicoes: [
      'Ele está plano com a cabeça ligeiramente levantada pela pressão',
      'Sua mão primeira já está nas costas dele (lapela cruzada profunda)',
      'Seu quadril permanece baixo na montada durante todo o movimento'
    ],
    dicas: [
      'Micro-dica: não puxe a lapela para cima — gire os punhos para fora e empurre o peito.',
      'Micro-dica: se ele defende com a mão na sua garganta, use o cotovelo para abrir e reengatar.',
      'Conceito chave: estrangulamento de lapela é pressão, não alavanca de braço.'
    ],
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
    condicoes: [
      'O braço dele está acima da linha do seu quadril (perto da sua cabeça)',
      'Seu joelho da frente está colado na cabeça dele, bloqueando a fuga',
      'Seu quadril está alinhado com o ombro dele'
    ],
    dicas: [
      'Micro-dica: caia para trás devagar, mantendo os joelhos juntos; velocidade cede espaço.',
      'Micro-dica: se ele une as mãos para defender, torça o pulso para fora e empurre com o quadril.',
      'Conceito chave: no armlock, o quadril fecha a articulação; os braços só seguram.'
    ],
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
    condicoes: [
      'O braço dele está cruzado sobre o pescoço dele',
      'Sua cabeça está no lado de dentro do braço (não do lado do cotovelo)',
      'Você contrai para frente e para baixo, não para os lados'
    ],
    dicas: [
      'Micro-dica: para travar, puxe a cabeça dele para dentro com uma mão e empurre a própria cabeça para fora.',
      'Micro-dica: deslize para o lado (sair da montada) para finalizar — na montada o ângulo é ruim.',
      'Conceito chave: kata-gatame finaliza pela pressão do ombro + braço; não é torção.'
    ],
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
    condicoes: [
      'Você tem o seatbelt e ganchos/body triangle',
      'Há espaço suficiente sob o queixo dele para deslizar a mão',
      'Ele não consegue trazer as duas mãos para dentro da defesa'
    ],
    dicas: [
      'Micro-dica: a mão desliza por baixo do queixo usando o próprio queixo como calha; não tente " entrar" de força.',
      'Micro-dica: bow and arrow exige puxar a perna na cabeça dele para arquear o corpo — sem a perna, é só pressão.',
      'Conceito chave: quem controla a cabeça e a coluna finaliza as costas.'
    ],
    caminho: [
      'Puxe o ombro dele para trás para criar espaço no queixo',
      'Deslize a mão por baixo do queixo (nunca por cima)',
      'Trave a segunda mão e expanda o peito',
      'Se ele defender bem, troque para bow and arrow com a lapela'
    ],
    reacoes: [
      { se: 'Ele protege o queixo com as duas mãos', entao: 'Use a lapela: bow and arrow' },
      { se: 'Ele tenta girar', entao: 'Body triangle e continue atacando' }
    ],
    erros: ['Forçar a mão por cima do queixo', 'Perder o seatbelt ao atacar']
  },

  /* ---------- fase: em pé (extra) ---------- */
  {
    id: 'pe-arrastao',
    fase: 'pe',
    nome: 'Arm drag / arrastão para as costas',
    objetivo: 'Puxar o braço dele para cruzar e tomar as costas em pé, sem forçar a queda.',
    pegadas: ['Pegada firme na manga do braço dele', 'Puxada curta e violenta para baixo/para o lado', 'Passo ao mesmo tempo para cruzar atrás dele'],
    condicoes: ['O braço puxado cruza a frente do corpo dele', 'Seu peito passa a estar nas costas dele antes do quadril', 'Ele fica com os dois pés virados para o mesmo lado'],
    dicas: ['Micro-dica: arraste para baixo, não para o lado — baixo quebra a postura.', 'Micro-dica: depois do drag, solte e abrace as costas antes que ele gire.', 'Conceito chave: o arrastão muda o ângulo sem usar força.'],
    caminho: ['Pegue a manga do braço dele', 'Puxe curto e cruze o corpo dele', 'Dê um passo atrás do quadril dele', 'Abrace a cintura e siga para o chão nas costas'],
    reacoes: [
      { se: 'Ele gira para te encarar', entao: 'Vá para body lock ou snapdown', proximo: 'bodylock-pe' },
      { se: 'Ele cai sentado', entao: 'Pegue o seatbelt e controle as costas', proximo: 'costas' }
    ],
    erros: ['Puxar sem dar o passo do quadril — fica longe das costas', 'Segurar a manga depois de cruzar — solte para abraçar']
  },
  {
    id: 'pe-snapdown',
    fase: 'pe',
    nome: 'Snapdown + front headlock',
    objetivo: 'Quebrar a postura puxando a nuca para baixo e entrar no front headlock, abrindo raspagens ou costas.',
    pegadas: ['Mãos na nuca/cabeça dele (uma de cada lado)', 'Cotovelos colados ao corpo', 'Peso dele carregado na ponta dos pés'],
    condicoes: ['Cabeça dele abaixada abaixo da linha dos ombros', 'Seu peito colado no topo da cabeça/ombros', 'Pés à largura dele ou um pouco mais aberto'],
    dicas: ['Micro-dica: snapdown é puxada rápida + afundar o próprio nível.', 'Micro-dica: depois do snap, não solte a cabeça; passe para front headlock e derrube.', 'Conceito chave: quem quebra postura e controla a cabeça domina o wrestling.'],
    caminho: ['Estabeleça contato na cabeça', 'Puxe a nuca para baixo subitamente', 'Entre no front headlock bloqueando os dois lados', 'Gire para derrubar nas costas ou raspagem'],
    reacoes: [
      { se: 'Ele resiste e fica retinho', entao: 'Vá para o body lock ou arm drag', proximo: 'bodylock-pe' },
      { se: 'Ele cai para frente', entao: 'Acompanhe e vá para a lateral', proximo: 'consolidacao-lateral' }
    ],
    erros: ['Puxar sem baixar o nível — ele esquiva', 'Não fechar o front headlock, deixando ele levantar']
  },

  /* ---------- fase: abertura / entrada (extra) ---------- */
  {
    id: 'abertura-overunder',
    fase: 'abertura',
    nome: 'Over-under pass',
    objetivo: 'Passagem longa de pressão: um braço por baixo da perna, outro por cima, empurrando o quadril até passar.',
    pegadas: ['Um braço por baixo da coxa dele (underhook na perna)', 'Outro braço por cima do ombro controlando a gola', 'Cabeça colada no quadril/abdômen dele'],
    condicoes: ['Seus cotovelos estão colados e empurram para baixo', 'Peso avança aos poucos sobre a perna dele', 'Ele não consegue recompor o frame porque sua cabeça bloqueia o quadril'],
    dicas: ['Micro-dica: não tente andar em volta — ande em linha reta, esmagando.', 'Micro-dica: se ele coloca a mão no seu rosto, empurre o cotovelo para dentro e continue.', 'Conceito chave: over-under é paciência + peso na perna.'],
    caminho: ['Passe um braço por baixo da coxa e outro por cima', 'Cole a cabeça no quadril dele', 'Ande para frente, matando o frame dele', 'Quando a perna ceder, caia na meia-guarda por cima'],
    reacoes: [
      { se: 'Ele recompõe a guarda aberta', entao: 'Aumente a pressão e vá para o leg drag', proximo: 'entrada-legdrag' },
      { se: 'Ele tenta meia-guarda profunda', entao: 'Aceite e consolide', proximo: 'meia-topo' }
    ],
    erros: ['Levantar a cabeça — ele coloca frame e te empurra', 'Andar para o lado sem pressão na perna']
  },
  {
    id: 'abertura-smash',
    fase: 'abertura',
    nome: 'Smash pass contra meia-guarda',
    objetivo: 'Esmagar o quadril dele contra o chão quando ele está de lado na meia, passando por cima com o ombro no queixo.',
    pegadas: ['Underhook na perna ou no braço de baixo', 'Ombro no quadril/barriga dele forçando-o de lado', 'Cabeça do lado do quadril preso'],
    condicoes: ['Ele está de lado, não de costas', 'Seu ombro empurra o quadril para baixo', 'A perna dele presa está dobrada e sem espaço'],
    dicas: ['Micro-dica: a smash pass funciona quando ele já está quase de lado — force isso primeiro.', 'Micro-dica: não cruze as pernas dele; esmague o joelho no peito dele.', 'Conceito chave: smash = ângulo da coxa dele apontando para cima sendo anulado.'],
    caminho: ['Chegue na meia-guarda com ele de lado', 'Use o ombro para esmagar o quadril no chão', 'Pise a perna presa e pule para o outro lado', 'Consolide na lateral'],
    reacoes: [
      { se: 'Ele fica plano de costas', entao: 'Siga para a meia-guarda por cima', proximo: 'meia-topo' },
      { se: 'Ele gira para longe', entao: 'Vá direto para as costas', proximo: 'costas' }
    ],
    erros: ['Tentar smashear alguém deitado de costas retinho', 'Não controlar o braço de cima — ele levanta e te empurra']
  },

  /* ---------- fase: meia-guarda (extra) ---------- */
  {
    id: 'meia-deep-half',
    fase: 'meia',
    nome: 'Defesa da meia-guarda profunda (deep half)',
    objetivo: 'Evitar ser raspado para cima quando ele entra por baixo da sua perna na meia-guarda.',
    pegadas: ['Whizzer forte no braço dele', 'Mão livre no chão para base', 'Quadril baixo, sentado no calcanhar dele'],
    condicoes: ['Seu quadril está no chão ou abaixo do dele', 'A perna dele não consegue levantar seu quadril', 'Whizzer travando o braço dele'],
    dicas: ['Micro-dica: nunca deixe ele agarrar a sua calça/cintura na deep half.', 'Micro-dica: se ele levanta, sente no seu quadril e pule para o outro lado.', 'Conceito chave: deep half morre quando você controla o braço e o quadril.'],
    caminho: ['Sente no quadril dele imediatamente', 'Cole o whizzer e empurre o braço para o chão', 'Pise a perna presa e pule para o lado contrário', 'Consolide em cima ou vá para as costas'],
    reacoes: [
      { se: 'Ele tenta levantar você', entao: 'Sente mais e use o peso para baixo', proximo: 'meia-topo' },
      { se: 'Ele expõe as costas', entao: 'Vá para as costas', proximo: 'costas' }
    ],
    erros: ['Levantar o quadril (aí ele raspa)', 'Não colocar o whizzer']
  },
  {
    id: 'meia-whizzer',
    fase: 'meia',
    nome: 'Passando com o whizzer (surpresa)',
    objetivo: 'Usar o overhook dele a seu favor para girar e cair do outro lado, sem lutar contra o underhook.',
    pegadas: ['Whizzer no braço dele do lado da perna presa', 'Mão de fora controlando a gola ou quadril', 'Cabeça do lado do whizzer'],
    condicoes: ['Ele colocou o whizzer pensando em raspar', 'Seu quadril está abaixo do dele', 'Você tem espaço para girar por baixo'],
    dicas: ['Micro-dica: não lute para arrancar o whizzer — use a rotação para o lado dele.', 'Micro-dica: pise forte com o pé de fora para criar impulso.', 'Conceito chave: toda reação dele abre um ângulo; o whizzer abre a rotação.'],
    caminho: ['Aceite o whizzer e segure a gola', 'Abaixe o quadril e gire por baixo do braço dele', 'Apareça do outro lado com o peito no chão', 'Consolide na lateral'],
    reacoes: [
      { se: 'Ele segura a perna', entao: 'Cruze o pé e libere a perna', proximo: 'consolidacao-lateral' },
      { se: 'Ele gira para fugir', entao: 'Vá para as costas', proximo: 'costas' }
    ],
    erros: ['Subir o quadril durante a rotação', 'Não segurar a gola — ele se afasta']
  },

  /* ---------- fase: consolidação (extra) ---------- */
  {
    id: 'consolidacao-knee-belly',
    fase: 'consolidacao',
    nome: 'Knee on belly móvel',
    objetivo: 'Usar um joelho na barriga como ponto de controle dinâmico para finalizar ou passar sem perder pressão.',
    pegadas: ['Joelho na linha do umbigo, pé de fora no chão para base', 'Mão de cima controlando a gola ou manga', 'Mão de baixo segurando a calça/cintura'],
    condicoes: ['Seu peso passa pelo joelho, não pelo quadril inteiro', 'A mão de baixo puxa o quadril dele para baixo', 'Ele não consegue sentar porque o joelho travou o abdômen'],
    dicas: ['Micro-dica: knee on belly é controle temporário — decida montada ou finalização rápido.', 'Micro-dica: se ele empurra o joelho, passe para o outro lado ou suba para montada.', 'Conceito chave: mobilidade > peso no knee on belly; se parar, ele te raspa.'],
    caminho: ['Coloque o joelho no umbigo com peso', 'Segure a gola e a calça para ancorar', 'Ameace montada para forçar a defesa', 'Suba para montada ou troque de lado'],
    reacoes: [
      { se: 'Ele empurra o joelho', entao: 'Suba para a montada do lado oposto', proximo: 'montada-controle' },
      { se: 'Ele fica passivo', entao: 'Aumente a pressão e finalize com armlock/kimura', proximo: 'fin-kimura' }
    ],
    erros: ['Ficar parado no knee on belly', 'Perder a pegada de baixo']
  },
  {
    id: 'consolidacao-nortesul',
    fase: 'consolidacao',
    nome: 'Norte-sul',
    objetivo: 'Controlar de cima com a cabeça virada para os pés dele, bloqueando rotações e preparando finalizações de costas/montada.',
    pegadas: ['Peito na barriga, cabeça na direção dos joelhos dele', 'Mãos controlando os quadris/calça', 'Joelhos no chão ao lado do corpo dele'],
    condicoes: ['Seus joelhos bloqueiam os quadris dele', 'Cabeça dele vira para o lado da mão de cima', 'Você consegue levantar o quadril dele levemente com os cotovelos'],
    dicas: ['Micro-dica: norte-sul é ponte para costas ou montada; não é para finalizar direto.', 'Micro-dica: para ir para as costas, agarre a calça e puxe para baixo enquanto dá a volta.', 'Conceito chave: controle de quadril + bloqueio de torção.'],
    caminho: ['Estabeleça o norte-sul com joelhos nos quadris', 'Ameace montada para ele girar', 'Siga a rotação e pegue as costas ou volte para montada'],
    reacoes: [
      { se: 'Ele gira para a esquerda', entao: 'Siga e pegue as costas', proximo: 'costas' },
      { se: 'Ele gira para a direita', entao: 'Montada', proximo: 'montada-controle' }
    ],
    erros: ['Ficar muito alto — ele te empurra', 'Não acompanhar a rotação dele']
  },
  {
    id: 'consolidacao-kesa',
    fase: 'consolidacao',
    nome: 'Kesa gatame / 100kg lateral',
    objetivo: 'Side control com seu quadril virado para a cabeça dele, bloqueando a rotação e abrindo estrangulamentos.',
    pegadas: ['Braço dele isolado ao redor do seu pescoço', 'Sua coxa/passando por baixo do quadril dele', 'Mão livre segurando a calça ou quadril'],
    condicoes: ['O quadril dele está virado para cima (lado do rosto)', 'Seu peso passa pelo peito sobre o braço isolado', 'Ele não consegue fazer hip escape porque seu pé bloqueia'],
    dicas: ['Micro-dica: kesa gatame é perfeita para ameaçar a lapela ou finalizar por estrangulamento de braço.', 'Micro-dica: se ele gira para você, ajuste o quadril e volte para o cem quilos.', 'Conceito chave: isolamento do braço + peso no peitoral.'],
    caminho: ['Parta da lateral com o braço isolado', 'Gire o quadril para cima, sentando no peitoral dele', 'Ameace finalização para forçar a defesa', 'Se defender, volte para a lateral ou montada'],
    reacoes: [
      { se: 'Ele defende o braço', entao: 'Vá para o kata-gatame', proximo: 'fin-katagatame' },
      { se: 'Ele gira para fora', entao: 'Montada', proximo: 'montada-controle' }
    ],
    erros: ['Deixar ele trazer o braço de volta', 'Perder a base para trás']
  },

  /* ---------- fase: montada (extra) ---------- */
  {
    id: 'montada-smount',
    fase: 'montada',
    nome: 'S-mount',
    objetivo: 'Montada girada com um pé colado no quadril dele, isolando o braço para armlock ou kata-gatame.',
    pegadas: ['Joelho da frente colado no quadril dele', 'Joelho de trás ao lado da cabeça dele', 'Mão controlando o braço isolado'],
    condicoes: ['Um braço dele está isolado entre os seus joelhos', 'Seu quadril está alinhado com o ombro dele', 'Ele não consegue fazer hip escape porque o pé bloqueia'],
    dicas: ['Micro-dica: suba para S-mount empurrando o cotovelo dele para dentro.', 'Micro-dica: se ele puxa o braço para dentro, caia para armlock imediatamente.', 'Conceito chave: S-mount é metade do armlock; o braço já está no caminho.'],
    caminho: ['Parta da montada alta', 'Empurre o cotovelo dele para dentro e deslize o joelho', 'Sente no quadril dele com um pé embaixo do quadril', 'Ataque armlock ou kata-gatame'],
    reacoes: [
      { se: 'Ele defende o braço puxando para dentro', entao: 'Armlock', proximo: 'fin-armlock' },
      { se: 'Ele cruza os braços', entao: 'Kata-gatame', proximo: 'fin-katagatame' }
    ],
    erros: ['Ficar de S-mount sem isolar o braço', 'Não bloquear o quadril com o pé']
  },

  /* ---------- fase: finalização (extra) ---------- */
  {
    id: 'fin-americana',
    fase: 'finalizacao',
    nome: 'Americana do side control',
    objetivo: 'Finalizar o braço dele girando-o para fora enquanto ele está deitado de lado.',
    pegadas: ['Braço dele isolado ao lado da cabeça', 'Seu braço por baixo do braço dele controlando o punho', 'Mão livre segurando o próprio punho'],
    condicoes: ['O cotovelo dele está flexionado', 'Seu quadril está colado no dele, sem espaço para rolar', 'O braço dele aponta para longe do corpo'],
    dicas: ['Micro-dica: para quebrar o braço, levante o cotovelo e gire o pulso para fora.', 'Micro-dica: se ele junta as mãos, pressione com o ombro no rosto dele para abrir.', 'Conceito chave: americana é torção do ombro, não força no pulso.'],
    caminho: ['Isole o braço na lateral', 'Passe o braço por baixo e segure o punho', 'Segure seu próprio punho e levante o cotovelo dele', 'Gire o pulso para fora devagar'],
    reacoes: [
      { se: 'Ele defende juntando as mãos', entao: 'Pressione o ombro no rosto e reajuste', proximo: 'fin-katagatame' },
      { se: 'Ele gira de bruços', entao: 'Vá para as costas', proximo: 'costas' }
    ],
    erros: ['Tentar finalizar com espaço entre os quadris', 'Puxar o pulso em vez de levantar o cotovelo']
  },
  {
    id: 'fin-kimura',
    fase: 'finalizacao',
    nome: 'Kimura do side control / meia-guarda',
    objetivo: 'Quebrar o ombro dele controlando o punho e girando o braço para trás.',
    pegadas: ['Controle do punho dele com uma mão', 'Seu outro braço passando por baixo do braço dele para segurar o próprio punho', 'Quadril rodando para criar ângulo'],
    condicoes: ['O braço dele está afastado do corpo', 'Seu corpo está perpendicular ao dele', 'O quadril está no chão e gira com o braço'],
    dicas: ['Micro-dica: não puxe o braço para trás sozinho — o quadril gira junto.', 'Micro-dica: se ele defende com a mão livre, segure o punho com as duas mãos e dê um passo acima da cabeça.', 'Conceito chave: kimura é controle de punho + rotação do quadril.'],
    caminho: ['Segure o punho dele', 'Passe o braço por baixo e trave o próprio punho', 'Gire o corpo perpendicular a ele', 'Leve o braço para trás mantendo o cotovelo alto'],
    reacoes: [
      { se: 'Ele gira para escapar', entao: 'Siga e vá para as costas', proximo: 'costas' },
      { se: 'Ele levanta o quadril', entao: 'Sente e finalize no chão ou montada', proximo: 'montada-controle' }
    ],
    erros: ['Tentar kimura sem isolar o braço', 'Não girar o quadril']
  },
  {
    id: 'fin-bowarrow',
    fase: 'finalizacao',
    nome: 'Bow and arrow das costas',
    objetivo: 'Estrangular a partir das costas usando a lapela dele e a perna na cabeça, arqueando o corpo.',
    pegadas: ['Mão na gola/lapela dele por baixo do pescoço', 'Perna de fora na cabeça dele', 'A mão livre puxa a calça/faixa do mesmo lado'],
    condicoes: ['Seatbelt ou controle de quadril estável', 'Você conseguiu colocar a perna na cabeça dele', 'A cabeça dele está virada para cima'],
    dicas: ['Micro-dica: a perna na cabeça arqueia ele; sem isso é só pressão.', 'Micro-dica: puxe a lapela para baixo e para trás, não para cima.', 'Conceito chave: finalização das costas vem da torção da coluna.'],
    caminho: ['Pegue a lapela por baixo do pescoço seguro', 'Coloque a perna na cabeça dele', 'Segure a calça do lado da perna', 'Puxe a lapela e empurre com a perna ao mesmo tempo'],
    reacoes: [
      { se: 'Ele defende com a mão na lapela', entao: 'Mude para mata-leão tradicional', proximo: 'fin-mataleao' },
      { se: 'Ele gira para dentro', entao: 'Mantenha o controle e volte para as costas', proximo: 'costas' }
    ],
    erros: ['Tentar finalizar sem colocar a perna na cabeça', 'Soltar o seatbelt para atacar']
  }
];

const porId = id => SISTEMA.find(n => n.id === id);

function tagImportancia(nivel) {
  if (nivel.includes('Crítico')) return 'critico';
  if (nivel.includes('Alto')) return 'alto';
  return '';
}

function conceitosDaPosicao(n) {
  if (typeof CONCEITOS === 'undefined') return [];
  const nome = n.nome.toLowerCase();
  const fase = n.fase;
  return CONCEITOS.filter(c => {
    const ondes = c.onde.map(o => o.toLowerCase());
    if (fase === 'pe' && ondes.some(o => o.includes('pé'))) return true;
    if ((fase === 'abertura' || fase === 'meia') && ondes.some(o => o.includes('guarda') || o.includes('passagem') || o.includes('meia'))) return true;
    if (fase === 'consolidacao' && ondes.some(o => o.includes('side control') || o.includes('lateral') || o.includes('knee'))) return true;
    if (fase === 'montada' && ondes.some(o => o.includes('montada') || o.includes('knee on belly'))) return true;
    if (fase === 'finalizacao' && ondes.some(o => o.includes('finalização') || o.includes('montada') || o.includes('costas'))) return true;
    return ondes.some(o => nome.includes(o) || o.includes(nome));
  });
}

SISTEMA.forEach(n => { n.conceitos = conceitosDaPosicao(n).map(c => c.id); });

let noSel = 'pe-pegada';
let modoSistema = 'fluxo';

function renderSistema() {
  const mapa = document.getElementById('mapaSistema');
  if (!mapa) return;
  mapa.innerHTML = `
    <div class="modo-toggle">
      <button class="btn-modo ${modoSistema === 'fluxo' ? 'on' : ''}" data-modo="fluxo">Fluxograma</button>
      <button class="btn-modo ${modoSistema === 'lista' ? 'on' : ''}" data-modo="lista">Lista</button>
    </div>
    <div id="modoSistemaConteudo"></div>`;
  if (modoSistema === 'fluxo') renderFluxo();
  else renderLista();
  renderNo();
}

function renderLista() {
  const cont = document.getElementById('modoSistemaConteudo');
  if (!cont) return;
  cont.innerHTML = `<div class="mapa">${FASES.map(f => `
    <div class="fase">
      <h4>${f.nome}</h4>
      ${SISTEMA.filter(n => n.fase === f.id).map(n =>
        `<div class="no${n.id === noSel ? ' sel' : ''}" data-no="${n.id}">${n.nome}</div>`).join('')}
    </div>`).join('')}</div>`;
}

function renderFluxo() {
  const cont = document.getElementById('modoSistemaConteudo');
  if (!cont) return;
  const cw = 180, nw = 150, nh = 54, gapY = 18, startY = 24, padX = 20;
  const pos = new Map();
  FASES.forEach((f, i) => {
    const ns = SISTEMA.filter(n => n.fase === f.id);
    const x = i * cw + padX;
    ns.forEach((n, j) => pos.set(n.id, { x, y: startY + j * (nh + gapY), n }));
  });
  const svgW = FASES.length * cw + padX * 2;
  const maxY = Math.max(...Array.from(pos.values()).map(p => p.y)) + nh + startY;
  let arrows = '';
  SISTEMA.forEach(n => {
    const s = pos.get(n.id);
    if (!s) return;
    n.reacoes.forEach(r => {
      if (!r.proximo) return;
      const t = pos.get(r.proximo);
      if (!t) return;
      const my = s.y + nh / 2;
      const mx = t.x > s.x ? Math.max(s.x + nw, (s.x + nw + t.x) / 2) : s.x + nw + 35;
      arrows += `<polyline class="reacao-line" points="${s.x + nw},${my} ${mx},${my} ${mx},${t.y + nh / 2} ${t.x},${t.y + nh / 2}" marker-end="url(#arrow)" />`;
    });
  });
  let nodes = '';
  pos.forEach(({ x, y, n }) => {
    const sel = n.id === noSel ? ' sel' : '';
    nodes += `<g class="no${sel}" data-no="${n.id}" transform="translate(${x},${y})">
      <rect class="fluxo-rect" width="${nw}" height="${nh}" rx="9" />
      <foreignObject width="${nw}" height="${nh}">
        <div class="no-text" xmlns="http://www.w3.org/1999/xhtml">${n.nome}</div>
      </foreignObject>
    </g>`;
  });
  cont.innerHTML = `<div class="fluxo-wrap"><svg class="fluxo-svg" width="${svgW}" height="${maxY}" viewBox="0 0 ${svgW} ${maxY}">
    <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="var(--muted)" /></marker></defs>
    ${arrows}${nodes}
  </svg></div>`;
}

function renderNo() {
  const n = porId(noSel);
  const el = document.getElementById('detalheNo');
  if (!n || !el) return;
  const nivel = dados.tecnicas[n.nome] || 0;
  const conceitos = conceitosDaPosicao(n);
  const tags = conceitos.map(c => `<span class="tag ${tagImportancia(c.nivel)}">${c.conceito}</span>`).join('');
  el.innerHTML = `
    <h3>${n.nome}</h3>
    ${tags ? `<div class="tags-conceito">${tags}</div>` : ''}
    <p><b>Objetivo:</b> ${n.objetivo}</p>
    <div class="grid2">
      <div>
        <h3 class="mt">Pegadas</h3>
        <ul class="bullets">${n.pegadas.map(p => `<li>${p}</li>`).join('')}</ul>
        ${n.condicoes ? `
          <h3 class="mt">Condições específicas</h3>
          <ul class="bullets cond">${n.condicoes.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
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
        ${n.dicas ? `
          <h3 class="mt">Dicas específicas</h3>
          <ul class="bullets dicas">${n.dicas.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        <h3 class="mt">Erros que te fazem perder a posição</h3>
        <ul class="bullets erros">${n.erros.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="mt">
      <span class="muted small">Seu nível nesta posição:</span>
      <span class="niveis">${['—','Aprendendo','Consolidada'].map((x, i) =>
        `<button data-nivelno="${i}" class="${nivel === i ? 'on' : ''}">${x}</button>`).join('')}</span>
    </div>`;
}

document.addEventListener('click', e => {
  const modo = e.target.closest('[data-modo]');
  if (modo) { modoSistema = modo.dataset.modo; renderSistema(); return; }
  const no = e.target.closest('#mapaSistema .no');
  if (no) { noSel = no.dataset.no; renderSistema(); return; }
  const ir = e.target.closest('button[data-ir]');
  if (ir) { noSel = ir.dataset.ir; mostrar('sistema'); renderSistema(); return; }
  const nv = e.target.closest('#detalheNo button[data-nivelno]');
  if (nv) {
    dados.tecnicas[porId(noSel).nome] = Number(nv.dataset.nivelno);
    salvar();
    renderNo();
  }
});

renderSistema();
