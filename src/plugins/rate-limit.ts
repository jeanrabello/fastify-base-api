import config from "@config/api";
import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
/**
 * @param {FastifyInstance} app
 */
async function rateLimitPlugin(app: FastifyInstance) {
  if (!config.rateLimit.enabled) {
    return;
  }

  app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
    allowList: function (request, key) {
      // Internal use to avoid rate limiting for internal requests
      return (
        request.headers["x-app-client-id"] ===
        config.rateLimit.disableLimitSecret
      );
    },
  });

  console.log("Rate limit enabled");
}
export { rateLimitPlugin };
