/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "circuit_matches",
    "created": "2025-12-13 12:00:00.000Z",
    "updated": "2025-12-13 12:00:00.000Z",
    "name": "circuit_matches",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "roundId",
        "name": "roundId",
        "type": "text",
        "required": true,
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
        "id": "sideAId",
        "name": "sideAId",
        "type": "text",
        "required": true,
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
        "id": "sideBId",
        "name": "sideBId",
        "type": "text",
        "required": true,
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
        "id": "sideAName",
        "name": "sideAName",
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
        "id": "sideBName",
        "name": "sideBName",
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
        "id": "judgeIds",
        "name": "judgeIds",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 100000
        }
      },
      {
        "system": false,
        "id": "judgeNames",
        "name": "judgeNames",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 100000
        }
      },
      {
        "system": false,
        "id": "room",
        "name": "room",
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
        "id": "scheduledAt",
        "name": "scheduledAt",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "result",
        "name": "result",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 100000
        }
      },
      {
        "system": false,
        "id": "status",
        "name": "status",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_circuit_matches_roundId` ON `circuit_matches` (`roundId`)",
      "CREATE INDEX `idx_circuit_matches_sideAId` ON `circuit_matches` (`sideAId`)",
      "CREATE INDEX `idx_circuit_matches_sideBId` ON `circuit_matches` (`sideBId`)"
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("circuit_matches");

  return dao.deleteCollection(collection);
})


