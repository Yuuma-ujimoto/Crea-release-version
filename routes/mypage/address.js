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
    next()
})


router.get("/",
    (req, res, next) => {
        connection.query("select count(*) as count from address where user_id = ?",
            [req.session.user_id],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "mypage/address/"})
                    return
                }
                next()
            })
    },
    (req, res, next) => {
        connection.query("select * from address where user_id = ?;",
            [req.session.user_id, req.session.user_id],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.render("error/ServerError", {url: "mypage/address"})
                    return
                }
                res.render("mypage/address/check", {result: result[0]})
            })
    }
)

router.get("/add",
    (req, res, next) => {
        res.render("mypage/address/add")
    })

router.post("/check",
    (req, res, next) => {
        const data = req.body;
        //苗字
        const first_name = data.first_name;
        //名前
        const last_name = data.last_name;
        //郵便番号
        const postal_code = data.postal_code;
        //都道府県
        const prefectures = data.prefectures;
        //市区町村
        const municipality = data.municipality;
        //番地
        const address = data.address;
        //建物名　コレだけは空白可
        const building = data.building;

        const phone_number = data.phone_number;

        let error_flag = false;
        let error_messages = []
        if (!first_name || !last_name) {
            error_messages.push("名前:未入力")
            error_flag = true
        }
        if (!postal_code) {
            error_messages.push("郵便番号:未入力")
            error_flag = true
        }
        if (!prefectures || !municipality || !address) {
            error_messages.push("住所:未入力")
            error_flag = true
        }
        if (!phone_number) {
            error_messages.push("電話番号:未入力")
            error_flag = true
        }

        if (error_flag) {
            res.render("error/ClientError", {error_messages: error_messages, url: "/mypage/address/"})
            return
        }
        next()
    },
    (req, res, next) => {
        const data = req.body;
        const address_name = data.first_name + " " + data.last_name;
        let address;
        if (!!data.building) {
            address = data.prefectures + data.municipality + data.address + data.building;
        } else {
            address = data.prefectures + data.municipality + data.address;
        }
        const postal_code = data.postal_code;
        const phone_number = data.phone_number;
        connection.query(
            "insert into address(user_id,postal_code,address,phone_number,address_name) values(?,?,?,?,?)",
            [req.session.user_id, postal_code, address, phone_number, address_name],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/mypage/address/"})
                    return
                }
                next()
            })
    }, (req, res, next) => {
        connection.query("update account set main_address_id = (select max(id) as max from address where user_id = ?)",
            [req.session.user_id],
            (err, result) => {
                if (err) {
                    res.render("error/ServerError", {url: "/mypage/address/"})
                    return
                }
                res.render("mypage/address/result")
            })

    }
)



module.exports = router