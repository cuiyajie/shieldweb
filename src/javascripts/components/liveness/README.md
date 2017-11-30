### 活体检测JS SDK

活体检测JS SDK是一套封装了UI的用来进行活体检测和静默活体检测的package，SDK用来请求公有云主要有两种方式。

```javascript
//用户部署自己的server层，安全
const liveness = new Liveness({
  host: HOST
})

```

#### Liveness的静态属性

##### isAvailable

判断当前浏览器是否支持活体检测功能，目前采用的方式是根据测试结果采用黑名单的方式实现

```javascript
if (Liveness.isAvailable) {
  // do something about calling liveness check
} else {
  // alert unsupport message
}
```

#### 在构建liveness对象时有以下几个参数

##### host

客户为了安全在客户端和公有云之间部署的代理地址 

##### action （可选）

活体检测需要指定某一个活体检测的动作，配置参数为以下枚举对象中的一个值。如果同时配置action和silent，则该配置将被覆盖，进行静默活体检测。

``` javascript
export const livenessEnum = {
  BLINK: 0,
  MOUTH: 1,
  YAW: 2
};
```
##### silent （可选）

静默活体检测时配置为true，如果非静默活体检测则无需配置。如果同时配置action和silent，则进行静默活体检测

``` javascript
silent: true
```

##### silentBase64 （可选）

当进行静默活体检测时，设置为true可返回base64编码的图片文件

``` javascript
silentBase64: true
```

##### onChecked(data)

活体与hack检测通过之后的回调函数

回调函数的参数data的属性样例

``` javascript
livenessCallbackData = {

  video_file: File // 返回上传的视频文件

  passed: Boolean  //活体检测是否通过

  hackPassed: Boolean //后端防hack时候通过

  feature_image_id: String //视频检测出活体的关键帧在云端的id

  // 该属性为指定动作活体检测结果
  motions: {
    [
      motion: String //活体检测的指定动作
      score: Number //活体检测算法评分
      passed: Boolean //是否通过活体检测
    ]
  },
  
  // 该属性为静默活体检测结果
  liveness_score: Number //静默活体检测评分
  base64_feature_image: String //静默活体检测返回关键帧的base64编码

  score: Number //后端防hack的算法得分
}
```


##### beforeCheck(data)

上传公有云之前执行


##### onError(msg)

请求失败时返回的信息

#### liveness对象的方法

##### show

显示活体检测UI组件

##### hide

隐藏活体检测UI组件 


#### nginx proxy解决方案示例

```
location = /liveness/check_liveness {
  set $args api_id=[api_id]&api_secret=[api_secret];
  proxy_pass http://106.14.249.117/liveness/check_liveness;
}

location = /hackness/selfie_hack_detect {
  set $args api_id=[api_id]&api_secret=[api_secret];
  proxy_pass http://106.14.249.117/hackness/selfie_hack_detect;
}

location ~ ^/liveness/liveness_image(.*)$ {
  proxy_pass http://106.14.249.117/liveness/liveness_image$1?api_id=[api_id]&api_secret=[api_secret];
}
```