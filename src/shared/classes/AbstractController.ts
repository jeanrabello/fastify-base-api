import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { Translation } from "../types/lang";

export abstract class AbstractController<T, K extends Translation> {
  public languagePack?: K;

  abstract handle(request: HttpRequest<T, K>): Promise<HttpResponse<K>>;
}
