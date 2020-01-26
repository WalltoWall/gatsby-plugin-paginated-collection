import { CreatePagesArgs, CreateSchemaCustomizationArgs } from 'gatsby'

import { createPages, createSchemaCustomization } from '../src/gatsby-node'
import { ProvidedPluginOptions } from '../src/types'

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
    getState: jest.fn(),
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
  getNode: jest.fn(),
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

const mockQueryResult = {
  data: {
    allNode: {
      edges: Array(35)
        .fill(undefined)
        .map((_, i) => ({ foo: i })),
    },
  },
}

const pluginOptions: ProvidedPluginOptions = {
  name: 'name',
  query: 'query',
  normalizer: queryResult =>
    (queryResult as typeof mockQueryResult).data.allNode.edges.map(node => ({
      foo: node.foo,
    })),
  plugins: [],
}

beforeAll(() => {
  ;(mockGatsbyContext.graphql as jest.Mock).mockReturnValue(
    Promise.resolve(mockQueryResult),
  )
})

beforeEach(() => jest.clearAllMocks())

describe('sourceNodes', () => {
  test('creates nodes', async () => {
    await new Promise(res =>
      createPages!(mockGatsbyContext, pluginOptions, res),
    )

    expect(mockGatsbyContext.actions.createNode).toMatchSnapshot()
  })
})

describe('createSchemaCustomization', () => {
  test('creates types', async () => {
    await createSchemaCustomization!(
      mockGatsbyContext as CreateSchemaCustomizationArgs,
      pluginOptions,
    )

    expect(mockGatsbyContext.actions.createTypes).toMatchSnapshot()
  })
})
