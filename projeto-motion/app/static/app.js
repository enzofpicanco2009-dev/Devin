const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const estado = { audio: null, canal: null, tema: null, estilo: null, paleta: null, fonte: null,
  imagens: [], formatos: new Set(["16x9"]), opcoes: null, poll: null };

// ---------- navegação ----------
function mostrar(tela) {
  $$(".tela").forEach((t) => (t.hidden = t.id !== `tela-${tela}`));
  $$(".link").forEach((l) => l.classList.toggle("ativo", l.dataset.tela === tela));
  if (tela !== "progresso" && estado.poll) { clearInterval(estado.poll); estado.poll = null; }
  if (tela === "biblioteca") carregarBiblioteca();
  window.scrollTo({ top: 0 });
}
document.addEventListener("click", (e) => {
  const alvo = e.target.closest("[data-tela]");
  if (alvo) { e.preventDefault(); mostrar(alvo.dataset.tela); }
});

// ---------- opções (temas, estilos, formatos) ----------
async function carregarOpcoes() {
  estado.opcoes = await (await fetch("/api/opcoes")).json();
  const { temas, estilos, formatos, paletas, fontes, ia } = estado.opcoes;

  renderCanais();

  $("#paletas").innerHTML = `<button type="button" class="paleta sel" data-id=""><span class="sw auto"></span><small>Do tema</small></button>` +
    paletas.map((p) => `<button type="button" class="paleta" data-id="${p.id}" title="${p.nome}">
      <span class="sw" style="background:${p.cores.fundo}"><i style="background:${p.cores.destaque}"></i><i style="background:${p.cores.destaque_2}"></i><i style="background:${p.cores.texto}"></i></span><small>${p.nome}</small></button>`).join("");
  $("#fontes").innerHTML = `<button type="button" class="fonte sel" data-id=""><span>Aa</span><small>Do tema</small></button>` +
    fontes.map((f) => `<button type="button" class="fonte" data-id="${f.id}" style="font-family:${f.familia};font-weight:${f.peso}"><span>Aa</span><small>${f.nome}</small></button>`).join("");
  $("#paletas").addEventListener("click", (e) => { const b = e.target.closest(".paleta"); if (b) { estado.paleta = b.dataset.id || null; $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", x === b)); amostra(); } });
  $("#fontes").addEventListener("click", (e) => { const b = e.target.closest(".fonte"); if (b) { estado.fonte = b.dataset.id || null; $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", x === b)); amostra(); } });

  if (!ia.disponivel) { $("#usar-ia").checked = false; $("#ia-rotulo").textContent = "IA local (Ollama) não encontrada — o roteiro será feito por regras"; }
  else $("#ia-rotulo").textContent = `Roteiro visual com IA local (${ia.modelo})`;

  $("#temas").innerHTML = temas.map((t) => {
    const c = t.cores, f = t.tipografia?.fonte_titulo || {};
    return `<button type="button" class="card" data-id="${t.id}">
      <div class="previa" style="background:${c.fundo};color:${c.texto};font-family:${f.familia || "Inter"};font-weight:${f.peso || 800}">
        <span>A Selic <em style="color:${c.destaque}">define</em> tudo</span>
      </div>
      <div class="info"><strong>${t.nome}</strong><small>${t.descricao}</small></div>
    </button>`;
  }).join("");

  $("#estilos").innerHTML = estilos.map((e) => {
    const alvo = e.ritmo?.duracao_cena_alvo_s ?? 4;
    const n = Math.max(2, Math.min(8, Math.round(24 / alvo)));
    const barras = Array.from({ length: n }, (_, i) => `<span class="barra" style="width:${Math.round(120 / n) - 4}px;opacity:${0.5 + (i % 2) * 0.4}"></span>`).join("");
    return `<button type="button" class="card" data-id="${e.id}">
      <div class="previa">${barras}</div>
      <div class="info"><strong>${e.nome}</strong><small>${e.descricao}</small></div>
    </button>`;
  }).join("");

  $("#formatos").innerHTML = formatos.map((f) => `
    <button type="button" class="chip ${estado.formatos.has(f.id) ? "sel" : ""}" data-id="${f.id}">
      <span class="fmt f${f.id}"></span><span>${f.nome}<small>${f.descricao}</small></span>
    </button>`).join("");

  selecionarCanal(estado.opcoes.canais[0]?.id);

  $("#temas").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) { selecionar("tema", c.dataset.id); amostra(); } });
  $("#estilos").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionar("estilo", c.dataset.id); });
  $("#canais").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionarCanal(c.dataset.id); });
  $("#formatos").addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    if (estado.formatos.has(c.dataset.id)) { if (estado.formatos.size > 1) estado.formatos.delete(c.dataset.id); }
    else estado.formatos.add(c.dataset.id);
    $$("#formatos .chip").forEach((x) => x.classList.toggle("sel", estado.formatos.has(x.dataset.id)));
  });
}
function selecionar(tipo, id) {
  estado[tipo] = id;
  $$(`#${tipo}s .card`).forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
}

