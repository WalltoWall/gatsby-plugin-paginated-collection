const gql = (query: TemplateStringsArray) => String(query).replace(`\n`, ` `)

export const types = gql`
  """
  Valid Prismic field types.
  """
  enum PrismicSchemaFieldType {
    Color
    Date
    Embed
    GeoPoint
    Group
    Image
    Link
    Number
    Select
    Slice
    Slices
    StructuredText
    Text
    Timestamp
    UID
  }

  """
  Valid Prismic slice display types. Determines the presentation of the repeatable fields.
  """
  enum PrismicSchemaSliceChoiceDisplayType {
    list
    grid
  }

  """
  A Prismic custom type schema.
  """
  type PrismicSchemaCustomType implements Node @dontInfer {
    "Name of the custom type."
    name: String!

    """
    Human-friendly name of the Prismic custom type. Note: this is derived
    from the \`name\` field and does not use the display name used in
    Prismic's UI.
    """
    displayName: String!

    "Tabs of the custom type."
    tabs: [PrismicSchemaTab!]! @link

    "Raw JSON schema of the custom type."
    schema: JSON!
  }

  """
  Prismic custom type tab data.
  """
  type PrismicSchemaTab implements Node @dontInfer {
    """
    Name of the tab. Note: this is derived from the \`displayName\` and is not
    guaranteed to be unique.
    """
    name: String!

    "Human-friendly name of the tab."
    displayName: String!

    "Fields of the tab."
    contentFields: [PrismicSchemaField!]! @link

    "Boolean signifying if the tab contains a Slice zone."
    hasSliceZone: Boolean!

    "Slice zone of the tab if present."
    sliceZone: PrismicSchemaField @link

    "Custom type to which the tab belongs."
    customType: PrismicSchemaCustomType! @link
  }

  """
  Prismic custom type slice zone choice.
  """
  type PrismicSchemaSliceChoice implements Node @dontInfer {
    "Name of the slice zone choice. Represents the Prismic API ID."
    name: String!

    "Human-friendly name of the slice zone choice."
    displayName: String!

    "Description of the slice zone choice."
    description: String!

    "Icon of the slice zone choice."
    icon: String!

    """
    Display type of the slice zone choice. Determines the presentation of the
    repeatable fields.
    """
    displayType: PrismicSchemaSliceChoiceDisplayType!

    "Non-repeatable fields of the slice zone choice."
    nonRepeatFields: [PrismicSchemaField!]! @link

    "Repeatable fields of the slice zone choice."
    repeatFields: [PrismicSchemaField!]! @link

    "Slice zone to which the slice choice belongs."
    sliceZone: PrismicSchemaField! @link
  }

  """
  Prismic custom type field.
  """
  type PrismicSchemaField implements Node @dontInfer {
    "Name of the field. Represents the Prismic API ID."
    name: String!

    "Human-friendly name of the field."
    displayName: String!

    "Type of the field."
    type: PrismicSchemaFieldType!

    "Description of the field's purpose."
    description: String

    "Fields for each repeatable item if field is a Group type."
    contentFields: [PrismicSchemaField!] @link

    "Slice choices if field is a Slices type (i.e. a Slice zone)."
    choices: [PrismicSchemaSliceChoice!] @link

    "Raw JSON data containing field-specific configuration."
    config: JSON!

    "Tab to which the field belongs."
    tab: PrismicSchemaTab @link
  }
`
