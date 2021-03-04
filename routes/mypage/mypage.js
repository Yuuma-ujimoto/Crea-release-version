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
            error_message: "このページはログインしたユーザーのみが閲覧できるページです。"
        })
        return;
    }

    console.log("login")
    next()

})


router.get('/',
    (req, res, next) => {
        res.render('mypage/mypage', {user_name: req.session.user_name,user_id:req.session.user_id})
    });


router.get("/check/credit",
    (req, res, next) => {
        connection.query("select * from credit where user_id = ?",
            [req.session.id],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/mypage"})
                    return
                }
                res.render("mypage/check/credit", {result: result})
            })
    })

router.get("/withdraw",
    (req, res) => {
        res.render("mypage/withdraw")
    })

router.post("/withdraw/confirm", (req, res) => {
    const user_id = req.session.user_id
    connection.query("update account set deleted_at = ? where id = ?",
        [Date(), user_id],
        (err, result) => {
            if (err) {
                res.render("error/ServerError", {url: "/mypage/withdraw"})
                return
            }
            res.render("mypage/withdraw_confirm")
        })
})

module.exports = router;
