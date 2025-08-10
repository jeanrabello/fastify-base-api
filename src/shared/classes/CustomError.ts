import { Translation } from "@src/shared/types/lang";
import { Paths } from "@src/shared/types/paths";

export default class CustomError<T extends Translation> extends Error {
  public statusCode: number;
  public translationPath: Paths<T>;

  constructor(translationPath: Paths<T>, statusCode?: number) {
    super(translationPath as string);
    this.statusCode = statusCode || 500;
    this.translationPath = translationPath;
    this.name = "CustomError";
  }
}
