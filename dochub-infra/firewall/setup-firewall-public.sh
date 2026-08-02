#!/bin/bash
# ============================================================
# Firewall del SERVIDOR PUBLICO - DocHub
# Este servidor SI recibe trafico de internet, pero solo en los
# puertos que HAProxy realmente necesita.
#
# Uso: sudo bash setup-firewall-public.sh
# ============================================================
set -e

IP_ADMIN="192.168.1.50"  # <-- tu IP (para poder entrar por SSH)

echo "[1/5] Politica por defecto: negar entrante, permitir saliente"
ufw default deny incoming
ufw default allow outgoing

echo "[2/5] SSH solo desde tu IP de administracion"
ufw allow from "$IP_ADMIN" to any port 22 proto tcp

echo "[3/5] Trafico web publico: HTTP (redirige) y HTTPS"
ufw allow 80/tcp
ufw allow 443/tcp

echo "[4/5] Panel de stats de HAProxy y metricas de Prometheus SOLO desde tu IP"
ufw allow from "$IP_ADMIN" to any port 8404 proto tcp
ufw allow from "$IP_ADMIN" to any port 8405 proto tcp

echo "[5/5] Logging + habilitar"
ufw logging on
ufw --force enable

ufw status verbose

# Revisar intentos bloqueados:
#   sudo grep "UFW BLOCK" /var/log/ufw.log | tail -20
