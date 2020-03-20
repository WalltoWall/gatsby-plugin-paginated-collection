import fs from 'fs'
import path from 'path'
import util from 'util'
import { Plugin, PageNode } from 'gatsby-plugin-paginated-collection'

const DEFAULT_PATH = 'paginated-collections'

const writeFileP = util.promisify(fs.writeFile)

interface PluginOptions {
  path: string
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
      const page: PageNode = getNode(pageId)
      await writeFileP(path.join(dir, page.id + '.json'), JSON.stringify(page))
    }),
  )
}
