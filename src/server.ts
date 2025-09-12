import "./observability/tracing";
import "@src/config/env";
import app from "./app";
import logger from "./observability/logger";

app.ready().then(() => {
  logger.info("Server initialized and ready to run!");
});
