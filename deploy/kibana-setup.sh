#!/usr/bin/env bash
# Deja Elasticsearch y Kibana listos para ver los logs de JHipster:
#   1. Política de retención (ILM): los índices pasan a solo lectura a los 7 días y se borran a los 30.
#   2. Plantilla de índice: aplica esa política a todos los índices jhipster-logs-*.
#   3. Data view "jhipster-logs-*" en Kibana, para usar Discover, dashboards y alertas.
# Uso: ./kibana-setup.sh   (con el stack levantado: docker compose up -d)
set -euo pipefail
ES=http://localhost:9200
KB=http://localhost:5601

echo "Esperando a Elasticsearch..."
until curl -s "$ES/_cluster/health" | grep -qE '"status":"(green|yellow)"'; do sleep 3; done

echo "1) Política ILM jhipster-logs"
curl -s -X PUT "$ES/_ilm/policy/jhipster-logs" -H 'Content-Type: application/json' -d '{
  "policy": {
    "phases": {
      "hot":    { "actions": {} },
      "warm":   { "min_age": "7d",  "actions": { "readonly": {} } },
      "delete": { "min_age": "30d", "actions": { "delete": {} } }
    }
  }
}'; echo

echo "2) Plantilla de índice jhipster-logs"
curl -s -X PUT "$ES/_index_template/jhipster-logs" -H 'Content-Type: application/json' -d '{
  "index_patterns": ["jhipster-logs-*"],
  "template": {
    "settings": {
      "number_of_replicas": 0,
      "index.lifecycle.name": "jhipster-logs"
    }
  }
}'; echo

echo "Esperando a Kibana..."
until curl -s "$KB/api/status" | grep -q '"level":"available"'; do sleep 5; done

echo "3) Data view jhipster-logs-*"
curl -s -X POST "$KB/api/data_views/data_view" -H 'kbn-xsrf: true' -H 'Content-Type: application/json' -d '{
  "override": true,
  "data_view": {
    "id": "jhipster-logs",
    "title": "jhipster-logs-*",
    "name": "Logs de JHipster",
    "timeFieldName": "@timestamp"
  }
}' > /dev/null && echo "ok"

echo
echo "Listo. Abrí Kibana: $KB/app/discover"
