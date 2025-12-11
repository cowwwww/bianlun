/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "99vqet85lxtklnq",
    "created": "2025-12-11 11:50:35.671Z",
    "updated": "2025-12-11 11:50:35.671Z",
    "name": "Wechatlogin",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "mnuz2bxi",
        "name": "wechatOpenid",
        "type": "text",
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
        "system": false,
        "id": "zb3jslph",
        "name": "wechatUnionid",
        "type": "text",
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
        "system": false,
        "id": "3awojhhj",
        "name": "avatar",
        "type": "url",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": [],
          "onlyDomains": []
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("99vqet85lxtklnq");

  return dao.deleteCollection(collection);
})
