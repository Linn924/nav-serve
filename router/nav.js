const Router = require("koa-router")
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")
const fs = require("fs")
const path = require("path")
const mime = require('mime-types')

const nav = new Router() //路由

//查询导航
nav.get('/navs',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const [resOne] = await connection.query('SELECT * FROM father_navs')
    const [resTwo] = await connection.query('SELECT * FROM son_one_navs')
    const [resThree] = await connection.query('SELECT * FROM son_two_navs ORDER BY brothersId') 
    connection.end((err) => console.log(err))

    function merge(father,son,key){
        for(let i = 0; i < son.length; i++){
            for(let j = 0; j < father.length; j++){
                if(son[i]['parentsId'] === father[j]['id']){
                    father[j][key] = father[j][key] || []
                    father[j][key].push(son[i])
                }
            }
        }
        return father
    }

    function group(arr){
        let result = [],stack = [-1],i = -1
        arr.forEach(item => {
            let tmp = stack.pop()
            if(tmp !== item.brothersId) i++
            stack.push(item.brothersId)
            if(!result[i]) result[i] = {id:item.brothersId,children:[item]}
            else result[i].children.push(item)  
        })
        return result
    }
    
    var res = merge(merge(resOne,resTwo,'one'),resThree,'two')
    res.forEach((item) => {item.two && (item.two = group(item.two))})

    if (res.length >= 0) {
        ctx.body = {
            data:res,
            code:200,
            tips:'查询成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'查询失败'
        }
    }
    
})

//添加导航
nav.post('/navs',async ctx => {
    const parentsId = ctx.request.body.parentsId
    const brothersId = ctx.request.body.brothersId
    const logo = ctx.request.body.logo.trim()
    const name = ctx.request.body.name.trim()
    const title = ctx.request.body.title.trim()
    const url = ctx.request.body.url.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO son_two_navs (parentsId,brothersId,logo,name,title,url) VALUE
                 (${parentsId}, ${brothersId},'${logo}', '${name}', '${title}', '${url}')`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'添加成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'添加失败'
        }
    }
    
})

//修改导航
nav.put('/navs',async ctx => {
    const id = ctx.request.body.id
    const logo = ctx.request.body.logo.trim()
    const name = ctx.request.body.name.trim()
    const title = ctx.request.body.title.trim()
    const url = ctx.request.body.url.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE son_two_navs set logo='${logo}', name='${name}',title='${title}',url='${url}' WHERE id=${id}`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'修改成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'修改失败'
        }
    }
})

//删除导航
nav.delete('/navs',async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM son_two_navs WHERE ?? = ?`
    const [res] = await connection.query(sql, ["id", id])
    connection.end((err) => console.log(err))
    
    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'删除成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'删除失败'
        }
    }
})

//查询图片
nav.get('/images/:id', async ctx =>{
    const id = ctx.params.id
    const filePath = path.join(__dirname, `../images/${id + '.png'}`)
    const file = fs.readFileSync(filePath)
    let mimeType = mime.lookup(filePath)
	ctx.set('content-type', mimeType)
    ctx.body = file	
})

module.exports = nav