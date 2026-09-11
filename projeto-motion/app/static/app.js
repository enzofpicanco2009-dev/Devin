const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const estado = { audio: null, tema: null, estilo: null, formatos: new Set(["16x9"]), opcoes: null, poll: null };

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
  const { temas, estilos, formatos } = estado.opcoes;

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

  selecionar("tema", temas[0]?.id);
  selecionar("estilo", estilos[0]?.id);

  $("#temas").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionar("tema", c.dataset.id); });
  $("#estilos").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) selecionar("estilo", c.dataset.id); });
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
  fd.append("tema_id", estado.tema);
  fd.append("estilo_id", estado.estilo);
  fd.append("formatos", [...estado.formatos].join(","));
  fd.append("modelo", $("#modelo").value);
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
  $("#resultado").hidden = true; $("#prog-erro").hidden = true; $("#log").hidden = true;
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
window.regerar = async (id) => { await fetch(`/api/projetos/${id}/gerar`, { method: "POST" }); abrirProjeto(id); };
function rotuloFormato(f) { return estado.opcoes?.formatos.find((x) => x.id === f)?.nome ?? f; }
function escapar(s) { return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

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
