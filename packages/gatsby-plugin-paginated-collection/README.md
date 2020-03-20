# gatsby-plugin-paginated-collection

Gatsby plugin which paginates a collection of data from your sources.

This plugin tries to be unopinionated in how you use the paginated data. For
example, you could use the pagination information to:

- Create a page within your site for each page of data.
- Create true client-side "Load More" functionality by saving JSON files for
  each page of data.
- Create next/previous buttons for articles on your site.

You can use this plugin multiple times per site for different collections of
data. For example, you could paginate blog posts and products individually by
using the plugin twice.

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Plugins](#plugins)
- [How to use](#how-to-use)
- [How to query](#how-to-query)
  - [Query Collections](#query-collections)
  - [Query Pages](#query-pages)
- [Examples](#examples)

## Features

- Groups data into pages of any size.
- Provides helpful pagination information like `hasNextPage` and `totalPages`.
- Collects your data to paginate using a GraphQL query. This could include data
  from multiple sources.

## Install

```sh
npm install --save gatsby-source-paginated-collection
```

## Plugins

Add functionality to your collections via plugins.

- [`gatsby-paginated-collection-json-files`](../gatsby-paginated-collection-json-files/README.md):
  Writes pages of a collection to JSON files.

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  /**
   * You can have multiple instances of this plugin to create separate
   * collections of data using different names.
   */
  {
    resolve: 'gatsby-source-paginated-collection',
    options: {
      /**
       * A name to identify your collection. If you have multiple instances of
       * this plugin, this will allow you to identify each collection. This is
       * required.
       */
      name: 'blogPosts',

      /**
       * The number of nodes to include in each page. Default: 10.
       */
      pageSize: 10,

      /**
       * The number of nodes to include in the first page. This is optional. If
       * no value is given, the first page will be the same size as all other
       * pages.
       */
      firstPageSize: 16,

      /**
       * GraphQL query used to fetch all data for the collection. All data
       * returned from the query will be available in the normalizer function
       * to shape your data. This is required.
       */
      query: `
        {
          allMarkdownRemark {
            nodes {
              id
              frontmatter {
                path
                title
                excerpt
              }
            }
          }
        }
      `,

      /**
       * Function used to map the result of the GraphQL query to nodes in the
       * collection. This should return an array of items to paginate. This is
       * required.
       */
      normalizer: ({ data }) =>
        data.allMarkdownRemark.nodes.map(node => ({
          id: node.id,
          path: node.frontmatter.path,
          title: node.frontmatter.title,
          excerpt: node.frontmatter.excerpt,
        })),
    },
  },
]
```

## How to query

You can query your collections using GraphQL like the following:

**Note**: Learn to use the GraphiQL tool and Ctrl+Spacebar at
<http://localhost:8000/___graphql> to discover the types and properties of your
GraphQL model.

```graphql
{
  paginatedCollection {
    pages {
      id
      nodes
    }
  }
}
```

If you have multiple instances of this plugin, you can use the name argument to
query a specific collection.

```graphql
{
  paginatedCollection(name: { eq: "blogPosts" }) {
    pages {
      id
      nodes
    }
  }
}
```

### Query Collections

Collections contain pages of nodes along with information about the pages.

Descriptions for each field are viewable in GraphiQL.

Querying a collection is most useful when needing to create pages or files for
each page in the collection. In your site's `gatsby-node.js`, for example, you
could create a page for each page in the collection, passing the page ID as
context to the page's template.

```graphql
{
  paginatedCollection {
    name
    pageSize
    firstPageSize
    lastPageSize
    nodeCount
    pageCount
    pages {
      id
    }
  }
}
```

### Query Pages

Pages contain grouped nodes along with information about the page and adjacent
pages.

Descriptions for each field are viewable in GraphiQL.

Note that `nodes` is a JSON field that automatically returns all data for each
node without needing to query fields individually.

Querying for a page is most useful when needing to display the nodes in the
page. In your page's GraphQL query, for example, you could query for the
specific collection page for that page.

```graphql
{
  paginatedCollectionPage {
    collectionName
    index
    nextPage {
      index
    }
    hasNextPage
    previousPage {
      index
    }
    hasPreviousPage
    nodeCount
    nodes
  }
}
```

## Examples

<details>
  <summary><strong>Example 1</strong>: Paginated list of blog posts</summary>
  <br/>

This example creates pages of blog posts with each page containing a list of up
to 10 posts. We will use a template to generate these pages using page context
to pass the pagination information.

1. **Add the plugin to `gatsby-config.js`**

   This example assumes you are creating pages for each blog post at
   `/blog/${slug}`.

   ```javascript
   // gatsby-config.js

   module.exports = {
     plugins: [
       {
         resolve: 'gatsby-plugin-paginated-collection',
         options: {
           name: 'blog-posts',
           query: `
             {
               allMarkdownRemark {
                 nodes {
                   id
                   frontmatter {
                     path
                     title
                     excerpt
                   }
                 }
               }
             }
           `,
           normalizer: ({ data }) =>
             data.allMarkdownRemark.nodes.map(node => ({
               id: node.id,
               url: `/blog/${node.frontmatter.path}`,
               title: node.frontmatter.title,
             })),
         },
       },
     ],
   }
   ```

1. **Create a blog posts template**

   This template will be used for each page of blog posts.

   ```javascript
   // src/templates/blog.js

   import React from 'react'
   import { Link, graphql } from 'gatsby'

   const BlogPage = ({ data }) => {
     const page = data.paginatedCollectionPage
     const blogPosts = page.nodes

     return (
       <div className="blog-posts">
         <ul className="blog-posts__list">
           {blogPosts.map(blogPost => (
             <li key={blogPost.id} className="blog-posts__post">
               <Link to={blogPost.url}>{blogPost.title}</Link>
             </li>
           ))}
         </ul>
         {page.hasPreviousPage && (
           <Link to={`/blog/${page.previousPage.id}`}>Previous page</Link>
         )}
         <span>
           Page {page.index + 1} of {page.collection.totalPages}
         </span>
         {page.hasNextPage && (
           <Link to={`/blog/${page.nextPage.id}`}>Next page</Link>
         )}
       </div>
     )
   }

   export default BlogPage

   export const query = graphql`
     query($id: String!) {
       paginatedCollectionPage(id: { eq: $id }) {
         nodes
         index
         hasNextPage
         nextPage {
           id
         }
         hasPreviousPage
         previousPage {
           id
         }
         collection {
           totalPages
         }
       }
     }
   `
   ```

1. **Create a page for each paginated group of blog posts**

   We query all the pages in the collection and create pages using the template
   above. We also create an extra page for the first group of blog posts with a
   nice URL.

   ```javascript
   // gatsby-node.js

   exports.createPages = async gatsbyContext => {
     const { actions, graphql } = gatsbyContext
     const { createPage } = actions

     const blogTemplate = path.resolve('src/templates/blog.js')

     const { data } = await graphql(`
       {
         paginatedCollection(name: { eq: "blog-posts" }) {
           pages {
             id
           }
         }
       }
     `)
     const pages = data.paginatedCollection.pages

     for (const page of pages)
       createPage({
         path: `/blog/${page.id}`,
         component: blogTemplate,
         context: { id: page.id },
       })

     // Create the first page with a nice URL
     createPage({
       path: '/blog/',
       component: blogTemplate,
       context: { id: pages[0] },
     })
   }
   ```

</details>

<details>
  <summary><strong>Example 2</strong>: Load more blog posts</summary>
  <br/>

This example creates JSON files in the site's `public` directory containing the
pagination data. Files in this directory are added to the site as-is, allowing
us to fetch the JSON client-side upon clicking a button.

On the page where we display the blog posts, we query the first page of posts as
part of the page's static query. These posts will be included in the static
build of the site.

The "Load More" button has a click handler that fetches the next page's JSON,
appends the posts from that page to some state, and updates the state holding
the latest page. Since we have the latest page in state, we can see if there are
more pages to fetch or if we are on the last page.

1. **Add the plugin to `gatsby-config.js`**

   This example assumes you are creating pages for each blog post at
   `/blog/${slug}`.

   ```javascript
   // gatsby-config.js

   module.exports = {
     plugins: [
       {
         resolve: 'gatsby-plugin-paginated-collection',
         options: {
           name: 'blog-posts',
           query: `
             {
               allMarkdownRemark {
                 nodes {
                   id
                   frontmatter {
                     path
                     title
                     excerpt
                   }
                 }
               }
             }
           `,
           normalizer: ({ data }) =>
             data.allMarkdownRemark.nodes.map(node => ({
               id: node.id,
               url: `/blog/${node.frontmatter.path}`,
               title: node.frontmatter.title,
             })),
         },
       },
     ],
   }
   ```

1. **Create the JSON files in `gatsby-node.js`**

   We're going to save it in `/paginated-data/${collection.id}`, where
   collection ID is a UUID for the blog posts, but this could also be
   `/paginated-data/blog-posts`.

   Similarly, we are using the page IDs for the JSON filenames, but this could
   also be the page number/index.

   Using the IDs forces you to rely on the pagination data provided by the
   plugin rather than keeping state yourself (e.g. incrementing page numbers).

   ```javascript
   // gatsby-node.js

   exports.createPages = async gatsbyContext => {
     const { graphql } = gatsbyContext

     const queryResult = await graphql(`
       {
         paginatedCollection(name: { eq: "blog-posts" }) {
           id
           pages {
             id
             nodes
             hasNextPage
             nextPage {
               id
             }
           }
         }
       }
     `)

     const collection = queryResult.data.paginatedCollection
     const dir = path.join(__dirname, 'public', 'paginated-data', collection.id)
     fs.mkdirSync(dir, { recursive: true })

     for (const page of collection.pages)
       fs.writeFileSync(
         path.resolve(dir, `${page.id}.json`),
         JSON.stringify(page),
       )
   }
   ```

1. **Create a Blog page with the fetching handler**

   The `loadNextPage` function does not do any error handling so feel free to
   improve on this.

   Note the use of `withPrefix` when creating the URL for the JSON file. This is
   only necessary if your site is not hosted at the root of your server.

   ```javascript
   // src/pages/blog.js

   import React, { useState, useCallback } from 'react'
   import { Link, graphql, withPrefix } from 'gatsby'

   const BlogPage = ({ data }) => {
     const initialPage = data.paginatedCollectionPage
     const [latestPage, setLatestPage] = useState(initialPage)
     const [blogPosts, setBlogPosts] = useState(initialPage.nodes)

     const loadNextPage = useCallback(async () => {
       if (!latestPage.hasNextPage) return

       const collectionId = latestPage.collection.id
       const nextPageId = latestPage.nextPage.id
       const path = withPrefix(
         `/paginated-data/${collectionId}/${nextPageId}.json`,
       )

       const res = await fetch(path)
       const json = await res.json()

       setBlogPosts(state => [...state, ...json.nodes])
       setLatestPage(json)
     }, [latestPage])

     return (
       <div className="blog-posts">
         <ul className="blog-posts__list">
           {blogPosts.map(blogPost => (
             <li key={blogPost.id} className="blog-posts__list__post">
               <Link to={blogPost.url}>{blogPost.title}</Link>
             </li>
           ))}
         </ul>
         {latestPage.hasNextPage && (
           <button class="blog-posts__load-more" onClick={loadNextPage}>
             Load more
           </button>
         )}
       </div>
     )
   }

   export default BlogPage

   export const query = graphql`
     {
       paginatedCollectionPage(
         collection: { name: { eq: "blog-posts" } }
         index: { eq: 0 }
       ) {
         nodes
         hasNextPage
         nextPage {
           id
         }
         collection {
           id
         }
       }
     }
   `
   ```

</details>

<details>
  <summary><strong>Example 3</strong>: Next/previous buttons on a blog post</summary>
  <br/>

TODO

</details>
