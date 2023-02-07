const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

// .static에 접근할 수 있다. 여기서 모델의 특정 인스턴스가 아닌 모델의 user 클래스에 추가할 수 있는 메서드를 정의할 수 있다.
userSchema.statics.findAndValidate = async function (username, password) {
  const foundUser = await this.findOne({ username }); // this는 특정 모델이나 스키마를 나타냄. 즉, User
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false; // isValid가 참이면 foundUser 반환, 거짓이면 false 반환
};

// 함수를 실행하기 전 pre("save")
userSchema.pre("save", async function (next) {
  // this.password = "NOT YOUR REAL PASSWORD!!!"; // this는 현재 User 내의 특정 인스턴스, User 모델에 this.password를 업데이트해 실제로 전달한 암호를  "NOT YOUR REAL PASSWORD!!!"로 바꿈(하이재킹)
  if (!this.isModified("password")) return next();
  // password와 같은 필드를 전달 할 수 있다. 특정 사용자 모델 내 암호 변경 여부를 참, 거짓으로 나타낸다.
  // 즉, `!this.isModified("password")` - 암호가 변경되지 않았을 경우 실행됨
  this.password = await bcrypt.hash(this.password, 12); // 해시할 암호를 전달해야하는데, 암호는 현재 이 콜백에 제공되는 것이 아니라 this에 제공됨
  next(); // nexxt는 pre("save")에 의해 save가 됨
});
// Bscrypt가 사용자 모델 내의 암호를 해시한 출력 값을 암호로 설정할 수 있다.

module.exports = mongoose.model("User", userSchema);
