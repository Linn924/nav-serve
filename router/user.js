const Router = require("koa-router")
const Md5 = require("md5")
const jwt = require("jsonwebtoken")
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const user = new Router() //路由

//登录
user.get('/users',async ctx => {
    const username = ctx.request.query.username.trim()
    const password = Md5(ctx.request.query.password.trim())
    const userdata = {name: username,pwd: password}
    const secret = "LinnCooper"

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT * FROM user where username = '${username}' and password= '${password}'`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.length > 0) {
        ctx.body = {
            code:200,
            tips:'登录成功',
            token:jwt.sign(userdata, secret)
        }
    } else {
        ctx.body = {
            code:400,
            tips:'登录失败',
        }
        
    }
})

module.exports = user