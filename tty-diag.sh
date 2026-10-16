#!/bin/sh
# Diagnostic wrapper: capture the service env, then exec pi with stderr visible.
L=/tmp/ttyd-diag.log
{
  echo "=== ttyd diag child start: $(date) ==="
  echo "HOME=[$HOME] TERM=[$TERM] SHELL=[$SHELL] LANG=[$LANG]"
  echo "PATH=[$PATH]"
  echo "stdin-is-tty: $(tty -s </dev/tty 2>&1 || true); stdin-tty: $( (test -t 0) && echo yes || echo no )"
  echo "-- pi in PATH: [$(command -v pi)]"
} >>"$L" 2>&1
# exec pi; append its exit status + stderr
/usr/bin/bash -lc pi >>"$L" 2>&1
echo "=== pi exit code: $? at $(date) ===" >>"$L"
