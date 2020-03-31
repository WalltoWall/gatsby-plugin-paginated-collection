import { createPaginatedCollectionNodes } from '../src'

const mockCollection = Array(35)
  .fill(undefined)
  .map((_, i) => ({ foo: i }))
const mockCreateNode = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('createPaginatedCollectionNodes', () => {
  test('creates nodes', () => {
    const node = createPaginatedCollectionNodes({
      collection: mockCollection,
      name: 'name',
      pageSize: 10,
      createNode: mockCreateNode,
      createNodeId: jest.fn().mockReturnValue('createNodeId'),
      createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
    })

    expect(node).toMatchSnapshot()
    expect(mockCreateNode).toMatchSnapshot()
  })
})
