import { FastifyRequest, FastifyReply } from "fastify";
import { Controller } from "../../types/controller";
import { HttpResponse } from "@src/types/http";

export const routeAdapter = (controller: Controller) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const httpResponse: HttpResponse = await controller.handle(request);

      if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
        return reply.status(httpResponse.statusCode).send({
          message: httpResponse.message,
          data: httpResponse.data,
        });
      } else {
        reply
          .status(httpResponse.statusCode)
          .send({ message: httpResponse.message });
      }
    } catch (error: any) {
      reply.status(500).send({ message: error.message });
    }
  };
};
