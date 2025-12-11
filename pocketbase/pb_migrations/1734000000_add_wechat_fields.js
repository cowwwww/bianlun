/// <reference path="../pb_data/types.d.ts" />

/**
 * 添加微信登录所需字段到users集合
 * - wechatOpenid: 微信OpenID (唯一)
 * - wechatUnionid: 微信UnionID
 * - avatar: 用户头像URL
 */

migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("users")

  // 添加 wechatOpenid 字段 (Text, Unique)
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wechat_openid",
    "name": "wechatOpenid",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": true,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // 添加 wechatUnionid 字段 (Text)
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wechat_unionid",
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
  }))

  // 添加 avatar 字段 (URL)
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "user_avatar",
    "name": "avatar",
    "type": "url",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  // 回滚：删除添加的字段
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("users")

  collection.schema.removeField("wechat_openid")
  collection.schema.removeField("wechat_unionid")
  collection.schema.removeField("user_avatar")

  return dao.saveCollection(collection)
})

