import { z } from "@utils/index";

const verifyUserCredentialsSchema = {
  schema: {
    tags: ["Users"],
    description: "Verify user credentials (email and password)",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    body: z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .required(),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z.string(),
          data: z.object({
            isValid: z.boolean(),
            user: z
              .object({
                id: z.string(),
                username: z.string(),
                email: z.string().email(),
              })
              .optional(),
          }),
        })
        .describe("Credential verification result"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z
            .string()
            .describe("Required fields not filled")
            .default("Required fields not filled"),
        })
        .describe("Required fields not filled"),
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

export { verifyUserCredentialsSchema };
