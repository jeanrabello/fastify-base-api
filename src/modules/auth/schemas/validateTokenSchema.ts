import { z } from "@utils/index";

const validateTokenSchema = {
  schema: {
    tags: ["Auth"],
    description: "Validate JWT token",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
      authorization: z.string().describe("Bearer token"),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z
            .string()
            .describe("Token is valid")
            .default("Token is valid"),
          data: z.object({
            valid: z.boolean(),
            user: z
              .object({
                id: z.string(),
                email: z.string(),
                name: z.string(),
              })
              .optional(),
          }),
        })
        .describe("Token validation result"),
      400: z.object({
        statusCode: z.number().default(400),
        message: z
          .string()
          .describe("Required fields not filled")
          .default("Required fields not filled"),
      }),
      401: z
        .object({
          statusCode: z.number().default(401),
          message: z
            .string()
            .describe("Invalid or expired token")
            .default("Invalid or expired token"),
        })
        .describe("Invalid or expired token"),
    },
  },
};

export { validateTokenSchema };
