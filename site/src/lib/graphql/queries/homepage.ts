export const HOMEPAGE_QUERY = `
  query Homepage {
    entry(section: "homepage") {
      title
      uri
      ... on homepage_Entry {
        heading
        body
      }
    }
  }
`;
