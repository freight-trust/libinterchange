# Model file format

## Model

Each model should have a file corresponding to it in `src/<version>/models`. The name of the file should correspond to the name of the object the model is describing.

e.g. for model **Event**, the file name should be **Event.json**.

### Properties

#### type

The type of object that this model describes. The name of the file should correspond to the name of the object the model is describing.

```json
{
  "type": "Event"
}
```

#### subClassOf

If this model is the subclass of another model or an external class _for which a local model does not exist_, this can be referenced here.

When calling `loadModel`, all of the parent model properties will be inherited.

```json
{
  "type": "BabyChanging",
  "subClassOf": "#LocationFeatureSpecification"
}
```

```json
{
  "type": "FacilityUse",
  "subClassOf": "https://schema.org/Product"
}
```

#### derivedFrom

A url pointing to any external objects that this model derives from.

Note this cannot be set when `subClassOf` is set to an external class.

```json
{
  "derivedFrom": "https://schema.org/Event"
}
```

#### hasId

A `boolean` indicating whether this model has an `id` field.

```json
{
  "hasId": true
}
```

#### idFormat

The format that the id should be represented as.

```json
{
  "idFormat": "https://schema.org/url"
}
```

#### sampleId

An example `id`.

```json
{
  "sampleId": "https://example.com/event/"
}
```

#### isJsonLd

Whether the this model is JSON-LD (defaults to `true`)

```json
{
  "isJsonLd": false
}
```

#### requiredFields

An array of field names that are **REQUIRED** in the specification. This should only include fields that are explicitly mentioned in the OpenActive spec.

```json
{
  "requiredFields": [
    "id",
    "@context",
    "type"
  ]
}
```

#### requiredOptions

Where one of a collection of fields are required (e.g. an Event must have a `schema:startDate` or `oa:eventSchedule`), this can be specified here.

```json
{
  "requiredOptions": [
    {
      "description": [
        "While these properties are marked as optional, a data publisher must provide either a schema:startDate or specify a oa:eventSchedule for an event."
      ],
      "options": [
        "startDate",
        "eventSchedule"
      ]
    }
  ]
}
```

#### recommendedFields

An array of field names that are **RECOMMENDED** in the specification. This should only include fields that are explicitly mentioned in the OpenActive spec.

```json
{
  "recommendedFields": [
    "description",
    "image",
    "organizer"
  ]
}
```

#### inSpec

An array of field names that are defined in the specification. This should only include fields that are explicitly mentioned in the OpenActive spec.

This **MUST** include **ALL** required, recommended and optional fields.

```json
{
  "inSpec": [
    "id",
    "@context",
    "name"
  ]
}
```

#### notInSpec

An array of field names that are not defined for a particular model, where it inherits fields from a parent class.

```json
{
  "notInSpec": [
    "eventSchedule"
  ]
}
```

#### commonTypos

An key-value object of common typos for field names.

```json
{
  "commonTypos": {
    "offer": "offers"
  }
}
```

#### fields

A key-value object of Fields (see below).

```json
{
  "fields": {
    "description": {
      "fieldName": "description",
      "requiredType": "https://schema.org/Text",
      "example": "An fast paced game that incorporates netball, handball and football.",
      "description": [
        "A free text description of the event"
      ]
    }
  }
}
```

#### betaFields

An key-value object of beta namespace fields (see below). These are currently not respected by the validator.

```json
{
  "betaFields": {
    "beta:description": {
      "fieldName": "beta:description",
      "requiredType": "https://schema.org/Text",
      "example": "An fast paced game that incorporates netball, handball and football.",
      "description": [
        "A free text description of the event"
      ]
    }
  }
}
```

#### description

TODO

#### namedExamples

TODO

## Field

### Properties

#### fieldName

The name of the field. In the `Model.fields` or `Model.betaFields` layout, this should match the key of the field.

```json
{
  "fieldName": "description"
}
```

#### model

The name of the model this field should conform to. This should reference another model that we have a local definition for.

```json
{
  "model": "#Event"
}
```

If this is an array of models, you can represent it as below:

```json
{
  "model": "ArrayOf#Event"
}
```

#### alternativeModels

Alternative models this field should conform to. This should reference another model that we have a local definition for.

```json
{
  "model": "#Event",
  "alternativeModels": [
    "ArrayOf#Event"
  ]
}
```

#### requiredType

The schema.org type this field should conform to.

```json
{
  "requiredType": "https://schema.org/url"
}
```

If this is an array of values, you can represent it as below:

```json
{
  "requiredType": "ArrayOf#https://schema.org/url"
}
```

#### alternativeTypes

Alternative schema.org types this field can conform to.

```json
{
  "requiredType": "https://schema.org/url",
  "alternativeTypes": [
    "ArrayOf#https://schema.org/url"
  ]
}
```

#### minDecimalPlaces

The minimum number of decimal places this field should have.

