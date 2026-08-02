#!/bin/bash
# ============================================================
# Firewall del SERVIDOR PRIVADO - DocHub
# Regla de oro: el servidor privado NO debe recibir trafico de
# internet directamente. Solo el servidor publico (HAProxy) y tu
# maquina de administracion deberian poder hablarle.
#
# Uso: sudo bash setup-firewall-private.sh
# Requiere: ufw (Ubuntu/Debian). Si usas otra distro, ver notas al final.
# ============================================================
set -e

IP_SERVIDOR_PUBLICO="192.168.1.100"   # <-- cambia por la IP real del servidor publico
IP_ADMIN="192.168.1.50"               # <-- tu IP (para poder entrar por SSH)

echo "[1/6] Politica por defecto: negar todo lo entrante, permitir todo lo saliente"
ufw default deny incoming
ufw default allow outgoing

echo "[2/6] Permitir SSH solo desde tu IP de administracion"
ufw allow from "$IP_ADMIN" to any port 22 proto tcp

echo "[3/6] Permitir que el servidor publico llegue a las 3 replicas de la API"
ufw allow from "$IP_SERVIDOR_PUBLICO" to any port 3001 proto tcp
ufw allow from "$IP_SERVIDOR_PUBLICO" to any port 3002 proto tcp
ufw allow from "$IP_SERVIDOR_PUBLICO" to any port 3003 proto tcp

echo "[4/6] Permitir que Grafana (servidor publico) consulte Prometheus"
ufw allow from "$IP_SERVIDOR_PUBLICO" to any port 9090 proto tcp

echo "[5/6] Activar logging para poder revisar intentos bloqueados"
ufw logging on

echo "[6/6] Habilitar el firewall"
ufw --force enable

ufw status verbose

# ------------------------------------------------------------
# Como revisar intentos bloqueados (para la evaluacion):
#   sudo tail -f /var/log/ufw.log
#   sudo grep "UFW BLOCK" /var/log/ufw.log | tail -20
#
# Si el servidor privado es un contenedor y no tienes acceso a
# systemd/ufw en el host (por eso "no puede usar MV"), la
# alternativa es que el equipo con acceso a la VM ejecute este
# mismo script una sola vez en el host que hospeda los contenedores
# de docker-compose.private.yml. El aislamiento fino entre
# contenedores (api / db / monitoreo) ya lo da Docker con las redes
# "app_network", "data_network" y "monitoring_network" definidas
# como internal en el compose (nadie fuera de esas redes puede
# hablarles directamente).
# ------------------------------------------------------------
