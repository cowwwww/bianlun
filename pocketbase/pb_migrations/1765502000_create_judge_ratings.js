/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // judge collection
  const judge = new Collection({
    id: "judge",
    name: "judge",
    type: "base",
    system: false,
    schema: [
      new SchemaField({ id: "fullName", name: "fullName", type: "text", required: true, presentable: true, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "wechatId", name: "wechatId", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "phone", name: "phone", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "experience", name: "experience", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "price", name: "price", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "location", name: "location", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "education", name: "education", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "expertise", name: "expertise", type: "json", required: false, presentable: false, unique: false, options: {} }),
      new SchemaField({ id: "languages", name: "languages", type: "json", required: false, presentable: false, unique: false, options: {} }),
      new SchemaField({ id: "showContactInfo", name: "showContactInfo", type: "bool", required: false, presentable: false, unique: false, options: {} }),
      new SchemaField({ id: "comments", name: "comments", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "judgeTypes", name: "judgeTypes", type: "json", required: false, presentable: false, unique: false, options: {} }),
      new SchemaField({ id: "splitVoteFrequency", name: "splitVoteFrequency", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "professionalKnowledgeLevel", name: "professionalKnowledgeLevel", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "persuasionPreference", name: "persuasionPreference", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "argumentationThreshold", name: "argumentationThreshold", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "biasAdjustment", name: "biasAdjustment", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "consensusRevocable", name: "consensusRevocable", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "lateArgumentAcceptance", name: "lateArgumentAcceptance", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "ruleViolationSeverity", name: "ruleViolationSeverity", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "winningCriteria", name: "winningCriteria", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "topicBiasResponse", name: "topicBiasResponse", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "argumentTypePreference", name: "argumentTypePreference", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "judgingCriteria", name: "judgingCriteria", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "status", name: "status", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "rating", name: "rating", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: false } }),
      new SchemaField({ id: "totalReviews", name: "totalReviews", type: "number", required: false, presentable: false, unique: false, options: { min: 0, max: null, noDecimal: true } }),
    ],
    indexes: [],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    options: {},
  });

  // ratings collection
  const ratings = new Collection({
    id: "ratings",
    name: "ratings",
    type: "base",
    system: false,
    schema: [
      new SchemaField({ id: "userId", name: "userId", type: "text", required: true, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "judgeId", name: "judgeId", type: "text", required: true, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "judgeName", name: "judgeName", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
      new SchemaField({ id: "rating", name: "rating", type: "number", required: true, presentable: false, unique: false, options: { min: 0, max: 5, noDecimal: false } }),
      new SchemaField({ id: "review", name: "review", type: "text", required: false, presentable: false, unique: false, options: { min: null, max: null, pattern: "" } }),
    ],
    indexes: [],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    options: {},
  });

  dao.saveCollection(judge);
  dao.saveCollection(ratings);
}, (db) => {
  const dao = new Dao(db);
  const judge = dao.findCollectionByNameOrId("judge");
  const ratings = dao.findCollectionByNameOrId("ratings");
  if (judge) dao.deleteCollection(judge);
  if (ratings) dao.deleteCollection(ratings);
});

