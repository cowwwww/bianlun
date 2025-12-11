/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = new Collection({
    "id": "timer_projects",
    "name": "timer_projects",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "name_field",
        "name": "name",
        "type": "text",
        "system": false,
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "id": "description_field",
        "name": "description",
        "type": "text",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "id": "type_field",
        "name": "type",
        "type": "select",
        "system": false,
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "countdown",
            "stopwatch"
          ]
        }
      },
      {
        "id": "duration_field",
        "name": "duration",
        "type": "number",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "id": "createdBy_field",
        "name": "createdBy",
        "type": "text",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("timer_projects");
  return dao.deleteCollection(collection);
});

