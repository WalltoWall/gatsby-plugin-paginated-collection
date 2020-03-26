import path from 'path'
import fs from 'fs'
import mockFs from 'mock-fs'
import { CreatePagesArgs } from 'gatsby'

import { onPostCreateNodes, PluginOptions } from '../src'
import {
  CollectionNode,
  NodeType,
} from 'gatsby-plugin-paginated-collection/src/types'

const MOCK_PROGRAM_DIRECTORY_PATH = '/__PROGRAM_DIRECTORY__/'

const rootPluginOptions = {
  name: 'name',
  query: 'query',
  pageSize: 1,
  firstPageSize: 1,
  normalizer: () => [],
  plugins: [{ resolve: 'gatsby-paginated-collection-json-files' }],
}

const nodes = [
  { id: 'node1', foo: 'bar' },
  { id: 'node2', foo: 'baz' },
]

const pages = [
  {
    id: 'page1',
    index: 0,
    nextPage: 'page2',
    nodes: [nodes[0]],
    collection: 'collection1',
    internal: {},
    children: [],
    parent: null,
  },
  {
    id: 'page2',
    index: 1,
    previousPage: 'page1',
    nodes: [nodes[1]],
    collection: 'collection1',
    internal: {},
    children: [],
    parent: null,
  },
]

const collections = [
  {
    id: 'collection1',
    pages: pages.map((p) => p.id),
    internal: {},
    children: [],
    parent: null,
  },
]

const mockCollectionNode: CollectionNode = {
  id: 'id',
  name: 'name',
  pageSize: rootPluginOptions.pageSize,
  firstPageSize: rootPluginOptions.firstPageSize,
  lastPageSize: pages[pages.length - 1].nodes.length,
  nodeCount: nodes.length,
  pageCount: collections[0].pages.length,
  pages: pages.map((p) => p.id),
  parent: 'parent',
  children: [],
  internal: {
    type: NodeType.Collection,
    contentDigest: 'contentDigest',
    owner: 'gatsby-plugin-paginated-collection',
  },
}

const mockActions = {
  deletePage: jest.fn(),
  createPage: jest.fn(),
  deleteNode: jest.fn(),
  deleteNodes: jest.fn(),
  createNode: jest.fn(),
  touchNode: jest.fn(),
  createNodeField: jest.fn(),
  createParentChildLink: jest.fn(),
  setWebpackConfig: jest.fn(),
  replaceWebpackConfig: jest.fn(),
  setBabelOptions: jest.fn(),
  setBabelPlugin: jest.fn(),
  setBabelPreset: jest.fn(),
  createJob: jest.fn(),
  createJobV2: jest.fn(),
  setJob: jest.fn(),
  endJob: jest.fn(),
  setPluginStatus: jest.fn(),
  createRedirect: jest.fn(),
  addThirdPartySchema: jest.fn(),
  createTypes: jest.fn(),
  createFieldExtension: jest.fn(),
}

const mockGatsbyContext: CreatePagesArgs & {
  traceId: 'initial-createPages'
} = {
  pathPrefix: 'pathPrefix',
  boundActionCreators: mockActions,
  actions: mockActions,
  loadNodeContent: jest.fn(),
  store: {
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    getState: jest
      .fn()
      .mockReturnValue({ program: { directory: MOCK_PROGRAM_DIRECTORY_PATH } }),
    replaceReducer: jest.fn(),
  },
  emitter: {
    addListener: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeListener: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    emit: jest.fn(),
    eventNames: jest.fn(),
    listenerCount: jest.fn(),
  },
  getNodes: jest.fn(),
  getNode: jest
    .fn()
    .mockImplementation((id: string) =>
      [...collections, ...pages, ...nodes].find((p) => p.id === id),
    ),
  getNodesByType: jest.fn(),
  hasNodeChanged: jest.fn(),
  reporter: {
    stripIndent: jest.fn(),
    format: jest.fn(),
    setVerbose: jest.fn(),
    setNoColor: jest.fn(),
    panic: jest.fn(),
    panicOnBuild: jest.fn(),
    error: jest.fn(),
    uptime: jest.fn(),
    success: jest.fn(),
    verbose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    activityTimer: jest.fn(),
    createProgress: jest.fn(),
  },
  getNodeAndSavePathDependency: jest.fn(),
  cache: {
    getAndPassUp: jest.fn(),
    wrap: jest.fn(),
    set: jest.fn(),
    mset: jest.fn(),
    get: jest.fn(),
    mget: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  },
  createNodeId: jest.fn().mockReturnValue('createNodeId'),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
  tracing: {
    tracer: {},
    parentSpan: {},
    startSpan: jest.fn(),
  },
  schema: {
    buildObjectType: jest.fn(),
    buildUnionType: jest.fn(),
    buildInterfaceType: jest.fn(),
    buildInputObjectType: jest.fn(),
    buildEnumType: jest.fn(),
    buildScalarType: jest.fn(),
  },
  traceId: 'initial-createPages',
  waitForCascadingActions: false,
  parentSpan: {},
  graphql: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFs({ MOCK_PROGRAM_DIRECTORY_PATH: {} })
})
afterEach(() => mockFs.restore())

