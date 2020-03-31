import { promises as fs } from 'fs'
import path from 'path'
import {
  Plugin,
  PageNode,
  CollectionNode,
} from 'gatsby-plugin-paginated-collection'

const DEFAULT_PLUGIN_OPTIONS: Required<PluginOptions> = {
  path: 'paginated-collections',
  expand: [],
  filename: 'id',
}

export interface PluginOptions {
  path?: string
  expand?: ('nextPage' | 'previousPage' | 'collection')[]
  filename?: 'id' | 'index' | ((node: PageNode) => string)
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

export const onPostCreateNodes: Plugin['onPostCreateNodes'] = async (
  node,
  rawPluginOptions: PluginOptions,
  gatsbyContext,
  _rootPluginOptions,
) => {
  const { getNode, store } = gatsbyContext
  const { program } = store.getState()
  const pluginOptions: Required<PluginOptions> = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...rawPluginOptions,
  }

  const dir = path.resolve(program.directory, 'public', pluginOptions.path)
  await fs.mkdir(dir, { recursive: true })

  await Promise.all(
    node.pages.map(async (pageId) => {
      const page: PageNode = getNode(pageId)
      const trimmedPage = {
        ...page,
        nextPage: pluginOptions.expand.includes('nextPage')
          ? {
              ...getNode(page.nextPage),
              nodes: undefined,
              internal: undefined,
              children: undefined,
              parent: undefined,
            }
          : page.nextPage,
        previousPage: pluginOptions.expand.includes('previousPage')
          ? {
              ...getNode(page.previousPage),
              nodes: undefined,
              internal: undefined,
              children: undefined,
              parent: undefined,
            }
          : page.previousPage,
        collection: pluginOptions.expand.includes('collection')
          ? {
              ...getNode(page.collection),
              internal: undefined,
              children: undefined,
              parent: undefined,
            }
          : page.collection,
        internal: undefined,
        children: undefined,
        parent: undefined,
      }

      const fileBasename =
        typeof pluginOptions.filename === 'function'
          ? String(pluginOptions.filename(page))
          : page[pluginOptions.filename]

      await fs.writeFile(
        path.join(dir, fileBasename + '.json'),
        JSON.stringify(trimmedPage),
      )
    }),
  )
}
