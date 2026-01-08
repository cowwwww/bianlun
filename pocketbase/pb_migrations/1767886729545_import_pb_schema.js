/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // Delete existing collections if they exist (except system collections)
  const existingCollections = [
    "Users", "Wechatlogin", "timers", "timer_projects", "judges",
    "ratings", "registrations", "tournaments", "matches", "form_configs",
    "circuits", "circuit_matches", "judge_scores", "judge_assignments",
    "team_members", "topics", "resources"
  ];

  existingCollections.forEach(collectionName => {
    try {
      const collection = dao.findCollectionByNameOrId(collectionName);
      if (collection) {
        dao.deleteCollection(collection);
      }
    } catch (error) {
      // Collection doesn't exist, continue
    }
  });

  // Import collections from pb_schema.json

  // 1. Users collection
  const usersCollection = new Collection({
  "id": "q12140y6j240tdu",
  "name": "Users",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "ntc2bjzd",
      "name": "full_name",
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
      "id": "tvzjq3uo",
      "name": "wechat_id",
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
      "id": "nlh8wuuj",
      "name": "password",
      "type": "text",
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
  "updateRule": null,
  "deleteRule": null,
  "options": {}
});

  dao.saveCollection(usersCollection);
  // 2. Wechatlogin collection
  const wechatloginCollection = new Collection({
  "id": "99vqet85lxtklnq",
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

  dao.saveCollection(wechatloginCollection);
  // 3. circuit_matches collection
  const circuit_matchesCollection = new Collection({
  "id": "circuit_matches",
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

  dao.saveCollection(circuit_matchesCollection);
  // 4. circuits collection
  const circuitsCollection = new Collection({
  "id": "circuits",
  "name": "circuits",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "tournamentId",
      "name": "tournamentId",
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
      "id": "name",
      "name": "name",
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
      "id": "description",
      "name": "description",
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
      "id": "rounds",
      "name": "rounds",
      "type": "json",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 1000000
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
    },
    {
      "system": false,
      "id": "totalTeams",
      "name": "totalTeams",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": true
      }
    },
    {
      "system": false,
      "id": "currentRound",
      "name": "currentRound",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": null,
        "noDecimal": true
      }
    },
    {
      "system": false,
      "id": "bracketType",
      "name": "bracketType",
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
    "CREATE INDEX `idx_circuits_tournamentId` ON `circuits` (`tournamentId`)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "options": {}
});

  dao.saveCollection(circuitsCollection);
  // 5. form_configs collection
  const form_configsCollection = new Collection({
  "id": "form_configs",
  "name": "form_configs",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "tournamentId",
      "name": "tournamentId",
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
      "id": "title",
      "name": "title",
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
      "id": "description",
      "name": "description",
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
      "id": "fields",
      "name": "fields",
      "type": "json",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 1000000
      }
    },
    {
      "system": false,
      "id": "teamMemberRoles",
      "name": "teamMemberRoles",
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
      "id": "minTeamMembers",
      "name": "minTeamMembers",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": null,
        "noDecimal": true
      }
    },
    {
      "system": false,
      "id": "maxTeamMembers",
      "name": "maxTeamMembers",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": null,
        "noDecimal": true
      }
    },
    {
      "system": false,
      "id": "allowJudgeSelection",
      "name": "allowJudgeSelection",
      "type": "bool",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {}
    },
    {
      "system": false,
      "id": "isActive",
      "name": "isActive",
      "type": "bool",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {}
    }
  ],
  "indexes": [
    "CREATE INDEX `idx_form_configs_tournamentId` ON `form_configs` (`tournamentId`)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "options": {}
});

  dao.saveCollection(form_configsCollection);
  // 6. judge_assignments collection
  const judge_assignmentsCollection = new Collection({
  "id": "judge_assignments",
  "name": "judge_assignments",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "judgeId",
      "name": "judgeId",
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
      "id": "judgeName",
      "name": "judgeName",
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
      "id": "matchId",
      "name": "matchId",
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
      "id": "matchName",
      "name": "matchName",
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
      "id": "tournamentId",
      "name": "tournamentId",
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
      "id": "tournamentName",
      "name": "tournamentName",
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
      "id": "deadline",
      "name": "deadline",
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
    },
    {
      "system": false,
      "id": "submittedAt",
      "name": "submittedAt",
      "type": "date",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": "",
        "max": ""
      }
    }
  ],
  "indexes": [
    "CREATE INDEX `idx_judge_assignments_judgeId` ON `judge_assignments` (`judgeId`)",
    "CREATE INDEX `idx_judge_assignments_matchId` ON `judge_assignments` (`matchId`)",
    "CREATE INDEX `idx_judge_assignments_tournamentId` ON `judge_assignments` (`tournamentId`)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "options": {}
});

  dao.saveCollection(judge_assignmentsCollection);
  // 7. judge_scores collection
  const judge_scoresCollection = new Collection({
  "id": "judge_scores",
  "name": "judge_scores",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "matchId",
      "name": "matchId",
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
      "id": "judgeId",
      "name": "judgeId",
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
      "id": "judgeName",
      "name": "judgeName",
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
      "id": "tournamentId",
      "name": "tournamentId",
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
      "id": "sideAScore",
      "name": "sideAScore",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "sideBScore",
      "name": "sideBScore",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "criteriaScores",
      "name": "criteriaScores",
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
      "id": "notes",
      "name": "notes",
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
    },
    {
      "system": false,
      "id": "reviewedBy",
      "name": "reviewedBy",
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
      "id": "reviewedAt",
      "name": "reviewedAt",
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
      "id": "reviewNotes",
      "name": "reviewNotes",
      "type": "text",
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
  "indexes": [
    "CREATE INDEX `idx_judge_scores_matchId` ON `judge_scores` (`matchId`)",
    "CREATE INDEX `idx_judge_scores_judgeId` ON `judge_scores` (`judgeId`)",
    "CREATE INDEX `idx_judge_scores_tournamentId` ON `judge_scores` (`tournamentId`)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "options": {}
});

  dao.saveCollection(judge_scoresCollection);
  // 8. judges collection
  const judgesCollection = new Collection({
  "id": "judge",
  "name": "judges",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "fullName",
      "name": "fullName",
      "type": "text",
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
      "system": false,
      "id": "wechatId",
      "name": "wechatId",
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
      "id": "phone",
      "name": "phone",
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
      "id": "experience",
      "name": "experience",
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
      "id": "price",
      "name": "price",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "location",
      "name": "location",
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
      "id": "education",
      "name": "education",
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
      "id": "expertise",
      "name": "expertise",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 5000
      }
    },
    {
      "system": false,
      "id": "languages",
      "name": "languages",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 5000
      }
    },
    {
      "system": false,
      "id": "showContactInfo",
      "name": "showContactInfo",
      "type": "bool",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {}
    },
    {
      "system": false,
      "id": "comments",
      "name": "comments",
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
      "id": "judgeTypes",
      "name": "judgeTypes",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 5000
      }
    },
    {
      "system": false,
      "id": "splitVoteFrequency",
      "name": "splitVoteFrequency",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "professionalKnowledgeLevel",
      "name": "professionalKnowledgeLevel",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "persuasionPreference",
      "name": "persuasionPreference",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "argumentationThreshold",
      "name": "argumentationThreshold",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "biasAdjustment",
      "name": "biasAdjustment",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "consensusRevocable",
      "name": "consensusRevocable",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "lateArgumentAcceptance",
      "name": "lateArgumentAcceptance",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "ruleViolationSeverity",
      "name": "ruleViolationSeverity",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "winningCriteria",
      "name": "winningCriteria",
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
      "id": "topicBiasResponse",
      "name": "topicBiasResponse",
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
      "id": "argumentTypePreference",
      "name": "argumentTypePreference",
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
      "id": "judgingCriteria",
      "name": "judgingCriteria",
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
      "id": "status",
      "name": "status",
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
      "id": "rating",
      "name": "rating",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "totalReviews",
      "name": "totalReviews",
      "type": "number",
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
    },
    {
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
    },
    {
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
    },
    {
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

  dao.saveCollection(judgesCollection);
  // 9. matches collection
  const matchesCollection = new Collection({
  "id": "matches",
  "name": "matches",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "tournamentId",
      "name": "tournamentId",
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
      "id": "round",
      "name": "round",
      "type": "text",
      "required": false,
      "presentable": true,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "pattern": ""
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
      "id": "sideAId",
      "name": "sideAId",
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
      "id": "sideBId",
      "name": "sideBId",
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
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 2000
      }
    },
    {
      "system": false,
      "id": "scheduledAt",
      "name": "scheduledAt",
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
      "id": "result",
      "name": "result",
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

  dao.saveCollection(matchesCollection);
  // 10. ratings collection
  const ratingsCollection = new Collection({
  "id": "ratings",
  "name": "ratings",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "userId",
      "name": "userId",
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
      "id": "judgeId",
      "name": "judgeId",
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
      "id": "judgeName",
      "name": "judgeName",
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
      "id": "rating",
      "name": "rating",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": 5,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "review",
      "name": "review",
      "type": "text",
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

  dao.saveCollection(ratingsCollection);
  // 11. registrations collection
  const registrationsCollection = new Collection({
  "id": "registrations",
  "name": "registrations",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "tournamentId",
      "name": "tournamentId",
      "type": "text",
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
      "system": false,
      "id": "teamName",
      "name": "teamName",
      "type": "text",
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
      "system": false,
      "id": "participants",
      "name": "participants",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 5000
      }
    },
    {
      "system": false,
      "id": "wechatId",
      "name": "wechatId",
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
      "id": "contact",
      "name": "contact",
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
      "id": "category",
      "name": "category",
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
      "id": "notes",
      "name": "notes",
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
      "id": "status",
      "name": "status",
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
      "id": "paymentStatus",
      "name": "paymentStatus",
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
      "id": "createdBy",
      "name": "createdBy",
      "type": "relation",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "collectionId": "_pb_users_auth_",
        "cascadeDelete": false,
        "minSelect": null,
        "maxSelect": 1,
        "displayFields": []
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

  dao.saveCollection(registrationsCollection);
  // 12. resources collection
  const resourcesCollection = new Collection({
  "id": "mco8zkzw4z7u6lt",
  "name": "resources",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "cskndmv3",
      "name": "title",
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
      "id": "knycldt5",
      "name": "description",
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
      "id": "stuk6uxc",
      "name": "category",
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
      "id": "vwalhs2d",
      "name": "topic",
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
      "id": "cxkelzqn",
      "name": "file",
      "type": "file",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "mimeTypes": [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain"
        ],
        "thumbs": null,
        "maxSelect": 1,
        "maxSize": 10485760,
        "protected": false
      }
    },
    {
      "system": false,
      "id": "frw5snlr",
      "name": "fileType",
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
      "id": "5pbnalwh",
      "name": "fileSize",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "e52xdyrm",
      "name": "author",
      "type": "text",
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

  dao.saveCollection(resourcesCollection);
  // 13. team_members collection
  const team_membersCollection = new Collection({
  "id": "team_members",
  "name": "team_members",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "registrationId",
      "name": "registrationId",
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
      "id": "tournamentId",
      "name": "tournamentId",
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
      "id": "name",
      "name": "name",
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
      "id": "role",
      "name": "role",
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
      "id": "school",
      "name": "school",
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
      "id": "year",
      "name": "year",
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
      "id": "contact",
      "name": "contact",
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
      "id": "experience",
      "name": "experience",
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
      "id": "isCompeting",
      "name": "isCompeting",
      "type": "bool",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {}
    }
  ],
  "indexes": [
    "CREATE INDEX `idx_team_members_registrationId` ON `team_members` (`registrationId`)",
    "CREATE INDEX `idx_team_members_tournamentId` ON `team_members` (`tournamentId`)"
  ],
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "options": {}
});

  dao.saveCollection(team_membersCollection);
  // 14. timer_projects collection
  const timer_projectsCollection = new Collection({
  "id": "timer_projects",
  "name": "timer_projects",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "name_field",
      "name": "name",
      "type": "text",
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
      "system": false,
      "id": "description_field",
      "name": "description",
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
      "id": "type_field",
      "name": "type",
      "type": "select",
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
      "system": false,
      "id": "duration_field",
      "name": "duration",
      "type": "number",
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
      "system": false,
      "id": "createdBy_field",
      "name": "createdBy",
      "type": "text",
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

  dao.saveCollection(timer_projectsCollection);
  // 15. timers collection
  const timersCollection = new Collection({
  "id": "hst380wy1d9yig6",
  "name": "timers",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "eocdneq4",
      "name": "name",
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
      "id": "v0bb9hln",
      "name": "description",
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
      "id": "jszyumcp",
      "name": "type",
      "type": "select",
      "required": false,
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
      "system": false,
      "id": "gj8qmx02",
      "name": "duration",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "category_field",
      "name": "category",
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
      "id": "bg_field",
      "name": "backgroundColor",
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
      "id": "text_field",
      "name": "textColor",
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
      "id": "public_field",
      "name": "isPublic",
      "type": "bool",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {}
    },
    {
      "system": false,
      "id": "timer_steps_field",
      "name": "timerSteps",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 20000
      }
    },
    {
      "system": false,
      "id": "bg_image_field",
      "name": "backgroundImage",
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
      "id": "author_field",
      "name": "author",
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
      "id": "usage_field",
      "name": "usageCount",
      "type": "number",
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
      "system": false,
      "id": "createdBy_field",
      "name": "createdBy",
      "type": "text",
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
  "deleteRule": null,
  "options": {}
});

  dao.saveCollection(timersCollection);
  // 16. topics collection
  const topicsCollection = new Collection({
  "id": "topics",
  "name": "topics",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "text",
      "name": "text",
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
      "id": "explanation",
      "name": "explanation",
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
      "id": "area",
      "name": "area",
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
      "id": "language",
      "name": "language",
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
      "id": "tournament",
      "name": "tournament",
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
      "id": "ratings",
      "name": "ratings",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 0
      }
    },
    {
      "system": false,
      "id": "averageRating",
      "name": "averageRating",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "noDecimal": false
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

  dao.saveCollection(topicsCollection);
  // 17. tournaments collection
  const tournamentsCollection = new Collection({
  "id": "tournaments",
  "name": "tournaments",
  "type": "base",
  "system": false,
  "schema": [
    {
      "system": false,
      "id": "name",
      "name": "name",
      "type": "text",
      "required": false,
      "presentable": true,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "pattern": ""
      }
    },
    {
      "system": false,
      "id": "title",
      "name": "title",
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
      "id": "description",
      "name": "description",
      "type": "text",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": 5000,
        "pattern": ""
      }
    },
    {
      "system": false,
      "id": "startDate",
      "name": "startDate",
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
      "id": "endDate",
      "name": "endDate",
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
      "id": "registrationDeadline",
      "name": "registrationDeadline",
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
      "id": "date",
      "name": "date",
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
      "id": "location",
      "name": "location",
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
      "id": "type",
      "name": "type",
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
      "id": "status",
      "name": "status",
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
      "id": "price",
      "name": "price",
      "type": "number",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 0,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "teamsize",
      "name": "teamsize",
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
      "id": "organizer",
      "name": "organizer",
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
      "id": "contact",
      "name": "contact",
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
      "id": "category",
      "name": "category",
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
      "id": "image",
      "name": "image",
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
      "id": "totalTeams",
      "name": "totalTeams",
      "type": "number",
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
      "system": false,
      "id": "playersPerTeam",
      "name": "playersPerTeam",
      "type": "number",
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
      "system": false,
      "id": "participationRequirements",
      "name": "participationRequirements",
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
      "id": "registrationLink",
      "name": "registrationLink",
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
      "id": "ruleBookLink",
      "name": "ruleBookLink",
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
      "id": "award",
      "name": "award",
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
      "id": "createdBy",
      "name": "createdBy",
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
      "id": "scoringConfig",
      "name": "scoringConfig",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSize": 10000
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

  dao.saveCollection(tournamentsCollection);

}, (db) => {
  const dao = new Dao(db);

  // Down migration - delete all imported collections
  const collectionsToDelete = [
    "Users", "Wechatlogin", "timers", "timer_projects", "judges",
    "ratings", "registrations", "tournaments", "matches", "form_configs",
    "circuits", "circuit_matches", "judge_scores", "judge_assignments",
    "team_members", "topics", "resources"
  ];

  collectionsToDelete.forEach(collectionName => {
    try {
      const collection = dao.findCollectionByNameOrId(collectionName);
      if (collection) {
        dao.deleteCollection(collection);
      }
    } catch (error) {
      // Collection doesn't exist, continue
    }
  });
})