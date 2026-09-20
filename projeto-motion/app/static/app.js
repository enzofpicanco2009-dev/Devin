const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const estado = { audio: null, canal: null, tema: null, estilo: null, paleta: null, fonte: null,
  banco: [], midiasSel: new Set(), midiasNovas: [], formatos: new Set(["16x9"]), opcoes: null, poll: null, roteiroModo: "externo" };

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
  carregarBanco();
  const { temas, estilos, formatos, paletas, fontes, ia } = estado.opcoes;

  renderCanais();

  $("#paletas").innerHTML = `<button type="button" class="paleta sel" data-id=""><span class="sw auto"></span><small>Do tema</small></button>` +
    paletas.map((p) => `<button type="button" class="paleta" data-id="${p.id}" title="${p.nome}">
      <span class="sw" style="background:${p.cores.fundo}"><i style="background:${p.cores.destaque}"></i><i style="background:${p.cores.destaque_2}"></i><i style="background:${p.cores.texto}"></i></span><small>${p.nome}</small></button>`).join("");
  $("#fontes").innerHTML = `<button type="button" class="fonte sel" data-id=""><span>Aa</span><small>Do tema</small></button>` +
    fontes.map((f) => `<button type="button" class="fonte" data-id="${f.id}" style="font-family:${f.familia};font-weight:${f.peso}"><span>Aa</span><small>${f.nome}</small></button>`).join("");
  $("#paletas").addEventListener("click", (e) => { const b = e.target.closest(".paleta"); if (b) { estado.paleta = b.dataset.id || null; $$("#paletas .paleta").forEach((x) => x.classList.toggle("sel", x === b)); amostra(); } });
  $("#fontes").addEventListener("click", (e) => { const b = e.target.closest(".fonte"); if (b) { estado.fonte = b.dataset.id || null; $$("#fontes .fonte").forEach((x) => x.classList.toggle("sel", x === b)); amostra(); } });

  if (!ia.disponivel) { $("#ia-rotulo").textContent = "Ollama não encontrado neste PC — se escolher, o roteiro cai em regras"; }
  else $("#ia-rotulo").textContent = `Roda no seu PC, sem custo (${ia.modelo})`;
  selecionarRoteiro(estado.roteiroModo);
  $("#roteiro-modos").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionarRoteiro(c.dataset.id); });

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

// ---------- banco de imagens e vídeos ----------
const inputMid = $("#midias"), dropMid = $(".drop-img");
["dragenter", "dragover"].forEach((ev) => dropMid.addEventListener(ev, (e) => { e.preventDefault(); dropMid.classList.add("sobre"); }));
["dragleave", "drop"].forEach((ev) => dropMid.addEventListener(ev, (e) => { e.preventDefault(); dropMid.classList.remove("sobre"); }));
dropMid.addEventListener("drop", (e) => addMidias(e.dataTransfer.files));
inputMid.addEventListener("change", () => { addMidias(inputMid.files); inputMid.value = ""; });
const EXT_MIDIA = /\.(png|jpe?g|webp|gif|svg|mp4|webm|mov)$/i;
function addMidias(files) {
  for (const f of files) if (EXT_MIDIA.test(f.name))
    estado.midiasNovas.push({ file: f, url: URL.createObjectURL(f), video: /\.(mp4|webm|mov)$/i.test(f.name),
      nome: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "), descricao: "" });
  renderMidiasNovas();
}
function renderMidiasNovas() {
  $("#lista-midias").innerHTML = estado.midiasNovas.map((m, i) => `
    <div class="img-item nova">
      ${m.video ? `<video src="${m.url}" muted></video>` : `<img src="${m.url}" alt="" />`}
      <div class="mid-campos">
        <input type="text" class="campo" data-i="${i}" data-k="nome" value="${escapar(m.nome)}" placeholder="Nome" required />
        <textarea class="campo" rows="2" data-i="${i}" data-k="descricao" placeholder="Descrição para a IA: o que aparece, quando usar (obrigatório)">${escapar(m.descricao)}</textarea>
      </div>
      <button type="button" class="x" data-rm="${i}" title="Remover">×</button>
    </div>`).join("");
}
$("#lista-midias").addEventListener("input", (e) => { const { i, k } = e.target.dataset; if (i !== undefined && k) estado.midiasNovas[+i][k] = e.target.value; });
$("#lista-midias").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { estado.midiasNovas.splice(+b.dataset.rm, 1); renderMidiasNovas(); } });

