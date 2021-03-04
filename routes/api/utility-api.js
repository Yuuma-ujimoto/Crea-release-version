const express = require('express');
const router = express.Router();

const mysql = require('mysql');
// router.use((req,res,next)=>{
//     if(!req.session.init_auth){
//         res.render("error/clientError",{url:"/",error_message:"ERROR"})
//         return
//     }
//     next()
// })

router.post("/add_cart", (req, res) => {
    if (!req.session.user_id) {
        res.json({is_error: true, error_message: "ログインしていないユーザーは購入できません。"})
        return;
    }

    const customize_id = parseInt(req.body.customize_id)
    if (!customize_id) {
        res.json({is_error: true, error_message: "IDが不正です。"})
        return
    }

    if (!req.session.cart) {

        req.session.cart = [customize_id]

    } else {
        if (req.session.cart.indexOf(customize_id) !== -1) {
            res.json({is_error: true, error_message: "既にカートに入っている商品です。"})
            return
        } else {
            req.session.cart.push(customize_id)
        }

    }
    res.json({is_error: false})
})

router.get("/get_ranking",
    (req, res) => {
        const sql = "select * from customize order by "
    })

module.exports = router;