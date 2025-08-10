import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { userRoutes } from "@modules/user/user.routes";

const routes = (app: FastifyTypedInstance) => {
  app.register(userRoutes, { prefix: "/user" });
};

export { routes };
