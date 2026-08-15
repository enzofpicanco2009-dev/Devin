/* Manual — dicionário, conceitos gerais e microdicas complementares */

const DICIONARIO = [
  { termo: 'Base', definicao: 'Distribuição do peso que impede ser desequilibrado. Base baixa e larga = difícil de derrubar; base estreita e alta = fácil de empurrar ou raspar.' },
  { termo: 'Postura', definicao: 'Alinhamento da coluna, cabeça e quadril. Postura quebrada = cabeça baixa, quadril para trás. Postura rígida = cabeça para trás, quadril à frente.' },
  { termo: 'Pegada / Grip', definicao: 'Qualquer controle que suas mãos fazem no adversário (gola, manga, calça, punho). Pegada dominante = você puxa antes dele.' },
  { termo: 'Quebrar a postura', definicao: 'Fazer ele dobrar para a frente, abaixar a cabeça ou levar o quadril para trás — ele fica sem força para atacar.' },
  { termo: 'Underhook', definicao: 'Seu braço passa por baixo da axila dele. Quem tem o underhook leva o peso para cima e abre caminhos de passagem/raspagem.' },
  { termo: 'Whizzer / Overhook', definicao: 'Seu braço passa por cima do braço dele. Útil para defender e virar, mas geralmente perde contra underhook bem colocado.' },
  { termo: 'Cross-face', definicao: 'Você encosta o ombro/jaw no rosto dele, virando a cabeça para longe. Ferramenta número 1 para segurar o topo.' },
  { termo: 'Hip escape / shrimp', definicao: 'Movimento de quadril para trás e para o lado, criando espaço para recuperar a guarda.' },
  { termo: 'Frame', definicao: 'Estrutura rígida (braço ou perna estendidos) que cria espaço entre você e o adversário.' },
  { termo: 'Guarda fechada', definicao: 'Pernas dele travadas na sua cintura. Posição defensiva dele; você precisa abrir antes de passar.' },
  { termo: 'Guarda aberta', definicao: 'Pernas dele soltas. Passador tem espaço, mas ela pode colocar ganchos (DLR, lasso, aranha).' },
  { termo: 'De La Riva (DLR)', definicao: 'Guarda com um gancho de fora na sua perna de trás e controle de manga/gola. Ameça raspagem e berimbolo.' },
  { termo: 'Meia-guarda', definicao: 'Apenas uma perna dele entre suas pernas. Posição de transição; quem dominar os frames/underhook passa ou raspa.' },
  { termo: 'Meia-guarda por cima', definicao: 'Você está no topo com a perna dele entre as suas. Sua posição-âncora para começar a pressão.' },
  { termo: 'Deep half / meia profunda', definicao: 'Ele fica debaixo da sua perna na meia-guarda, ameaçando raspar para cima. Perigosa se você levantar o quadril.' },
  { termo: 'Side control / cem quilos', definicao: 'Você deitado de lado por cima, peito no peito, segurando. Controlar antes de finalizar.' },
  { termo: 'Montada', definicao: 'Você sentado na barriga/peito dele, pernas na linha axial. Posição dominante, mas exige base para não ser raspado.' },
  { termo: 'S-mount', definicao: 'Montada com um pé colado no quadril e corpo girado, isolando um braço. Passagem direta para armlock.' },
  { termo: 'Seatbelt / cinturão', definicao: 'Controle das costas: um braço por cima do ombro, outro por baixo da axila, mãos travadas.' },
  { termo: 'Grapevine / ganchos', definicao: 'Seus pés enroscados nas panturrilhas dele na montada, travando o hip escape.' },
  { termo: 'Knee cut', definicao: 'Passagem por cima da coxa dele, cortando com o joelho, geralmente indo para a meia-guarda por cima.' },
  { termo: 'Leg drag', definicao: 'Arrastar a perna dele através do seu corpo, deixando-a cruzada, e cair por cima com pressão.' },
  { termo: 'Body lock', definicao: 'Dois braços travados no quadril/cintura dele, colando quadril com quadril. Elimina as pernas como ataque.' },
  { termo: 'Toreando', definicao: 'Passagem empurrando as duas panturrilhas para um lado e circulando para o outro.' },
  { termo: 'Kata-gatame', definicao: 'Estrangulamento usando o próprio braço dele cruzado no pescoço. Funciona do topo, lateral e montada.' },
  { termo: 'Bow and arrow', definicao: 'Estrangulamento das costas usando a lapela dele e a perna na cabeça. Finalização de alta taxa.' },
  { termo: 'Americana', definicao: 'Chave de braço girando o braço dele para fora, com o cotovelo dobrado.' },
  { termo: 'Kimura', definicao: 'Chave de braço controlando o punho e quebrando a postura do ombro para trás.' },
  { termo: 'Arm triangle / triângulo de braço', definicao: 'Estrangulamento com o braço dele e seu ombro, sem usar as costas do adversário.' },
  { termo: 'Sprawl', definicao: 'Jogar as pernas para trás para defender queda, levando o peso nas costas dele.' },
  { termo: 'Deload', definicao: 'Semana com 60-70% do volume/intensidade para recuperação e consolidação técnica.' },
  { termo: 'Sequência', definicao: 'Dias de treino consecutivos. Manter uma sequência ajuda a fixar o sistema.' }
];

