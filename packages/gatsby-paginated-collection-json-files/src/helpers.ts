import path from 'path'
import { promises as fs } from 'fs'
import { CollectionNode, PageNode } from 'gatsby-plugin-paginated-collection'
import { CreatePagesArgs } from 'gatsby'

export interface WritePaginatedCollectionJSONFilesArgs {
  node: CollectionNode
  directory: string
  expand?: ('nextPage' | 'previousPage' | 'collection')[]
  filename?: 'id' | 'index' | ((node: PageNode) => string)
  getNode: CreatePagesArgs['getNode']
}

export const writePaginatedCollectionJSONFiles = async (
  args: WritePaginatedCollectionJSONFilesArgs,
): Promise<void> => {
  const { node, directory, expand = [], filename = 'id', getNode } = args

  await fs.mkdir(directory, { recursive: true })

  await Promise.all(
    node.pages.map(async (pageId) => {
      const page: PageNode = getNode(pageId)
      const trimmedPage = {
        ...page,
        nextPage: expand.includes('nextPage')
          ? {
              ...getNode(page.nextPage),
              nodes: undefined,
              internal: undefined,
              children: undefined,
              parent: undefined,
            }
          : page.nextPage,
        previousPage: expand.includes('previousPage')
          ? {
              ...getNode(page.previousPage),
              nodes: undefined,
              internal: undefined,
              children: undefined,
              parent: undefined,
            }
          : page.previousPage,
        collection: expand.includes('collection')
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
        typeof filename === 'function' ? String(filename(page)) : page[filename]

      await fs.writeFile(
        path.join(directory, fileBasename + '.json'),
        JSON.stringify(trimmedPage),
      )
    }),
  )
}
