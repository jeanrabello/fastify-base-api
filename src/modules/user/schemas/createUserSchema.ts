import { z } from "@utils/index";

const createUserSchema = {
  schema: {
    tags: ["Users"],
    description: "Create a new user",
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
            .describe("User created successfully")
            .default("User created successfully"),
        })
        .describe("User created"),
    },
  },
};

export { createUserSchema };
