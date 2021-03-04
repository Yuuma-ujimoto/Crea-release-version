const express = require('express');
const router = express.Router();

const mysql = require('mysql');
//MySQL接続設定
const db = require("../config/db")
//MySQL接続設定
const connection = require("../config/db")//接続処理
connection.connect()


// router.use((req,res,next)=>{
//     console.log("index")
//     if(!req.session.init_auth){
//         console.log(req.session)
//         res.render("error/clientError",{url:"/",error_message:"ERROR"})
//         return
//     }
//     next()
// })



router.get('/',
    (req, res, next) => {
        console.log("index access")
        if(!req.session.user_id){
            res.redirect("/sign-in/random")
            return
        }
        res.render('index/index', {user_id: req.session.user_id});
    }
);

router.get("/cart",
    (req, res, next) => {
        console.log(req.session.cart)
        if (!req.session.user_id) {
            res.render("error/ClientError",{error_message:"ログインしていないユーザーはこのページにアクセスする事が出来ません"})
            return
        }

        if (!req.session.cart || !req.session.cart.length) {
            res.render("error/ClientError",{error_message:"カートに商品が入っていません。"})
            return
        }
        connection.query(
            "select c.front_image_path,c.back_image_path,p.products_name,p.price from customize c inner join products p on c.products_id = p.id  where c.id in (?)",
            [req.session.cart],
            (err, result) => {
            if(err){
                console.log(err)
                res.render("error/ServerError",{url:"/"})
                return
            }
                console.log(result)
                res.render("index/cart", {cart:result})
            })
    }
);



router.get("/qanda",
    (req, res) => {
        res.render("index/qanda", {title: "test", url: "/"})
    })

router.get("/inquiry",
    (req, res) => {
        if (!req.session.user_id) {
            res.render("index/not-login")
            return;
        }
        res.render("index/inquiry")
    })

router.post("/inquiry/check",
    (req, res, next) => {
        let title
        if (!req.body.inqury_title) {
            title = null
        } else {
            title = req.body.inqury_title
        }
        connection.query(
            "insert into inquiry(inquiry_title,inquiry_content,user_id) value(?,?,?)",
            [title, req.body.inquiry_content, req.session.user_id],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {"url": "/inquiry"})
                    return;
                }
                res.redirect("/")
            })
    }
)

router.get("/error/ClientError",(req, res) => {
    res.render("error/ClientError",{error_message:"エラーが発生しました。下のボタンからトップページへと戻ることができます。"})
})

module.exports = router;
