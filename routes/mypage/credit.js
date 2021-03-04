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


router.get("/",
    (req, res, next) => {
        console.log("p-1-1")
        connection.query("select count(*) as count from credit_card where user_id = ?",
            [req.session.user_id],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "mypage/credit/"})
                    return
                }
                if (!result[0].count) {
                    res.render("mypage/credit/check")
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        const sql = "select * from credit_card where user_id = ?"
        connection.query(sql,
                [req.session.user_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "mypage/credit"})
                    return
                }
                res.render("mypage/credit/check", {result: result[0]})
            })
    }
)

router.get("/add",
    (req, res, next) => {
        res.render("mypage/credit/add")
    })

router.post("/check",
    (req, res, next) => {
        const credit_number = req.body.credit_number.toString();
        const expiration_date = req.body.month + "/" + req.body.year
        const security_code = req.body.security_code;
        if (!credit_number || !req.body.month || !req.body.year || !security_code) {
            res.render("error/ClientError", {error_message: "未入力の値があります。"})
        }
        let credit_card_type = null
        if (credit_number.slice(0, 1) === "4") {
            credit_card_type = "VISA"
        } else if (credit_number.slice(0, 2) === "35") {
            credit_card_type = "JCB"
        }
        connection.query(
            "insert into credit_card(user_id,credit_card_type,credit_card_num,security_code,expiration_date) values(?,?,?,?,?)",
            [req.session.user_id, credit_card_type, credit_number, security_code, expiration_date],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/mypage/credit"})
                    return
                }
                next()
            }
        )
    },
    (req, res, next) => {
        connection.query("update account set main_credit_id = (select max(id) from credit_card where user_id = ?) where id = ?",
            [req.session.user_id, req.session.user_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/mypage/credit"})
                    return
                }
                res.render("mypage/credit/result")
            })

    }
)

//未実装
//クレジットカードのメイン登録情報を書き換え

router.post("api/change_main", (req, res, next) => {
        const id = req.body.id;
        connection.query("select count(*) as count from credit_card where id = ?",
            [id],
            (err, result) => {
                if (err) {
                    res.json({
                        api_result: "internal_error"
                    })
                    return
                }
                if (result.count) {
                    res.json({
                        api_result: "not_found"
                    })
                    return
                }
                next()
            })
    },
    (req, res) => {
        connection.query("update account set main_credit_id = ? where id = ?",
            [req.body.id, req.session.user_id],
            (err, result) => {
                if (err) {
                    res.json({
                        api_result: "internal_error"
                    })
                    return
                }
                res.json({
                    api_result: "success"
                })
            })
    })

// 未実装
//クレジットカードの登録情報を抹消するAPI
router.post("api/delete/", (req, res) => {
    const credit_card_id = req.body.id;
    connection.query("delete from credit_card where id = ?", [credit_card_id],
        (err, result) => {
            if (err) {
                res.json("api_result:error")
                return
            }
            res.json("api_result:success")
        })
})

module.exports = router