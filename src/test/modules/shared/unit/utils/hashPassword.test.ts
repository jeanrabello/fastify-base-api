import { hashPassword, comparePassword } from "@src/shared/utils/hashPassword";

describe("hashPassword", () => {
  const testPassword = "testPassword123";

  it("Should hash password successfully", async () => {
    const hashedPassword = await hashPassword(testPassword);

    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe("string");
    expect(hashedPassword).not.toBe(testPassword);
    expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hash tem pelo menos 60 caracteres
  });

  it("Should generate different hashes for the same password", async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);

    expect(hash1).not.toBe(hash2); // bcrypt usa salt aleatório
  });

  it("Should compare password correctly with valid hash", async () => {
    const hashedPassword = await hashPassword(testPassword);
    const isValid = await comparePassword(testPassword, hashedPassword);

    expect(isValid).toBe(true);
  });

  it("Should compare password correctly with invalid hash", async () => {
    const hashedPassword = await hashPassword(testPassword);
    const isValid = await comparePassword("wrongPassword", hashedPassword);

    expect(isValid).toBe(false);
  });

  it("Should handle edge cases correctly", async () => {
    // bcrypt aceita string vazia, então vamos testar isso
    const emptyHash = await hashPassword("");
    expect(emptyHash).toBeDefined();
    expect(typeof emptyHash).toBe("string");

    const isValidEmpty = await comparePassword("", emptyHash);
    expect(isValidEmpty).toBe(true);

    // Teste com hash inválido deve retornar false, não throw
    const isValidInvalid = await comparePassword("test", "invalid_hash");
    expect(isValidInvalid).toBe(false);
  });
});
