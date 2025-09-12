import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { metrics, trace } from '@opentelemetry/api';
import logger from './logger';

const meter = metrics.getMeter('fastify-base-api', '1.0.0');

// HTTP Metrics
const httpRequestsTotal = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

const httpRequestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'Duration of HTTP requests in milliseconds',
  unit: 'ms',
});

const httpRequestsActive = meter.createUpDownCounter('http_requests_active', {
  description: 'Number of active HTTP requests',
});

// Business Metrics
const authAttemptsTotal = meter.createCounter('auth_attempts_total', {
  description: 'Total number of authentication attempts',
});

const authFailuresTotal = meter.createCounter('auth_failures_total', {
  description: 'Total number of failed authentication attempts',
});

const databaseConnectionsActive = meter.createUpDownCounter('database_connections_active', {
  description: 'Number of active database connections',
});

export function createMetricsMiddleware(app: FastifyInstance) {
  // Request metrics middleware
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    // Store start time for duration calculation
    request.requestStartTime = startTime;
    
    // Increment active requests
    httpRequestsActive.add(1, {
      method: request.method,
      route: request.routeOptions?.url || 'unknown',
    });

    logger.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    }, 'Incoming request');
  });

  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const duration = Date.now() - (request.requestStartTime || Date.now());
    const statusCode = reply.statusCode.toString();
    const method = request.method;
    const route = request.routeOptions?.url || 'unknown';

    const labels = {
      method,
      route,
      status_code: statusCode,
      status_class: `${Math.floor(reply.statusCode / 100)}xx`,
    };

    // Record metrics
    httpRequestsTotal.add(1, labels);
    httpRequestDuration.record(duration, labels);
    httpRequestsActive.add(-1, { method, route });

    // Add trace attributes
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttributes({
        'http.response_time_ms': duration,
        'http.status_class': labels.status_class,
      });
    }

    logger.info({
      method,
      url: request.url,
      statusCode: reply.statusCode,
      duration,
      responseSize: reply.getHeader('content-length') || 0,
    }, 'Request completed');
  });

  app.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setAttributes({
        'error': true,
        'error.name': error.name,
        'error.message': error.message,
      });
    }

    logger.error({
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
    }, 'Request error');
  });
}

// Business metrics functions
export const recordAuthAttempt = (success: boolean, reason?: string) => {
  authAttemptsTotal.add(1, { success: success.toString() });
  
  if (!success) {
    authFailuresTotal.add(1, { reason: reason || 'unknown' });
  }
  
  logger.info({ success, reason }, 'Authentication attempt recorded');
};

export const recordDatabaseConnection = (active: boolean) => {
  databaseConnectionsActive.add(active ? 1 : -1);
  logger.debug({ active }, 'Database connection state changed');
};

// Declare module to extend FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    requestStartTime?: number;
  }
}