const CONCEITOS = [
  {
    conceito: 'Base primeiro, ataque depois',
    descricao: 'Você só pode finalizar ou progredir quando a posição está morta. Se ele ainda consegue se mexer, volte a consolidação.',
    onde: ['Em pé', 'Meia-guarda', 'Montada', 'Side control'],
    nivel: 'Crítico em todas as fases'
  },
  {
    conceito: 'Cross-face e underhook andam juntos',
    descricao: 'Cross-face vira a cabeça, underhook controla a coluna. Juntos, eles apagam a rotação dele. Perder um dos dois deixa ele vivo.',
    onde: ['Meia-guarda por cima', 'Side control'],
    nivel: 'Crítico para o topo'
  },
  {
    conceito: 'Ângulo, ângulo, ângulo',
    descricao: 'Passar de frente é luta de força. Passar pelo ângulo é luta de mecânica. Sempre circule para fora do pé de apoio.',
    onde: ['Em pé', 'Knee cut', 'Leg drag'],
    nivel: 'Crítico na passagem'
  },
  {
    conceito: 'Quem sobe primeiro no quadril ganha',
    descricao: 'Na meia-guarda, quem coloca o quadril mais alto controla a transição. Seu quadril deve ficar abaixo e à frente do dele.',
    onde: ['Meia-guarda por cima'],
    nivel: 'Crítico na passagem e defesa'
  },
  {
    conceito: 'Peso em cima, não à frente',
    descricao: 'Passe o peso verticalmente sobre o corpo dele. Peso à frente gera postura e convida à ponte ou ao levantamento.',
    onde: ['Side control', 'Montada', 'Knee on belly'],
    nivel: 'Alto'
  },
  {
    conceito: 'Mate o braço acima da cabeça',
    descricao: 'Na montada, o braço dele isolado acima da cabeça = armlock, lapela, kata-gatame abertos. Mantenha os dois braços baixos até quebrar isso.',
    onde: ['Montada'],
    nivel: 'Crítico para finalizar'
  },
  {
    conceito: 'A rola acelera, a técnica consolida',
    descricao: 'Rolar muito sem treinar posição travada te faz repetir erros. Separe o treino: 50% técnica lenta + 50% rola com regras.',
    onde: ['Treinos gerais'],
    nivel: 'Médio'
  },
  {
    conceito: 'Defesa de passagem começa na postura (dele)',
    descricao: 'Se você quebra a postura dele em pé, ele não consegue nem abrir uma boa guarda. Quebra de postura = metade da passagem.',
    onde: ['Em pé', 'Abertura de guarda'],
    nivel: 'Crítico na passagem'
  },
  {
    conceito: 'Mãos coladas, cotovelos grudados',
    descricao: 'Braços distantes do corpo são alvos de armlock, triângulo e ganhos de posição. Cotovelos junto ao corpo = estrutura.',
    onde: ['Todas as posições'],
    nivel: 'Alto'
  },
  {
    conceito: 'Cabeça do lado oposto da perna presa',
    descricao: 'Na meia-guarda por cima, cabeça do outro lado impede ele de sentar e pegar o underhook/whizzer do lado certo.',
    onde: ['Meia-guarda por cima'],
    nivel: 'Crítico no topo'
  },
  {
    conceito: 'Se ele pode girar, ele pode escapar',
    descricao: 'Toda fuga passa por rotação. Se controlar a cabeça e o quadril dele, você elimina a fuga.',
    onde: ['Side control', 'Montada', 'Costas'],
    nivel: 'Alto'
  },
  {
    conceito: 'Finalização é consequência de controle',
    descricao: 'Não finalize no momento em que você chega ao controle — segure 10-15s, depois ataque. O cansaço dele torna a finalização mais fácil.',
    onde: ['Montada', 'Side control', 'Costas'],
    nivel: 'Alto'
  },
  {
    conceito: 'Respiração controla o gás',
    descricao: 'Respirar pela narina e manter a boca fechada prolonga a rola e reduz o pânico em posições apertadas.',
    onde: ['Todas as posições'],
    nivel: 'Médio'
  },
  {
    conceito: 'Cada posição é uma aposta: risco x recompensa',
    descricao: 'Montada = controle máximo, finalizações fortes, mas raspável. Side control = mais segura, menos finalizações. Escolha pelo contexto.',
    onde: ['Decisão tática'],
    nivel: 'Médio'
  }
];

