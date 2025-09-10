import { z } from "@utils/index";

const refreshTokenSchema = {
  schema: {
    tags: ["Auth"],
    description: "Refresh JWT access token using refresh token",
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
            .describe("Token refreshed successfully")
            .default("Token refreshed successfully"),
          data: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            expiresIn: z.number(),
          }),
        })
        .describe("Token refreshed successfully"),
      401: z
        .object({
          statusCode: z.number().default(401),
          message: z
            .string()
            .describe("Invalid refresh token")
            .default("Invalid refresh token"),
        })
        .describe("Invalid refresh token"),
    },
  },
};

export { refreshTokenSchema };
