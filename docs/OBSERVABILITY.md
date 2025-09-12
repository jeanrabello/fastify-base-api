# Observabilidade - Fastify Base API

Este documento descreve a implementação completa de observabilidade na API utilizando OpenTelemetry, Prometheus, Grafana, Jaeger e Pino para logging estruturado.

## Componentes da Stack

### OpenTelemetry
- **Auto-instrumentação**: Coleta automática de traces e métricas
- **Instrumentações habilitadas**: HTTP, Fastify, Pino
- **Exportadores**: Prometheus (métricas) e Jaeger (traces)

### Pino Logger
- **Logging estruturado** em formato JSON
- **Correlação automática** com traces (traceId, spanId)
- **Formatação**: pino-pretty em desenvolvimento, JSON em produção

### Prometheus
- **Coleta de métricas** da aplicação e sistema
- **Endpoint**: `http://localhost:9464/metrics`
- **Scrape interval**: 5s para API, 15s para sistema

### Grafana
- **Visualização** de métricas e dashboards
- **Interface**: `http://localhost:3000` (admin/admin123)
- **Dashboards**: API Overview e System Metrics

### Jaeger
- **Distributed tracing** da aplicação
- **Interface**: `http://localhost:16686`
- **Coleta automática** de spans HTTP e Fastify

## Métricas Coletadas

### HTTP Métricas
- `http_requests_total`: Total de requests HTTP por método, rota e status
- `http_request_duration_ms`: Duração dos requests em millisegundos
- `http_requests_active`: Número de requests ativos

### Métricas de Negócio
- `auth_attempts_total`: Total de tentativas de autenticação
- `auth_failures_total`: Total de falhas de autenticação
- `database_connections_active`: Conexões ativas com banco

### Métricas de Sistema (Node Exporter)
- CPU, Memória, Disk I/O, Network I/O

## Como Usar

### 1. Iniciar a Stack de Observabilidade

```bash
# Inicia Prometheus, Grafana, Jaeger e Node Exporter
docker compose -f docker-compose.observability.yml up -d
```

### 2. Iniciar a API
```bash
# Com telemetria habilitada
npm run dev
```

### 3. Acessar as Interfaces
- **API**: `http://localhost:3333/api`
- **Métricas**: `http://localhost:9464/metrics`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000` (admin/admin123)
- **Jaeger**: `http://localhost:16686`

### 4. Verificar Coleta de Dados
1. Faça algumas requisições para a API
2. Verifique métricas no Prometheus
3. Visualize dashboards no Grafana
4. Analise traces no Jaeger

## Configuração

### Variáveis de Ambiente
```env
# Logging
LOG_LEVEL=info                    # Nível de log (debug, info, warn, error)
NODE_ENV=development              # Formato do log (pretty em dev)

# Jaeger
JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

### Estrutura de Arquivos
```
observability/
├── telemetry.ts              # Configuração OpenTelemetry
├── logger.ts                 # Configuração Pino
├── metrics.ts                # Métricas customizadas
└── tracing.ts                # Inicialização (importar primeiro)

observability/                # Configurações Docker
├── prometheus/
│   └── prometheus.yml
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   └── dashboards/
    └── dashboards/
        ├── api-overview.json
        └── system-metrics.json
```

## Dashboards Grafana

### 1. API Overview
- Request Rate (req/s)
- Response Time (percentis 50 e 95)
- HTTP Status Codes (2xx, 4xx, 5xx)
- Active Requests
- Authentication Metrics

### 2. System Metrics
- CPU Usage (%)
- Memory Usage (%)
- Network I/O (Bytes/s)
- Disk I/O (Bytes/s)

## Alerting (Futuro)
- High error rate (> 5%)
- High response time (> 1s)
- High CPU usage (> 80%)
- Low disk space (< 10%)

## Troubleshooting

### Métricas não aparecendo
1. Verificar se API está rodando na porta correta
2. Verificar configuração do Prometheus
3. Verificar se endpoint `/metrics` está acessível

### Traces não aparecendo no Jaeger
1. Verificar se Jaeger está rodando
2. Verificar configuração do JAEGER_ENDPOINT
3. Verificar logs da aplicação

### Logs sem trace correlation
1. Verificar importação do tracing.ts
2. Verificar se spans estão sendo criados
3. Verificar configuração do Pino

## Performance

A implementação de observabilidade adiciona overhead mínimo:
- **Traces**: ~1-2ms por request
- **Métricas**: < 1ms por request  
- **Logs**: ~0.5ms por log entry

Para produção, considere:
- Amostragem de traces (10-20%)
- Configurar retenção de dados
- Monitorar uso de recursos do Prometheus/Grafana