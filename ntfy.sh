#!/bin/sh
# ntfy self-hosted server for Pi-bridge push notifications.
# Binds 0.0.0.0:3333 (reachable over LAN/tailnet for the phone to subscribe).
# NOTE: no forced auth - rely on tailnet/LAN trust. The Pi-bridge chat UI already
# gates its own API with a token.
DIR="$HOME/.local/share/ntfy-pibridge"
mkdir -p "$DIR"
PIDFILE="$DIR/ntfy.pid"
LOG="$DIR/ntfy.log"
case "$1" in
  start)
    if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "ntfy already running (pid $(cat "$PIDFILE"))"; exit 0
    fi
    setsid nohup "$HOME/.local/bin/ntfy" serve --listen-http 0.0.0.0:3333 > "$LOG" 2>&1 &
    echo $! > "$PIDFILE"
    sleep 1
    if kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "ntfy running on 0.0.0.0:3333 (pid $(cat "$PIDFILE"))"
    else
      echo "ntfy failed; see $LOG"; tail -8 "$LOG"; exit 1
    fi
    ;;
  stop)
    [ -f "$PIDFILE" ] && kill "$(cat "$PIDFILE")" 2>/dev/null && rm -f "$PIDFILE" && echo stopped || echo "not running"
    ;;
  status)
    [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null && echo "running (pid $(cat "$PIDFILE"))" || echo "not running"
    ;;
  publish)
    # quick manual test-message
    curl -s -X POST "http://127.0.0.1:3333/pibridge" -H "Title: test" -d "${2:-hello from PC}"
    ;;
  *)
    echo "usage: $0 start|stop|status|publish [msg]"
    ;;
esac
