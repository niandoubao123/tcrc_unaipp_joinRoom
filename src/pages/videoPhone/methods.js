import { genTestUserSig } from '../../libs/debug/GenerateTestUserSig.js'
export default class {
  showNumber(val){
    this.phoneDialog = val
  }
  showCallConfirm(val){
    this.callConfirmDialog = val
  }
  initRtcConfig(data){
    data.template = data.template
    data.roomID = data.roomID
    data.userID = data.userID
    console.log('* room enterRoom','走进来99999999', data)

    const Signature = genTestUserSig(data.userID)
    data.sdkAppID = Signature.sdkAppID
    data.userSig = Signature.userSig
    this.template = data.template


    this.playVidoe.input.rtcConfig = {
      sdkAppID: data.sdkAppID, // 您的实时音视频服务创建应用后分配的 sdkAppID
      userID: data.userID,
      roomID : data.roomID,
      userSig: data.userSig,
      template: data.template, // 1v1 grid custom
      debugMode: data.debugMode, // 非必要参数，打开组件的调试模式，开发调试时建议设置为 true
      beautyLevel: 9, // 默认开启美颜
      enableIM: false, // 可选，仅支持初始化设置（进房前设置），不支持动态修改
      audioVolumeType: data.audioVolumeType,
    }
  }
  submitCall(){
    uni.makePhoneCall({
      // 手机号
      phoneNumber: this.phone, 
      // 成功回调
      success: (res) => {
        console.log('调用成功!')	
      },
      // 失败回调
      fail: (res) => {
        console.log('调用失败!')
      }
    });
  }
  async enterRoomBefore(){
    let isOk = await this.methods('checkDeviceAuthorize')
    if(isOk){
      //近房间
      let data = {
        roomID:this.playVidoe.input.rtcConfig.roomID,
        userID:this.playVidoe.input.rtcConfig.userID,
        template:this.callVideo.input.template,
        debugMode:this.callVideo.input.debugMode,
        cloudenv:this.callVideo.input.cloudenv,
      }
      this.methods('enterRoom',data)
    }else{
      console.log('出错')
    }
  }
  async checkDeviceAuthorize(){
    let isOk = false
    this.hasOpenDeviceAuthorizeModal = false
    await new Promise((resolve, reject) => {
      if (!uni.getSetting || !uni.getSetting()) {
        // 微信测试版 获取授权API异常，目前只能即使没授权也可以通过
        resolve()
      }
      uni.getSetting().then((result)=> {
        // console.log('getSetting', result[1])
        this.authorizeMic = result[1].authSetting['scope.record']
        this.authorizeCamera = result[1].authSetting['scope.camera']
        if (result[1].authSetting['scope.camera'] && result[1].authSetting['scope.record']) {
          // 授权成功
          isOk = true
          resolve()
        } else {
          // 没有授权，弹出授权窗口
          // 注意： uni.authorize 只有首次调用会弹框，之后调用只返回结果，如果没有授权需要自行弹框提示处理
          console.log('getSetting 没有授权，弹出授权窗口', result)
          uni.authorize({
            scope: 'scope.record',
          }).then((res)=>{
            console.log('authorize mic', res)
            this.authorizeMic = true
            if (this.authorizeCamera) {
              resolve()
            }
          }).catch((error)=>{
            console.log('authorize mic error', error)
            this.authorizeMic = false
          })
          uni.authorize({
            scope: 'scope.camera',
          }).then((res)=>{
            console.log('authorize camera', res)
            this.authorizeCamera = true
            if (this.authorizeMic) {
              resolve()
            } else {
              this.openConfirm()
              reject(new Error('authorize fail'))
            }
          }).catch((error)=>{
            console.log('authorize camera error', error)
            this.authorizeCamera = false
            this.openConfirm()
            reject(new Error('authorize fail'))
          })
        }
      })
    })
    return isOk
  }
  enterRoom(data) {
    data.template = data.template
    data.roomID = data.roomID
    data.userID = data.userID
    console.log('组建所在页面进房enterroom', data)

    const Signature = genTestUserSig(data.userID)
    data.sdkAppID = Signature.sdkAppID
    data.userSig = Signature.userSig
    this.template = data.template
    if (data.template === 'grid') {
    } else {
      this.playVidoe.input.rtcConfig = {
        sdkAppID: data.sdkAppID, // 您的实时音视频服务创建应用后分配的 sdkAppID
        userID: data.userID,
        userSig: data.userSig,
        template: data.template, // 1v1 grid custom
        debugMode: data.debugMode, // 非必要参数，打开组件的调试模式，开发调试时建议设置为 true
        beautyLevel: 9, // 默认开启美颜
        enableIM: false, // 可选，仅支持初始化设置（进房前设置），不支持动态修改
        audioVolumeType: data.audioVolumeType,
      }
    }
    this.trtcComponent.enterRoom({ roomID: data.roomID }).then(()=>{
      
      console.log('HDFH11111111111111111111111111111',data)
      
      if (this.template === '1v1') {
        // 设置推流端视窗的坐标和尺寸
        console.log('HDFH',data)
        this.trtcComponent.setViewRect({
          userID: data.userID,
          xAxis: '480rpx',
          yAxis: '160rpx',
          width: '240rpx',
          height: '320rpx',
        })
      }
    }).catch((res)=>{
      console.error('组建所在页面 进房失败:', res)
    })
  }

