#!/bin/sh
# diagnostic wrapper: log the failing environment, then exec pi
L=/tmp/ttyd-diag.log
{
  echo "=== ttyd child started $(date) ==="
  echo "HOME=$HOME TERM=$TERM SHELL=$SHELL"
  echo "PATH=$PATH"
  echo "tty: $(tty) cols=$(tput cols 2>/dev/null) rows=$(tput lines 2>/dev/null)"
  echo "bash -lc pi test output:"
  command -v pi
} >>"$L" 2>&1
sleep 30   # stay alive so the terminal stays up for inspection
exit 0
