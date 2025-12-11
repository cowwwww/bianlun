/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  let collection = null;

  try {
    collection = dao.findCollectionByNameOrId("timers");
  } catch (_) {
    collection = null;
  }

  if (!collection) {
    collection = new Collection({
      id: "timers",
      name: "timers",
      type: "base",
      system: false,
      schema: [],
      indexes: [],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      options: {},
    });
  }

  const upsertField = (field) => {
    const existing = collection.schema.getFieldByName(field.name);
    if (existing) {
      // If exists, keep it as-is to avoid duplicate column errors
      return;
    }
    collection.schema.addField(new SchemaField(field));
  };

  upsertField({
    id: "name_field",
    name: "name",
    type: "text",
    system: false,
    required: true,
    presentable: true,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "description_field",
    name: "description",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "category_field",
    name: "category",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "bg_field",
    name: "backgroundColor",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "text_field",
    name: "textColor",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "public_field",
    name: "isPublic",
    type: "bool",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {},
  });

  upsertField({
    id: "timer_steps_field",
    name: "timerSteps",
    type: "json",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {},
  });

  upsertField({
    id: "bg_image_field",
    name: "backgroundImage",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "author_field",
    name: "author",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  upsertField({
    id: "usage_field",
    name: "usageCount",
    type: "number",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: 0,
      max: null,
      noDecimal: true,
    },
  });

  upsertField({
    id: "type_field",
    name: "type",
    type: "select",
    system: false,
    required: true,
    presentable: false,
    unique: false,
    options: {
      maxSelect: 1,
      values: ["countdown", "stopwatch"],
    },
  });

  upsertField({
    id: "duration_field",
    name: "duration",
    type: "number",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: 0,
      max: null,
      noDecimal: true,
    },
  });

  upsertField({
    id: "createdBy_field",
    name: "createdBy",
    type: "text",
    system: false,
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: "",
    },
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("timers");
  if (!collection) return;

  // On rollback, drop the collection to keep migrations reversible.
  return dao.deleteCollection(collection);
});

