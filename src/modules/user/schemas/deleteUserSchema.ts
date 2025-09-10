import z from "zod";

const deleteUserSchema = {
  schema: {
    tags: ["Users"],
    description: "Delete user by id",
    security: [{ bearerAuth: [] }],
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string().min(4),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z.string(),
        })
        .describe("User deleted"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z
            .string()
            .describe("Error deleting user")
            .default("Error deleting user"),
        })
        .describe("Error deleting user"),
      401: z
        .object({
          statusCode: z.number().default(401),
          message: z.string(),
        })
        .describe("Authentication required"),
      404: z
        .object({
          statusCode: z.number().default(404),
          message: z
            .string()
            .describe("User not found")
            .default("User not found"),
        })
        .describe("User not found"),
    },
  },
};

export { deleteUserSchema };
