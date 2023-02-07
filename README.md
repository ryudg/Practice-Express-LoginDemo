# Practice-Express-BcryptV2

# Bcrypt를 이용한 Login App Demo

## Install

```bash
## express ejs mongoose bcrypt express-session
> npm i
```

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

# 3. Session에 login 정보 저장

## 3.1 세션에 로그인(등록)한 사용자의 ID를 저장

```javascript
// index.js

...

app.use(session({ secret: "loginsecret" }));  // 세션(session) 미들웨어를 추가, "secret" 옵션은 세션의 비밀 키를 지정하는데, 이 비밀 키는 세션 ID를 암호화하기 위해 사용

...

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password: hash,
  });
  await user.save();
  req.session.user_id = user._id; // 등록할 때 session에 user ID 저장
  res.redirect("/");
});

...

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    req.session.user_id = user._id; // 로그인할 때 session에 user ID 저장
    res.send("WELECOME");
  } else {
    res.send("TRY AGAIN");
  }
});
```

- 사용자에게 자동으로 반환되는 특정 쿠키에 세션 저장소가 정보를 연계 시킴
- 세션을 사용하고 있기 때문에 자동으로 발급된 세션 ID를 브라우저에서 보내는 요청과 함께 돌려보내면,
- 서버는 먼저 세션 ID가 유효한지, 위조 또는 변조 되지 않았는지 서명되어 있는지 등을 확인함.
- 그리고 그 ID를 사용해 연관된 정보를 가져옴
- 현재 세션 내 연관된 정보 - `req.session.user_id = user._id`
- 로그인에 성공할때, 등록할때에만 세션에 사용자 ID를 저장

## 3.2 `/secret` route 보호

```javascript
// index.js

...

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {       // session에 user ID가 없다면
    res.redirect("/login");         // /login page로 redirect
  } else {                          // session에 user ID가 있다면
    res.send("My Secret is.....");  // /secret page로 이동
  }
});
```

# 4. Logout

> session에 사용자 ID 제거 <br>
> 현재 사용자 로그인 유무를 확인하기 위해서는 세션에 사용자 ID로 저장된 ID를 확인. <br>
> 세션은 모두 서버에 저장되고 클라이언트로 반환되는 서명된 쿠키가 있다. <br>
> 이 서명된 쿠키는 유효성 검사를 할 수 없는데, 이 쿠키를 조정하거나 직접 만든 쿠키를 보내면 무시되어 거짓 값으로 지정됨 <br>
> 즉 아무 정보도 얻을 수 없다. 이것이 바로 서명 작업의 핵심 <br>
> 이러한 안전 장치가 없으면 가짜 세션 ID를 보내 다른 사용자인 척 로그인을 할 수 있다.

```html
<!-- views/secret.ejs -->

...

<form action="/logout" method="POST">
  <button>Log Out</button>
</form>
```

```javascript
// index.js

...


app.post("/logout", (req, res) => {
  req.session.user_id = null; // session에 저장된 user id 비우기
  // req.session.destroy();  // 한 특성만 null로 설정하는 것이 아닌, session 전체를 파기
  res.redirect("/login");
});

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("secret");
});
```

# 5. Login Middleware

> 사용자의 로그인 여부(사용자 ID가 session에 있는지)를 확인하는 미들웨어 만들기 <br>
> 보호해야할 엔트포인트가 여러개일 때 유용

```javascript
// index.js

...

// app.use()를 사용해 항상 이 미들웨어를 적용하는 대신 함수 사용
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

...

app.get("/secret", requireLogin, (req, res) => {      // requireLogin 미들웨어 적용
  res.render("secret");
});
app.get("/topsecret", requireLogin, (req, res) => {   // requireLogin 미들웨어 적용
  res.send("TOP SECRET!!!!!!");
});
```

# 6. Refactoring

## 6.1 static method

- findOne을 호출해 사용자 이름으로 사용자를 찾고 암호가 맞는지 대조하는 두단계로 구성

```javascript
// index.js

...

User.메소드이름(username, password); // 이 메서드가 정보가 일치하는 사용자를 반환하거나 암호 등이 맞지 않아 유효한 사용자가 아닐 경우 false나 undefined를 반환
const user = await User.findOne({ username });
const validPassword = await bcrypt.compare(password, user.password);
```

- 이를 모델의 static method로 옮길 수 있다.
  > Static Method는 클래스 외부에서 호출할 수 없고, 클래스 내부에서만 호출 가능한 메소드<br>
  > Static Method에서는 클래스의 인스턴스를 생성하지 않고도 클래스 이름을 통해서 바로 호출할 수 있다.<br>
  > 즉, 클래스 레벨에서 실행되는 메소드이다.