async function carregarBanco() {
  estado.banco = await (await fetch("/api/biblioteca")).json();
  renderBanco();
}
function renderBanco() {
  const el = $("#banco");
  if (!estado.banco.length) { el.innerHTML = `<p class="dica">O banco está vazio. Adicione a primeira imagem ou vídeo abaixo.</p>`; return; }
  el.innerHTML = estado.banco.map((m) => `
    <div class="mid-card ${estado.midiasSel.has(m.id) ? "sel" : ""}" data-id="${m.id}">
      <label class="mid-thumb">
        <input type="checkbox" ${estado.midiasSel.has(m.id) ? "checked" : ""} data-sel="${m.id}" />
        ${m.tipo === "video" ? `<video src="/api/biblioteca/${m.id}/arquivo" muted preload="metadata"></video>` : `<img src="/api/biblioteca/${m.id}/arquivo" alt="" />`}
        <span class="badge">${m.tipo === "video" ? "vídeo" : "imagem"}</span>
      </label>
      <div class="mid-info">
        <strong>${escapar(m.nome)}</strong>
        <small>${escapar(m.descricao)}</small>
        <div class="mid-acoes"><button type="button" class="mini" data-ed="${m.id}">Editar</button><button type="button" class="mini" data-del="${m.id}">Apagar</button></div>
      </div>
    </div>`).join("");
}
$("#banco").addEventListener("change", (e) => {
  const id = e.target.dataset.sel; if (!id) return;
  e.target.checked ? estado.midiasSel.add(id) : estado.midiasSel.delete(id);
  e.target.closest(".mid-card").classList.toggle("sel", e.target.checked);
});
$("#banco").addEventListener("click", async (e) => {
  const del = e.target.closest("[data-del]"), ed = e.target.closest("[data-ed]");
  if (del) {
    const m = estado.banco.find((x) => x.id === del.dataset.del);
    if (!confirm(`Apagar "${m.nome}" do banco? Vídeos já gerados não são afetados.`)) return;
    await fetch(`/api/biblioteca/${m.id}`, { method: "DELETE" });
    estado.midiasSel.delete(m.id); await carregarBanco();
  } else if (ed) {
    const m = estado.banco.find((x) => x.id === ed.dataset.ed);
    const nome = prompt("Nome da mídia:", m.nome); if (nome === null) return;
    const descricao = prompt("Descrição para a IA (o que aparece, quando usar):", m.descricao); if (descricao === null) return;
    const r = await fetch(`/api/biblioteca/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, descricao }) });
    if (!r.ok) alert((await r.json()).detail || "Não foi possível salvar.");
    await carregarBanco();
  }
});

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
  fd.append("roteiro_modo", estado.roteiroModo);
  fd.append("midias_ids", [...estado.midiasSel].join(","));
  for (const m of estado.midiasNovas) fd.append("midias_novas", m.file, m.file.name);
  fd.append("midias_novas_meta", JSON.stringify(estado.midiasNovas.map((m) => ({ nome: m.nome, descricao: m.descricao }))));
  try {
    const r = await fetch("/api/projetos", { method: "POST", body: fd });
    if (!r.ok) throw new Error((await r.json()).detail || r.statusText);
    const { id } = await r.json();
    abrirProjeto(id);
  } catch (err) {
    $("#erro-form").textContent = err.message;
  } finally {
    btn.disabled = false; selecionarRoteiro(estado.roteiroModo);
  }
});

function selecionarRoteiro(id) {
  estado.roteiroModo = id;
  $$("#roteiro-modos .card").forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
  $("#gerar").textContent = id === "externo" ? "Transcrever áudio" : "Gerar vídeo";
}

// ---------- roteiro de outra IA ----------
async function copiar(texto, btn) {
  try { await navigator.clipboard.writeText(texto); }
  catch { const ta = document.createElement("textarea"); ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
  const antes = btn.textContent; btn.textContent = "Copiado!"; setTimeout(() => (btn.textContent = antes), 1500);
}
$("#ext-copiar-transcricao").addEventListener("click", (e) => copiar($("#ext-transcricao").value, e.currentTarget));
$("#ext-copiar-prompt").addEventListener("click", (e) => copiar($("#ext-prompt").value, e.currentTarget));
$("#ext-gerar").addEventListener("click", async (e) => {
  const btn = e.currentTarget; const id = estado.projetoAtual;
  const texto = $("#ext-roteiro").value.trim();
  $("#ext-erro").textContent = "";
  if (!texto) { $("#ext-erro").textContent = "Cole o roteiro que a IA devolveu."; return; }
  btn.disabled = true;
  try {
    const r = await fetch(`/api/projetos/${id}/roteiro`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto }) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
    abrirProjeto(id);
  } catch (err) { $("#ext-erro").textContent = err.message; }
  finally { btn.disabled = false; }
});

function renderExterno(p) {
  const ext = p.roteiro_externo;
  const el = $("#externo");
  if (!ext || !ext.pronto || p.estado === "rodando") { el.hidden = true; return; }
  el.hidden = false;
  if ($("#ext-transcricao").value !== ext.transcricao) { $("#ext-transcricao").value = ext.transcricao; $("#ext-prompt").value = ext.prompt; }
  $("#ext-status").textContent = ext.pendente ? `${ext.trechos} trechos transcritos — aguardando o roteiro` : "roteiro aplicado — cole outro para refazer";
}

// ---------- progresso / resultado ----------
function abrirProjeto(id) {
  mostrar("progresso");
  estado.editando = null; estado.editTemplate = null; estado.imagensProjeto = null;
  $("#resultado").hidden = true; $("#prog-erro").hidden = true; $("#log").hidden = true; $("#ao-vivo").hidden = true; $("#externo").hidden = true;
  estado.projetoAtual = id;
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
  const aguardandoRoteiro = p.roteiro_externo?.pronto && p.roteiro_externo.pendente && p.estado !== "rodando";
  const idx = p.etapa ? ids.indexOf(p.etapa) : (aguardandoRoteiro ? ids.indexOf("m09") : (p.estado === "concluido" ? ids.length : -1));
  const fmt = p.formato_atual ? ` (${p.formato_atual})` : "";
  $("#etapas").innerHTML = p.etapas.map(([e, nome], i) => {
    const cls = (p.estado === "concluido" && !aguardandoRoteiro) || i < idx ? "feita" : (i === idx && p.estado === "rodando" ? "atual" : "");
    const ico = cls === "feita" ? "✓" : "";
    const extra = aguardandoRoteiro && e === "m09" ? " — esperando você colar o roteiro" : "";
    return `<li class="${cls}"><span class="ico">${ico}</span>${nome}${cls === "atual" ? fmt : ""}${extra}</li>`;
  }).join("");
  $("#etapas").hidden = p.estado === "novo";

  if (p.estado === "rodando" && p.log.length) { $("#log").hidden = false; $("#log").textContent = p.log.join("\n"); }
  else $("#log").hidden = true;

  renderExterno(p);
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
  const modo = { ia: `IA local · ${av.modelo || ""}`, externo: "Roteiro de outra IA", regras: "Roteiro por regras", fixo: "Template fixo" }[av.modo] || av.modo;
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
  MidiaCheia: [["midia", "Imagem ou vídeo do projeto", "midia"]],
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
    else if (tipo === "imagem" || tipo === "midia") {
      const imgs = (estado.imagensProjeto || []).filter((im) => tipo === "midia" || im.tipo !== "video");
      input = imgs.length ? `<select class="campo" ${nome}>${imgs.map((im) => `<option value="${im.id}" ${v === im.id ? "selected" : ""}>${escapar(im.nome || im.arquivo)}</option>`).join("")}</select>`
        : `<small class="sb-pq">Este projeto não tem ${tipo === "midia" ? "mídias" : "imagens"} do banco vinculadas.</small>`;
    } else input = `<input class="campo" ${nome} value="${escapar(String(v ?? ""))}" />`;
    return `<label class="ed-campo"><span>${rotulo}</span>${input}</label>`;
  }).join("");
  const idx = estado.aoVivo.cenas.findIndex((x) => x.id === c.id), ultima = idx === estado.aoVivo.cenas.length - 1;
  return `<div class="sb-info sb-editor" data-cena="${c.id}">
    <div class="ed-tempos">
      <label class="ed-campo"><span>Começa em (s)</span><input class="campo" type="number" step="0.1" id="ed-inicio" value="${c.inicio.toFixed(1)}" ${idx === 0 ? "disabled" : ""} /></label>
      <label class="ed-campo"><span>Termina em (s)</span><input class="campo" type="number" step="0.1" id="ed-fim" value="${c.fim.toFixed(1)}" ${ultima ? "disabled" : ""} /></label>
    </div>
    <small class="sb-pq">O áudio não muda; só o momento em que a tela troca para a cena vizinha.</small>
    <label class="ed-campo"><span>Template</span>
      <select class="campo" id="ed-template" onchange="trocarTemplateEdicao(this.value)">${tpls.map((id) => `<option value="${id}" ${id === tpl ? "selected" : ""}>${escapar(templateNome(id))}</option>`).join("")}</select></label>
    ${campos}
    <div class="ed-erro" id="ed-erro" hidden></div>
    <div class="sb-linha"><button class="btn" onclick="salvarCena('${c.id}')">Salvar</button><button class="btn ghost" onclick="cancelarEdicao()">Cancelar</button>
      <button class="sb-editar" onclick="dividirCena('${c.id}')" title="Corta esta cena no meio e cria uma nova cena depois">+ Dividir em 2</button>
      ${estado.aoVivo.cenas.length > 1 ? `<button class="sb-editar" onclick="removerCena('${c.id}')" title="Junta este trecho à cena anterior">Remover</button>` : ""}</div>
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
function mostrarErro(r, e) { $("#ed-erro").hidden = false; $("#ed-erro").textContent = typeof e.detail === "string" ? e.detail : "Dados inválidos."; }
async function recarregarCenas() {
  estado.editando = null; estado.editTemplate = null;
  await atualizar(estado.projetoAtual);
}
window.dividirCena = async (id) => {
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}/dividir`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) return mostrarErro(r, await r.json().catch(() => ({})));
  await recarregarCenas();
};
window.removerCena = async (id) => {
  if (!confirm("Remover esta cena? O trecho de áudio passa para a cena vizinha.")) return;
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}`, { method: "DELETE" });
  if (!r.ok) return mostrarErro(r, await r.json().catch(() => ({})));
  await recarregarCenas();
};
window.salvarCena = async (id) => {
  const c0 = estado.aoVivo.cenas.find((x) => x.id === id);
  const ini = parseFloat($("#ed-inicio").value), fim = parseFloat($("#ed-fim").value);
  const mudouTempo = (!isNaN(ini) && Math.abs(ini - c0.inicio) > 0.05) || (!isNaN(fim) && Math.abs(fim - c0.fim) > 0.05);
  if (mudouTempo) {
    const rt = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}/tempos`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inicio: isNaN(ini) ? null : ini, fim: isNaN(fim) ? null : fim }) });
    if (!rt.ok) return mostrarErro(rt, await rt.json().catch(() => ({})));
  }
  const corpo = lerEditor();
  const r = await fetch(`/api/projetos/${estado.projetoAtual}/cenas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  if (!r.ok) return mostrarErro(r, await r.json().catch(() => ({})));
  await recarregarCenas();
};
window.rerenderizar = () => { estado.imagensProjeto = null; regerar(estado.projetoAtual); };
function templateNome(id) {
  return ({ TextoCorrido: "Texto resumido", TituloImpacto: "Título de impacto", Pergunta: "Pergunta", Citacao: "Citação", NumeroDestaque: "Número em destaque",
    ComparacaoDoisLados: "Comparação", GraficoBarras: "Gráfico de barras", SetaTendencia: "Seta de tendência",
    ImagemDestaque: "Imagem em destaque", MidiaCheia: "Mídia em tela cheia", ListaAnimada: "Lista animada", FundoVazio: "Fundo" })[id] || id;
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
