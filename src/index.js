import Target from './target'
import Wechat from './wechat'
import asyncMethod from './asyncMethod'
import authMethod from './authMethod'


const proxyInstance = new Proxy(new Target, {
  get (target, key) {
    // 返回已创建方法
    if (target[key]) {
      return target[key]
    }

    // 新建授权方法返回
    const methodScope = authMethod[key]
    if (methodScope) {
      target[key] = async (options, params) => {
        await Wechat.getUserAuth(methodScope)
        return Wechat.promiseCall(key, options, params)
      }
      return target[key]
    }

    // 新建异步方法返回
    if (asyncMethod.includes(key)) {
      target[key] = Wechat.promiseify(key)
      return target[key]
    }

    // 返回Wechat静态方法
    if (Wechat[key]) {
      return Wechat[key]
    }

    // 返回原始同步方法
    return wx[key]
  }
})

export default proxyInstance