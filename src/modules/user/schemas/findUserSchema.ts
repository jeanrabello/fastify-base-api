import { z } from "@utils/index";

const findUserSchema = {
  schema: {
    tags: ["Users"],
    description: "Find user by id",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      302: z
        .object({
          statusCode: z.number().default(302),
          data: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string().email(),
            createdAt: z
              .string()
              .datetime()
              .describe("ISO date string for when the user was created"),
            updatedAt: z
              .string()
              .datetime()
              .describe("ISO date string for when the user was last updated"),
          }),
        })
        .describe("User data"),
    },
  },
};

export { findUserSchema };
