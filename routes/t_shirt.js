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

const AWS_SDK = require("aws-sdk")

router.use((req, res, next) => {
    if (!req.session.user_id) {
        res.render("error/clientError", {
            url: "/",
            error_message: "このページはログインしたユーザーのみが閲覧できるページです。"
        })
        return;
    }
    console.log("login")
    next()
})

router.post("/check",
    (req, res, next) => {
        let front_image_base64_data = req.body.front_image_base64_data

        const hash_1 = crypto.createHash('sha1');
        hash_1.update(front_image_base64_data)
        const front_file_name = hash_1.digest('hex')


        let front_data = base64.decode(front_image_base64_data.replace("data:image/png;base64,", ""))

        // S3 保存
        const AWS = AWS_SDK
        console.log("x-2")
        const config = require("../config/aws")

        AWS.config.update(config)
        const params = {
            Bucket: "crea-test-bucket",
            Key: `public/${front_file_name}.png`,
            Body: front_data,
            ContentType: "image/png",
        }
        const s3 = new AWS.S3()

        s3.putObject(params, (err, data) => {
            if (err) {
                console.log(err)
                res.render("error/ServerError", {url: "/"})
                return
            }
            next()
        })


    },
    (req, res, next) => {
        //裏側画像処理
        let back_image_base64_data = req.body.back_image_base64_data
        const hash_2 = crypto.createHash("sha1")
        hash_2.update(back_image_base64_data)
        const back_file_name = hash_2.digest('hex')

        let back_data = base64.decode(back_image_base64_data.replace("data:image/png;base64,", ""))

        const AWS = AWS_SDK
        const s3 = new AWS.S3()

        const config = require("../config/aws")

        AWS.config.update(config)
        const params = {
            Bucket: "crea-test-bucket",
            Key: `public/${back_file_name}.png`,
            Body: back_data,
            ContentType: "image/png",
        }

        s3.putObject(params, (err, data) => {
            if (err) {
                console.log(err)
                res.render("error/ServerError", {url: "/"})
                return
            }
            console.log(data, "a")
            next()
        })


    },
    (req, res, next) => {
        const nuno = req.body.nuno_select
        const gara = req.body.gara_select
        const tie = req.body.tie_select
        const click = req.body.click_count
        const accessory = req.body.accessory_html_data
        const product_id = req.body.product_id


        let customize_data_json = {
            product_id: product_id,
            nuno: nuno,
            gara: gara,
            tie: tie,
            click: click,
            accessory: accessory
        }
        console.log(customize_data_json)
        const hash_1 = crypto.createHash('sha1');
        hash_1.update(nuno + gara + tie + accessory)
        const file_name = hash_1.digest('hex')
        const customize_data_path = (file_name + ".json")

        const AWS = AWS_SDK
        const config = require("../config/aws")
        AWS.config.update(config)
        const params = {
            Bucket: "crea-test-bucket",
            Key: `json/${file_name}.json`,
            Body: JSON.stringify(customize_data_json, null, ' '),
            ContentType: "application/json"
        }
        console.log("case-customize-phase1-2")
        const s3 = new AWS.S3()
        s3.putObject(params, (err, data) => {
            console.log("case-customize-phase1-3")
            if (err) {
                console.log(err)
                res.render("error/ServerError", {url: "/"})
                return
            }
            console.log("case-customize-phase1-4")
            next()
        })


    },
    (req, res, next) => {
        let front_image_base64_data = req.body.front_image_base64_data
        const hash_1 = crypto.createHash('sha1');
        hash_1.update(front_image_base64_data)
        const front_file_name = hash_1.digest('hex')

        let back_image_base64_data = req.body.back_image_base64_data
        const hash_2 = crypto.createHash("sha1")
        hash_2.update(back_image_base64_data)
        const back_file_name = hash_2.digest('hex')

        //　カスタマイズデータ
        const nuno = req.body.nuno_select
        const gara = req.body.gara_select
        const tie = req.body.tie_select
        const accessory = req.body.accessory_html_data
        const hash_3 = crypto.createHash('sha1');
        hash_3.update(nuno + gara + tie + accessory)
        const file_name = hash_3.digest('hex')
        const customize_data_path = file_name + ".json"

        // ここでカスタマイズの保存
        connection.connect()
        connection.query("insert into customize(products_id,create_user_id,front_image_path,back_image_path,customize_data) values(?,?,?,?,?)",
            [req.body.product_id,
                req.session.user_id,
                front_file_name + ".png",
                back_file_name + ".png",
                customize_data_path],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/"});
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        connection.query("select max(id) as id from customize where create_user_id = ? and products_id = ?",
            [req.session.user_id, req.body.product_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "/"})
                    return
                }
                // カート追加処理
                if (!req.session.cart) {
                    req.session.cart = [result[0].id]
                } else {
                    req.session.cart.push(result[0].id)
                }
                console.log("x-end-point")
                res.redirect("/customize/add_cart");
            })
    })

module.exports = router