/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("topics");

  // Allow public access for create and view operations
  collection.createRule = ""; // Anyone can create topics
  collection.viewRule = ""; // Anyone can view topics
  collection.updateRule = ""; // Anyone can update topics
  collection.deleteRule = ""; // Anyone can delete topics

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("topics");

  // Revert to admin-only permissions
  collection.createRule = "";
  collection.viewRule = "";
  collection.updateRule = "";
  collection.deleteRule = "";

  return dao.saveCollection(collection);
})
