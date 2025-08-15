import { z } from "@utils/index";

const updateUserEmailSchema = {
  schema: {
    tags: ["Users"],
    description: "Update user's email",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string().min(1),
    }),
    body: z.object({
      email: z.string().email(),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z
            .string()
            .describe("User email updated successfully")
            .default("User email updated successfully"),
          data: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string().email(),
          }),
        })
        .describe("User email updated"),
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
      409: z
        .object({
          statusCode: z.number().default(409),
          message: z
            .string()
            .describe("Email already registered")
            .default("Email already registered"),
        })
        .describe("Email already registered"),
      500: z
        .object({
          statusCode: z.number().default(500),
          message: z
            .string()
            .describe("Error updating email")
            .default("Error updating email"),
        })
        .describe("Error updating email"),
    },
  },
};

export { updateUserEmailSchema };
