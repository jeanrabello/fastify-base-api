import { z } from "@utils/index";

const findUserByEmailSchema = {
  schema: {
    tags: ["Users"],
    description: "Find user by email",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    body: z
      .object({
        email: z.string().email(),
      })
      .required(),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z.string(),
          data: z
            .object({
              id: z.string(),
              username: z.string(),
              email: z.string().email(),
            })
            .nullable(),
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
      404: z
        .object({
          statusCode: z.number().default(404),
          message: z
            .string()
            .describe("User not found")
            .default("User not found"),
        })
        .describe("User not found"),
      500: z.object({
        statusCode: z.number().default(500),
        message: z
          .string()
          .describe("Internal server error")
          .default("Internal server error"),
      }),
    },
  },
};

export { findUserByEmailSchema };
