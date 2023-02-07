# Practice-Express-BcryptV2

Bcrypt를 이용한 Login App Demo

# Define user Schema

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

# Create register ejs template

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

# Hashing password

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

# Find data

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
