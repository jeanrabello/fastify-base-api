import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { CreateUserController } from "@modules/user/controllers/CreateUserController";
import {
  createUserSchema,
  deleteUserSchema,
  findUserSchema,
  updateUserEmailSchema,
  listUsersSchema,
} from "@modules/user/schemas";
import { routeAdapter } from "@utils/routeAdapter";
import { FindUserController } from "@modules/user/controllers/FindUserController";
import { ListUsersController } from "@modules/user/controllers/ListUsersController";
import { MongoUserRepository } from "@src/infra/mongo/repositories/user/MongoUserRepository";
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";
import { FindUserByIdUseCase } from "@modules/user/useCases/FindUserByIdUseCase";
import { ListUsersPaginatedUseCase } from "@modules/user/useCases/ListUsersPaginatedUseCase";
import { DeleteUserController } from "./controllers/DeleteUserController";
import { DeleteUserByIdUseCase } from "./useCases/DeleteUserByIdUseCase";
import { UpdateUserEmailController } from "./controllers/UpdateUserEmailController";
import { UpdateUserEmailUseCase } from "./useCases/UpdateUserEmailUseCase";

const userRoutes = (app: FastifyTypedInstance) => {
  app.post(
    "/",
    createUserSchema,
    routeAdapter(
      new CreateUserController({
        createUserUseCase: new CreateUserUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );
  app.get(
    "/",
    listUsersSchema,
    routeAdapter(
      new ListUsersController({
        listUsersUseCase: new ListUsersPaginatedUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );

  app.get(
    "/:id",
    findUserSchema,
    routeAdapter(
      new FindUserController({
        findUserByIdUseCase: new FindUserByIdUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );
  app.delete(
    "/:id",
    deleteUserSchema,
    routeAdapter(
      new DeleteUserController({
        findUserByIdUseCase: new FindUserByIdUseCase({
          userRepository: new MongoUserRepository(),
        }),
        deleteUserByIdUseCase: new DeleteUserByIdUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );
  app.put(
    "/:id",
    updateUserEmailSchema,
    routeAdapter(
      new UpdateUserEmailController({
        updateUserEmailUseCase: new UpdateUserEmailUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );
};

export { userRoutes };
