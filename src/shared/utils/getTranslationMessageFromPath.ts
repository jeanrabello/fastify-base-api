import { Translation } from "../types/lang";
import { Paths } from "../types/paths";

export const getTranslationMessageFromPath = <
  K extends Translation = Translation,
>(
  langPack: Translation,
  codePath?: Paths<K>,
): string => {
  if (codePath && codePath.includes("invalidFields")) {
    return `${langPack.shared.error.invalidFields}:${codePath.split(":")[1]}`;
  }

  const parts = codePath?.split(".") ?? [];
  let current: any = langPack;
  for (const part of parts) {
    if (current && part in current) {
      current = current[part];
    } else {
      return parts.length === 1 && codePath
        ? codePath
        : langPack.shared.error.noMessageSpecified;
    }
  }

  return typeof current === "string"
    ? current
    : langPack.shared.error.internalServerError;
};
