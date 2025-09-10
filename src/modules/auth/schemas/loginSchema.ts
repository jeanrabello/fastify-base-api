import { z } from "@utils/index";

const loginSchema = {
  schema: {
    tags: ["Auth"],
    description: "Authenticate user and generate JWT tokens",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z
            .string()
            .describe("Login successful")
            .default("Login successful"),
          data: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            expiresIn: z.number(),
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
            }),
          }),
        })
        .describe("Login successful"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z
            .string()
            .describe("Invalid request data")
            .default("Invalid request data"),
        })
        .describe("Invalid request data"),
      401: z
        .object({
          statusCode: z.number().default(401),
          message: z
            .string()
            .describe("Invalid credentials")
            .default("Invalid credentials"),
        })
        .describe("Invalid credentials"),
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

export { loginSchema };
