import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const translationMiddleware = async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    const domain = request.url.split("/")[2];
    const acceptLanguage = request.headers["accept-language"] || "en-us";
    let langPackCode = "en-us";

    const availableDomains = fs
      .readdirSync(path.join(__dirname, "../../modules"))
      .filter((dir) => !dir.includes("routes"));

    if (!availableDomains.includes(domain)) {
      return;
    }

    if (acceptLanguage) {
      const lang = acceptLanguage.split(",")[0].trim().toLowerCase();
      const availableLangs = fs
        .readdirSync(path.join(__dirname, `../../modules/${domain}/lang`))
        .map((file) => path.parse(file).name)
        .filter((lang) => lang !== "index");
      if (availableLangs.includes(lang)) {
        langPackCode = lang;
      }
    }

    const fileExt = process.env.NODE_ENV !== "development" ? "js" : "ts";

    const langFilePath = pathToFileURL(
      path.join(
        __dirname,
        `../../modules/${domain}/lang/${langPackCode}.${fileExt}`,
      ),
    ).href;

    const langPack = await import(langFilePath);
    request.languagePack =
      (langPack as any).default.default ?? langPack.default;
    request.lang = langPackCode;
  });
};

export default translationMiddleware;
