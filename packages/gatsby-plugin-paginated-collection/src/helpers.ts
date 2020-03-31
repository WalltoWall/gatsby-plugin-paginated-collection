import { CreatePagesArgs } from 'gatsby'

import {
  NormalizedNode,
  NodeType,
  ID,
  PageNodeInput,
  CollectionNodeInput,
} from './types'
import { chunk } from './utils'

interface CreatePageNodeArgs {
  /** Nodes for the page. */
  chunk: NormalizedNode[]
  /** UUID for the page. Used as a pseudo cursor to identify the page. */
  id: ID
  /** Index of the page within the collection. */
  index: number
  /** Tuples Tuples of page UUIDs and nodes. */
  chunkTuples: [ID, NormalizedNode[]][]
  collectionId: ID
  /** Gatsby createPages context. */
  createNode: CreatePagesArgs['actions']['createNode']
  /** Options provided to the plugin by the user. */
  createContentDigest: CreatePagesArgs['createContentDigest']
}

/**
 * Creates a Gatsby Node representing a page in a collection of nodes.
 *
 * @param args Arguments to create the page node.
 *
 * @returns The created Gatsby Node.
 */
const createPageNode = (args: CreatePageNodeArgs): PageNodeInput => {
  const {
    chunk,
    id,
    index,
    chunkTuples,
    collectionId,
    createNode,
    createContentDigest,
  } = args

  const nextChunkTuple = chunkTuples[index + 1]
  const previousChunkTuple = chunkTuples[index - 1]

  const node: PageNodeInput = {
    id,
    collection: collectionId,
    index,
    nextPage: nextChunkTuple?.[0],
    hasNextPage: Boolean(nextChunkTuple),
    previousPage: previousChunkTuple?.[0],
    hasPreviousPage: Boolean(previousChunkTuple),
    nodeCount: chunk.length,
    nodes: chunk,
    internal: {
      type: NodeType.Page,
      contentDigest: createContentDigest(chunk),
    },
  }

  createNode(node, { name: 'gatsby-plugin-paginated-collection' })

  return node
}

interface CreatePaginatedCollectionNodesArgs {
  /** Array of items to paginate. */
  collection: NormalizedNode[]
  /** Name of the collection. */
  name: string
  /** The number of nodes to include in each page. */
  pageSize: number
  /** The action used to create nodes. */
  createNode: CreatePagesArgs['actions']['createNode']
  /** A helper function for creating node IDs. */
  createNodeId: CreatePagesArgs['createNodeId']
  /** A helper function for creating node content digests. */
  createContentDigest: CreatePagesArgs['createContentDigest']
}

/**
 * Creates a Gatsby Node and its child nodes representing a collection of pages
 * of nodes.
 *
 * @param args Arguments to create the collection nodes.
 *
 * @returns The created Gatsby Node.
 */
export const createPaginatedCollectionNodes = (
  args: CreatePaginatedCollectionNodesArgs,
) => {
  const {
    collection,
    name,
    pageSize,
    createNode,
    createNodeId,
    createContentDigest,
  } = args

  const id: string = createNodeId(`${NodeType.Collection} ${name}`)

  const chunks = chunk(pageSize, collection)
  const pageNodes = chunks
    .map<[ID, NormalizedNode[]]>((chunk, index) => [
      createNodeId(`${NodeType.Page} ${name} ${index}`),
      chunk,
    ])
    .map(([pageId, chunk], index, arr) =>
      createPageNode({
        chunk,
        id: pageId,
        index,
        chunkTuples: arr,
        collectionId: id,
        createNode,
        createContentDigest,
      }),
    )

  const nodeCount = pageNodes.reduce(
    (count, pageNode) => (count += pageNode.nodes.length),
    0,
  )

  const pageNodeIds = pageNodes.map(pageNode => pageNode.id)

  const node: CollectionNodeInput = {
    id,
    name,
    pageSize,
    firstPageSize: pageNodes[0].nodes.length,
    lastPageSize: pageNodes[pageNodes.length - 1].nodes.length,
    nodeCount,
    pageCount: pageNodes.length,
    pages: pageNodeIds,
    internal: {
      type: NodeType.Collection,
      contentDigest: createContentDigest(pageNodes),
    },
  }

  createNode(node, { name: 'gatsby-plugin-paginated-collection' })

  return node
}
