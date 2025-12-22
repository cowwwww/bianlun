/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("matches");

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "topicId",
    "name": "topicId",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }));

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("matches");

  // remove
  collection.schema.removeField("topicId");

  return dao.saveCollection(collection);
});
