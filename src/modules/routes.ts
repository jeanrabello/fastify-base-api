import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { userRoutes } from "@modules/user/user.routes";
import { authRoutes } from "@modules/auth/auth.routes";

const routes = (app: FastifyTypedInstance) => {
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/user" });
};

export { routes };
