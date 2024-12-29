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
    },
  },
};

export { findUserSchema };
