const express = require('express');
const router = express.Router();

const mysql = require('mysql');
//MySQL接続設定
//MySQL接続設定
const connection = require("../config/db")//接続処理
//接続処理
connection.connect()

router.use((req, res, next) => {
    if (!req.session.user_id) {
        res.render("error/clientError", {
            url: "/",
            error_message: "このページはログインしたユーザーのみが閲覧できるページです。"
        })
        return;
    }
    next()
})

router.get('/buy',
    (req, res, next) => {
        console.log("x")
        if (!req.session.cart) {
            res.render("error/ClientError", {error_message: "カート無し"})
            return
        }
        connection.query(
            " select p.id,p.products_name,c.front_image_path,c.back_image_path,p.price,c.id as customize_id  from customize c inner join products p on c.products_id = p.id where c.id in (?);" +
            "select * from address where user_id = ? order by id DESC limit 1;" +
            "select * from credit_card where user_id = ? order by id DESC limit 1;",
            [req.session.cart, req.session.user_id, req.session.user_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/"})
                    return
                }
                res.render("order/buy", {result: result[0], address: result[1], credit_card: result[2]})
            })
    });

router.post("/check",
    (req, res, next) => {
        if (req.body.customize_id.length !== req.body.quantity.length) {
            res.render("error/ClientError", {error_message: "入力値が不正です。"})
            return
        }
        let quantity_error_flag = false
        req.body.quantity.forEach(q => {
            if (q < 0) {
                quantity_error_flag = true
            }
        })
        if (quantity_error_flag) {
            res.render("error/ClientError", {error_message: "入力値が不正です。"})
            return
        }
        // エラーチェック終了
        next()
    },
    (req, res, next) => {
        connection.query("insert into purchase(address_id,credit_card_id,tracking_id,user_id) Values(?,?,1000,?)",
            [req.body.address, req.body.credit_card, req.session.user_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/order/buy"})
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        console.log("X3")
        connection.beginTransaction(err => {
            if (err) {
                res.render("error/ServerError")
            }

            connection.query("select max(id) as max_id from purchase where user_id = ?",
                [req.session.user_id],
                (err1, result) => {
                    if (err1) {
                        console.log(err1)
                        return connection.rollback(() => {
                            res.render("error/ServerError", {url: "/order/buy"})
                        })
                    }
                    console.log(result)
                    const purchase_id = result[0].max_id
                    console.log(purchase_id)

                    connection.query("select max(order_number) as max_order_number from order_data", (err2, result1) => {
                        if (err2) {
                            return connection.rollback(() => {
                                res.render("error/ServerError", {url: "/order/buy"})
                            })
                        }
                        const max_order_number = result1[0].max_order_number

                        for (let i = 0; i < req.body.customize_id.length; i++) {
                            connection.query(
                                "insert into order_data(purchase_id,order_number,order_price,quantity,customize_id) Values(?,?,?,?,?)"
                                , [purchase_id, max_order_number + 1, 500, req.body.quantity[i], req.body.customize_id[i]],
                                (err) => {
                                    if (err) {
                                        console.log()
                                        return connection.rollback(() => {
                                            res.render("error/ServerError", {url: "/order/buy"})
                                        })
                                    }
                                })
                            console.log(i)
                        }
                    })
                })
            connection.commit(commit_err => {
                if (commit_err) {
                    return connection.rollback(() => {
                        res.render("error/ServerError")
                    })
                }
                req.session.buy = true
                res.redirect("/order/result")
            })
        })
    }
)

router.get("/result", (req, res, next) => {
    if (req.session.buy) {
        req.session.buy = false
        req.session.unset = req.session.cart
        req.session.cart = []
    }
    res.render("order/result")
})

module.exports = router;