```javascript
// models/user.js
const bcrypt = require("bcrypt");

...

// .static에 접근할 수 있다. 여기서 모델의 특정 인스턴스가 아닌 모델의 user 클래스에 추가할 수 있는 메서드를 정의할 수 있다.
userSchema.statics.findAndValidate = async function (username, password) {
  const foundUser = await this.findOne({ username }); // this는 특정 모델이나 스키마를 나타냄. 즉, User
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false; // isValid가 참이면 foundUser 반환, 거짓이면 false 반환
};
```

```javascript
// index.js

...

  // const user = await User.findOne({ username });
  // const validPassword = await bcrypt.compare(password, user.password);
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    // res.send("WELECOME");
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});
// if(!user
```

## 6.2 Mongoose와 model의 암호 해시

> 사용자를 등록할 때 암호를 먼저 해시하고, 그 암호를 `new User`에 추가한 뒤 `save()` 했지만, <br>
> Mongoose와 model이 대신 암호 해시 <br>
> 그 후 User만 만들고 암호를 전달 한 뒤 `save()`를 호출하고 저장하기 전에 암호를 해시해서, 암호를 해시 암호를 교체하는 미들웨어를 모델이 사용하게 만들기

```javascript
// index.js

...

app.post("/register", async (req, res) => {
  const { password, username } = req.body;  // password, username를 new User에 전달
  // const hash = await bcrypt.hash(password, 12);
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});
```

- userSchema에 미들웨어 추가

```javascript
// models/user.js

...

// 함수를 실행하기 전 pre("save")
userSchema.pre("save", function (next) {
  this.password = "NOT YOUR REAL PASSWORD!!!"; // this는 현재 User 내의 특정 인스턴스, User 모델에 this.password를 업데이트해 실제로 전달한 암호를  "NOT YOUR REAL PASSWORD!!!"로 바꿈(하이재킹)
  next(); // nexxt는 pre("save")에 의해 save가 됨
});

```

- pig라는 사용자 추가

```bash
## mongoShell

> db.users.find().pretty()

...

{
        "_id" : ObjectId("63e28d4f161789ff8f93c83a"),
        "username" : "pig",
        "password" : "NOT YOUR REAL PASSWORD!!!",
        "__v" : 0
}
```

- `this.password`의 값을 bscrypt의 해시 암호로 대체하기

```javascript
// models/user.js

...

// 함수를 실행하기 전 pre("save")
userSchema.pre("save", async function (next) {
  // this.password = "NOT YOUR REAL PASSWORD!!!"; // this는 현재 User 내의 특정 인스턴스, User 모델에 this.password를 업데이트해 실제로 전달한 암호를  "NOT YOUR REAL PASSWORD!!!"로 바꿈(하이재킹)
  this.password = await bcrypt.hash(this.password, 12); // 해시할 암호를 전달해야하는데, 암호는 현재 이 콜백에 제공되는 것이 아니라 this에 제공됨
  next(); // nexxt는 pre("save")에 의해 save가 됨
});
// Bscrypt가 사용자 모델 내의 암호를 해시한 출력 값을 암호로 설정할 수 있다.
```

```bash
## mongoShell

> db.users.find().pretty()

...

{
        "_id" : ObjectId("63e28ed6baa04ebbbb3e7eca"),
        "username" : "cat",
        "password" : "$2b$12$5eWuYwDllUJV9EbkBhy92e20.HOzY4cevsUusso6jTbZpVheuN26G",
        "__v" : 0
}
```

- 사용자는 사용자 이름과 암호를 가지고 있는데, 현재 사용자를 저장할 때마다 아래의 미들웨어가 실행됨

```javascript
// models/user.js

...

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

- 암호를 변경하지 않고 사용자 이름만 변경하려고 할 때 암호를 다시 해시하게 되는데, 이는 불필요함.
  - 즉, 암호가 변경됐을 때만 다시 해시해야함

```javascript
// models/user.js

...

// 함수를 실행하기 전 pre("save")
userSchema.pre("save", async function (next) {
  // password와 같은 필드를 전달 할 수 있다. 특정 사용자 모델 내 암호 변경 여부를 참, 거짓으로 나타낸다.
  // 즉, `!this.isModified("password")` - 암호가 변경되지 않았을 경우 실행됨
  if (!this.isModified("password")) return next();      // 암호가 변경되지 않았으면 next()
  this.password = await bcrypt.hash(this.password, 12); // 암호가 변경되었으면 해시
  next();
});

```
