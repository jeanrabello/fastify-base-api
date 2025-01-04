import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const translationMiddleware = async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    const acceptLanguage = request.headers["accept-language"] || "en-US";
    let langPackCode = "en-US";

    if (acceptLanguage) {
      const lang = acceptLanguage.split(",")[0].trim();
      const availableLangs = fs
        .readdirSync(path.join(__dirname, "../../lang"))
        .map((file) => path.parse(file).name);

      if (availableLangs.includes(lang)) {
        langPackCode = lang;
      }
    }

    const fileExt = process.env.NODE_ENV !== "development" ? "js" : "ts";

    const langFilePath = pathToFileURL(
      path.join(__dirname, `../../lang/${langPackCode}.${fileExt}`),
    ).href;

    const langPack = await import(langFilePath);
    request.languagePack = langPack.default;
  });
};

export default translationMiddleware;
