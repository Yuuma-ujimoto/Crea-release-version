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
// router.use((req, res, next) => {
//     if (!req.session.init_auth) {
//         res.render("error/clientError", {url: "/", error_message: "ERROR"})
//         return
//     }
//     next()
// })

router.use((req, res, next) => {
    if (!req.session.user_id) {
        res.render("error/clientError", {url: "/",
            error_message: "このページはログインしたユーザーのみが閲覧できるページです。"})
        return;
    }
    next()
})

router.get("/", (req, res) => {
    console.log(req.session.unset)
    if (!req.session.unset) {
        res.render("error/clientError", {error_message: "未送信投稿はありません。"})
        return
    }
    if(req.session.unset.length === 1){
        res.redirect("/sns/post/"+req.session.unset[0])
        return
    }
    res.redirect("/sns/select")
})

router.get("/select", (req, res) => {
    // 複数あるときの選択用ページ
    connection.query(
        "select c.front_image_path,c.back_image_path,p.products_name,c.id from customize c inner join products p on c.products_id = p.id  where c.id in (?)"
        , [req.session.unset],
        (err, result) => {
            if (err) {
                console.log(err)
                res.render("error/ServerError", {url: "sns/"})
                return
            }
            res.render("sns/select", {result: result})
        })
})

router.get("/post/:id", (req, res, next) => {
    // 送信するときのページ
    const customize_id = req.params.id;
    const sql = "select front_image_path,back_image_path from customize where id = ?"
    connection.query(sql,[customize_id],(err, result) => {
        if(err){
            console.log(err)
            res.render("error/ServerError")
            return
        }
        console.log(result)
        res.render("sns/post", {customize_id: customize_id,result:result})
    })

})

router.post("/check", (req, res, next) => {
    //　送信値チェック
    const user_id = req.session.user_id
    const customize_id = parseInt(req.body.customize_id)
    const post_content = htmlspecialchars(req.body.post_content)
    const post_title = htmlspecialchars(req.body.post_title)
    if (req.session.unset.indexOf(customize_id) === -1) {
        res.render("error/ClientError", {error_message: "customizeIDError"})
        return
    }

    if (!post_title) {
        res.render("error/ClientError", {error_message: "タイトルが入力されていません"})
        return
    }
    if(ng_word(post_title)||ng_word(post_content)){
        res.render("error/ClientError",{error_message:"暴言もしくは卑猥なワードといった使用できない単語が含まれています"})
        return
    }

    connection.query("insert into post(user_id,customize_id,post_title,post_content) values(?,?,?,?)",
        [user_id, customize_id, post_title, post_content],
        (err, result) => {
            if (err) {
                console.log(err)
                res.render("error/ServerError", {url: "/sns"})
                return
            }
            res.redirect("/sns/result")
        }
    )
})

router.get("/result", (req, res, next) => {
    // 送信完了画面
    res.render("sns/result")
})

module.exports = router;