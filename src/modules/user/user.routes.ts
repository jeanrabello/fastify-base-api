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
import { FindUserByEmailController } from "@modules/user/controllers/FindUserByEmailController";
import { VerifyUserCredentialsController } from "@modules/user/controllers/VerifyUserCredentialsController";
import { MongoUserRepository } from "@src/infra/mongo/repositories/user/MongoUserRepository";
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";
import { FindUserByIdUseCase } from "@modules/user/useCases/FindUserByIdUseCase";
import { FindUserByEmailUseCase } from "@modules/user/useCases/FindUserByEmailUseCase";
import { VerifyUserCredentialsUseCase } from "@modules/user/useCases/VerifyUserCredentialsUseCase";
import { ListUsersPaginatedUseCase } from "@modules/user/useCases/ListUsersPaginatedUseCase";
import { DeleteUserController } from "./controllers/DeleteUserController";
import { DeleteUserByIdUseCase } from "./useCases/DeleteUserByIdUseCase";
import { UpdateUserEmailController } from "./controllers/UpdateUserEmailController";
import { UpdateUserEmailUseCase } from "./useCases/UpdateUserEmailUseCase";
import { findUserByEmailSchema } from "./schemas/findUserByEmailSchema";
import { verifyUserCredentialsSchema } from "./schemas/verifyUserCredentialsSchema";

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
  app.post(
    "/email",
    {
      ...findUserByEmailSchema,
    },
    routeAdapter(
      new FindUserByEmailController({
        findUserByEmailUseCase: new FindUserByEmailUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );
  app.post(
    "/auth/verify",
    verifyUserCredentialsSchema,
    routeAdapter(
      new VerifyUserCredentialsController({
        verifyUserCredentialsUseCase: new VerifyUserCredentialsUseCase({
          userRepository: new MongoUserRepository(),
        }),
      }),
    ),
  );
  app.get(
    "/",
    {
      ...listUsersSchema,
      preHandler: app.authenticate,
      config: {
        hateoas: {
          collection: true,
          pagination: true,
          links: [{ rel: "create", method: "POST", path: "/api/user" }],
          itemLinks: (user: { id: string }) => [
            { rel: "self", method: "GET", path: `/api/user/${user.id}` },
            { rel: "update", method: "PUT", path: `/api/user/${user.id}` },
            { rel: "delete", method: "DELETE", path: `/api/user/${user.id}` },
          ],
        },
      },
    },
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
    {
      ...findUserSchema,
      preHandler: app.authenticate,
      config: {
        hateoas: {
          links: [
            { rel: "collection", method: "GET", path: "/api/user" },
            { rel: "update", method: "PUT", path: "/api/user/:id" },
            { rel: "delete", method: "DELETE", path: "/api/user/:id" },
          ],
        },
      },
    },
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
    {
      ...deleteUserSchema,
      preHandler: app.authenticate,
    },
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
    {
      ...updateUserEmailSchema,
      preHandler: app.authenticate,
    },
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
