#!/usr/bin/env bash
# ============================================================================
# LLOYDS METALS & ENERGY - NGINX CONFIGURATION RUNNER
# Run with: sudo ./setup-nginx.sh
# ============================================================================

set -e

if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo ./setup-nginx.sh"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/.deployment/configure_nginx.py"

python3 "$PYTHON_SCRIPT"
