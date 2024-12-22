import { FastifyRequest } from "fastify";
import { FastifyTypedInstance } from "../types/fastifyTypedInstance";
import { z } from "@utils/index";

const routes = (app: FastifyTypedInstance) => {
  app.get(
    "/:param",
    {
      schema: {
        tags: ["HelloWorld"],
        params: z.object({
          param: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            params: z.object({
              param: z.string().default("Hello World"),
            }),
          }),
        },
      },
    },
    async (request: FastifyRequest) => {
      return {
        message: request.languagePack.commom.helloWorld,
        params: request.params,
      };
    },
  );
};

export { routes };
