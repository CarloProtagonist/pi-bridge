#!/bin/bash
# One-time setup for running pi from your phone over Tailscale.
# Run:  sudo /home/crispy/pi-bridge/ttyd-setup.sh
# Requires network for the ttyd package; Tailscale must already be installed.
set -e
[ "$(id -u)" = 0 ] || { echo "run with sudo"; exit 1; }

echo "[1/3] installing ttyd..."
apt-get update -qq
apt-get install -y -qq ttyd curl

# Run ttyd as the real user over Tailscale auth-style: bind to tailnet IP,
# read-write, single tab. (Tailscale itself already restricts who can reach us.)
TAILOUT=$(tailscale ip -4 2>/dev/null || true)
[ -n "$TAILOUT" ] || TAILOUT=100.121.26.79
echo "[2/3] writing /etc/systemd/system/ttyd-pi.service (bind $TAILOUT)"
mkdir -p /var/log/pibridge
chown crispy:crispy /var/log/pibridge
cat > /etc/systemd/system/ttyd-pi.service <<EOF
[Unit]
Description=ttyd bridge to pi coding agent
After=network-online.target tailscaled.service

[Service]
User=crispy
WorkingDirectory=/home/crispy
ExecStart=/usr/sbin/ttyd -i $TAILOUT -p 8788 -w -t fontSize=14 -t cursorBlink=true pi
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
echo "[3/3] enabling services..."
systemctl daemon-reload
systemctl enable --now ttyd-pi.service
systemctl is-active tailscaled >/dev/null || systemctl start tailscaled
# Start the tailscale connection if logged in
tailscale status >/dev/null 2>&1 || tailscale up --hostname crispy-pc || true
sleep 1
IP=$(tailscale ip -4 2>/dev/null || echo "100.121.26.79")
echo
echo "done. From your phone (Tailscale connected):"
echo "  TUI :  http://$IP:8788   (full pi terminal)"
echo "  Chat:  http://$IP:8787   (pi-bridge web UI; on the PC run: cd pi-bridge && ./start.sh start)"
echo "  token:  cat ~/.config/pibridge/token"
