import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  name: 'fastify-base-api',
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
    log: (object) => {
      const span = trace.getActiveSpan();
      if (!span) return object;

      const { spanId, traceId, traceFlags } = span.spanContext();
      return {
        ...object,
        traceId,
        spanId,
        traceFlags,
      };
    },
  },
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

export default logger;