describe('onPostCreateNodes', () => {
  test('creates files', async () => {
    await onPostCreateNodes!(
      mockCollectionNode,
      {},
      mockGatsbyContext,
      rootPluginOptions,
    )

    const dir = path.join(
      MOCK_PROGRAM_DIRECTORY_PATH,
      'public',
      'paginated-collections',
    )
    const filenames = fs.readdirSync(dir)
    const files = filenames.map((filename) =>
      fs.readFileSync(path.join(dir, filename), 'utf-8'),
    )
    mockFs.restore()

    expect(filenames).toEqual(Object.values(pages).map((p) => `${p.id}.json`))
    expect(files).toMatchSnapshot()
  })

  test('writes to configured directory', async () => {
    await onPostCreateNodes!(
      mockCollectionNode,
      { path: 'new-path' },
      mockGatsbyContext,
      rootPluginOptions,
    )

    const dir = path.join(MOCK_PROGRAM_DIRECTORY_PATH, 'public', 'new-path')
    const filenames = fs.readdirSync(dir)
    expect(filenames).toEqual(Object.values(pages).map((p) => `${p.id}.json`))
  })

  describe('expands fields', () => {
    test('nextPage', async () => {
      await onPostCreateNodes!(
        mockCollectionNode,
        { expand: ['nextPage'] },
        mockGatsbyContext,
        rootPluginOptions,
      )

      const dir = path.join(
        MOCK_PROGRAM_DIRECTORY_PATH,
        'public',
        'paginated-collections',
      )
      const filenames = fs.readdirSync(dir)
      const file = JSON.parse(
        fs.readFileSync(path.join(dir, filenames[0]), 'utf-8'),
      )
      expect(file.nextPage).toEqual({
        ...pages[1],
        nodes: undefined,
        internal: undefined,
        parent: undefined,
        children: undefined,
      })
    })

    test('previousPage', async () => {
      await onPostCreateNodes!(
        mockCollectionNode,
        { expand: ['previousPage'] },
        mockGatsbyContext,
        rootPluginOptions,
      )

      const dir = path.join(
        MOCK_PROGRAM_DIRECTORY_PATH,
        'public',
        'paginated-collections',
      )
      const filenames = fs.readdirSync(dir)
      const file = JSON.parse(
        fs.readFileSync(path.join(dir, filenames[1]), 'utf-8'),
      )
      expect(file.previousPage).toEqual({
        ...pages[0],
        nodes: undefined,
        internal: undefined,
        parent: undefined,
        children: undefined,
      })
    })

    test('collection', async () => {
      await onPostCreateNodes!(
        mockCollectionNode,
        { expand: ['collection'] },
        mockGatsbyContext,
        rootPluginOptions,
      )

      const dir = path.join(
        MOCK_PROGRAM_DIRECTORY_PATH,
        'public',
        'paginated-collections',
      )
      const filenames = fs.readdirSync(dir)
      const file = JSON.parse(
        fs.readFileSync(path.join(dir, filenames[0]), 'utf-8'),
      )
      expect(file.collection).toEqual({
        ...collections[0],
        internal: undefined,
        parent: undefined,
        children: undefined,
      })
    })
  })

  describe('uses correct filename', () => {
    test('id by default', async () => {
      await onPostCreateNodes!(
        mockCollectionNode,
        {},
        mockGatsbyContext,
        rootPluginOptions,
      )

      const dir = path.join(
        MOCK_PROGRAM_DIRECTORY_PATH,
        'public',
        'paginated-collections',
      )
      const filenames = fs.readdirSync(dir)
      mockFs.restore()

      expect(filenames).toEqual(Object.values(pages).map((p) => `${p.id}.json`))
    })

    test('determined by property name', async () => {
      await onPostCreateNodes!(
        mockCollectionNode,
        { filename: 'index' },
        mockGatsbyContext,
        rootPluginOptions,
      )

      const dir = path.join(
        MOCK_PROGRAM_DIRECTORY_PATH,
        'public',
        'paginated-collections',
      )
      const filenames = fs.readdirSync(dir)
      mockFs.restore()

      expect(filenames).toEqual(
        Object.values(pages).map((p) => `${p.index}.json`),
      )
    })

    test('determined by function', async () => {
      await onPostCreateNodes!(
        mockCollectionNode,
        { filename: (node) => node.index.toString() } as PluginOptions,
        mockGatsbyContext,
        rootPluginOptions,
      )

      const dir = path.join(
        MOCK_PROGRAM_DIRECTORY_PATH,
        'public',
        'paginated-collections',
      )
      const filenames = fs.readdirSync(dir)
      mockFs.restore()

      expect(filenames).toEqual(
        Object.values(pages).map((p) => `${p.index}.json`),
      )
    })
  })
})
