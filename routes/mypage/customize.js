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
    res.redirect("/mypage/customize/history")
})

router.get("/history",(req, res) => {
    res.render("mypage/customize/history",{user_id:req.session.user_id})
})
//　改修予定
//　ほぼ突貫で例外処理等を無視している
router.post("/api/add-cart",(req, res) => {
    //　カートに既に同じIDの商品が入っている時に弾く
    // 将来性を考えてユーザーチェックは無し（他のユーザーのcustomizeを追加可能な仕様）
    console.log("call api",req.body.id)
    if (!req.session.cart) {
        req.session.cart = [parseInt(req.body.id)]
    } else {
        req.session.cart.push(parseInt(req.body.id))
    }
    res.json({result:true})
})

module.exports = router;
