const express = require('express');
const router = express.Router();

const mysql = require('mysql');
//MySQL接続設定
const connection = require("../../config/db")//接続処理

router.use((req, res, next) => {
    if (!req.session.user_id) {
        res.render("error/clientError", {url: "/",
            error_message: "このページはログインしたユーザーのみが閲覧できるページです。"})
        return;
    }
    next()
})

connection.connect()
// router.use((req,res,next)=>{
//     if(!req.session.init_auth){
//         res.render("error/clientError",{url:"/",error_message:"ERROR"})
//         return
//     }
//     next()
// })

router.get("/history",(req, res) => {
    res.render("mypage/order/history",{user_id:req.session.user_id})
})

module.exports = router;
