import { PluginOptions as GatsbyPluginOptions, NodeInput } from 'gatsby'

export type ID = string

export enum NodeType {
  Collection = 'PaginatedCollection',
  Page = 'PaginatedCollectionPage',
}

export interface PageNodeInput extends NodeInput {
  collectionName: string
  index: number
  page: ID
  nextPage: ID
  hasNextPage: boolean
  previousPage: ID
  hasPreviousPage: boolean
  nodeCount: number
  nodes: Node[]
  internal: NodeInput['internal'] & {
    type: NodeType.Page
  }
}

export interface CollectionNodeInput extends NodeInput {
  name: string
  totalPages: number
  pageSize: number
  firstPageSize: number
  lastPageSize: number
  totalNodeCount: number
  pages: ID[]
  internal: NodeInput['internal'] & {
    type: NodeType.Collection
  }
}

export interface GraphQLResult {
  errors?: any
  data?: unknown
}

export interface Node {
  [key: string]: unknown
}

export interface PluginOptions extends ProvidedPluginOptions {
  pageSize: number
  firstPageSize: number
}

export interface ProvidedPluginOptions extends GatsbyPluginOptions {
  name: string
  query: string
  pageSize?: number
  firstPageSize?: number
  normalizer: (input: GraphQLResult) => Node[]
}
