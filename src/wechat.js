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
}

