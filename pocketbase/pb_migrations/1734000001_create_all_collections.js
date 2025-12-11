/// <reference path="../pb_data/types.d.ts" />

/**
 * 自动创建所有需要的集合
 * 包括：tournaments, topics, timer_projects
 * 并更新 users 集合添加微信字段
 */

migrate((db) => {
  const dao = new Dao(db);

  // ============================================
  // 1. 创建 tournaments 集合
  // ============================================
  const tournamentsCollection = new Collection({
    id: "tournaments_collection",
    name: "tournaments",
    type: "base",
    system: false,
    schema: [
      {
        id: "name_field",
        name: "name",
        type: "text",
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "title_field",
        name: "title",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "description_field",
        name: "description",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "startDate_field",
        name: "startDate",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "endDate_field",
        name: "endDate",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "registrationDeadline_field",
        name: "registrationDeadline",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "date_field",
        name: "date",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "location_field",
        name: "location",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "type_field",
        name: "type",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "status_field",
        name: "status",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "price_field",
        name: "price",
        type: "number",
        required: false,
        options: {
          min: null,
          max: null
        }
      },
      {
        id: "teamsize_field",
        name: "teamsize",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "organizer_field",
        name: "organizer",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "contact_field",
        name: "contact",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "category_field",
        name: "category",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "image_field",
        name: "image",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "totalTeams_field",
        name: "totalTeams",
        type: "number",
        required: false,
        options: {
          min: null,
          max: null
        }
      },
      {
        id: "playersPerTeam_field",
        name: "playersPerTeam",
        type: "number",
        required: false,
        options: {
          min: null,
          max: null
        }
      },
      {
        id: "participationRequirements_field",
        name: "participationRequirements",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "registrationLink_field",
        name: "registrationLink",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "ruleBookLink_field",
        name: "ruleBookLink",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "award_field",
        name: "award",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      }
    ],
    indexes: [],
    listRule: "",  // 公开访问
    viewRule: "",  // 公开访问
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''"
  });

  dao.saveCollection(tournamentsCollection);
  console.log("✅ Created tournaments collection");

  // ============================================
  // 2. 创建 topics 集合
  // ============================================
  const topicsCollection = new Collection({
    id: "topics_collection",
    name: "topics",
    type: "base",
    system: false,
    schema: [
      {
        id: "text_field",
        name: "text",
        type: "text",
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "explanation_field",
        name: "explanation",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "area_field",
        name: "area",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "language_field",
        name: "language",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "tournament_field",
        name: "tournament",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "ratings_field",
        name: "ratings",
        type: "json",
        required: false,
        options: {}
      },
      {
        id: "averageRating_field",
        name: "averageRating",
        type: "number",
        required: false,
        options: {
          min: null,
          max: null
        }
      }
    ],
    indexes: [],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''"
  });

  dao.saveCollection(topicsCollection);
  console.log("✅ Created topics collection");

  // ============================================
  // 3. 创建 timer_projects 集合
  // ============================================
  const timerProjectsCollection = new Collection({
    id: "timer_projects_collection",
    name: "timer_projects",
    type: "base",
    system: false,
    schema: [
      {
        id: "name_field",
        name: "name",
        type: "text",
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "description_field",
        name: "description",
        type: "text",
        required: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "type_field",
        name: "type",
        type: "text",
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        id: "duration_field",
        name: "duration",
        type: "number",
        required: false,
        options: {
          min: null,
          max: null
        }
      },
      {
        id: "createdBy_field",
        name: "createdBy",
        type: "text",
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      }
    ],
    indexes: [],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = createdBy",
    deleteRule: "@request.auth.id = createdBy"
  });

  dao.saveCollection(timerProjectsCollection);
  console.log("✅ Created timer_projects collection");

  // ============================================
  // 4. 更新 users 集合 - 添加微信字段
  // ============================================
  const usersCollection = dao.findCollectionByNameOrId("users");

  // 添加 wechatOpenid
  usersCollection.schema.addField(new SchemaField({
    id: "wechat_openid",
    name: "wechatOpenid",
    type: "text",
    required: false,
    unique: true,
    options: {
      min: null,
      max: null,
      pattern: ""
    }
  }));

  // 添加 wechatUnionid
  usersCollection.schema.addField(new SchemaField({
    id: "wechat_unionid",
    name: "wechatUnionid",
    type: "text",
    required: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: ""
    }
  }));

  // 添加 avatar
  usersCollection.schema.addField(new SchemaField({
    id: "user_avatar",
    name: "avatar",
    type: "url",
    required: false,
    unique: false,
    options: {
      exceptDomains: null,
      onlyDomains: null
    }
  }));

  dao.saveCollection(usersCollection);
  console.log("✅ Updated users collection with WeChat fields");

  console.log("🎉 All collections created successfully!");
  
  return null;

}, (db) => {
  // 回滚操作
  const dao = new Dao(db);

  try {
    // 删除创建的集合
    const tournaments = dao.findCollectionByNameOrId("tournaments");
    dao.deleteCollection(tournaments);
    console.log("⏪ Deleted tournaments collection");
  } catch (e) {}

  try {
    const topics = dao.findCollectionByNameOrId("topics");
    dao.deleteCollection(topics);
    console.log("⏪ Deleted topics collection");
  } catch (e) {}

  try {
    const timerProjects = dao.findCollectionByNameOrId("timer_projects");
    dao.deleteCollection(timerProjects);
    console.log("⏪ Deleted timer_projects collection");
  } catch (e) {}

  try {
    // 删除 users 的微信字段
    const users = dao.findCollectionByNameOrId("users");
    users.schema.removeField("wechat_openid");
    users.schema.removeField("wechat_unionid");
    users.schema.removeField("user_avatar");
    dao.saveCollection(users);
    console.log("⏪ Removed WeChat fields from users");
  } catch (e) {}

  return null;
});

