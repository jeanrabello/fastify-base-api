import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const serviceName = 'fastify-base-api';
const serviceVersion = '1.0.0';

export function initializeTelemetry() {
  // Configure Prometheus exporter for metrics
  const prometheusExporter = new PrometheusExporter({
    port: 9464,
    endpoint: '/metrics',
  }, () => {
    console.log('Prometheus metrics server started on port 9464');
  });

  // Configure Jaeger exporter for traces
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  // Create the Node SDK
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
    }),
    traceExporter: jaegerExporter,
    metricReader: prometheusExporter,
    instrumentations: [
      new HttpInstrumentation({
        requestHook: (span, request) => {
          span.setAttributes({
            'http.request.body.size': request.headers['content-length'] || 0,
            'user.agent': request.headers['user-agent'] || 'unknown',
          });
        },
        responseHook: (span, response) => {
          span.setAttributes({
            'http.response.body.size': response.headers['content-length'] || 0,
          });
        },
      }),
      new FastifyInstrumentation({
        requestHook: (span, info) => {
          span.setAttributes({
            'fastify.route': info.request.routeOptions?.url || 'unknown',
            'fastify.method': info.request.method,
          });
        },
      }),
      new PinoInstrumentation(),
    ],
  });

  // Start the SDK
  sdk.start();
  console.log('OpenTelemetry initialized successfully');

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry terminated'))
      .catch((error) => console.error('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0));
  });

  return sdk;
}