import { FastifyTypedInstance } from "../../types/fastifyTypedInstance";
import { CreateUserController } from "./controllers/CreateUserController";
import { createUserSchema } from "./schemas/createUserSchema";
import { routeAdapter } from "@utils/routeAdapter";
import { findUserSchema } from "./schemas/findUserSchema";
import { FindUserController } from "./controllers/FindUserController";

const userRoutes = (app: FastifyTypedInstance) => {
  app.post("/", createUserSchema, routeAdapter(new CreateUserController()));
  app.get("/:id", findUserSchema, routeAdapter(new FindUserController()));
};

export { userRoutes };
