import {
  PluginOptions as GatsbyPluginOptions,
  NodeInput,
  CreatePagesArgs,
  Node,
} from 'gatsby'

export type ID = string

export enum NodeType {
  Collection = 'PaginatedCollection',
  Page = 'PaginatedCollectionPage',
}

export type NormalizedNode = Record<string, unknown>

export type PageNode = Node & PageNodeInput

export interface PageNodeInput extends NodeInput {
  collection: ID
  index: number
  nextPage: ID | undefined
  hasNextPage: boolean
  previousPage: ID | undefined
  hasPreviousPage: boolean
  nodeCount: number
  nodes: NormalizedNode[]
  internal: NodeInput['internal'] & {
    type: NodeType.Page
  }
}

export type CollectionNode = Node & CollectionNodeInput

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

export type PluginOptions = Required<ProvidedPluginOptions>

export interface PluginConfig {
  resolve: string
  options?: Record<string, unknown>
}

export interface ProvidedPluginOptions extends GatsbyPluginOptions {
  name: string
  query: string
  pageSize?: number
  firstPageSize?: number
  normalizer: (input: GraphQLResult) => NormalizedNode[]
  plugins: PluginConfig[]
}

export interface Plugin {
  onPostCreateNodes?(
    gatsbyContext: CreatePagesArgs & { traceId: 'initial-createPages' },
    rootPluginOptions: PluginOptions,
    pluginOptions: unknown,
  ): void | Promise<void>
}
