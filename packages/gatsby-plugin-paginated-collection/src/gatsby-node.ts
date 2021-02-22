import {
  GatsbyNode,
  CreateSchemaCustomizationArgs,
  PluginOptions as GatsbyPluginOptions,
} from 'gatsby'

import { fmtMsg } from './utils'
import { ProvidedPluginOptions, PluginOptions, Plugin } from './types'
import { types } from './gqlTypes'
import { createPaginatedCollectionNodes } from './helpers'

const DEFAULT_PLUGIN_OPTIONS = {
  pageSize: 10,
}

export const createPages: GatsbyNode['createPages'] = (
  gatsbyContext,
  providedPluginOptions: ProvidedPluginOptions,
  callback,
) => {
  const pluginOptions: PluginOptions = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...providedPluginOptions,
    firstPageSize:
      providedPluginOptions.firstPageSize ??
      providedPluginOptions.pageSize ??
      DEFAULT_PLUGIN_OPTIONS.pageSize,
  }

  const {
    graphql,
    getNode,
    reporter,
    actions,
    createNodeId,
    createContentDigest,
  } = gatsbyContext
  const { createNode } = actions
  const { name, query, pageSize, normalizer, plugins } = pluginOptions

  // If no options are provided, assume the user is only declaring the plugin
  // for programmatic use. Adding the plugin to `gatsby-node.js` is still
  // necessary to register the GraphQL types.
  if (
    Object.keys(providedPluginOptions).filter(key => key !== 'plugins').length <
    1
  ) {
    reporter.verbose(
      fmtMsg(
        `Plugin will only register GraphQL types since no options were provided.`,
      ),
    )
    return callback && callback(null)
  }

  const asyncFn = async () => {
    const queryResult = await graphql(query)

    if (queryResult.errors) {
      reporter.error(
        fmtMsg(
          `The provided GraphQL query for "${name}" contains errors. Pagination files will not be created.`,
        ),
        queryResult.errors[0],
      )
      return
    }

    const items = await Promise.resolve(normalizer(queryResult))

    if (!Array.isArray(items)) {
      reporter.error(
        fmtMsg(
          `The normalizer function for "${name}" did not return an array. Pagination files will not be created.`,
        ),
      )
      return
    }

    if (items.length < 1)
      reporter.warn(
        fmtMsg(
          `No items for "${name}" were returned. Pagination data will be created on an empty set.`,
        ),
      )

    const nodeInput = createPaginatedCollectionNodes({
      collection: items,
      name,
      pageSize,
      createNode,
      createNodeId,
      createContentDigest,
    })
    const node = getNode(nodeInput.id)

    for (const plugin of plugins) {
      const requiredPlugin: Plugin = require(plugin.resolve)
      await requiredPlugin?.onPostCreateNodes?.(
        node,
        plugin.pluginOptions,
        gatsbyContext,
        pluginOptions,
      )
    }
  }

  asyncFn().finally(() => callback && callback(null))
}

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async (
  gatsbyContext: CreateSchemaCustomizationArgs,
  _pluginOptions: GatsbyPluginOptions,
) => {
  const { actions } = gatsbyContext
  const { createTypes } = actions

  createTypes(types)
}
