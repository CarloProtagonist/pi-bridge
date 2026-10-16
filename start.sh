#!/bin/bash
# pi-bridge + ntfy are now managed by user systemd services:
#   systemd --user -u pibridge.service     (port 8787)
#   systemd --user -u pibridge-ntfy.service (port 3333)
# This script is kept as a thin wrapper for habit.
case "${1:-status}" in
  start|stop|restart|status)
    # "start extra args" -> just take "start" (no per-run args supported under systemd)
    if [ "$1" = "start" ]; then cmd=start; else cmd=$1; fi
    if [ "$cmd" = "start" ] && systemctl --user is-active pibridge >/dev/null 2>&1; then
      echo "already running (systemd)"; exit 0
    fi
    systemctl --user "$cmd" pibridge pibridge-ntfy
    ;;
  token)
    cat ~/.config/pibridge/token
    ;;
  logs)
    journalctl --user -u pibridge --no-pager -n "${2:-50}"
    ;;
  publish)
    curl -s -X POST "http://127.0.0.1:3333/pibridge" -H "Title: test" -d "${2:-hello from PC}"
    ;;
  *)
    echo "usage: $0 start|stop|restart|status|token|logs [n]|publish [msg]"
    exit 1
    ;;
esac
