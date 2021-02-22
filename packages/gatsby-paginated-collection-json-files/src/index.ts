import path from 'path'
import {
  Plugin,
  PageNode,
  CollectionNode,
} from 'gatsby-plugin-paginated-collection'

import {
  writePaginatedCollectionJSONFiles,
  WritePaginatedCollectionJSONFilesArgs,
} from './helpers'

export { writePaginatedCollectionJSONFiles } from './helpers'

const DEFAULT_PLUGIN_OPTIONS = {
  path: 'paginated-collections',
}

export type ExpandedPageNode = PageNode & {
  nextPage?: Pick<
    PageNode,
    | 'id'
    | 'collection'
    | 'index'
    | 'nextPage'
    | 'hasNextPage'
    | 'previousPage'
    | 'hasPreviousPage'
    | 'nodeCount'
  >
  previousPage?: Pick<
    PageNode,
    | 'id'
    | 'collection'
    | 'index'
    | 'nextPage'
    | 'hasNextPage'
    | 'previousPage'
    | 'hasPreviousPage'
    | 'nodeCount'
  >
  collection: Pick<
    CollectionNode,
    | 'id'
    | 'name'
    | 'pageSize'
    | 'firstPageSize'
    | 'lastPageSize'
    | 'nodeCount'
    | 'pageCount'
    | 'pages'
  >
}

export interface PluginOptions {
  path?: string
  expand?: WritePaginatedCollectionJSONFilesArgs['expand']
  filename?: WritePaginatedCollectionJSONFilesArgs['filename']
}

export const onPostCreateNodes: Plugin['onPostCreateNodes'] = async (
  node,
  rawPluginOptions: PluginOptions,
  gatsbyContext,
  _rootPluginOptions,
) => {
  const { getNode, store } = gatsbyContext
  const { program } = store.getState()
  const pluginOptions: PluginOptions &
    Required<Pick<PluginOptions, keyof typeof DEFAULT_PLUGIN_OPTIONS>> = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...rawPluginOptions,
  }

  const dir = path.resolve(program.directory, 'public', pluginOptions.path)

  await writePaginatedCollectionJSONFiles({
    node,
    directory: dir,
    expand: pluginOptions.expand,
    filename: pluginOptions.filename,
    getNode,
  })
}
