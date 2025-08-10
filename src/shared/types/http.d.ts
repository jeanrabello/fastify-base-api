import { Translation } from "./lang";
import { Paths } from "./paths";

export interface BaseRequest<K> {
  languagePack: K;
  lang: string;
}

export interface HttpRequest<T, K> extends BaseRequest<K> {
  body?: T;
  params?: any;
  query?: any;
}

export interface HttpResponse<K extends Translation = Translation, T = any> {
  statusCode: number;
  message?: Paths<K>;
  data?: T;
}
