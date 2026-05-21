#!/usr/bin/env bash
# Create a virtual environment and install MkDocs dependencies for this repo.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$REPO_ROOT/.venv"
REQUIREMENTS_FILE="$REPO_ROOT/installation/requirements.txt"
MKDOCS_HOST="127.0.0.1"
MKDOCS_PORT="8001"

function print_usage() {
  cat <<EOF
Usage: ./installation/install.sh [--serve]

Creates .venv in the repo root and installs packages from installation/requirements.txt.

Options:
  --serve    Start mkdocs after install (http://${MKDOCS_HOST}:${MKDOCS_PORT})

Requires: python3 (3.10+), pip

After install:
  source .venv/bin/activate
  mkdocs serve -a ${MKDOCS_HOST}:${MKDOCS_PORT}
EOF
}

RUN_SERVE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --serve)
      RUN_SERVE=1
      shift
      ;;
    -h | --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      print_usage >&2
      exit 1
      ;;
  esac
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required." >&2
  exit 1
fi

python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" || {
  echo "Error: Python 3.10 or newer is required." >&2
  exit 1
}

cd "$REPO_ROOT"

function venv_is_valid() {
  [[ -x "$VENV_DIR/bin/python" ]]
}

function ensure_venv() {
  if venv_is_valid; then
    echo "Using existing virtual environment at .venv"
    return 0
  fi
  if [[ -e "$VENV_DIR" ]]; then
    echo "Removing incomplete or broken .venv (missing bin/python)"
    rm -rf "$VENV_DIR"
  fi
  echo "Creating virtual environment at .venv"
  python3 -m venv "$VENV_DIR"
  if ! venv_is_valid; then
    echo "Error: failed to create a working virtual environment at .venv" >&2
    exit 1
  fi
}

ensure_venv
VENV_PYTHON="$VENV_DIR/bin/python"

"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install -r "$REQUIREMENTS_FILE"

echo ""
echo "Done. Virtual environment is ready."
echo ""
echo "  source .venv/bin/activate"
echo "  mkdocs serve -a ${MKDOCS_HOST}:${MKDOCS_PORT}"
echo ""
echo "Build static site:"
echo "  mkdocs build --clean"

if ((RUN_SERVE == 1)); then
  "$VENV_DIR/bin/mkdocs" serve -a "${MKDOCS_HOST}:${MKDOCS_PORT}"
fi