// ---------- canais (presets) ----------
function renderCanais() {
  $("#canais").innerHTML = estado.opcoes.canais.map((c) => {
    const tema = estado.opcoes.temas.find((t) => t.id === c.tema_padrao);
    const cores = c.cores || tema?.cores || {};
    return `<button type="button" class="card" data-id="${c.id}">
      <div class="previa canal-previa" style="background:${cores.fundo || "#111"};color:${cores.texto || "#fff"}"><span style="color:${cores.destaque || "#fc4"}">${escapar(c.nome.slice(0, 1).toUpperCase())}</span></div>
      <div class="info"><strong>${escapar(c.nome)}</strong><small>${escapar(c.dna?.publico || tema?.nome || "")}</small></div>
    </button>`;
  }).join("");
}
function selecionarCanal(id) {
  const c = estado.opcoes.canais.find((x) => x.id === id);
  if (!c) return;
  estado.canal = id;
  $$("#canais .card").forEach((x) => x.classList.toggle("sel", x.dataset.id === id));
  // herda o design do canal; o usuário pode trocar depois só para este vídeo
  selecionar("tema", c.tema_padrao);
  selecionar("estilo", c.estilo_padrao);
  estado.paleta = c.paleta_id || null; estado.fonte = c.fonte_id || null;
  $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", (x.dataset.id || null) === estado.paleta));
  $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", (x.dataset.id || null) === estado.fonte));
  amostra();
}
$("#nc-criar").addEventListener("click", async () => {
  const nome = $("#nc-nome").value.trim();
  $("#nc-erro").textContent = "";
  if (!nome) { $("#nc-erro").textContent = "Dê um nome ao canal."; return; }
  const fd = new FormData();
  fd.append("nome", nome); fd.append("publico", $("#nc-publico").value); fd.append("cta", $("#nc-cta").value);
  fd.append("tom", $("#nc-tom").value); fd.append("tema_id", estado.tema); fd.append("estilo_id", estado.estilo);
  fd.append("paleta_id", estado.paleta || ""); fd.append("fonte_id", estado.fonte || "");
  const r = await fetch("/api/canais", { method: "POST", body: fd });
  if (!r.ok) { $("#nc-erro").textContent = (await r.json()).detail || r.statusText; return; }
  const canal = await r.json();
  estado.opcoes.canais.push(canal);
  renderCanais(); selecionarCanal(canal.id);
  $("#novo-canal").open = false; $("#nc-nome").value = "";
});

// ---------- amostra do design ----------
function amostra() {
  const tema = estado.opcoes.temas.find((t) => t.id === estado.tema);
  const pal = estado.opcoes.paletas.find((p) => p.id === estado.paleta);
  const fon = estado.opcoes.fontes.find((f) => f.id === estado.fonte);
  const c = { ...(tema?.cores || {}), ...(pal?.cores || {}) };
  const ft = fon || { familia: tema?.tipografia?.fonte_titulo?.familia || "Inter", peso: tema?.tipografia?.fonte_titulo?.peso || 800 };
  const el = $("#amostra");
  el.style.background = c.fundo; el.style.color = c.texto; el.style.fontFamily = ft.familia; el.style.fontWeight = ft.peso;
  $("em", el).style.color = c.destaque; $(".am-num", el).style.color = c.destaque_2;
}

