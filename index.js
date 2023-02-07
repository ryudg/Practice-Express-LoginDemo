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

// register
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

// login
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body; // username을 찾을때 findById를 사용하지만, 인증된 사용자를 대상으로하는 이번 경우에는 Id를 얻을 수 없다. 즉, 사용자 id로 찾아야함(아이디가 중복되면 안되는 이유)
  const user = await User.findOne({ username });
  // 사용자를 찾아서 req.body에 할당된 해시 암호와 사용자가 입력한 암호 대조하기
  const validPassword = await bcrypt.compare(password, user.password); // boolean value
  if (validPassword) {
    res.send("WELECOME");
  } else {
    res.send("TRY AGAIN");
  }
});
// if(!user){} user를 찾을 수 없는 경우 사용자에게 알릴 수 있다. 이때 암호가 틀렸거나 사용자를 찾을 수 없는 경우 사용자에게 어떤 문제가 있는지 알려주면 안됨. 즉, 사용자 이름 또는 암호를 찾을 수 없다고 알려야함

app.get("/secret", (req, res) => {
  res.send("My Secret is.....");
});

app.listen(3003, () => {
  console.log("Server Open 3003!!!!!");
});
