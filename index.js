const express = require("express");
const app = express();
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://localhost:27017/loginDemo")
  .then(() => {
    console.log("MogoDB Connection Open");
  })
  .catch((err) => {
    console.log("MogoDB ERROR");
    console.log(err);
  });

app.set("view engine", "ejs"); // Node.js 기반의 웹 애플리케이션에서 EJS 템플릿 엔진을 사용
app.set("views", "views"); // 'views' 디렉토리에서 EJS 템플릿 파일을 찾는 경로를 지정

app.use(express.urlencoded({ extended: true })); // 클라이언트에서 서버로 데이터를 전송할 때 URL 인코딩 방식으로 인코딩하여 전송할 수 있도록 해줌

app.get("/", (req, res) => {
  res.send("THIS IS THE HOME PAGE");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
  });
  await user.save();
  res.redirect("/");
});
// > mongo
// > use loginDemo
// switched to db loginDemo
// > show collections
// users
// > db.users.find().pretty()
// {
//         "_id" : ObjectId("63e262d93839b6549b640151"),
//         "username" : "son",
//         "password" : "$2b$12$vR3IYOMBFh8uYWAQibM5RuLxDP639huv/dp.bdWxu4LhH1XhNhnhu",
//         "__v" : 0
// }

app.get("/secret", (req, res) => {
  res.send("My Secret is.....");
});

app.listen(3003, () => {
  console.log("Server Open 3003!!!!!");
});
