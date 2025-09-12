# Stack de Observabilidade

Esta pasta contém toda a configuração necessária para executar a stack de observabilidade da API.

## Quick Start

```bash
# 1. Iniciar a stack de observabilidade
docker compose -f docker-compose.observability.yml up -d

# 2. Verificar se todos os serviços estão rodando
docker compose -f docker-compose.observability.yml ps

# 3. Iniciar a API (em outro terminal)
npm run dev

# 4. Fazer algumas requisições para gerar dados
curl http://localhost:3333/api/health

# 5. Acessar as interfaces
open http://localhost:3000  # Grafana (admin/admin123)
open http://localhost:9090  # Prometheus
open http://localhost:16686 # Jaeger
```

## Serviços

| Serviço | Porta | Interface | Descrição |
|---------|-------|-----------|-----------|
| API | 3333 | http://localhost:3333/api | Fastify API |
| Métricas | 9464 | http://localhost:9464/metrics | Endpoint Prometheus |
| Prometheus | 9090 | http://localhost:9090 | Coleta de métricas |
| Grafana | 3000 | http://localhost:3000 | Dashboards (admin/admin123) |
| Jaeger | 16686 | http://localhost:16686 | Distributed tracing |
| Node Exporter | 9100 | http://localhost:9100/metrics | Métricas do sistema |

## Comandos Úteis

```bash
# Parar todos os serviços
docker compose -f docker-compose.observability.yml down

# Ver logs de um serviço específico
docker compose -f docker-compose.observability.yml logs -f prometheus
docker compose -f docker-compose.observability.yml logs -f grafana

# Limpar dados (irá perder dashboards customizados)
docker compose -f docker-compose.observability.yml down -v

# Recriar serviços
docker compose -f docker-compose.observability.yml up -d --force-recreate
```

## Estrutura

```
observability/
├── README.md                    # Este arquivo
├── prometheus/
│   └── prometheus.yml          # Configuração Prometheus
└── grafana/
    ├── provisioning/
    │   ├── datasources/        # Auto-config datasources
    │   └── dashboards/         # Auto-config dashboards
    └── dashboards/             # JSON dos dashboards
        ├── api-overview.json   # Dashboard principal da API
        └── system-metrics.json # Dashboard do sistema
```

## Troubleshooting

### Problema: Métricas não aparecem no Prometheus
**Solução**: Verificar se a API está rodando e se o endpoint `/metrics` está acessível.

### Problema: Dashboards não carregam no Grafana
**Solução**: Aguardar alguns minutos para o Grafana processar os arquivos de provisioning.

### Problema: Traces não aparecem no Jaeger
**Solução**: Fazer requisições para a API para gerar traces.

### Problema: Permissão negada no Docker
**Solução**: Verificar se o Docker está rodando e se você tem permissões adequadas.