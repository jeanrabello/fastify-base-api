import { z } from "@utils/index";

const signupSchema = {
  schema: {
    tags: ["Auth"],
    description: "Register a new user account",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    body: z.object({
      username: z.string(),
      email: z.string().email(),
      password: z.string().min(8).max(16),
    }),
    response: {
      201: z
        .object({
          statusCode: z.number().default(201),
          message: z
            .string()
            .describe("User registered successfully")
            .default("User registered successfully"),
          data: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string(),
          }),
        })
        .describe("User registered"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z
            .string()
            .describe("Required fields not filled")
            .default("Required fields not filled"),
        })
        .describe("Required fields not filled"),
      409: z
        .object({
          statusCode: z.number().default(409),
          message: z
            .string()
            .describe("Email or username already registered")
            .default("Email or username already registered"),
        })
        .describe("Email or username already registered"),
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

export { signupSchema };
