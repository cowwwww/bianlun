/// <reference path="../pb_data/types.d.ts" />

/**
 * 微信OAuth登录处理
 * 支持PC扫码登录和手机网页授权
 */

// 微信配置
const WECHAT_CONFIG = {
  appId: 'wx78427a667a2ca948',
  appSecret: '67017e32df837f1fbf68d6eb488d9c87',
};

onBeforeServe((e) => {
  // 处理微信回调 - 获取用户信息并登录/注册
  e.router.post("/api/auth/wechat/callback", (c) => {
    try {
      const data = $apis.requestInfo(c);
      const code = data.data.code;
      
      if (!code) {
        throw new BadRequestError("Missing authorization code");
      }

      console.log("Processing WeChat login with code:", code);

      // 步骤 1: 用code换取access_token
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`;
      
      const tokenRes = $http.send({
        url: tokenUrl,
        method: "GET",
        timeout: 10,
      });
      
      if (tokenRes.statusCode !== 200) {
        console.error("Failed to get access token:", tokenRes.raw);
        throw new BadRequestError("Failed to get WeChat access token");
      }
      
      const tokenData = tokenRes.json;
      console.log("Got access token for openid:", tokenData.openid);
      
      if (tokenData.errcode) {
        console.error("WeChat API error:", tokenData.errmsg);
        throw new BadRequestError(`WeChat API error: ${tokenData.errmsg}`);
      }
      
      const accessToken = tokenData.access_token;
      const openid = tokenData.openid;
      const unionid = tokenData.unionid || "";

      // 步骤 2: 获取用户信息
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;
      
      const userInfoRes = $http.send({
        url: userInfoUrl,
        method: "GET",
        timeout: 10,
      });
      
      if (userInfoRes.statusCode !== 200) {
        console.error("Failed to get user info:", userInfoRes.raw);
        throw new BadRequestError("Failed to get WeChat user info");
      }
      
      const userInfo = userInfoRes.json;
      console.log("Got user info for:", userInfo.nickname);
      
      if (userInfo.errcode) {
        console.error("WeChat user info error:", userInfo.errmsg);
        throw new BadRequestError(`WeChat API error: ${userInfo.errmsg}`);
      }

      // 步骤 3: 查找或创建用户
      const collection = $app.dao().findCollectionByNameOrId("users");
      let record;
      
      try {
        // 尝试通过 openid 查找已存在的用户
        record = $app.dao().findFirstRecordByFilter(
          "users",
          `wechatOpenid = {:openid}`,
          { openid: openid }
        );
        console.log("Found existing user:", record.id);
        
        // 更新用户信息
        record.set("name", userInfo.nickname);
        record.set("avatar", userInfo.headimgurl);
        if (unionid) {
          record.set("wechatUnionid", unionid);
        }
        $app.dao().saveRecord(record);
        
      } catch (e) {
        // 用户不存在，创建新用户
        console.log("Creating new user for openid:", openid);
        
        record = new Record(collection);
        record.set("wechatOpenid", openid);
        record.set("wechatUnionid", unionid);
        record.set("name", userInfo.nickname || "微信用户");
        record.set("avatar", userInfo.headimgurl || "");
        
        // 生成唯一的临时邮箱
        const tempEmail = `wechat_${openid}@arcx.temp`;
        record.set("email", tempEmail);
        record.set("emailVisibility", false);
        
        // 设置随机密码（用户不会使用，因为通过微信登录）
        const randomPassword = $security.randomString(32);
        record.set("password", randomPassword);
        record.set("passwordConfirm", randomPassword);
        
        $app.dao().saveRecord(record);
        console.log("Created new user:", record.id);
      }

      // 步骤 4: 生成认证token
      const token = $security.NewToken(
        record.getId(),
        $app.settings().recordAuthToken.secret,
        $app.settings().recordAuthToken.duration
      );

      // 返回用户信息和token
      return c.json(200, {
        token: token,
        record: record,
        user: {
          id: record.id,
          email: record.get("email"),
          name: record.get("name"),
          avatar: record.get("avatar"),
          wechatOpenid: record.get("wechatOpenid"),
        }
      });

    } catch (error) {
      console.error("WeChat login error:", error);
      return c.json(400, {
        error: error.message || "WeChat login failed"
      });
    }
  });

  // 测试接口 - 验证微信配置
  e.router.get("/api/auth/wechat/config", (c) => {
    return c.json(200, {
      appId: WECHAT_CONFIG.appId,
      configured: true,
      hasSecret: WECHAT_CONFIG.appSecret !== "",
    });
  });
});

