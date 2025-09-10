import { AuthenticatedUser } from "./fastify";
import { Translation } from "./lang";
import { Paths } from "./paths";

export interface BaseRequest<K> {
  languagePack: K;
  lang: string;
  user?: AuthenticatedUser;
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
  headers: {
    authorization?: string;
    "accept-language"?: string;
  };
}

export interface HttpResponse<K extends Translation = Translation, T = any> {
  statusCode: number;
  message?: Paths<K>;
  data?: T;
}