```json
{
  "fieldName": "longitude",
  "sameAs": "https://schema.org/longitude",
  "requiredType": "https://schema.org/Number",
  "minDecimalPlaces": 3,
  "example": -0.083437,
  "description": [
    "The longitude of a location. For example -0.083437 (WGS 84)."
  ]
}
```

#### maxDecimalPlaces

The maximum number of decimal places this field should have.

```json
{
  "fieldName": "price",
  "sameAs": "https://schema.org/price",
  "requiredType": "https://schema.org/Number",
  "example": 33.00,
  "maxDecimalPlaces": 2,
  "description": [
    "The offer price of the activity.",
    "This price should be specified without currency symbols and as a floating point number with two decimal places.",
    "The currency of the price should be expressed in the priceCurrency field."
  ]
}
```

#### requiredContent

If this property must be set to a specific value, this can be specified here.

```json
{
  "fieldName": "type",
  "requiredType": "https://schema.org/Text",
  "requiredContent": "Event",
  "description": "",
  "example": "Event"
}
```

#### description

An array of strings (one per paragraph), describing this field.

```json
{
  "description": [
    "A URL to a web page (or section of a page) that describes the event."
  ]
}
```

#### example

An example value of this field, for documentation.

```json
{
  "fieldName": "url",
  "requiredType": "https://schema.org/url",
  "description": [
    "A URL to a web page (or section of a page) that describes the event."
  ],
  "example": "https://example.com/event/1234"
}
```

#### options

If this property must be set to a specific value picked from a list (e.g. an `enum`), the list values can be specified here.

```json
{
  "fieldName": "eventStatus",
  "requiredType": "https://schema.org/url",
  "description": [
    "The status of an event. Can be used to indicate rescheduled or cancelled events"
  ],
  "options": [
    "https://schema.org/EventCancelled",
    "https://schema.org/EventPostponed",
    "https://schema.org/EventRescheduled",
    "https://schema.org/EventScheduled"
  ],
  "example": "https://schema.org/EventScheduled"
}
```

#### inheritsTo

If this property allows an object to pass values down for inheritance by the child, you can specify this in a number of ways.

If all fields are inheritable:

```json
{
  "fieldName": "subEvent",
  "inheritsTo": "*"
}
```

To specify a blacklist of fields:

```json
{
  "fieldName": "subEvent",
  "inheritsTo": {
    "exclude": ["id", "identifier", "subEvent", "superEvent"]
  }
}
```

To specify a whitelist of fields:

```json
{
  "fieldName": "subEvent",
  "inheritsTo": {
    "include": ["name", "description", "startDate", "endDate"]
  }
}
```

`exclude` takes precedence over `include`.

#### inheritsFrom

If this property allows an object to inherit properties from it, you can specify this in a number of ways.

If all fields are inheritable:

```json
{
  "fieldName": "superEvent",
  "inheritsFrom": "*"
}
```

To specify a blacklist of fields (anything not in this list will be inheritable):

```json
{
  "fieldName": "superEvent",
  "inheritsFrom": {
    "exclude": ["id", "identifier", "subEvent", "superEvent"]
  }
}
```

To specify a whitelist of fields (anything not in this list will not be inheritable):

```json
{
  "fieldName": "subEvent",
  "inheritsFrom": {
    "include": ["name", "description", "startDate", "endDate"]
  }
}
```

`exclude` takes precedence over `include`.


## Namespace resolution

`sameAs` is REQUIRED, and must reflect the `fieldName` within the relevant namespace.


## DEPRECATED Namespace resolution

> Although the section below still reflects the inner workings of the validator, `sameAs` is now REQUIRED to remove ambiguity and make the model files easier to parse by various tools.
> It is expected that future versions of the OpenActive validator library will remove the namespace resolution logic specified below, and instead use the `sameAs` value provided.

For each field within the model, the rules of resolution are thus:

* *IF* `sameAs` is set on the field, use the namespace in there (see [example](https://github.com/openactive/data-models/blob/d5deb89c2395ba770b8cd943dedda9e996f76ac0/versions/2.x/models/Event.json#L115)) (the `activity` field is defined in the OA namespace, but `Event` is schema.org)
* *ELSE IF* `derivedFrom` is set for the model, use the namespace in there (see [example](https://github.com/openactive/data-models/blob/06a0516f2f228d2045e63530c7754df35d3810f5/versions/2.x/models/EntryPoint.json#L3)
* *ELSE IF* `derivedFrom` is set for a model further up the hierarchy as is specified via `subClassOf`, use the namespace in there
* *ELSE IF* `subClassOf` at the base of the hierarchy is an external class, use the namespace in there
* *ELSE* assume the field is in the OA namespace

If the same field has been defined in two different namespaces (e.g. in both "`schema:`" and "`oa:`"), the oa.jsonld file would not be able to be generated, and the unit tests produce the error "namespaces should not have fields in multiple namespaces".

Where the `sameAs` namespace is the same as the `derivedFrom` namespace, the use of `sameAs` is redundant.
