const gql = (query: TemplateStringsArray) => String(query).replace(`\n`, ` `)

export const types = gql`
  """
  A page in a paginated collection.
  """
  type PaginatedCollectionPage implements Node @dontInfer {
    "Name of the collection to which this page belongs."
    collectionName: String!

    "The next page."
    nextPage: ID @link

    "Whether or not a page exists after this page."
    hasNextPage: Boolean!

    "The previous page."
    previousPage: ID @link

    "Whether or not a page exists before this page."
    hasPreviousPage: Boolean!

    "Number of nodes in this page."
    nodeCount: Int!

    "Nodes in this page."
    nodes: [JSON!]!
  }

  """
  A paginated collection of nodes.
  """
  type PaginatedCollection implements Node @dontInfer {
    "Name of the collection."
    name: String!

    "Maximum number of nodes in each page."
    pageSize: Int!

    "Number of nodes in the first page."
    firstPageSize: Int!

    "Number of nodes in the last page."
    lastPageSize: Int!

    "Number of nodes in the collection."
    nodeCount: Int!

    "Number of pages in the collection."
    pageCount: Int!

    "Pages in the collection."
    pages: [ID!]! @link
  }
`
