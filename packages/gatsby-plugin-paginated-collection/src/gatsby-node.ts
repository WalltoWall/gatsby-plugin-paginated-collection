import {
  GatsbyNode,
  CreateSchemaCustomizationArgs,
  PluginOptions as GatsbyPluginOptions,
} from 'gatsby'

import { chunk, fmtMsg, createCollectionNode } from './utils'
import { ProvidedPluginOptions, PluginOptions, Plugin } from './types'
import { types } from './gqlTypes'

export const DEFAULT_PLUGIN_OPTIONS = {
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

  const { graphql, getNode, reporter } = gatsbyContext
  const { name, query, pageSize, normalizer, plugins } = pluginOptions

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

    const chunks = chunk(pageSize, items)
    const nodeId = createCollectionNode(chunks, gatsbyContext, pluginOptions)
    const node = getNode(nodeId)

    for (const plugin of plugins) {
      const requiredPlugin: Plugin = require(plugin.resolve)
      await requiredPlugin?.onPostCreateNodes?.(
        node,
        plugin.options,
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
