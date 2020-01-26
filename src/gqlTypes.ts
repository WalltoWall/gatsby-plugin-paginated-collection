const gql = (query: TemplateStringsArray) => String(query).replace(`\n`, ` `)

export const types = gql`
  type PaginatedCollectionPage implements Node @dontInfer {
    collectionName: String!
    page: ID!
    nextPage: ID! @link
    hasNextPage: Boolean!
    previousPage: ID! @link
    hasPreviousPage: Boolean!
    nodeCount: Int!
    nodes: [JSON!]!
  }

  type PaginatedCollection implements Node @dontInfer {
    name: String!
    totalPages: Int!
    pageSize: Int!
    firstPageSize: Int!
    lastPageSize: Int!
    totalNodeCount: Int!
    pages: [ID!]! @link
  }
`
