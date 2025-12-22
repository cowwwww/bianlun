/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("topics");

  // Fix the ratings field options - remove maxSize restriction
  collection.schema = collection.schema.map(field => {
    if (field.name === 'ratings') {
      field.options = {};
    }
    return field;
  });

  // Set public permissions
  collection.createRule = "";
  collection.viewRule = "";
  collection.listRule = "";
  collection.updateRule = "";
  collection.deleteRule = "";

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("topics");

  // Revert to admin-only permissions
  collection.createRule = "";
  collection.viewRule = "";
  collection.listRule = "";
  collection.updateRule = "";
  collection.deleteRule = "";

  return dao.saveCollection(collection);
})
