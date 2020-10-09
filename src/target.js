import Wechat from './wechat'

export default class Target {
  //------------------------------------------- 路由
  navigateTo (url, params) {
    params && (url += `?${this.getQueryString(params)}`)
    return Wechat.promiseCall('navigateTo', { url })
  }

  redirectTo (url, params = {}) {
    params && (url += `?${this.getQueryString(params)}`)
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
  /**
   * 拼接查询字符串
   * @param {*} params 参数对象
   */
  getQueryString (params) {
    return Object.keys(params).reduce((total, item) => {
      total += `${item}=${params[item]}&`
      return total
    }, '').slice(0, -1)
  }

  /**
   * 解析查询字符串
   * @param {*} queryStr 字符串
   */
  parseQueryString (queryStr) {
    const list = queryStr.split('&')
    const params = {}
    list.forEach(item => {
      const map = item.split('=')
      params[map[0]] = map[1]
    });
    return params
  }
}