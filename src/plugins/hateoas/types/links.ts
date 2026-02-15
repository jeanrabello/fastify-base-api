export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type StandardLinkRelation =
  | "self"
  | "next"
  | "prev"
  | "first"
  | "last"
  | "collection"
  | "item"
  | "create"
  | "edit"
  | "update"
  | "delete"
  | "related"
  | "search";

export interface HateoasLink {
  rel: StandardLinkRelation | string;
  href: string;
  method?: HttpMethod;
  title?: string;
  templated?: boolean;
}

export interface LinkDefinition {
  rel: StandardLinkRelation | string;
  method?: HttpMethod;
  path?: string;
  href?: string;
  title?: string;
}
