# Practice-Express-BcryptV2

Bcrypt를 이용한 Login App Demo

# 1. Register

## 1.1 Define user Schema

```javascript
// models/user.js

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be Blank"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be Blank"],
  },
});

module.exports = mongoose.model("User", userSchema);
```

```javascript
// index.js

...

mongoose.set("strictQuery", true);  // Mongoose 모듈에서 strictQuery 옵션을 true로 설정하여, MongoDB 데이터베이스에서 불가능한 쿼리가 수행되려 할 때 오류를 발생
mongoose
  .connect("mongodb://localhost:27017/loginDemo") // MongoDB 데이터베이스에 연결
  .then(() => {
    console.log("MogoDB Connection Open");
  })
  .catch((err) => {
    console.log("MogoDB ERROR");
    console.log(err);
  });
```

## 1.2 Create register ejs template

```html
<!-- views/register.ejs -->

<form action="/register" method="POST">
  <div>
    <label for="username">Enter Username : </label>
    <input
      type="text"
      name="username"
      id="username"
      placeholder="username"
      autocomplete="off"
    />
  </div>
  <div>
    <label for="password">Enter Password : </label>
    <input
      type="password"
      name="password"
      id="password"
      placeholder="password"
      autocomplete="off"
    />
  </div>
  <button>Sign Up</button>
</form>
```

```javascript
// index.js

...

app.set("view engine", "ejs"); // Node.js 기반의 웹 애플리케이션에서 EJS 템플릿 엔진을 사용
app.set("views", "views"); // 'views' 디렉토리에서 EJS 템플릿 파일을 찾는 경로를 지정

app.use(express.urlencoded({ extended: true })); // 클라이언트에서 서버로 데이터를 전송할 때 URL 인코딩 방식으로 인코딩하여 전송할 수 있도록 해줌
```

## 1.3 Hashing password

```javascript
// index.js

...

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

app.get("/secret", (req, res) => {
  res.send("My Secret is.....");
});
```

## 1.4 Find data

```bash
## mongoShell

> mongo
> use loginDemo
switched to db loginDemo
> show collections
users
> db.users.find().pretty()
{
        "_id" : ObjectId("63e262d93839b6549b640151"),
        "username" : "son",
        "password" : "$2b$12$vR3IYOMBFh8uYWAQibM5RuLxDP639huv/dp.bdWxu4LhH1XhNhnhu",
        "__v" : 0
}
```

# 2. Login

```html
<!-- views/login.ejs -->

...

<form action="/login" method="POST">
  <div>
    <label for="username">Enter Username : </label>
    <input
      type="text"
      name="username"
      id="username"
      placeholder="username"
      autocomplete="off"
    />
  </div>
  <div>
    <label for="password">Enter Password : </label>
    <input
      type="password"
      name="password"
      id="password"
      placeholder="password"
      autocomplete="off"
    />
  </div>
  <button>Login</button>
</form>
```

```javascript
// index.js

...

// login
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body; // username을 찾을때 findById를 사용하지만, 인증된 사용자를 대상으로하는 이번 경우에는 Id를 얻을 수 없다. 즉, 사용자 id로 찾아야함(아이디가 중복되면 안되는 이유)
  const user = await User.findOne({ username });
  // 사용자를 찾아서 req.body에 할당된 해시 암호와 사용자가 입력한 암호 대조하기
  const validPassword = await bcrypt.compare(password, user.password); // boolean value
  // if(!user){...} user를 찾을 수 없는 경우 사용자에게 알릴 수 있다. 이때 암호가 틀렸거나 사용자를 찾을 수 없는 경우 사용자에게 어떤 문제가 있는지 알려주면 안됨. 즉, 사용자 이름 또는 암호를 찾을 수 없다고 알려야함
  if (validPassword) {
    res.send("WELECOME");
  } else {
    res.send("TRY AGAIN");
  }
});

```
