import { z } from "@utils/index";

export const listUsersSchema = {
  schema: {
    tags: ["Users"],
    description: "List users with pagination",
    querystring: z.object({
      page: z
        .string()
        .regex(/^[0-9]+$/)
        .optional()
        .default("1"),
      size: z
        .string()
        .regex(/^[0-9]+$/)
        .optional()
        .default("10"),
    }),
    response: {
      200: z.object({
        statusCode: z.number(),
        message: z.string(),
        data: z.object({
          totalItems: z.number(),
          nextPage: z.number().nullable(),
          previousPage: z.number().nullable(),
          page: z.number(),
          size: z.number(),
          content: z.array(
            z.object({
              id: z.string(),
              username: z.string(),
              email: z.string().email(),
            }),
          ),
        }),
      }),
    },
  },
};
