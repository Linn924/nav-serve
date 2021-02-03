(async function run(){
    const Koa = require('koa')
    const Static = require('koa-static-cache')
    const Router = require('koa-router')
    const cors = require('koa2-cors')
    const koaBody = require('koa-body')
    const jwt = require("jsonwebtoken")

    const app = new Koa()
    const router = new Router()

    app.use(koaBody({ multipart: true }))
    app.use(cors())
    app.use(Static("./static", { 
        prefix: "/static",
        gzip: true,
    }))
    
    app.use(async (ctx, next) => { 
        const token = ctx.headers.authorization
        const method = ctx.request.method
        const url = method !== 'DELETE' ? ctx.request.url : ctx.request.url.split('?')[0]
        const one = method === 'GET'
        const two = method !== 'GET' && (url === '/navs')

        if(one) return await next()
        if(two && token === 'null') {
          return ctx.body = {
              code: 444,
              tips: "该功能只有登录用户可以使用",
            }
        }
        if(two && token !== 'null'){   
            let flag = false
            jwt.verify(token, 'LinnCooper', async (error, decoded) => {
                if (!decoded) {
                    flag = true
                    return ctx.body = {
                        code: 445,
                        tips: "token无效",
                    }
                }
            })
            if(!flag){
                return await next()
            }
        }
      })

    const nav = require("./router/nav.js")
    const user = require("./router/user.js")
    
    app.use(nav.routes())
    app.use(user.routes())
    app.use(router.routes())

    app.listen(0925, () => {
        console.log('serve is running')
    })

})()