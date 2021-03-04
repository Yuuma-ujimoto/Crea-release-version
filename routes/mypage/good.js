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

router.get("/",(req, res) => {
    res.redirect("/mypage/good/history")
})

router.get("/history",(req, res, next) => {
    res.render("mypage/good/history")
})



module.exports = router;
