import { Translation } from "./lang";
import { Paths } from "./paths";

export interface BaseRequest<K> {
  languagePack: K;
  lang: string;
}

export interface HttpRequest<
  Body = undefined,
  Params = undefined,
  Query = undefined,
  K = any,
> extends BaseRequest<K> {
  body?: Body;
  params?: Params;
  query?: Query;
}

export interface HttpResponse<K extends Translation = Translation, T = any> {
  statusCode: number;
  message?: Paths<K>;
  data?: T;
}
