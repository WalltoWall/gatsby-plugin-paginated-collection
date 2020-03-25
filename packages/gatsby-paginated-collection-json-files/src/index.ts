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
  nextPage?: PageNode & { nodes: undefined }
  previousPage?: PageNode & { nodes: undefined }
  collection: CollectionNode
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
    node.pages.map(async pageId => {
      const page: ExpandedPageNode = getNode(pageId)

      if (pluginOptions.expand.includes('nextPage')) {
        const expansion = getNode(page.nextPage)
        if (expansion) page.nextPage = { ...expansion, nodes: undefined }
      }

      if (pluginOptions.expand.includes('previousPage')) {
        const expansion = getNode(page.previousPage)
        if (expansion) page.previousPage = { ...expansion, nodes: undefined }
      }

      if (pluginOptions.expand.includes('collection'))
        page.collection = getNode(page.collection)

      const fileBasename =
        typeof pluginOptions.filename === 'function'
          ? String(pluginOptions.filename(page))
          : page[pluginOptions.filename]

      await fs.writeFile(
        path.join(dir, fileBasename + '.json'),
        JSON.stringify(page),
      )
    }),
  )
}