// ---------- imagens do projeto ----------
const inputImg = $("#imagens"), dropImg = $(".drop-img");
["dragenter", "dragover"].forEach((ev) => dropImg.addEventListener(ev, (e) => { e.preventDefault(); dropImg.classList.add("sobre"); }));
["dragleave", "drop"].forEach((ev) => dropImg.addEventListener(ev, (e) => { e.preventDefault(); dropImg.classList.remove("sobre"); }));
dropImg.addEventListener("drop", (e) => addImagens(e.dataTransfer.files));
inputImg.addEventListener("change", () => { addImagens(inputImg.files); inputImg.value = ""; });
function addImagens(files) {
  for (const f of files) if (f.type.startsWith("image/") || /\.svg$/i.test(f.name))
    estado.imagens.push({ file: f, url: URL.createObjectURL(f), tags: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "), descricao: "" });
  renderImagens();
}
function renderImagens() {
  $("#lista-imagens").innerHTML = estado.imagens.map((im, i) => `
    <div class="img-item">
      <img src="${im.url}" alt="" />
      <input type="text" class="campo" data-i="${i}" value="${escapar(im.tags)}" placeholder="palavras-chave, separadas por vírgula" />
      <button type="button" class="x" data-rm="${i}" title="Remover">×</button>
    </div>`).join("");
}
$("#lista-imagens").addEventListener("input", (e) => { const i = e.target.dataset.i; if (i !== undefined) estado.imagens[+i].tags = e.target.value; });
$("#lista-imagens").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { estado.imagens.splice(+b.dataset.rm, 1); renderImagens(); } });

// ---------- áudio ----------
const drop = $("#drop"), inputAudio = $("#audio");
["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("sobre"); }));
["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("sobre"); }));
drop.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) definirAudio(f); });
inputAudio.addEventListener("change", () => { if (inputAudio.files[0]) definirAudio(inputAudio.files[0]); });
$("#trocar").addEventListener("click", (e) => { e.preventDefault(); inputAudio.click(); });

function definirAudio(f) {
  estado.audio = f;
  $("#arq-nome").textContent = f.name;
  $("#arq-info").textContent = `${(f.size / 1024 / 1024).toFixed(1)} MB`;
  const a = document.createElement("audio");
  a.src = URL.createObjectURL(f);
  a.addEventListener("loadedmetadata", () => {
    const s = Math.round(a.duration), m = Math.floor(s / 60);
    $("#arq-info").textContent += ` · ${m}:${String(s % 60).padStart(2, "0")}`;
    URL.revokeObjectURL(a.src);
  });
  $(".drop-vazio").hidden = true; $(".drop-cheio").hidden = false;
  if (!$("#titulo").value) $("#titulo").value = f.name.replace(/\.[^.]+$/, "");
  $("#gerar").disabled = false;
}

// ---------- gerar ----------
$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!estado.audio) return;
  const btn = $("#gerar"); btn.disabled = true; btn.textContent = "Enviando…"; $("#erro-form").textContent = "";
  const fd = new FormData();
  fd.append("audio", estado.audio);
  fd.append("titulo", $("#titulo").value);
  fd.append("canal_id", estado.canal);
  fd.append("tema_id", estado.tema);
  fd.append("estilo_id", estado.estilo);
  fd.append("paleta_id", estado.paleta || "");
  fd.append("fonte_id", estado.fonte || "");
  fd.append("formatos", [...estado.formatos].join(","));
  fd.append("modelo", $("#modelo").value);
  fd.append("usar_ia", $("#usar-ia").checked ? "true" : "false");
  for (const im of estado.imagens) fd.append("imagens", im.file, im.file.name);
  fd.append("imagens_meta", JSON.stringify(estado.imagens.map((im) => ({ tags: im.tags, descricao: im.descricao }))));
  try {
    const r = await fetch("/api/projetos", { method: "POST", body: fd });
    if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
    const { id } = await r.json();
    abrirProjeto(id);
  } catch (err) {
    $("#erro-form").textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = "Gerar vídeo";
  }
});

