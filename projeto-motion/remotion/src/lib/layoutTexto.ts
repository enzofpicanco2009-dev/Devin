export type LayoutTexto = {
  linhas: string[];
  tamanhoFonte: number;
  truncado: boolean;
};

export function quebrarLinhas(texto: string, maxCaracteres: number): string[] {
  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const candidata = atual ? `${atual} ${p}` : p;
    if (candidata.length <= maxCaracteres || !atual) {
      atual = candidata;
    } else {
      linhas.push(atual);
      atual = p;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export function ajustarTexto(
  texto: string,
  opts: {
    tamanhoMax: number;
    tamanhoMin: number;
    maxLinhas: number;
    maxCaracteresLinha: number;
  },
): LayoutTexto {
  let tamanho = opts.tamanhoMax;
  while (tamanho >= opts.tamanhoMin) {
    const fator = opts.tamanhoMax / tamanho;
    const maxChars = Math.floor(opts.maxCaracteresLinha * fator);
    const linhas = quebrarLinhas(texto, maxChars);
    if (linhas.length <= opts.maxLinhas) {
      return { linhas, tamanhoFonte: tamanho, truncado: false };
    }
    tamanho -= 4;
  }
  const fator = opts.tamanhoMax / opts.tamanhoMin;
  const maxChars = Math.floor(opts.maxCaracteresLinha * fator);
  const linhas = quebrarLinhas(texto, maxChars).slice(0, opts.maxLinhas);
  const ultima = linhas[linhas.length - 1];
  linhas[linhas.length - 1] = ultima.replace(/\S+$/, "…");
  return { linhas, tamanhoFonte: opts.tamanhoMin, truncado: true };
}
