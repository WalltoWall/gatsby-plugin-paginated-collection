import fs from 'fs'
import path from 'path'
import util from 'util'
import {
  Plugin,
  PageNode,
  CollectionNode,
} from 'gatsby-plugin-paginated-collection'

const DEFAULT_PLUGIN_OPTIONS = {
  path: 'paginated-collections',
  expand: [],
}

const writeFileP = util.promisify(fs.writeFile)

interface PluginOptions {
  path?: string
  expand?: ('nextPage' | 'previousPage' | 'collection')[]
}

type ExpandedPageNode = PageNode & {
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
  fs.mkdirSync(dir, { recursive: true })

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

      await writeFileP(path.join(dir, page.id + '.json'), JSON.stringify(page))
    }),
  )
}
