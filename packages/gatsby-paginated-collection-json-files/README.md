# gatsby-paginated-collection-json-files

Writes JSON files for a collection made by `gatsby-plugin-paginated-collection`
to a site's `public` folder. The files can be fetched as needed client-side.

## Table of Contents

- [Features](#features)
- [Install](#install)
- [How to use](#how-to-use)
- [How to query](#how-to-query)
  - [Query Collections](#query-collections)
  - [Query Pages](#query-pages)
- [Examples](#examples)

## Install

```sh
npm install --save gatsby-paginated-collection-json-files
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-source-paginated-collection',
    options: {
      // In addition to your other options...

      /**
       * Function used to map the result of the GraphQL query to nodes in the
       * collection. This should return an array of items to paginate. This is
       * required.
       */
      plugins: [
        {
          resolve: 'gatsby-paginated-collection',
          options: {
            /**
             * Path within the site's public folder to which the plugin will
             * write files. Default: 'paginated-collections'
             */
            path: 'paginated-collections',
          },
        },
      ],
    },
  },
]
```

## How to use

Each page in the collection is saved as a JSON file named `${id}.json` where
`${id}` id the page's node ID. You can get a page's ID via GraphQL directly or
by using a page's `nextPage` or `previousPage` fields.

The following query fetches the ID of the first page of a collection named
`blogPosts`. It also fetches the next page's ID which can be used in a
client-side `fetch` to load the JSON file.

```graphql
{
  paginatedCollectionPage(
    collection: { name: { eq: "blogPosts" } }
    index: { eq: 0 }
  ) {
    id
    nextPage {
      id
    }
  }
}
```
