const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const connection = require("../../config/db")
connection.connect()

// router.use((req,res,next)=>{
//     if(!req.session.init_auth){
//         res.render("error/clientError",{url:"/",error_message:"ERROR"})
//         return
//     }
//     next()
// })

router.post(
    "/get_address_data",
    (req, res, next) => {
    if(!req.session.user_id){
        res.json({error:true,error_message:"非ログインユーザーです。"})
        return
    }
    const sql = "select count(*) as count from address where user_id = ?"
    connection.query(sql,
        [req.session.user_id],
        (err, result) => {
        if(err){
            res.json({error:true,error_message:"サーバー内部エラー"})
            return
        }
        if(!result[0].count){
            res.json({error:false,existsAddress:false})
            return
        }
        next()
    })
},
    (req, res) => {
        const sql = "select * from address where user_id = ?"
        connection.query(sql,
            [req.session.user_id],
            (err, result) => {
            if(err){
                console.log(err)
                res.json({error:true,error_message:"サーバー内部エラー"})
                return
            }
            res.json({error:false,existsAddress:true,result:result})
            })
    })

router.post("/get_customize_history",(req, res,next) =>{
    const sql = "select front_image_path,id from customize where create_user_id = ? order by id desc"
    connection.query(sql,[req.body.user_id],(err, result) => {
        if(err){
            console.log(err)
            res.render("error/ServerError")
            return
        }
        res.json(result)
    })
})
router.post("/get_order_history",(req, res,next) =>{
    const sql = "select C.front_image_path,C.id from order_data O " +
        "inner join purchase P on O.purchase_id = P.id inner join customize C on C.id = O.customize_id " +
        "where P.user_id = ?;" +
        "select O.customize_id from order_data O " +
        "inner join purchase P on O.purchase_id = P.id " +
        "where customize_id not in (select customize_id from post where user_id = ?) and P.user_id = ? order by O.order_number DESC;"
    connection.query(sql,[req.body.user_id,req.body.user_id,req.body.user_id],(err, result) => {
        if(err){
            console.log(err)
            res.json({error:true})
            return
        }
        let unset = []
        result[1].forEach(items=>{
            unset.push(items.customize_id)
        })
        res.json({error:false,result: result[0],unset:unset})
    })
})

router.post("/get_good_history",
    (req, res) => {
        let json = {"error": false, posts: []}

        const sql =
            "select P.id,P.post_title,P.user_id,A.user_name,C.front_image_path,C.back_image_path,P.created_at" +
            " from post P inner join customize C on P.customize_id = C.id inner join account A on P.user_id = A.id" +
            " where P.deleted_at is null and P.id in (select post_id from good where user_id = ?) order by P.id desc";
        // 投稿とcustomizeを結び付けそのうち削除されていないレコードを10件ページ数に応じて取得
        connection.query(
            sql,
            [req.session.user_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.json({error:true})
                    return
                }
                console.log(result)
                res.json({error:false,posts:result})
            }
        )

    })

module.exports = router;