// ---------- progresso / resultado ----------
function abrirProjeto(id) {
  mostrar("progresso");
  estado.editando = null; estado.editTemplate = null; estado.imagensProjeto = null;
  $("#resultado").hidden = true; $("#prog-erro").hidden = true; $("#log").hidden = true; $("#ao-vivo").hidden = true;
  atualizar(id);
  estado.poll = setInterval(() => atualizar(id), 1500);
}

async function atualizar(id) {
  const r = await fetch(`/api/projetos/${id}`);
  if (!r.ok) { clearInterval(estado.poll); return; }
  const p = await r.json();
  const nomeTema = estado.opcoes?.temas.find((t) => t.id === p.tema_id)?.nome ?? "";
  const nomeEstilo = estado.opcoes?.estilos.find((t) => t.id === p.estilo_id)?.nome ?? "";
  $("#prog-titulo").textContent = p.titulo;
  $("#prog-sub").textContent = [nomeTema, nomeEstilo, p.formatos.join(" · ")].filter(Boolean).join("  •  ");

  const ids = p.etapas.map(([e]) => e);
  const idx = p.etapa ? ids.indexOf(p.etapa) : (p.estado === "concluido" ? ids.length : -1);
  const fmt = p.formato_atual ? ` (${p.formato_atual})` : "";
  $("#etapas").innerHTML = p.etapas.map(([e, nome], i) => {
    const cls = p.estado === "concluido" || i < idx ? "feita" : (i === idx && p.estado === "rodando" ? "atual" : "");
    const ico = cls === "feita" ? "✓" : "";
    return `<li class="${cls}"><span class="ico">${ico}</span>${nome}${cls === "atual" ? fmt : ""}</li>`;
  }).join("");
  $("#etapas").hidden = p.estado === "novo";

  if (p.estado === "rodando" && p.log.length) { $("#log").hidden = false; $("#log").textContent = p.log.join("\n"); }
  else $("#log").hidden = true;

  renderAoVivo(p);

  if (p.estado === "erro") {
    clearInterval(estado.poll); estado.poll = null;
    $("#prog-erro").hidden = false;
    $("#prog-erro").innerHTML = `<strong>Algo deu errado.</strong>\n${escapar(p.erro || "")}\n\n<button class="btn" onclick="regerar('${id}')">Tentar de novo</button>`;
  }

  if (p.prontos.length) {
    $("#resultado").hidden = false;
    $("#resultado").innerHTML = p.prontos.map((f) => `
      <div class="video-card">
        <video controls preload="metadata" src="/api/projetos/${id}/video/${f}?v=${Date.now()}"></video>
        <div class="acoes"><strong>${rotuloFormato(f)}</strong>
          <a class="btn" href="/api/projetos/${id}/video/${f}?download=1">Baixar MP4</a></div>
      </div>`).join("");
  }
  if (p.estado !== "rodando" && estado.poll) { clearInterval(estado.poll); estado.poll = null; }
}
// ---------- demonstração ao vivo ----------
function renderAoVivo(p) {
  const av = p.ao_vivo;
  if (!av) { $("#ao-vivo").hidden = true; return; }
  $("#ao-vivo").hidden = false;
  const modo = { ia: `IA local · ${av.modelo || ""}`, regras: "Roteiro por regras", fixo: "Template fixo" }[av.modo] || av.modo;
  $("#av-modo").textContent = av.status === "pensando" ? `${modo} — lendo a transcrição…` : modo;
  $("#av-dica").textContent = av.status === "pensando"
    ? "A IA está lendo a narração inteira, dividindo em ideias e decidindo o que aparece em cada cena."
    : `${av.cenas.length} cenas. O texto falado não vai para a tela: cada cena mostra o que a IA escreveu para ela.`;
  const nomes = Object.fromEntries((estado.opcoes?.templates || []).map((t) => [t.id, t]));
  const renderizando = p.etapa === "m13";
  const podeEditar = p.estado !== "rodando" && av.status !== "pensando";
  const abertas = new Set($$("#storyboard .sb-fala[open]").map((d) => d.dataset.i));
  estado.aoVivo = av; estado.projetoAtual = p.id;
  $("#storyboard").innerHTML = av.cenas.map((c, i) => `
    <div class="sb-cena ${c.preview ? "pronta" : ""} ${estado.editando === c.id ? "editando" : ""}">
      <div class="sb-th">${c.preview ? `<img src="${c.preview}&t=${Date.now()}" alt="" />`
        : `<div class="sb-vazio ${renderizando ? "pulsa" : ""}"><span>${escapar(templateNome(c.template))}</span>${renderizando ? "<small>renderizando…</small>" : (c.editada ? "<small>renderize para ver</small>" : "")}</div>`}</div>
      ${estado.editando === c.id ? editorCena(c) : `<div class="sb-info">
        <div class="sb-linha"><span class="sb-n">${i + 1}</span><span class="sb-t">${fmtTempo(c.inicio)} – ${fmtTempo(c.fim)}</span><span class="tag mini" title="${escapar(nomes[c.template]?.descricao || "")}">${escapar(templateNome(c.template))}</span>
          ${podeEditar ? `<button class="sb-editar" onclick="editarCena('${c.id}')" title="Trocar template ou texto">Editar</button>` : ""}</div>
        <strong class="sb-tela">${escapar(c.tela || "")}</strong>
        ${c.por_que ? `<small class="sb-pq">${escapar(c.por_que)}</small>` : ""}
        <details class="sb-fala" data-i="${i}" ${abertas.has(String(i)) ? "open" : ""}><summary>Fala original</summary>${escapar(c.fala || "")}</details>
      </div>`}
    </div>`).join("");
  const editadas = av.cenas.filter((c) => c.editada && !c.preview).length;
  $("#av-rerender").hidden = !(podeEditar && editadas);
  $("#av-rerender-n").textContent = editadas === 1 ? "1 cena editada" : `${editadas} cenas editadas`;
}

