# gatsby-paginated-collection-json-files

Writes JSON files for a collection made by `gatsby-plugin-paginated-collection`
to a site's `public` folder.

The files can be fetched as needed client-side.

## Table of Contents

- [Features](#features)
- [Install](#install)
- [How to use](#how-to-use)
- [How to query](#how-to-query)

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
      plugins: [
        {
          resolve: 'gatsby-paginated-collection-json-files',
          options: {
            /**
             * Path within the site's public folder to which the plugin will
             * write files. Default: 'paginated-collections'
             */
            path: 'paginated-collections',

            /**
             * Include data for the next or previous page or the collection
             * itself. All fields except `nodes` will be included if expanded.
             * The following fields can be expanded: nextPage, previousPage,
             * collection. Default: no fields
             */
            expand: ['nextPage', 'previousPage'],

            /**
             * Configure the filename of the JSON files. The following values
             * are valid:
             *   - "id": ID of the page
             *   - "index": Index of the page
             *   - A function that returns a string. e.g. (page) => page.id
             *
             * Default: 'id'
             */
            filename: 'id',
          },
        },
      ],
    },
  },
]
```

## How to query

Each page in the collection is saved as a JSON file named `${id}.json` where
`${id}` is the page's ID. You can get a page's ID by querying for the page' node
directly or by using a page's `nextPage` or `previousPage` fields.

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
