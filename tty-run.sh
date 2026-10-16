#!/bin/sh
# ttyd child entry: run pi, capture stderr/stdout to a log so failures are visible.
LOG=/home/crispy/pi-bridge/tty-child.log
TERM="${TERM:-xterm-256color}"
[ -n "${LC_ALL:-${LANG:-}}" ] || export LC_CTYPE=C.UTF-8
export TERM
# 3 = duplicate of stderr -> log (stdout stays on the tty for the TUI)
exec 3>"$LOG"
/usr/bin/bash -lc pi 2>&3
echo "[$(date)] bash -lc pi exited: $?" >&3
