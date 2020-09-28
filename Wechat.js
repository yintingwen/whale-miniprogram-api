export default class Wechat  {
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
    return  (options, ...args) => Wechat.promiseCall(methodName, options, ...args)
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
   * 拼接查询字符串
   * @param {*} params 参数对象
   */
  static getQueryString (params) {
    return Object.keys(params).reduce((total, item) => {
      total += `${item}=${params[item]}&`
      return total
    }, '').slice(0, -1)
  }

  /**
   * 解析查询字符串
   * @param {*} queryStr 字符串
   */
  static parseQueryString (queryStr) {
    const list = queryStr.split('&')
    const params = {}
    list.forEach(item => {
      const map = item.split('=')
      params[map[0]] = map[1]
    });
    return params
  }

  /**
   * 获取图片信息
   * @param {*} url 图片地址
   */
  static getImageInfo (src) {
    return Wechat.promiseCall('getImageInfo', { src })
  }

  /**
   * 登录
   * @param {*} timeout 超时时间
   */
  static login (timeout = 10000) {
    return Wechat.promiseCall('login', { timeout })
  }

  /**
   * laoding
   * @param {*} title 内容
   * @param {*} mask 是否遮罩
   */
  showLoading (title = "加载中", mask = true) {
    return Wechat.promiseCall('showLoading', { title, mask })
  }

  /**
   * 提示信息
   * @param {*} title 信息
   * @param {*} icon 图标
   * @param {*} duration 时长
   * @param {*} mask 遮罩
   */
  showToast (title, icon = 'none', duration = 1500, mask = false) {
    return new Promise((resolve, reject) => {
      wx.showToast({
        title,
        icon,
        duration,
        mask,
        success: resolve,
        fail: reject
      });
    })
  }

  //------------------------------------------- 路由
  navigateTo (url, params = {}) {
    url += `?${Wechat.getQueryString(params)}`
    return Wechat.promiseCall('navigateTo', { url })
  }

  redirectTo (url, params = {}) {
    url += `?${Wechat.getQueryString(params)}`
    return Wechat.promiseCall('redirectTo', { url })
  }

  navigateBack (delta = 1) {
    wx.navigateBack({
      delta
    })
  }



  /**
   * 获取用户地理位置，包含授权
   */
  static async getLocation () {
    await Wechat.getUserAuth('scope.userLocation', '检测到您没打开地理位置权限，是否去设置打开？')
    return Wechat.promiseCall('getLocation', { type: 'gcj02' })
  }

  /**
   * 保存图片, 包含授权
   * @param {*} filePath 
   */
  static async saveImageToPhotosAlbum (filePath) {
    await Wechat.getUserAuth('scope.writePhotosAlbum', '检测到您没打开下载图片功能权限，是否去设置打开？')
    return Wechat.promiseCall('saveImageToPhotosAlbum', { filePath })
  }

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

