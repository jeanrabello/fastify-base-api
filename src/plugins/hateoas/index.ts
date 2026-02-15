import hateoasPlugin from "./plugin";

export { hateoasPlugin };
export * from "./types";
export {
  generateLink,
  generateLinks,
  generateSelfLink,
  generateItemLinks,
} from "./generators/linkGenerator";
export { generatePaginationLinks } from "./generators/paginationLinks";
export {
  buildUrl,
  buildUrlWithQuery,
  getOriginFromUrl,
} from "./utils/urlBuilder";
export {
  createExtractors,
  defaultItemsExtractor,
  defaultPaginationExtractor,
  createItemsExtractorFromPath,
  createPaginationExtractorFromPaths,
} from "./utils/extractors";
export type {
  Extractors,
  ItemsExtractor,
  PaginationExtractor,
  PathsConfig,
} from "./utils/extractors";

export default hateoasPlugin;
