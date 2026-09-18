"""CLI: python -m pipeline <comando> --projeto <id> [--force] [--formato 16x9]

Comandos: m01 m04 m09 m12 m13 m14 run validar novo
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import (m01_transcrever, m04_estruturar_cenas, m09_motor_decisao,
               m12_aplicar_tema, m13_renderizar, m14_compor)
from .comum import Caminhos, carregar_timeline
from .projetos import criar_projeto

ORDEM = ["m01", "m04", "m09", "m12", "m13", "m14"]
MODULOS = {
    "m01": lambda a: m01_transcrever.executar(a.projeto, a.force),
    "m04": lambda a: m04_estruturar_cenas.executar(a.projeto, a.force),
    "m09": lambda a: m09_motor_decisao.executar(a.projeto, a.force),
    "m12": lambda a: m12_aplicar_tema.executar(a.projeto, a.force, a.formato),
    "m13": lambda a: m13_renderizar.executar(a.projeto, a.force, a.formato),
    "m14": lambda a: m14_compor.executar(a.projeto, a.force, a.formato),
}


def cmd_validar(a):
    c = Caminhos(a.projeto)
    t = carregar_timeline(c)
    print(f"timeline ok: {len(t.cenas)} cenas, etapas {t.etapas_concluidas}")
    for e in t.validacao.erros:
        print(f"  ✖ {e}")
    for w in t.validacao.avisos:
        print(f"  ⚠ {w}")


def cmd_novo(a):
    try:
        raiz = criar_projeto(a.projeto, Path(a.audio) if a.audio else None, canal=a.canal,
                             titulo=a.titulo, modelo=a.modelo, tema_id=a.tema, estilo_id=a.estilo)
    except (FileExistsError, ValueError) as e:
        sys.exit(str(e))
    print(f"Projeto criado em {raiz}. Coloque o áudio em entrada/ e rode: python -m pipeline run --projeto {a.projeto}")


def main(argv=None):
    p = argparse.ArgumentParser(prog="python -m pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)
    for nome in ORDEM + ["run", "validar"]:
        s = sub.add_parser(nome)
        s.add_argument("--projeto", required=True)
        s.add_argument("--force", action="store_true")
        s.add_argument("--formato", default=None)
        if nome == "run":
            s.add_argument("--ate", choices=ORDEM, default="m14", help="para após esta etapa")
    n = sub.add_parser("novo")
    n.add_argument("--projeto", required=True)
    n.add_argument("--canal", default="canal_exemplo")
    n.add_argument("--audio", default=None, help="arquivo de áudio a copiar para entrada/")
    n.add_argument("--titulo", default=None)
    n.add_argument("--modelo", default="small")
    n.add_argument("--tema", default=None, help="preset em config/temas/")
    n.add_argument("--estilo", default=None, help="preset em config/estilos/")

    a = p.parse_args(argv)
    if a.cmd == "novo":
        return cmd_novo(a)
    if a.cmd == "validar":
        return cmd_validar(a)
    if a.cmd == "run":
        for etapa in ORDEM:
            MODULOS[etapa](a)
            if etapa == a.ate:
                break
        return
    MODULOS[a.cmd](a)


if __name__ == "__main__":
    main()
