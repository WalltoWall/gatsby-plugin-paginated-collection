import fs from 'fs'
import path from 'path'
import util from 'util'
import {
  Plugin,
  PageNode,
  CollectionNode,
} from 'gatsby-plugin-paginated-collection'

const DEFAULT_PATH = 'paginated-collections'

const writeFileP = util.promisify(fs.writeFile)

interface PluginOptions {
  path: string
  expand: ('nextPage' | 'previousPage' | 'collection')[]
}

type ExpandedPageNode = PageNode & {
  nextPage?: PageNode
  previousPage?: PageNode
  collection: CollectionNode
}

export const onPostCreateNodes: Plugin['onPostCreateNodes'] = async (
  node,
  pluginOptions: PluginOptions,
  gatsbyContext,
  _rootPluginOptions,
) => {
  const { getNode, store } = gatsbyContext
  const program = store.getState()

  const dir = path.resolve(
    program.directory,
    'public',
    pluginOptions.path ?? DEFAULT_PATH,
  )
  fs.mkdirSync(dir, { recursive: true })

  await Promise.all(
    node.pages.map(async pageId => {
      const page: ExpandedPageNode = getNode(pageId)

      if (pluginOptions.expand.includes('nextPage')) {
        page.nextPage = getNode(page.nextPage)
        if (page.nextPage) delete page.nextPage.nodes
      }

      if (pluginOptions.expand.includes('previousPage')) {
        page.previousPage = getNode(page.previousPage)
        if (page.previousPage) delete page.previousPage.nodes
      }

      if (pluginOptions.expand.includes('collection')) {
        page.collection = getNode(page.collection)
        if (page.collection) delete page.collection.nodes
      }

      await writeFileP(path.join(dir, page.id + '.json'), JSON.stringify(page))
    }),
  )
}
