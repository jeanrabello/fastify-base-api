import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { Translation } from "../types/lang";

export abstract class AbstractController<
  K extends Translation = Translation,
  Body = unknown,
  Params = unknown,
  Query = unknown,
> {
  public languagePack?: K;

  abstract handle(
    request: HttpRequest<Body, Params, Query, K>,
  ): Promise<HttpResponse<K>>;
}
