import { PluginOptions as GatsbyPluginOptions, NodeInput } from 'gatsby'

export type ID = string

export enum NodeType {
  Collection = 'PaginatedCollection',
  Page = 'PaginatedCollectionPage',
}

export interface PageNodeInput extends NodeInput {
  collection: ID
  index: number
  nextPage: ID | undefined
  hasNextPage: boolean
  previousPage: ID | undefined
  hasPreviousPage: boolean
  nodeCount: number
  nodes: Node[]
  internal: NodeInput['internal'] & {
    type: NodeType.Page
  }
}

export interface CollectionNodeInput extends NodeInput {
  name: string
  pageSize: number
  firstPageSize: number
  lastPageSize: number
  nodeCount: number
  pageCount: number
  pages: ID[]
  internal: NodeInput['internal'] & {
    type: NodeType.Collection
  }
}

export interface GraphQLResult {
  errors?: any
  data?: unknown
}

export type Node = Record<string, unknown>

export type PluginOptions = Required<ProvidedPluginOptions>

export interface ProvidedPluginOptions extends GatsbyPluginOptions {
  name: string
  query: string
  pageSize?: number
  firstPageSize?: number
  normalizer: (input: GraphQLResult) => Node[]
}