// ---------- edição manual de cena ----------
const CAMPOS = {
  TituloImpacto: [["texto", "Frase na tela", "texto"], ["palavras_destaque", "Palavras em destaque (separe por vírgula)", "lista"]],
  TextoCorrido: [["texto", "Resumo de 1 frase", "longo"], ["destaque", "Palavras em destaque (até 2, por vírgula)", "lista"]],
  Pergunta: [["texto", "Pergunta", "texto"]],
  Citacao: [["texto", "Citação", "longo"], ["autor", "Autor", "texto"]],
  NumeroDestaque: [["valor", "Número (ex: 13,75%)", "texto"], ["rotulo", "O que é esse número", "texto"],
    ["sentimento", "Cor", "opcoes", [["neutro", "Neutro"], ["positivo", "Positivo (verde)"], ["negativo", "Negativo (vermelho)"]]]],
  ComparacaoDoisLados: [["titulo", "Título", "texto"], ["a.rotulo", "Lado A — nome", "texto"], ["a.valor", "Lado A — valor", "texto"], ["a.itens", "Lado A — itens (por vírgula)", "lista"],
    ["b.rotulo", "Lado B — nome", "texto"], ["b.valor", "Lado B — valor", "texto"], ["b.itens", "Lado B — itens (por vírgula)", "lista"],
    ["vencedor", "Destacar", "opcoes", [["nenhum", "Nenhum"], ["a", "Lado A"], ["b", "Lado B"]]]],
  GraficoBarras: [["titulo", "Título", "texto"], ["barras", "Barras — uma por linha: nome: valor", "barras"], ["unidade", "Unidade (%, R$…)", "texto"]],
  SetaTendencia: [["direcao", "Direção", "opcoes", [["sobe", "Sobe"], ["desce", "Desce"]]], ["texto", "Texto", "texto"], ["valor", "Valor", "texto"],
    ["sentimento", "Cor", "opcoes", [["neutro", "Neutro"], ["positivo", "Positivo (verde)"], ["negativo", "Negativo (vermelho)"]]]],
  ImagemDestaque: [["imagem", "Imagem do projeto", "imagem"], ["texto", "Título sobre a imagem", "texto"], ["legenda", "Legenda", "texto"]],
  ListaAnimada: [["titulo", "Título", "texto"], ["itens", "Itens — um por linha (2 a 6)", "linhas"]],
};
function pegar(obj, caminho) { return caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function por(obj, caminho, v) { const ks = caminho.split("."); let o = obj; ks.slice(0, -1).forEach((k) => { o[k] = o[k] || {}; o = o[k]; }); o[ks.at(-1)] = v; }

function editorCena(c) {
  const tpl = estado.editTemplate || c.template;
  const dados = estado.editTemplate && estado.editTemplate !== c.template
    ? { texto: c.dados?.texto || c.dados?.titulo || c.tela || "", titulo: c.dados?.titulo || c.dados?.texto || "" }
    : (c.dados || {});
  const tpls = (estado.opcoes?.templates || []).map((t) => t.id).filter((id) => CAMPOS[id]);
  const campos = (CAMPOS[tpl] || []).map(([chave, rotulo, tipo, opcoes]) => {
    const v = pegar(dados, chave);
    const nome = `data-campo="${chave}"`;
    let input;
    if (tipo === "longo") input = `<textarea class="campo" rows="2" ${nome}>${escapar(v || "")}</textarea>`;
    else if (tipo === "lista") input = `<input class="campo" ${nome} value="${escapar((v || []).join(", "))}" />`;
    else if (tipo === "linhas") input = `<textarea class="campo" rows="4" ${nome}>${escapar((v || []).join("\n"))}</textarea>`;
    else if (tipo === "barras") input = `<textarea class="campo" rows="4" ${nome}>${escapar((v || []).map((b) => `${b.rotulo}: ${b.valor}`).join("\n"))}</textarea>`;
    else if (tipo === "opcoes") input = `<select class="campo" ${nome}>${opcoes.map(([o, r]) => `<option value="${o}" ${v === o ? "selected" : ""}>${r}</option>`).join("")}</select>`;
    else if (tipo === "imagem") {
      const imgs = estado.imagensProjeto || [];
      input = imgs.length ? `<select class="campo" ${nome}>${imgs.map((im) => `<option value="${im.id}" ${v === im.id ? "selected" : ""}>${escapar(im.nome || im.arquivo)}</option>`).join("")}</select>`
        : `<small class="sb-pq">Este projeto não tem imagens enviadas.</small>`;
    } else input = `<input class="campo" ${nome} value="${escapar(String(v ?? ""))}" />`;
    return `<label class="ed-campo"><span>${rotulo}</span>${input}</label>`;
  }).join("");
  return `<div class="sb-info sb-editor" data-cena="${c.id}">
    <label class="ed-campo"><span>Template</span>
      <select class="campo" id="ed-template" onchange="trocarTemplateEdicao(this.value)">${tpls.map((id) => `<option value="${id}" ${id === tpl ? "selected" : ""}>${escapar(templateNome(id))}</option>`).join("")}</select></label>
    ${campos}
    <div class="ed-erro" id="ed-erro" hidden></div>
    <div class="sb-linha"><button class="btn" onclick="salvarCena('${c.id}')">Salvar</button><button class="btn ghost" onclick="cancelarEdicao()">Cancelar</button></div>
    <details class="sb-fala"><summary>Fala original</summary>${escapar(c.fala || "")}</details>
  </div>`;
}
function redesenharStoryboard() { renderAoVivo({ id: estado.projetoAtual, ao_vivo: estado.aoVivo, estado: "concluido", etapa: null }); }
window.editarCena = async (id) => {
  if (!estado.imagensProjeto) estado.imagensProjeto = await (await fetch(`/api/projetos/${estado.projetoAtual}/imagens`)).json();
  estado.editando = id; estado.editTemplate = null; redesenharStoryboard();
};
window.trocarTemplateEdicao = (tpl) => { estado.editTemplate = tpl; redesenharStoryboard(); };
window.cancelarEdicao = () => { estado.editando = null; estado.editTemplate = null; redesenharStoryboard(); };
function lerEditor() {
  const tpl = $("#ed-template").value, dados = {};
  for (const [chave, , tipo] of CAMPOS[tpl] || []) {
    const el = $(`#storyboard [data-campo="${chave}"]`);
    if (!el) continue;
    const raw = el.value.trim();
    let v = raw;
    if (tipo === "lista") v = raw.split(",").map((s) => s.trim()).filter(Boolean);
    else if (tipo === "linhas") v = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    else if (tipo === "barras") v = raw.split("\n").map((s) => s.trim()).filter(Boolean).map((l) => {
      const i = l.lastIndexOf(":"); return { rotulo: (i < 0 ? l : l.slice(0, i)).trim(), valor: (i < 0 ? "" : l.slice(i + 1)).trim() };
    });
    por(dados, chave, v);
  }
  return { template: tpl, dados };
}
window.salvarCena = async (id) => {
  const corpo = lerEditor();
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    $("#ed-erro").hidden = false; $("#ed-erro").textContent = typeof e.detail === "string" ? e.detail : "Dados inválidos para este template.";
    return;
  }
  const res = await r.json();
  const c = estado.aoVivo.cenas.find((x) => x.id === id);
  Object.assign(c, { template: res.template, dados: res.dados, tela: res.tela, por_que: "editado manualmente", editada: true, preview: null });
  estado.editando = null; estado.editTemplate = null; redesenharStoryboard();
};
window.rerenderizar = () => { estado.imagensProjeto = null; regerar(estado.projetoAtual); };
function templateNome(id) {
  return ({ TextoCorrido: "Texto resumido", TituloImpacto: "Título de impacto", Pergunta: "Pergunta", Citacao: "Citação", NumeroDestaque: "Número em destaque",
    ComparacaoDoisLados: "Comparação", GraficoBarras: "Gráfico de barras", SetaTendencia: "Seta de tendência",
    ImagemDestaque: "Imagem em destaque", ListaAnimada: "Lista animada", FundoVazio: "Fundo" })[id] || id;
}
function fmtTempo(s) { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }

