import { z } from "@utils/index";

const findUserSchema = {
  schema: {
    tags: ["Users"],
    description: "Find user by id",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          data: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string().email(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
        })
        .describe("User data"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z
            .string()
            .describe("Required fields not filled")
            .default("Required fields not filled"),
        })
        .describe("Required fields not filled"),
      500: z.object({})
    },
  },
};

export { findUserSchema };
