export type PageProps<
  /**
   * Query parameters, e.g. /search-page/?query=foo
   */
  SearchParams = {},
  /**
   * Page slugs, e.g. /item/[id]/
   */
  Params = {},
> = {
  searchParams?: SearchParams
  params?: Params
}
