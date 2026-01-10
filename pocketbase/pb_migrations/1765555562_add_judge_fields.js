/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("judges");

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "obligationsLeft",
    "name": "obligationsLeft",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }));

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "totalObligations",
    "name": "totalObligations",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }));

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "teamId",
    "name": "teamId",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "teamName",
    "name": "teamName",
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
  const collection = dao.findCollectionByNameOrId("judges");

  // remove
  collection.schema.removeField("obligationsLeft");
  collection.schema.removeField("totalObligations");
  collection.schema.removeField("teamId");
  collection.schema.removeField("teamName");

  return dao.saveCollection(collection);
})


