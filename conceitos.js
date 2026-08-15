/* Conceitos teóricos gerais e sua importância no sistema de jogo.
   Cada conceito recebe id, título, descrição, aplicação geral e nível. */

const CONCEITOS = [
  {
    id: 'base-ataque',
    conceito: 'Base primeiro, ataque depois',
    descricao: 'Você só pode finalizar ou progredir quando a posição está morta. Se ele ainda consegue se mexer, volte a consolidação.',
    onde: ['Em pé', 'Meia-guarda', 'Montada', 'Side control'],
    nivel: 'Crítico em todas as fases'
  },
  {
    id: 'cross-under',
    conceito: 'Cross-face e underhook andam juntos',
    descricao: 'Cross-face vira a cabeça, underhook controla a coluna. Juntos, eles apagam a rotação dele. Perder um dos dois deixa ele vivo.',
    onde: ['Meia-guarda por cima', 'Side control'],
    nivel: 'Crítico para o topo'
  },
  {
    id: 'angulo',
    conceito: 'Ângulo, ângulo, ângulo',
    descricao: 'Passar de frente é luta de força. Passar pelo ângulo é luta de mecânica. Sempre circule para fora do pé de apoio.',
    onde: ['Em pé', 'Knee cut', 'Leg drag', 'Over-under'],
    nivel: 'Crítico na passagem'
  },
  {
    id: 'quadril-baixo',
    conceito: 'Quem sobe primeiro no quadril ganha',
    descricao: 'Na meia-guarda, quem coloca o quadril mais alto controla a transição. Seu quadril deve ficar abaixo e à frente do dele.',
    onde: ['Meia-guarda por cima'],
    nivel: 'Crítico na passagem e defesa'
  },
  {
    id: 'peso-vertical',
    conceito: 'Peso em cima, não à frente',
    descricao: 'Passe o peso verticalmente sobre o corpo dele. Peso à frente gera postura e convida à ponte ou ao levantamento.',
    onde: ['Side control', 'Montada', 'Knee on belly'],
    nivel: 'Alto'
  },
  {
    id: 'braco-cabeca',
    conceito: 'Mate o braço acima da cabeça',
    descricao: 'Na montada, o braço dele isolado acima da cabeça abre armlock, lapela e kata-gatame. Mantenha os dois braços baixos até quebrar isso.',
    onde: ['Montada'],
    nivel: 'Crítico para finalizar'
  },
  {
    id: 'rola-tecnica',
    conceito: 'A rola acelera, a técnica consolida',
    descricao: 'Rolar muito sem treinar posição travada te faz repetir erros. Separe o treino: 50% técnica lenta + 50% rola com regras.',
    onde: ['Treinos gerais'],
    nivel: 'Médio'
  },
  {
    id: 'postura-quebrada',
    conceito: 'Defesa de passagem começa na postura (dele)',
    descricao: 'Se você quebra a postura dele em pé, ele não consegue nem abrir uma boa guarda. Quebra de postura = metade da passagem.',
    onde: ['Em pé', 'Abertura de guarda'],
    nivel: 'Crítico na passagem'
  },
  {
    id: 'cotovelos-colados',
    conceito: 'Mãos coladas, cotovelos grudados',
    descricao: 'Braços distantes do corpo são alvos de armlock, triângulo e ganhos de posição. Cotovelos junto ao corpo = estrutura.',
    onde: ['Todas as posições'],
    nivel: 'Alto'
  },
  {
    id: 'cabeca-oposta',
    conceito: 'Cabeça do lado oposto da perna presa',
    descricao: 'Na meia-guarda por cima, cabeça do outro lado impede ele de sentar e pegar o underhook/whizzer do lado certo.',
    onde: ['Meia-guarda por cima'],
    nivel: 'Crítico no topo'
  },
  {
    id: 'rotacao-escape',
    conceito: 'Se ele pode girar, ele pode escapar',
    descricao: 'Toda fuga passa por rotação. Se controlar a cabeça e o quadril dele, você elimina a fuga.',
    onde: ['Side control', 'Montada', 'Costas'],
    nivel: 'Alto'
  },
  {
    id: 'finalizacao-controle',
    conceito: 'Finalização é consequência de controle',
    descricao: 'Não finalize no momento em que você chega ao controle — segure 10-15s, depois ataque. O cansaço dele torna a finalização mais fácil.',
    onde: ['Montada', 'Side control', 'Costas'],
    nivel: 'Alto'
  },
  {
    id: 'respiracao',
    conceito: 'Respiração controla o gás',
    descricao: 'Respirar pela narina e manter a boca fechada prolonga a rola e reduz o pânico em posições apertadas.',
    onde: ['Todas as posições'],
    nivel: 'Médio'
  },
  {
    id: 'risco-recompensa',
    conceito: 'Cada posição é uma aposta: risco x recompensa',
    descricao: 'Montada = controle máximo, finalizações fortes, mas raspável. Side control = mais segura, menos finalizações. Escolha pelo contexto.',
    onde: ['Decisão tática'],
    nivel: 'Médio'
  },
  {
    id: 'conexao',
    conceito: 'Conexão: quem solta os pontos de controle primeiro perde',
    descricao: 'Body lock, pegada de gola e ganchos só funcionam enquanto você não solta. Perder a conexão antes de estabilizar devolve a iniciativa.',
    onde: ['Body lock', 'Costas', 'Montada'],
    nivel: 'Alto'
  },
  {
    id: 'alavanca-base',
    conceito: 'Sempre atacar a base dele primeiro',
    descricao: 'Ninguém finaliza nem passa alguém com base. Antes de atacar, remova um ponto de apoio (cabeça, quadril, cotovelo ou pé).',
    onde: ['Em pé', 'Passagem', 'Finalização'],
    nivel: 'Crítico'
  },
  {
    id: 'criar-reatividade',
    conceito: 'Crie a reação que você quer explorar',
    descricao: 'Estilo Mica: ameace um ataque para forçar a defesa dele, depois apareça no espaço que a defesa abriu.',
    onde: ['Passagem', 'Finalização', 'Em pé'],
    nivel: 'Alto'
  },
  {
    id: 'sequencial',
    conceito: 'O jogo é uma sequência de checkpoints, não de saltos',
    descricao: 'Você não passa direto para a montada; passa pela meia consolidada. Se perdeu um checkpoint, volte um passo em vez de forçar.',
    onde: ['Sistema de posições'],
    nivel: 'Crítico'
  },
  {
    id: 'quadril-rei',
    conceito: 'Quem controla o quadril controla a posição',
    descricao: 'Cabeça e braços são importantes, mas o quadril é o centro de massa. Travar o quadril dele congela frames e escapes.',
    onde: ['Todas as posições'],
    nivel: 'Crítico'
  },
  {
    id: 'leglock-prev',
    conceito: 'Proteja a linha do joelho contra leglocks',
    descricao: 'Não deixe seu pé entre as pernas dele sem controlo de quadril. Para fora, ponta do pé para fora, calcanhar escondido.',
    onde: ['Guarda aberta', 'Passagem', 'Meia-guarda'],
    nivel: 'Alto'
  }
];
