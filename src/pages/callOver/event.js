export let life = {
  async created() {
    //预留发websocket的位置  一进页面就发事件  然后等待接收事件
  },
  async mounted() {
  }
};
export let event = {
  toBack(){
    uni.switchTab({
      url: '/pages/videoPhone/index',
      fail: e=>{
        uni.navigateTo({
          url:'/pages/videoPhone/index'
        })
      }
    })
  }
};
export let watch = {};
