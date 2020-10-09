import scopeDictionary from './scope'

export default class Wechat {
  /**
   * 通过promise的方式调用
   * @param {1} methodName 方法名
   * @param {*} options 参数
   */
  static promiseCall (methodName, options, ...args) {
    return new Promise((resolve, reject) => {
      wx[methodName]({
        ...options,
        success: resolve,
        fail: reject
      }, ...args)
    })
  }

  /**
   * 将方法封装为promise
   * @param {*} methodName 方法名称
   */
  static promiseify (methodName) {
    return (options, ...args) => Wechat.promiseCall(methodName, options, ...args)
  }

  /**
   * 校验是否允许某个权限
   * @param {*} auth 权限字段
   */
  static async checkAuth (auth) {
    const setting = await Wechat.promiseCall('getSetting')
    // undefined还未请求授权，true已经允许授权
    return (setting.authSetting[auth] === undefined || setting.authSetting[auth] === true)
  }

  /**
   * 获取用户授权
   * @param {*} scope 范围字段
   * @param {*} content 提示文本内容
   */
  static getUserAuth (scope, content) {
    if (content === undefined) {
      const scopeDesception = scopeDictionary[scope]
      content = `检测到您没打开${scopeDesception}权限，是否去设置打开？`
    }
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope,
        success: resolve,
        fail: () => {
          wx.showModal({
            content,
            success: (result) => {
              if (result.cancel) {
                return reject(new Error('拒绝授权'))
              }
              wx.openSetting({
                success: (result) => {
                  if (result.authSetting[scope] !== true) {
                    return reject(new Error('授权失败'))
                  }
                  resolve()
                },
                fail: reject,
              })
            },
            fail: reject
          })
        }
      })
    })
  }

  /**
   * 更新小程序
   */
  static update () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success (res) {
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

