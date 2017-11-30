# Web端金融demo

## Demo

Web端金融demo是用来在web端展示公有云接口，主要包括认证比对接口，活体检测，后端hack检测等。

Demo的部署主要包括两个方面，首先是客户端web页面的部署，这部分使用了nginx作为服务器，部署按一下步骤进行。其次，Demo在客户端和公有云之间加了一个Proxy层，用来封装apiId和apiSecret。

首先安装所有依赖包
```
npm install
```

在开发环境中，开启本地server
```
npm start
```
开启本地proxy
```
node server/proxy.js [本地host] [Domain list]
```

在正式环境中，部署web层
```
npm run production

sudo nginx -s reload
```

部署proxy层
```
node server/proxy.js [正式host] [正式domain list]
```

部署JSSDK
```
npm run liveness
rsync -avz public/ [production server host]
```


### 活体检测JS SDK

活体检测JS SDK是一套封装了UI的用来进行活体检测的package，SDK用来请求公有云主要有两种方式。

```javascript
//用户部署自己的server层，安全
const liveness = new Liveness({
  host: HOST
})

//用户直接用apiId和apiSecret进行认证，有暴露apiId和apiSecret的风险
const liveness = new Liveness({
  apiId: API_ID,
  apiSecret: API_SECRET,
})
```

#### 在构建liveness对象时有以下几个参数

##### host

客户为了安全在客户端和公有云之间部署的代理地址  //该参数和apiId, apiSecret必须提供其一

##### apiId

客户的apiId //与apiSecret配合使用

##### apiSecret

客户的apiSecret //与apiId配合使用

##### onChecked(data)

活体与hack检测通过之后的回调函数

回调函数的参数data的属性样例

``` javascript
livenessCallbackData = {

  passed: Boolean  //活体检测是否通过

  hackPassed: Boolean //后端防hack时候通过

  feature_image_id: String //视频检测出活体的关键帧在云端的id

  liveness_video_id: String //活体视频在云端的id

  motions: {
    [
      motion: String //活体检测的指定动作
      score: Number //活体检测算法评分
      passed: Boolean //是否通过活体检测
    ]
  },

  score: Number //后端防hack的算法得分
}
```

##### onError(msg)

请求失败时返回的信息

#### liveness对象的方法

##### show

显示活体检测UI组件

##### hide

隐藏活体检测UI组件 




# 邀请码后台

Web端和App端金融demo后端，包括验证免费次数，是否过期，是否请求允许的公有云接口。

# /invitation_code_auth
>
* [1.接口描述](#1)
* [2.请求参数](#2)
* [3.返回参数](#3)
* [4.错误码](#4)

<h2 id="1">1.接口描述</h2>

检查邀请码是否有效


#### 请求方式

> POST


<h2 id="2">2.请求参数</h2>

| 字段           | 类型     | 必需 | 描述 |
|---------------|----------|-----|-----|
| **invitation_code**  | *string* | 是  | 验证码|
| **platform_type**  | *number* | 是  | 平台类型|
| **token**  | *string* | (app端可选，web端不需要)  | 校验邀请码使用次数 |

> platform_type参数 Web `1`,  App `2`二选一。

> token参数标识了这台设备是否已经登录过，如果正确传递这个参数邀请码将不会减少这个邀请码的使用次数。


<h2 id="3">3.返回参数</h2>

#### 正常响应

| 字段 | 类型 | 说明 |
|------|------|-------|
| **status** | *string* | 状态，正常为 `OK` |
| **invitation_code** | *string* |  通过检测的邀请码  |
| **token** | *string* | 用户唯一标识 |

#### 返回样例

```json
{
  "status": "ok",
  "invitation_code": "item",
  "token": "b745d45aa55b18c805a4557cffa7c520080eafa94d180a1aa7521cefd69395b4"
}
```

<h2 id="4">4.错误码</h2>


| 状态码 | `status` 字段                | 说明            |
|--------|------------------------------|-----------------|
| `400`  | PROXY_INVALID_ARGUMENT             | 无效的邀请码，具体原因见 `message` 字段内容， 错误信息见 `text`  |
| `401`  | PROXY_KEY_EXPIRED                  | 验证码过期，具体情况见 `message` 字段内容， 错误信息见 `text` |
| `403`  | PROXY_ARGUMENTS_ERROR                 | 请求的参数字段错误，具体情况见 `message` 字段内容， 错误信息见 `text`       |
| `403`  | PROXY_UNAUTHORIZED                 | 邀请码验证失败，具体情况见 `message` 字段内容， 错误信息见 `text`      |
| `403`  | PROXY_COUNT_LIMIT_EXCEEDED          | 免费调用次数已用完，具体情况见 `message` 字段内容， 错误信息见 `text` |
| `500`  | PROXY_INTERNAL_ERROR               | 服务器内部错误，具体情况见 `message`， 错误信息见 `text` |

错误信息对应的`text`和`messgae`
```json
   "PROXY_ARGUMENTS_ERROR": {
      "status": "PROXY_ARGUMENTS_ERROR",
      "message": "Arguments error",
      "text": "请求的参数字段错误，您可拨打010-52725617与我们联系"
    },
    "PROXY_UNAUTHORIZED": {
      "status": "PROXY_UNAUTHORIZED",
      "message": "Token unauthorized",
      "text": "邀请码验证失败，您可拨打010-52725617与我们联系"
    },
    "PROXY_KEY_EXPIRED": {
      "status": "PROXY_KEY_EXPIRED",
      "message": "Token expired",
      "text": "邀请码已到期，请联系010-52725617申请新邀请码"
    },
    "PROXY_COUNT_LIMIT_EXCEEDED": {
      "status": "PROXY_COUNT_LIMIT_EXCEEDED",
      "message": "Free counts have used up",
      "text": "邀请码试用次数已用完，请联系010-52725617申请新邀请码"
    },
    "PROXY_INTERNAL_ERROR": {
      "status": "PROXY_INTERNAL_ERROR",
      "message": "Proxy server error",
      "text": "服务器内部错误，请稍后再试"
    },
    "PROXY_VERIFIED": {
      "status": "PROXY_VERIFIED_ERROR",
      "message": "Proxy verified error"
    },
    "NOT_FOUND": {
      "status": "NOT_FOUND",
      "message": "Path error",
      "text": "请求路径错误"
    }
```

# /reset_verify

<h2 id="1">1.接口描述</h2>

将`ASDF`邀请码置为审核中或者审核完


#### 请求方式

> GET

<h2 id="2">2.请求参数</h2>

| 字段           | 类型     | 必需 | 描述 |
|---------------|----------|-----|-----|
| **verify**  | *number* | 是  | 置为的类型|

verify是`1`的时候 ASDF 可以使用 `2` 的时候无法使用

#### 返回样例

```json
{
  "lastVerify": 1,
  "isVerify": 1
}
```