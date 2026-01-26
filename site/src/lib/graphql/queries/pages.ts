export const PAGE_BY_URI_QUERY = `
  query PageByUri($uri: [String]) {
    entry(section: "pages", uri: $uri) {
      title
      uri
      ... on page_Entry {
        heading
        body {
          html
        }
      }
    }
  }
`;
