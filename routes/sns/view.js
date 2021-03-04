const express = require('express');
const router = express.Router();

// router.use((req, res, next) => {
//     if (!req.session.init_auth) {
//         res.render("error/clientError", {url: "/", error_message: "ERROR"})
//         return
//     }
//     next()
// })


router.get("/",
    (req, res, next) => {
    res.redirect("/view/1")
})

router.get("/ranking",(req, res) => {
    console.log("x")
    res.render("view/ranking")
})

router.get("/:id", (req, res, next) => {
    res.render("view/post-list")
})



router.get("/status/:post_id", (req, res, next) => {
    res.render("view/status", {post_id: req.params.post_id})
})

router.get("/user-page/:id",(req, res) => {
    res.render("view/user-page",{user_id:req.params.id})
})

router.post("/add-cart",(req, res) => {
    const customize_id = parseInt(req.body.customize_id)
    if(!customize_id){
        res.render("error/ClientError",{error:true,error_message:"IDが不正です。"})
        return
    }
    if(req.session.cart.indexOf(customize_id)!==-1){
        res.render("error/ClientError",{error:true,error_message:"既にカートに入っている商品です。"})
        return
    }
    console.log()
    if(!req.session.cart){
        req.session.cart = [customize_id]
    }
    else {
        req.session.cart.push(customize_id)
    }
    console.log("XXX")
    res.render("customize/add_cart")
})

module.exports = router;