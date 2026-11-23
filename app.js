require("dotenv").config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {checkAuthenticationCookie} = require('./middleware/authentication');

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");


const app = express();
const PORT = process.env.PORT || 8000;

 mongoose
 .connect(process.env.MONGO_URL)
.then((e) => console.log("mongoDb connected"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkAuthenticationCookie("token"));
app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));

app.get('/', async(req,res)=>{
   const allBlogs = await Blog.find({});
    return res.render('home',{
        user: req.user,
        blogs : allBlogs,
    });
});

app.use("/user",userRoute);                         //middleware-always check when any req came
app.use("/blog",blogRoute);

app.listen(PORT,()=>{
    console.log(`Server is started on port ${PORT}`);
});