window.regerar = async (id) => { await fetch(`/api/projetos/${id}/gerar`, { method: "POST" }); abrirProjeto(id); };
function rotuloFormato(f) { return estado.opcoes?.formatos.find((x) => x.id === f)?.nome ?? f; }
function escapar(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

// ---------- biblioteca ----------
async function carregarBiblioteca() {
  const itens = await (await fetch("/api/projetos")).json();
  if (!itens.length) { $("#lista").innerHTML = `<p class="vazio">Nenhum vídeo ainda. Crie o primeiro em “Novo vídeo”.</p>`; return; }
  $("#lista").innerHTML = itens.map((p) => {
    const tema = estado.opcoes?.temas.find((t) => t.id === p.tema_id);
    const cor = tema ? `linear-gradient(135deg, ${tema.cores.fundo}, ${tema.cores.destaque})` : "var(--bg-3)";
    const prontos = Object.entries(p.formatos).filter(([, ok]) => ok).map(([f]) => rotuloFormato(f)).join(", ");
    const data = new Date(p.criado_em * 1000).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    const rot = { concluido: "Pronto", rodando: "Gerando…", erro: "Erro", novo: "Sem vídeo" }[p.estado] || p.estado;
    return `<div class="item" onclick="abrirProjeto('${p.id}')">
      <div class="th" style="background:${cor}"></div>
      <div class="meta"><strong>${escapar(p.titulo)}</strong><br><small>${tema?.nome ?? ""} · ${data}${prontos ? " · " + prontos : ""}</small></div>
      <span class="estado ${p.estado}">${rot}</span>
    </div>`;
  }).join("");
}
window.abrirProjeto = abrirProjeto;

carregarOpcoes();
