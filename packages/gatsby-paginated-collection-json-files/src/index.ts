import fs from 'fs'
import path from 'path'
import util from 'util'
import {
  Plugin,
  NodeType,
  CollectionNode,
  PageNode,
} from 'gatsby-plugin-paginated-collection'

const writeFileP = util.promisify(fs.writeFile)

export const onPostCreateNodes: Plugin['onPostCreateNodes'] = async (
  gatsbyContext,
  _rootPluginOptions,
  _pluginOptions,
) => {
  const { getNode, getNodesByType, store } = gatsbyContext
  const program = store.getState()

  const collections: CollectionNode[] = await getNodesByType(
    NodeType.Collection,
  )
  const pages = collections.flatMap(coll => coll.pages)

  const dir = path.resolve(program.directory, 'public', 'paginated-collection')
  fs.mkdirSync(dir, { recursive: true })

  await Promise.all(
    pages.map(async pageId => {
      const page: PageNode = getNode(pageId)
      await writeFileP(path.join(dir, page.id + '.json'), JSON.stringify(page))
    }),
  )
}
