import { FastifyRequest, FastifyReply } from "fastify";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { AbstractController } from "../classes/AbstractController";
import { Translation } from "@src/shared/types/lang";
import { IModel } from "../classes/IModel";

export const routeAdapter = (
  controller: AbstractController<IModel | null, Translation>,
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    controller.languagePack = request.languagePack;
    const httpResponse: HttpResponse = await controller.handle(
      request as HttpRequest<IModel, Translation>,
    );
    if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
      return reply.status(httpResponse.statusCode).send({
        statusCode: httpResponse.statusCode,
        message: httpResponse.message,
        data: httpResponse.data,
      });
    } else {
      reply
        .status(httpResponse.statusCode)
        .send({ message: httpResponse.message });
    }
  };
};
