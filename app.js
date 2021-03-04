let createError = require('http-errors');
const express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);


const indexRouter = require("./routes/index");
const signInRouter = require("./routes/sign-in")
const signUpPouter = require("./routes/sign-up")
const mypageRouter = require("./routes/mypage/mypage")
const mypageInfoRouter = require("./routes/mypage/info")
const mypageAddressRouter = require("./routes/mypage/address")
const mypageCreditCardRouter = require("./routes/mypage/credit")
const mypageCustomizeRouter = require("./routes/mypage/customize")
const mypageOrderRouter = require("./routes/mypage/order")
const mypageGoodRouter = require("./routes/mypage/good")
const orderRouter = require("./routes/order")
const snsRouter = require("./routes/sns/post")
const snsViewRouter = require("./routes/sns/view")

// カスタマイズ
const customizeRouter = require("./routes/customize")
const pouchCustomizeRouter = require("./routes/pouch")
const passCaseCustomizeRouter = require("./routes/passcase")
const t_shirtCustomizeRouter = require("./routes/t_shirt")

// API系
const utilityAPIRouter = require("./routes/api/utility-api")
const snsAPIRouter = require("./routes/api/sns-api")
const mypageAPIRouter = require("./routes/api/mypage-api")

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "50mb"}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const options = require("./config/session_mysql")

const sess = {
    secret: 'xxxxxxxxxx',
    cookie: { maxAge: 30*24*60*60*1000 },
    store: new MySQLStore(options),
    resave: false,
    saveUninitialized: true,
}

app.use(session(sess))


app.use("/sign-in", signInRouter)
app.use("/sign-up", signUpPouter)
app.use("/mypage/info", mypageInfoRouter)
app.use("/mypage/address", mypageAddressRouter)
app.use("/mypage/credit", mypageCreditCardRouter)
app.use("/mypage/customize", mypageCustomizeRouter)
app.use("/mypage/good", mypageGoodRouter)
app.use("/mypage/order", mypageOrderRouter)
app.use("/mypage/", mypageRouter)
app.use("/order", orderRouter)
app.use("/sns", snsRouter)
app.use("/view", snsViewRouter)
app.use('/', indexRouter)


app.use("/customize/pouch",pouchCustomizeRouter)
app.use("/customize/pass_case",passCaseCustomizeRouter)
app.use("/customize/t_shirt",t_shirtCustomizeRouter)
app.use("/customize", customizeRouter)



// API系
app.use("/sns-api", snsAPIRouter)
app.use("/utility-api", utilityAPIRouter)
app.use("/mypage-api", mypageAPIRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.log("ERROR", res.status)

    if(err.status === 404){
        res.render('error/ClientError', {url: "/", error_message: err.status});
        return;
    }

// APIトークン
    const client = require("./config/slack");
    const text = 'Server Error'+path.resolve();
    const channel = "#error-alert"
    const params = {
        channel: channel,
        text: text
    }
    client.chat.postMessage(params);
    res.render("error/ServerError")

});

const {WebClient} = require('@slack/web-api');

// APIトークン
// #チャンネル名 of @ユーザー名
const channel = '#server-bot';
// メッセージ
const text = 'Server Start'+path.resolve();

const client = require("./config/slack");
const params = {
    channel: channel,
    text: text
};

client.chat.postMessage(params);


module.exports = app;
