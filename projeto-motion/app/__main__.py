import argparse

import uvicorn


def main() -> None:
    p = argparse.ArgumentParser(prog="python -m app", description="Interface web do Motion Studio")
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--porta", type=int, default=8000)
    a = p.parse_args()
    uvicorn.run("app.servidor:app", host=a.host, port=a.porta)


if __name__ == "__main__":
    main()