function renderManual() {
  const cont = document.getElementById('conteudoManual');
  if (!cont) return;
  cont.innerHTML = `
    <div class="card">
      <h3>Dicionário</h3>
      <p class="muted small">Clique no termo para ver a definição. Use esse glossário quando aparecer algo que você não lembrar.</p>
      <div class="dicionario">
        ${DICIONARIO.map(d => `
          <details class="termo">
            <summary>${d.termo}</summary>
            <div>${d.definicao}</div>
          </details>`).join('')}
      </div>
    </div>

    <div class="card">
      <h3>Conceitos gerais e suas importâncias</h3>
      <p class="muted small">Crítico = regra que governa seu jogo; Alto = fundamental; Médio = tático.</p>
      <div class="conceitos">
        ${CONCEITOS.map(c => `
          <div class="conceito">
            <div class="cab"><b>${c.conceito}</b> <span class="tag ${destaqueTag(c.nivel)}">${c.nivel}</span></div>
            <div class="desc">${c.descricao}</div>
            <div class="aplica">Onde se aplica: ${c.onde.join(', ')}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <h3>Microdicas por fase</h3>
      <p class="muted small">Condicionantes e dicas pequenas que fazem a posição funcionar ou falhar.</p>
      <div class="micro-fase">
        ${FASES.map(f => {
          const nos = SISTEMA.filter(n => n.fase === f.id);
          return `
            <h4>${f.nome}</h4>
            ${nos.map(n => `
              <div class="micro-no">
                <b>${n.nome}</b>
                ${n.condicoes ? `<ul class="bullets small cond">${n.condicoes.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
                ${n.dicas ? `<ul class="bullets small dicas">${n.dicas.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
              </div>`).join('')}
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function destaqueTag(n) {
  if (n.includes('Crítico')) return 'critico';
  if (n.includes('Alto')) return 'alto';
  return '';
}

// renderiza quando a aba Manual é escolhida
document.getElementById('tabs')?.addEventListener('click', e => {
  if (e.target.closest('.tab')?.dataset.view === 'manual') renderManual();
});
