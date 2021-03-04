const express = require('express');
const router = express.Router();
const htmlspecialchars = require("htmlspecialchars")
const ng_word = require("../util/NG_WORD_LIST")

const mysql = require('mysql');
//MySQL接続設定
//MySQL接続設定
const connection = require("../../config/db")//接続処理


//接続処理
connection.connect()
// router.use((req,res,next)=>{
//     if(!req.session.init_auth){
//         res.render("error/clientError",{url:"/",error_message:"ERROR"})
//         return
//     }
//     next()
// })

router.post("/get_timeline",
    (req, res) => {

        const sql = "select max(id) as page_max from post;" +
            "select P.id,P.post_title,P.user_id,A.user_name,C.front_image_path,C.back_image_path,P.created_at" +
            " from post P inner join customize C on P.customize_id = C.id inner join account A on P.user_id = A.id" +
            " where P.deleted_at is null order by P.id desc";
        // 投稿とcustomizeを結び付けそのうち削除されていないレコードを10件ページ数に応じて取得
        connection.query(
            sql,

            (err, result) => {
                if (err) {
                    console.log(err)

                    res.json({error:true})
                    return
                }

                res.json({error:false,posts:[result[1]]})
            }
        )

    })

router.post("/get_status",
    (req, res, next) => {
        let json_data = {error: false}


        const sql = "select C.id,P.post_title,P.customize_id,P.post_content,P.user_id,C.front_image_path,C.back_image_path,P.created_at,A.user_name " +
            "from post P " +
            "inner join customize C on C.id = P.customize_id " +
            "inner join account A on A.id = P.user_id " +
            "where P.id = ? and P.deleted_at is null;"+
            "select count(*) as count from good where user_id = ? and post_id = ?"
        const post_id = parseInt(req.body.post_id)
        connection.query(sql,
            [post_id,req.session.user_id,post_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    json_data.error = true
                    res.json(json_data)
                    return
                }
                json_data.result = result[0][0]
                json_data.good_flag = result[1][0].count
                res.json(json_data)
            })
    })

router.post("/get_user_data",
    (req, res) => {
        //const page = parseInt(req.body.page);
        const user_id = parseInt(req.body.user_id)

        const sql = "select P.id,P.post_title,P.user_id,A.user_name,C.front_image_path,C.back_image_path" +
            " from post P inner join customize C on P.customize_id = C.id inner join account A on P.user_id = A.id" +
            " where P.deleted_at is null and P.user_id = ? order by P.id DESC";
        // 投稿とcustomizeを結び付けそのうち削除されていないレコードを10件ページ数に応じて取得
        connection.query(
            sql,
            [user_id],
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

router.post("/good",
    (req, res, next) => {
        if (!req.session.user_id) {
            res.json({error: true})
            return
        }
        const post_id = parseInt(req.body.post_id)
        const sql = "select count(*) as count from good where user_id = ? and post_id = ?"
        connection.query(sql,
            [req.session.user_id, post_id],
            (err, result) => {
                if (err) {
                    console.error(err)
                    res.json({error: true})
                    return
                }
                if (result[0].count) {
                    const sql = "delete from good where user_id = ? and post_id = ?"
                    connection.query(sql,[req.session.user_id,post_id],(err1,result1)=>{
                        if(err1){
                            console.log(err1)
                            res.json({error:true})
                            return
                        }
                        res.json({error: false, status:0})
                    })
                    return
                }
                next()
            })
    }, (req, res, next) => {
        const sql = "insert into good(user_id,post_id) value(?,?)"
        const post_id = parseInt(req.body.post_id)
        connection.query(sql,
            [req.session.user_id, post_id],
            (err) => {
                if (err) {
                    console.error(err)
                    res.json({error: true})
                    return
                }
                next()
            })
    }, (req, res) => {
        const sql = "update post set good_count = good_count + 1 where id = ?"
        connection.query(sql,
            [parseInt(req.body.post_id)],
            (err, result) => {
                if (err) {
                    console.error(err)
                    res.json({error: true})
                    return
                }
                res.json({error: false, flag: false, status:1})
            })
    })

router.post("/get_comment",
    (req, res, next) => {
        const post_id = req.body.post_id
        const sql = "select R.reply_content,A.user_name,R.created_at from reply R inner join account A on R.user_id = A.id where post_id = ?"
        connection.query(sql, [post_id], (err, result) => {
            if (err) {
                console.log(err)
                res.json({error: true})
                return
            }
            res.json({error: false, result: result})
        })
    })

router.post("/post_comment", (req, res, next) => {
    if (!req.session.user_id) {
        res.json({error: true})
        return
    }
    const sql = "insert into reply(post_id,reply_content,user_id) value(?,?,?)"
    const post_id = parseInt(req.body.post_id)
    const reply_content = htmlspecialchars(req.body.reply_content)
    // 余裕あったらここでNGワード系排除
    if(ng_word(reply_content)){
        res.json({error:true,ng_word:true})
        return
    }
    connection.query(sql,
        [post_id, reply_content, req.session.user_id],
        (err, result) => {
            if (err) {
                console.log(err)
                res.json({error: true})
                return
            }
            res.json({error: false})
        })
})

router.post("/get_ranking", (req, res) => {
    let limit = 3


    const sql = `select count(*),
    P.id as 'post_id',
    P.post_title,
    C.id as 'customize_id',
    C.front_image_path ,
    A.user_name 
    from good G 
    inner join post P on G.post_id = P.id 
    inner join customize C on C.id = P.customize_id 
    inner join account A on P.user_id = A.id 
    group by post_id 
    order by count(*) desc limit ?`;
    connection.query(sql,[limit],(err, result) => {
        if (err){
            res.json({error:true,message:err})
            return
        }
        res.json({error:false,result:result})
    })
})

router.post("/get_ranking_sns", (req, res) => {
    let limit = 10

    //  P.id,P.post_title,P.user_id,A.user_name,C.front_image_path,C.back_image_path,P.created_at

    const sql = `
    select count(*) as good_count,
    P.id,
    P.post_title,
    A.user_name,
    C.front_image_path,
    P.created_at
    from good G 
    inner join post P on G.post_id = P.id 
    inner join customize C on C.id = P.customize_id 
    inner join account A on P.user_id = A.id 
    group by post_id 
    order by count(*) desc limit ?`;
    connection.query(sql,[limit],(err, result) => {
        if (err){
            res.json({error:true,message:err})
            return
        }
        res.json({error:false,posts:[result]})
    })
})





module.exports = router;