/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hst380wy1d9yig6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "category_field",
    "name": "category",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bg_field",
    "name": "backgroundColor",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "text_field",
    "name": "textColor",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "public_field",
    "name": "isPublic",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "timer_steps_field",
    "name": "timerSteps",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 20000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bg_image_field",
    "name": "backgroundImage",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "author_field",
    "name": "author",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "usage_field",
    "name": "usageCount",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": null,
      "noDecimal": true
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "createdBy_field",
    "name": "createdBy",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hst380wy1d9yig6")

  // remove
  collection.schema.removeField("category_field")

  // remove
  collection.schema.removeField("bg_field")

  // remove
  collection.schema.removeField("text_field")

  // remove
  collection.schema.removeField("public_field")

  // remove
  collection.schema.removeField("timer_steps_field")

  // remove
  collection.schema.removeField("bg_image_field")

  // remove
  collection.schema.removeField("author_field")

  // remove
  collection.schema.removeField("usage_field")

  // remove
  collection.schema.removeField("createdBy_field")

  return dao.saveCollection(collection)
})
