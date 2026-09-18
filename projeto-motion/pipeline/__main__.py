import sys

from .cli import main

for fluxo in (sys.stdout, sys.stderr):
    fluxo.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)

main()
