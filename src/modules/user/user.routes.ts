import { FastifyTypedInstance } from "../../types/fastifyTypedInstance";
import { CreateUserController } from "./controllers/CreateUserController";
import { CreateUserRepository } from "./repositories/CreateUserRepository";
import { createUserSchema } from "./schemas/createUserSchema";
import { routeAdapter } from "@utils/routeAdapter";
import { findUserSchema } from "./schemas/findUserSchema";

const userRoutes = (app: FastifyTypedInstance) => {
  app.post(
    "/",
    createUserSchema,
    routeAdapter(new CreateUserController(new CreateUserRepository())),
  );
  app.get(
    "/:id",
    findUserSchema,
    routeAdapter(new CreateUserController(new CreateUserRepository())),
  );
};

export { userRoutes };
