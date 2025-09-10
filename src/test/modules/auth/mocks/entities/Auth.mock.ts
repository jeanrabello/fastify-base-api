export const mockUser = {
  id: "687d61bac1f462be9017ad91",
  username: "testuser",
  email: "test@example.com",
  password: "$2b$10$rF8K.H7p8V5.gT3Q2nN9sOAJFy2k.7z1D3f4G5h6J7k8L9m0N1o2P3",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockLoginResponse = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.refresh",
  expiresIn: 900,
  user: {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.username,
  },
};

export const mockTokenPayload = {
  id: mockUser.id,
  email: mockUser.email,
  name: mockUser.username,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900,
};
