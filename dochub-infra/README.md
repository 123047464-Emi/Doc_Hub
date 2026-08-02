# DocHub — Monitoreo, Firewall y Balanceo (Integrante 4)

Esta carpeta cubre tu parte del proyecto DocHub:
1. Monitoreo con Prometheus + Grafana
2. Firewall (aplicación + revisión de bloqueos)
3. Balanceador de carga con HAProxy

Está basada y adaptada del `demo-files.zip` que dio el profe, con nombres
y puertos ajustados a **DocHub_Api** / **DocHub_Web**.

## Arquitectura (dos servidores)

```
                         INTERNET
                             │
                    (80/443 HTTPS)
                             ▼
                 ┌───────────────────────┐
                 │   SERVIDOR PÚBLICO     │
                 │  - HAProxy (balanceo)  │
                 │  - Grafana (dashboards)│
                 └───────────┬───────────┘
                             │ red interna / LAN
                             ▼
                 ┌───────────────────────┐
                 │   SERVIDOR PRIVADO     │
                 │  - DocHub_Api x3       │
                 │  - DocHub_Web x2       │
                 │  - Prometheus          │
                 │  - cAdvisor            │
                 │  - node_exporter       │
                 │  - (BD, del compañero) │
                 └───────────────────────┘
```

- El **servidor público** es el único con IP visible desde internet.
- El **servidor privado** solo acepta conexiones del servidor público
  (eso es justo lo que hace el firewall).

## Archivos incluidos

| Archivo | Para qué sirve |
|---|---|
| `docker-compose.public.yml` | Levanta HAProxy + Grafana en el servidor público |
| `docker-compose.private.yml` | Levanta 2 réplicas de DocHub_Api + 2 réplicas de DocHub_Web + Prometheus + exporters en el servidor privado |
| `haproxy/haproxy.cfg` | Balanceo round-robin entre las réplicas de API y de Web, TLS, panel de stats |
| `prometheus/prometheus.yml` | Qué scrapea Prometheus (API, host, contenedores, HAProxy) |
| `grafana/provisioning/...` | Grafana se auto-configura con el datasource y el dashboard al arrancar |
| `grafana/DASHBOARDS-RECOMENDADOS.md` | IDs de dashboards **oficiales/comunidad** de Grafana a importar (Node Exporter Full, Docker/cAdvisor, HAProxy) — así no se arma uno desde cero |
| `grafana/dashboards/dochub-overview.json` | Dashboard extra opcional, resumen simple de DocHub (no obligatorio, ver nota arriba) |
| `DocHub_Web.Dockerfile.EJEMPLO` | Dockerfile de ejemplo para `DocHub_Web` (renómbralo a `Dockerfile` dentro de esa carpeta) |
| `firewall/setup-firewall-private.sh` | Reglas para que el servidor privado solo hable con el público |
| `firewall/setup-firewall-public.sh` | Reglas para exponer solo 80/443 al público |

## Pasos para dejarlo funcionando

1. **Reemplaza los placeholders** en estos 3 archivos con tus IPs reales:
   - `prometheus/prometheus.yml` → `IP_SERVIDOR_PUBLICO`
   - `haproxy/haproxy.cfg` → `IP_SERVIDOR_PRIVADO`
   - `grafana/provisioning/datasources/datasource.yml` → `IP_SERVIDOR_PRIVADO`
   - `firewall/*.sh` → `IP_ADMIN` y `IP_SERVIDOR_PUBLICO`

2. **Certificado SSL**: copia tu `server.crt` y `server.key` (o el que
   les haya dado el profe) a `haproxy/certs/`, combínalos en un solo
   archivo `.pem` y nómbralo `server.pem`:
   ```bash
   cat server.crt server.key > haproxy/certs/server.pem
   ```

3. **Exponer `/metrics` en tu API** (para que Prometheus tenga algo que
   leer de DocHub_Api). Si usan Express, instala `prom-client`:
   ```bash
   npm install prom-client
   ```
   y agrega esto en tu `server.js`, junto a tus demás rutas:
   ```javascript
   const client = require('prom-client');
   client.collectDefaultMetrics();

   app.get('/metrics', async (req, res) => {
     res.set('Content-Type', client.register.contentType);
     res.end(await client.register.metrics());
   });

   app.get('/health', (req, res) => res.sendStatus(200));
   ```

4. **Levantar los servicios**:
   ```bash
   # en el servidor privado
   docker compose -f docker-compose.private.yml up -d

   # en el servidor publico
   docker compose -f docker-compose.public.yml up -d
   ```

5. **Aplicar firewall** (en cada servidor, con sudo):
   ```bash
   sudo bash firewall/setup-firewall-private.sh   # en el servidor privado
   sudo bash firewall/setup-firewall-public.sh    # en el servidor publico
   ```

## Cómo demostrar cada punto en la evaluación

- **Monitoreo (Prometheus/Grafana)**: abre `http://IP_PUBLICA/grafana/`,
  entra con `admin` / la contraseña que pusiste, y muestra el dashboard
  "DocHub" ya cargado con datos en vivo. También puedes abrir
  `http://IP_PRIVADA:9090/targets` para mostrar que Prometheus ve las 3
  réplicas, el host y HAProxy como "UP".

- **Firewall**: en el servidor privado corre `sudo ufw status verbose`
  para mostrar las reglas activas, y `sudo grep "UFW BLOCK" /var/log/ufw.log`
  para mostrar intentos bloqueados reales (puedes generar uno a propósito
  intentando conectarte a un puerto cerrado desde otra máquina).

- **Balanceador de carga**: abre `http://IP_PUBLICA:8404/stats` — ahí se
  ve en vivo cómo HAProxy reparte las peticiones entre `api1`, `api2`,
  `api3` (backend `api_back`) y entre `web1`, `web2` (backend `web_back`).
  Para probarlo en el momento, puedes correr varias veces:
  ```bash
  # prueba el balanceo de la API
  for i in {1..10}; do curl -s https://IP_PUBLICA/api/health; done

  # prueba el balanceo del Web
  for i in {1..10}; do curl -s https://IP_PUBLICA/ > /dev/null; done
  ```
  y mostrar en el panel de stats cómo suben los contadores de cada
  servidor de forma alternada, en ambos backends.

## Notas

- El puerto de la API (3000) ya está confirmado con su `.env`. Si cambia,
  ajústalo en `docker-compose.private.yml` y en `haproxy.cfg`.
- `DocHub_Web/server.js` **NO** se usa para servir la página — es una
  API mock aparte (documentos, firmas, login de prueba). El Dockerfile
  compila el proyecto con `npm run build` y sirve el resultado (`dist/`)
  con Nginx en el puerto 80 del contenedor, mapeado a 5001/5002 en el
  host. Así se prueba/balancea la página real, no la API de prueba.
- `web1`/`web2` necesitan el `Dockerfile` dentro de `DocHub_Web/`. Te
  dejé uno de ejemplo en `DocHub_Web.Dockerfile.EJEMPLO` — cópialo a
  `DocHub_Web/Dockerfile`.
- Para el monitoreo (Grafana), revisa `grafana/DASHBOARDS-RECOMENDADOS.md`:
  ahí están los 3 dashboards oficiales/comunidad que debes importar por
  ID en vez de construir uno desde cero.
- El servicio de base de datos no está aquí a propósito: es parte del
  trabajo de tu compañero de API/BD. Solo agrégalo a la red
  `data_network` de `docker-compose.private.yml` si necesitas que
  Prometheus también la monitoree (con el exporter correspondiente,
  ej. `prom/mysqld-exporter` o `prometheuscommunity/postgres_exporter`).