  bindTRTCRoomEvent() {
    const TRTC_EVENT = this.trtcComponent.EVENT
    this.timestamp = []
    // 初始化事件订阅
    this.trtcComponent.on(TRTC_EVENT.LOCAL_JOIN, (event)=>{
      // console.log('* room LOCAL_JOIN', event)
      // 进房成功，触发该事件后可以对本地视频和音频进行设置
      if (this.options.localVideo === true || this.options.template === '1v1') {
        this.trtcComponent.publishLocalVideo()
      }
      if (this.options.localAudio === true || this.options.template === '1v1') {
        this.trtcComponent.publishLocalAudio()
      }
      if (this.callVideo.input.template === 'custom') {
        this.trtcComponent.setViewRect({
          userID: event.userID,
          xAxis: '0rpx',
          yAxis: '0rpx',
          width: '240rpx',
          height: '320rpx',
        })
      }
    })
    this.trtcComponent.on(TRTC_EVENT.LOCAL_LEAVE, (event)=>{
      console.log('* room LOCAL_LEAVE', event)
    })
    this.trtcComponent.on(TRTC_EVENT.ERROR, (event)=>{
      console.log('* room ERROR', event)
    })
    // 远端用户进房
    this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_JOIN, (event)=>{
      console.log('组件所在页面  远端用户进房', event, this.trtcComponent.getRemoteUserList())
      this.timestamp.push(new Date())
      // 1v1视频通话时限制人数为两人的简易逻辑，建议通过后端实现房间人数管理
      // 2人以上同时进行通话请选择网格布局
      if (this.template === '1v1' && this.timestamp.length > 1) {
        const interval = this.timestamp[1] - this.timestamp[0]
        if (interval < 1000) {
          // 房间里已经有两个人
          this.setData({
            showTipToast: true,
          }, () => {
            setTimeout(()=>{
              this.setData({
                showTipToast: false,
              })
              wx.navigateBack({
                delta: 1,
              })
            }, 4000)
          })
        }
      }
    })
    // 远端用户退出
    this.trtcComponent.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event)=>{
      console.log('组件所在页面  远端用户退出', event, this.trtcComponent.getRemoteUserList())
      //跳转到感谢致电页面
      this.methods('toPage','/pages/callOver/index')
      if (this.template === '1v1') {
        this.timestamp = []
      }
      if (this.template === '1v1' && this.remoteUser === event.data.userID) {
        this.remoteUser = null
      }
    })
    // 远端用户推送视频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event)=>{
      console.log('组件所在页面  远端用户推送视频', event, this.trtcComponent.getRemoteUserList())
      // 订阅视频
      const userList = this.trtcComponent.getRemoteUserList()
      const data = event.data
      if (this.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
        // 1v1 只订阅第一个远端流
        this.remoteUser = data.userID
        this.trtcComponent.subscribeRemoteVideo({
          userID: data.userID,
          streamType: data.streamType,
        })
      } else {
        // if (!this.data.subscribeList[data.userID + '-video']) {
        this.trtcComponent.subscribeRemoteVideo({
          userID: data.userID,
          streamType: data.streamType,
        })
        // 标记该用户已首次订阅过
        this.data.subscribeList[data.userID + '-video'] = true
        // }
      }
      if (this.template === 'custom' && data.userID && data.streamType) {
        let index = userList.findIndex((item)=>{
          return item.userID === data.userID
        })
        index++
        const y = 320 * index + 160
        // 设置远端视图坐标和尺寸
        this.trtcComponent.setViewRect({
          userID: data.userID,
          streamType: data.streamType,
          xAxis: '480rpx',
          yAxis: y + 'rpx',
          width: '240rpx',
          height: '320rpx',
        })
      }
    })
    // 远端用户取消推送视频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event)=>{
      console.log('组件所在页面  远端用户取消推送视频', event, this.trtcComponent.getRemoteUserList())
    })
    // 远端用户推送音频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event)=>{
      console.log('组件所在页面  远端用户推送音频', event, this.trtcComponent.getRemoteUserList())
      // 订阅音频
      const data = event.data
      if (this.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
        this.remoteUser = data.userID
        this.trtcComponent.subscribeRemoteAudio({ userID: data.userID })
      } else {
        // if (!this.data.subscribeList[data.userID + '-audio']) {
        this.trtcComponent.subscribeRemoteAudio({
          userID: data.userID,
        })
        // 标记该用户已首次订阅过
        this.data.subscribeList[data.userID + '-audio'] = true
        // }
      }
    })
    // 远端用户取消推送音频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event)=>{
      console.log('组件所在页面  远端用户取消推送音频', event, this.trtcComponent.getRemoteUserList())
    })
    // this.trtcComponent.on(TRTC_EVENT.LOCAL_NET_STATE_UPDATE, (event)=>{
    //   console.log('* room LOCAL_NET_STATE_UPDATE', event)
    // })
    // this.trtcComponent.on(TRTC_EVENT.REMOTE_NET_STATE_UPDATE, (event)=>{
    //   console.log('* room REMOTE_NET_STATE_UPDATE', event)
    // })
    this.trtcComponent.on(TRTC_EVENT.IM_READY, (event)=>{
      console.log('* room IM_READY', event)
    })
    this.trtcComponent.on(TRTC_EVENT.IM_MESSAGE_RECEIVED, (event)=>{
      console.log('* room IM_MESSAGE_RECEIVED', event)
    })
  }

  toPage(url){
    uni.switchTab({
      url: url,
      fail: e=>{
        uni.navigateTo({
          url:url
        })
      }
    })
  }

  // websocket
  async connectSocketInit() {
    console.log('创建websocket')
    let isOK = false
    let _this = this
    // 创建一个this.socketTask对象   发送、接收、关闭
    this.socketTask = uni.connectSocket({
      //webSocket url地址
      url: "ws://172.16.2.36:8080/client",
      success(data) {
        console.log(data)
        _this.isSockedtask = true
        console.log("websocket连接成功");
      },fail(data){
        console.log("websocket连接失败");
        console.log(data)
      }
    });
    // 发送,接收须在正常连接打开中
    this.socketTask.onOpen((res) => {
      console.log("WebSocket连接正常打开中...！");
      this.is_open_socket = true;
      // 接收数据
      let data = {
        "taskId":randomStr(10),
        'parkingId':"xxx",
        "channelId":'123',
        "openId":this.code
      };
      this.socketTask.onMessage((res) => {
        console.log('接受数据',res)
        isOK = true
        let data = JSON.parse(res.data)
        if(data.code=='200'){
          this.status = 'success'
          //假设收到房间号  
        }
        console.log(data)
      });
      this.socketTask.send({
        data: JSON.stringify(data),
        async success() {
          console.log("消息发送成功");
        },
      });
    })
    // 这里仅是事件监听【如果socket关闭了会执行】
    this.socketTask.onClose(() => {
      console.log("已经被关闭了")
      // this.methods('connectSocketInit')
    })
    return isOK
  }
  // 关闭websocket【离开这个页面的时候执行关闭】
  closeSocket() {
    this.socketTask.close({
      success(res) {
        this.is_open_socket = false;
        console.log("关闭成功", res)
      },
      fail(err) {
        console.log("关闭失败", err)
      }
    })
  }
  //获取code
  async getCode(){
    let isOk = false
    let that = this
    await new Promise(async r => {
      uni.login({
        provider: 'weixin',
        success: function (res) {
          console.log('想拿code',res.code);
          that.code = res.code
          isOk = true
          r()
        }
      }); 
    })
  // await new Promise(async r => {
  //   uni.login({
  //     provider: 'weixin',
  //     success: function(res) {
  //       let appid = '你的appId'
  //       let secret = '你的appSecret'
  //       let url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' +
  //             res.code + '&grant_type=authorization_code';
  //       uni.request({
  //         url: url, // 请求路径
  //         success: result => {
  //             console.info('想拿openid',result.data.openid);
  //             that.openId = result.data.openid
  //             r()
  //           },
  //         });
  //       }
  //   });
  // })
    return isOk
  }
}

let randomStr = (len) => {
	let str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let result = "";
	while(len) {
		let index = Math.floor(Math.random() * str.length);
		result += str[index];
		--len;
	}
	return result;
}
