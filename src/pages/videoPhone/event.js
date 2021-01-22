export let life = {
  async created() {
    //预留发websocket的位置  一进页面就发事件  然后等待接收事件
    let isOk = await this.methods('getCode')
    if(isOk){
      this.methods('connectSocketInit')
    }
  },
  async mounted() {
      this.methods('initRtcConfig',{userID :'test001',roomID:888888,template:'1v1'})
      // 获取 rtcroom 实例
      this.trtcComponent = this.$refs['trtcComponent']
      console.log('this.trtcComponent',this.trtcComponent)
      // 监听TRTC Room 关键事件
      this.methods('bindTRTCRoomEvent')
      //基本数据 this.callVideo.input  通话模式等
      Object.getOwnPropertyNames(this.callVideo.input).forEach(key => {

        if (this.callVideo.input[key] === 'true') {
          this.callVideo.input[key] = true;
        }
  
        if (this.callVideo.input[key] === 'false') {
          this.callVideo.input[key] = false;
        }
      });
      this.options = this.callVideo.input;

      await setTimeout(() => {
        this.status = 'success'
        if(this.status==='success'){
          //填入房间号进入房间
          let data = {userID :'test001'}
          this.methods('enterRoomBefore',data)
        }
      }, 1000);
  },
  onShow: function () {
    uni.hideHomeButton()
  },
  // 关闭websocket
	beforeDestroy() {
    this.methods('closeSocket')
	},
};
export let event = {
  async appLoginWx() {
    let isOk = await this.methods('submit'); //手动登陆  会进行微信绑定,也是common/login接口
    if (!isOk) {
      return;
    }
    // 登录成功同样调用系统初始化
    await this.$systemInit();
  },
  //挂断
  hangUpFun(){
    this.$refs.trtcComponent.hangUpFun()
  },
  //语音<->视频
  toggleSoundModeFun(){
    this.$refs.trtcComponent.toggleSoundModeFun(this.callVideo.input.callingMode)
  },
  //翻转镜头
  switchCamera(){
    this.$refs.trtcComponent.switchCamera(this.callVideo.input.cameraMode)
  },
  hiddenPhoneDialog(){
    this.methods('showNumber',false)
    this.methods('showCallConfirm',false)
    //复现视频按钮
    this.$refs.trtcComponent.refreshBtns()
  },
  showNumber(){
    this.methods('showNumber',true)
  },
  toCall(){
    this.methods('showCallConfirm',true)
    this.methods('showNumber',false)
    //隐藏视频操作按钮  防止穿透
    this.$refs.trtcComponent.hiddenBtns()
  },
  cannelCall(){
    this.methods('showCallConfirm',false)
    //复现视频按钮
    this.$refs.trtcComponent.refreshBtns()
  },
  submitCall(){
    this.methods('showCallConfirm',false)
    this.methods('submitCall')
    //退房
    this.$refs.trtcComponent.hangUpFun()
    this.methods('toPage','/pages/callOver/index')
  },
};
export let watch = {};
