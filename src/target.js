import Wechat from './wechat'

export default class Target {
  //------------------------------------------- 路由
  navigateTo (url, params) {
    params && (url += `?${Wechat.getQueryString(params)}`)
    return Wechat.promiseCall('navigateTo', { url })
  }

  redirectTo (url, params = {}) {
    params && (url += `?${Wechat.getQueryString(params)}`)
    return Wechat.promiseCall('redirectTo', { url })
  }

  navigateBack (delta = 1) {
    wx.navigateBack({
      delta
    })
  }

  switchTab (url) {
    return Wechat.promiseCall('switchTab', { url })
  }

  //------------------------------------------- 其他
  update () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('res.hasUpdate====')
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success (res) {
              console.log('success====', res)
              // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
        updateManager.onUpdateFailed(() => {
          // 新的版本下载失败
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
          })
        })
      }
    })
  }
}