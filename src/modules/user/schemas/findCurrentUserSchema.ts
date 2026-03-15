import { z } from "@utils/index";

const findCurrentUserSchema = {
  schema: {
    tags: ["Users"],
    description: "Get the authenticated user's profile",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
      authorization: z.string().describe("Bearer token"),
    }),
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
        .describe("Current user data"),
      401: z
        .object({
          statusCode: z.number().default(401),
          message: z
            .string()
            .describe("Authorization required")
            .default("Authorization required"),
        })
        .describe("Authorization required"),
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

export { findCurrentUserSchema };
