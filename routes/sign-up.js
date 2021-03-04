//Expressの読み込み
const express = require("express")
//routerを設定
const router = express.Router()
// Mysqlのライブラリ読み込み
const mysql = require('mysql');
//MySQL接続設定
const connection = require("../config/db")//接続処理
//接続処理
connection.connect()


// サインアップ処理
router.get("/", (req, res) => {
    //サインアップ様のフォームが書かれたファイルを送信
    res.render("sign-up/signup")
})

router.post("/check", (req, res, next) => {
    //-送信データ取得
    //ユーザー名
    const user_name = req.body.user_name
    //メールアドレス
    const mail_address = req.body.mail_address
    //パスワード
    const password = req.body.password
    //確認用パスワード
    const confirm_password = req.body.confirm_password
    //-送信データ取得ここまで
    //確認画面書き出し
    res.render("sign-up/check", {
        user_name: user_name,
        mail_address: mail_address,
        password: password,
        confirm_password: confirm_password
    })
})

router.post("/confirm",
    (req, res, next) => {
        //---送信データを取得---
        //ユーザー名
        const user_name = req.body.user_name
        //メールアドレス
        const mail_address = req.body.mail_address
        //パスワード
        const password = req.body.password
        //確認用パスワード
        const confirm_password = req.body.confirm_password
        //-取得　ここまで-
        //-エラー変数-
        let error_flag = false
        let error_messages = []
        //-エラー変数ここまで-
        //-送信データのチェック
        if (!user_name) {
            //ユーザー名未入力
            error_messages.push("ユーザー名:未記入")
            error_flag = true
        }
        if (!mail_address) {

            error_messages.push("メールアドレス:未記入")
            error_flag = true
        }
        if (!password) {
            error_messages.push("パスワード:未記入")
            error_flag = true
        }
        if (!confirm_password) {
            error_messages.push("確認用パスワード:未記入")
            error_flag = true
        }
        //送信データのNull判定ここまで
        //パスワードの判定
        if (password !== confirm_password) {
            error_messages.push("パスワード&確認用パスワード:不一致")
            error_flag = true
        }

        if (error_flag) {
            //一時チェック
            res.render("error/ClientError", {error_messages: error_messages, url: "/sign-up"})
//            res.render("error/error", {title: "Sign UP", error_messages: error_messages, url: "/sign-up"})
        }
        next()
    },
    (req, res, next) => {
        //ユーザー名
        const user_name = req.body.user_name
        //メールアドレス
        const mail_address = req.body.mail_address
        //パスワード
        const password = req.body.password
        //確認用パスワード
        const confirm_password = req.body.confirm_password
        //
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

        if (password.match(UserNameAndPassWordRELiteral) && confirm_password.match(UserNameAndPassWordRELiteral)) {
            //パスワード正規表現チェック
            error_messages.push("パスワード:正規表現")
            error_flag = true
        }
        if (error_flag) {
            //二次チェック
            //ここでチェック挟むことでDBへの無駄なアクセスを制限
            res.render("error/ClientError", {error_messages: error_messages, url: "/sign-up"})
            return
        }
        next()
    },
    (req, res, next) => {
        // 必要な情報だけ取得
        //ユーザー名
        const user_name = req.body.user_name
        //メールアドレス
        const mail_address = req.body.mail_address
        // MySQLでメールアドレスとユーザー名の重複を検知
        connection.query("select count(*) as count from account where mail = ?",
            [mail_address],
            (error, result) => {
                if (error) {
                    res.render("error/ServerError", {url: "/sign-up"})
                    return
                }
                if (result[0].count) {
                    res.render("error/ClientError", {error_message: "メールアドレス:重複", url: "/sign-up"})
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        const user_name = req.body.user_name
        connection.query("select count(*) as count from account where user_name = ?",
            [user_name],
            (error, result) => {

                if (error) {
                    res.render("error/ServerError", {url: "/sign-up"})
                    return
                }
                if (result[0].count) {
                    res.render("error/ClientError", {error_message: "ユーザー名:重複", url: "/sign-up"})
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        connection.query("insert into account(user_name,mail,password,created_at) value(?,?,?,?)",
            [req.body.user_name, req.body.mail_address, req.body.password, new Date()],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/sign-up"})
                    return;
                }
                next()
            })
    }, (req, res) => {
        connection.query(
            "select id from account where mail = ?",
            [req.body.mail_address],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/sign-up"})
                    return
                }
                req.session.user_id = result[0].id
                req.session.user_name = req.body.user_name
                res.redirect("/sign-up/result")
            }
        )
    }
)
router.get("/result", (req, res) => {
    res.render("sign-up/result")
})


// サインイン処理

module.exports = router