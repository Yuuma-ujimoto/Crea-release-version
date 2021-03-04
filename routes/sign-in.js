const express = require("express")
const router = express.Router()

const mysql = require('mysql');
//MySQL接続設定
const connection = require("../config/db")//接続処理

connection.connect()


//サインイン処理
router.get("/", (req, res) => {
    res.render("sign-in/signin")
})

router.post("/check",
    (req, res, next) => {
        connection.query("select count(*) as count from account where user_name = ? and mail = ? and password = ? ",
            [req.body.user_name, req.body.mail_address, req.body.password],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/sign-in"})
                    return
                }
                if (!result[0].count) {
                    res.render("error/ClientError", {error_message: "ログインに失敗しました", url: "/sign-in"})
                    return
                }
                next()
            })
    },
    (req, res) => {
        connection.query(
            "select id,user_name from account where mail = ?",
            [req.body.mail_address],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/sign-in"})
                    return
                }
                req.session.user_id = result[0].id
                req.session.user_name = result[0].user_name
                res.redirect("/")
            }
        )
    }
)


router.get("/random",
    (req, res, next) => {
        const sql = "select id from account where deleted_at is null"
        connection.query(sql, (err, result) => {
            let list_x = []
            result.forEach(items => {
                list_x.push(items.id)
            })
            req.session.user_id = list_x[Math.floor(Math.random() * list_x.length)]
            next()
        })
    },
    (req, res) => {
        const sql = "select user_name from account where id = ?"
        connection.query(sql, [req.session.user_id], (err, result) => {
            if (err) {
                console.log(err)
                res.render("error/ServerError");
                return
            }
            req.session.user_name = result[0].user_name;
            req.session.cart = []
            req.session.unset = []
            if (!req.query.redirect) {
                res.redirect("/")
                res.end()
                return
            }

            if (req.query.redirect === 'mypage') {
                res.redirect("/mypage")
            } else {
                res.redirect("/")
            }
        })
    })

router.get("/set_user/:id", (req, res) => {
    let id = 1
    if (!!req.params.id) {
        id = parseInt(req.params.id)
    }
    const sql = "select user_name from account where id = ?"
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err)
            res.render("error/ServerError");
            return
        }
        console.log(result)
        if (!!result) {
            req.session.user_id = id
            req.session.user_name = result[0].user_name;
        }
        res.redirect("/")
    })
})

router.get("/forget", (req, res) => {
    res.render("sign-in/forget")
})

module.exports = router