// Garante que catalogo/templates.json e src/templates/_registry.ts estão em sincronia.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const catalogo = JSON.parse(
  readFileSync(resolve(here, "../../catalogo/templates.json"), "utf8"),
);
const registrySrc = readFileSync(
  resolve(here, "../src/templates/_registry.ts"),
  "utf8",
);

const implementados = catalogo.templates
  .filter((t) => t.status === "implementado")
  .map((t) => t.id);

const faltando = implementados.filter(
  (id) => !new RegExp(`^\\s*${id}:\\s*\\{`, "m").test(registrySrc),
);

if (faltando.length) {
  console.error("Templates no catálogo marcados como implementados mas ausentes no registry:", faltando);
  process.exit(1);
}
console.log(`OK: ${implementados.length} template(s) implementado(s) presentes no registry.`);
