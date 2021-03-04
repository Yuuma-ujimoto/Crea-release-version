const express = require("express")
const router = express.Router()
const path = require("path")
const mysql = require('mysql');
//MySQL接続設定
const connection = require("../config/db")
//暗号化設定
const crypto = require("crypto")
const fs = require("fs")
const base64 = require("urlsafe-base64")

// router.use((req, res, next) => {
//     if (!req.session.init_auth) {
//         res.render("error/clientError", {url: "/", error_message: "ERROR"})
//         return
//     }
//     next()
// })

router.use((req, res, next) => {
    if (!req.session.user_id) {
        res.render("error/ClientError", {
            url: "/",
            error_message: "このページはログインしたユーザーのみが閲覧できるページです。"
        })
        return;
    }
    console.log("login")
    next()
})

router.get("/add_cart", (req, res) => {
    res.render("customize/add_cart")
})


router.get("/:id",
    (req, res, next) => {
        switch (parseInt(req.params.id)) {
            case 1:
                res.render("customize/pouch_customize")
                return
            case 2:
                res.render("customize/pass_case_customize")
                return
            case 3:
                res.render("customize/t_shirt_customize")
                return;
            default:
                res.render("error/ClientError", {error_message: "存在しないID"})
                return;
        }
    })



//***********************************************************************************************

/// Tシャツ


/// 再編集

router.get("/remake/:id",
    (req, res, next) => {
        console.log("X1")
        const sql = "select count(*) as count from customize where id = ?"
        connection.query(sql, [parseInt(req.params.id)],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/"})
                    return
                }
                if (!result[0].count) {
                    res.render("error/ClientError", {error_message: "指定したカスタマイズIDは存在しません"})
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        console.log("x2")
        const sql = "select customize_data,products_id from customize where id = ?"
        connection.query(sql,
            [parseInt(req.params.id)],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/"})
                    return
                }
                console.log("x2-1")
                const url = `https://crea-test-bucket.s3-ap-northeast-1.amazonaws.com/json/${result[0].customize_data}`
                const request = require("request")
                request({
                    url: url,
                    json: true
                }, (error, response, body) => {
                    console.log(body)
                    // https.get(url, (customize_data) => {

                    switch (parseInt(result[0].products_id)) {
                        case 1:
                            res.render("customize/pouch_remake", {customize_data: body})
                            break;
                        case 2:
                            res.render("customize/pass_case_remake", {customize_data: body})
                            break;
                        case 3:
                            res.render("customize/t_shirt_remake",{customize_data:body})
                            break
                        default:
                            res.render("error/ClientError", {error_message: "存在しないIDです。"})
                            break;
                    }
                })

            })


    }
)


module.exports = router