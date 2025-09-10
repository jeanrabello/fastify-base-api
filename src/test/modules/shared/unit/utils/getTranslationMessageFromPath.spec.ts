import { Translation } from "@src/shared/types/lang";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";

const mockTranslation: Translation = {
  shared: {
    error: {
      invalidFields: "Invalid fields",
      requiredFields: "Required fields not filled",
      tokenExpired: "Token expired",
      tokenNotFound: "Token not found",
      internalServerError: "Internal server error",
      noMessageSpecified: "No message specified",
      authorizationRequired: "Authorization required",
      invalidAuthorizationFormat: "Invalid authorization format",
      invalidToken: "Invalid token",
      accessForbidden: "Access forbidden",
    },
  },
};

describe("getTranslationMessageFromPath", () => {
  it("Returns the correct message for a valid path", () => {
    const msg = getTranslationMessageFromPath(
      mockTranslation,
      "shared.error.internalServerError",
    );
    expect(msg).toBe("Internal server error");
  });

  it("Returns the fallback for an undefined codePath", () => {
    const msg = getTranslationMessageFromPath(mockTranslation, undefined);
    expect(msg).toBe("Internal server error");
  });

  it("Returns the no message specified when the path does not exist", () => {
    const invalid = "invalid.path";
    const msg = getTranslationMessageFromPath(mockTranslation, invalid as any);
    expect(msg).toBe("No message specified");
  });

  it("Returns internalServerError if the path resolves to undefined", () => {
    (mockTranslation.shared as any).error.undefinedKey = undefined;
    const msg = getTranslationMessageFromPath(
      mockTranslation,
      "shared.error.undefinedKey" as any,
    );
    expect(msg).toBe("Internal server error");
  });

  it("Returns the invalidFields message with fields when failed at schema", () => {
    const msg = getTranslationMessageFromPath(
      mockTranslation,
      "shared.error.invalidFields: 'invalidField'",
    );
    expect(msg).toBe("Invalid fields: 'invalidField'");
  });

  it("Returns literal message when is not a path for a mapped message", () => {
    const msg = getTranslationMessageFromPath(
      mockTranslation,
      "Literal message" as any,
    );
    expect(msg).toBe("Literal message");
  });
});
