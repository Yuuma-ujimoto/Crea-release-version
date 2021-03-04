const express = require('express');
const router = express.Router();

const mysql = require('mysql');
//MySQL接続設定
const connection = require("../../config/db")//接続処理


connection.connect()
// router.use((req,res,next)=>{
//     if(!req.session.init_auth){
//         res.render("error/clientError",{url:"/",error_message:"ERROR"})
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

    console.log("login")
    next()

})


router.get("/", (req, res, next) => {
    connection.query("select user_name, mail from account where id = ?",
        [req.session.user_id], (err, result) => {
            if (err) {
                res.render("error/ServerError",{url:"/mypage"})
                return;
            }
            console.log(result)
            res.render("mypage/info/check", {user_name: result[0].user_name, mail_address: result[0].mail})
        })
})

router.get("/edit", (req, res) => {
    connection.query("select mail,user_name from account where id = ?",
        [req.session.user_id],
        (err, result) => {
            if (err) {
                res.render("error/server_error", {url: "mypage/info/"})
                return;
            }
            res.render("mypage/info/edit", {user_name: result[0].user_name, mail_address: result[0].mail})
        })

})

router.post("/edit/check", (req, res, next) => {
        console.log("test")
    //user_nameチェックmailチェック
        const user_name = req.body.user_name
        //メールアドレス
        const mail_address = req.body.mail_address
        //パスワード

        let error_flag = false
        let error_messages = []
        //--------------------------------------------------------------------------------------------------------------
        // ユーザー名&パスワード用正規表現リテラル
        const UserNameAndPassWordRELiteral = "/^[\w]+$/"
        // メールアドレス用正規表現リテラル
        const MailAddressRELiteral = "/^[\\w.\\-]+@[\\w\\-]+\\.[\\w.\\-]+\n$/"

        if (user_name.match(UserNameAndPassWordRELiteral)) {
            //ユーザー名が正規表現に引っかかった場合
            error_messages.push("ユーザー名:正規表現")
            error_flag = true;
        }
        if (user_name.length < 4 || 20 < user_name) {
            //ユーザー名の文字数チェック
            error_messages.push("ユーザー名:文字数")
            error_flag = true
        }

        if (mail_address.match(MailAddressRELiteral)) {
            //メールアドレスの正規表現チェック
            error_messages.push("メールアドレス:正規表現")
            error_flag = true
        }
        if (256 < mail_address.length) {
            //メールアドレス文字数チェック
            error_messages.push("メールアドレス:文字数")
            error_flag = true
        }

        if (error_flag) {
            res.render("error/error", {title: "edit info", error_messages: error_messages, url: "mypage/info/edit"})
            return;
        }
        next()
    }, (req, res, next) => {
        const password = req.body.password
        connection.query("select password from account where id = ?",
            req.session.user_id,
            (err, result) => {
                if (err) {
                    res.render("error/server_error", {url: "mypage/info/edit"})
                    return
                }
                if (result[0].password !== password) {
                    res.render("error/error",
                        {title: "edit info", error_messages: ["パスワード:エラー"], url: "mypage/info/edit"}
                    )
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        const user_name = req.body.user_name;
        const mail_address = req.body.mail_address;
        connection.query("update account set user_name = ?,mail = ? where id = ?",
            [user_name, mail_address, req.session.user_id],
            (err, result) => {
                if (err) {
                    res.render("error/server_error", {url: "mypage/info/edit"})
                    return;
                }
                res.render("mypage/info/result")
            })
    })



module.exports = router