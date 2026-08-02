# Dashboards de Grafana para DocHub (prediseñados, no desde cero)

Tu profe pidió usar dashboards que Grafana ya ofrece, no armar uno desde
cero. Grafana tiene una librería pública de dashboards de la comunidad
(grafana.com/grafana/dashboards) a los que te conectas por **ID**.

## Cómo importar uno (dentro de Grafana)

1. Entra a Grafana → menú izquierdo → **Dashboards** → **New** → **Import**.
2. Pega el **ID** del dashboard (ver tabla abajo) en el campo
   "Import via grafana.com" y dale **Load**.
3. En "Prometheus" selecciona el datasource `Prometheus-DocHub`
   (el que ya dejamos provisionado).
4. Dale **Import**. Listo, ya tienes el dashboard con datos en vivo.

## Dashboards recomendados para tu stack

| Qué monitorea | ID en grafana.com | Nombre |
|---|---|---|
| CPU, RAM, disco, red del servidor (node_exporter) | **1860** | Node Exporter Full |
| Contenedores Docker (cadvisor + node_exporter) | **893** | Docker and system monitoring |
| HAProxy (frontends/backends, balanceo) | **12693** | HAProxy 2 Full |

Estos 3 cubren exactamente lo que ya está corriendo en
`docker-compose.private.yml` (node_exporter, cadvisor) y en
`haproxy.cfg` (métricas expuestas en el puerto 8405).

## Si no tienen internet en el servidor de Grafana

Si la máquina donde corre Grafana no tiene salida a internet para
jalar el dashboard por ID, la alternativa es:

1. En **otra** máquina con internet, entra a
   `https://grafana.com/grafana/dashboards/1860` (o el ID que sea),
   descarga el JSON.
2. Copia ese `.json` a `grafana/dashboards/` en este repo.
3. Se cargará solo, porque `grafana/provisioning/dashboards/dashboard.yml`
   ya apunta a esa carpeta.

## Nota sobre el dashboard personalizado anterior

Dejé `grafana/dashboards/dochub-overview.json` (el que armamos antes)
como **extra opcional** por si quieren un panel resumen simple con solo
lo de DocHub. No es obligatorio usarlo — con los 3 de la tabla de arriba
ya cumples el punto de la rúbrica.
