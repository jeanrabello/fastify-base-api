import { FastifyTypedInstance } from "../types/fastifyTypedInstance";
import { userRoutes } from "./user/user.routes";

const routes = (app: FastifyTypedInstance) => {
  app.register(userRoutes, { prefix: "/user" });
};

export { routes };
