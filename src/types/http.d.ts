import { Translation } from "./lang";

export interface BaseRequest {
  languagePack: Translation;
  lang: string;
}

export interface HttpRequest<T> extends BaseRequest {
  body?: T;
  params?: any;
  query?: any;
}

export interface HttpResponse extends BaseResponse {
  statusCode: number;
  message?: string;
  data?: any;
}
