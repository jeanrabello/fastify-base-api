import { FastifyTypedInstance } from "../../types/fastifyTypedInstance";
import { CreateUserController } from "./controllers/CreateUserController";
import { createUserSchema } from "./schemas/createUserSchema";
import { routeAdapter } from "@utils/routeAdapter";

const userRoutes = (app: FastifyTypedInstance) => {
  app.post("/", createUserSchema, routeAdapter(new CreateUserController()));
};

export { userRoutes };
