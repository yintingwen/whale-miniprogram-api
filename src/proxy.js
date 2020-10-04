import Target from './target'
import Wechat from './wechat'
import asyncMethod from './asyncMethod'
import authMethod from './authMethod'

const proxyInstance = new Proxy(new Target, {
  get (target, key) {
    // 返回已有方法
    if (target[key]) {
      return target[key]
    }

    // 新建授权方法
    const authMehodInfo = authMethod[key]
    if (authMehodInfo) {
      target[key] = async (options, params) => {
        await Wechat.getUserAuth(authMehodInfo.scope, `检测到您没打开${authMehodInfo.description}权限，是否去设置打开？`)
        return Wechat.promiseCall(key, options, params)
      }
      return target[key]
    }

    // 新建异步方法
    if (asyncMethod.includes(key)) {
      target[key] = Wechat.promiseify(key)
      return target[key]
    }

    // 返回原始同步方法
    return wx[key]
  }
})

export default proxyInstance