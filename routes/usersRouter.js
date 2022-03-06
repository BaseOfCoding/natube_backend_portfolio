/* 라이브러리 영역 */

const express = require("express");
const router = express.Router();
const models = require("../models");
const { auth } = require("../middleware/auth");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/* 로그인 요청 함수, 아이디나 패스워드가 빈 값인지 1차로 확인, 
2차로, user_id를 확인하고, 결과값이 null 또는, password가 맞지 않다면, error 라는 메시지를 보내주고,
아니라면, db에 token값을 update 해준 후, 결과값과 token을 넘겨준다.
*/
router.post("/signin", async (req, res) => {
  const body = req.body;
  const { user_id, password } = body;
  if (user_id == "" || password == "") {
    res.send("undefined");
    return;
  }

  models.users
    .findOne({
      where: {
        user_id: user_id,
      },
    })
    .then((result) => {
      if (result == null || result.password != passwordEncryption(password)) {
        res.send("error");
      } else {
        let token = createToken(user_id);
        models.users.update({ token: token }, { where: { user_id: user_id } });
        res.send({
          resultData: result,
          token: token,
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

// 회원가입 post 요청 함수, 유저 아이디가 있는 중복인 지 아닌 지 확인하고, 중복 된 아이디가 없다면 db에 생성하는 방식, password는, 해쉬값으로 만들어 저장한다.
router.post("/signup", async (req, res) => {
  const body = req.body;
  const { user_id, password, profileUrl, nickname } = body;
  let tempCryptoPassword = password;

  models.users
    .findAll({
      where: {
        user_id,
      },
    })
    .then((result) => {
      if (result.length == 0) {
        models.users
          .findAll({
            where: {
              nickname,
            },
          })
          .then((result) => {
            if (result.length == 0) {
              models.users
                .create({
                  user_id,
                  password: passwordEncryption(tempCryptoPassword),
                  nickname,
                  profileUrl,
                })
                .then((result) => {
                  console.log("sign up : ", result);
                  res.send(result);
                })
                .catch((err) => {
                  console.error("sign up error :", err);
                  res.send("error");
                });
            } else {
              res.send("nickname_duplicate");
            }
          })
          .catch((err) => {
            console.error("signup nickname checking error : ", err);
            res.send("signup nickname checking error");
          });
      } else {
        res.send("id_duplicate");
      }
    })
    .catch((err) => {
      console.error("signup id checking error : ", err);
      res.send("signup id checking error");
    });
});

// 인증 post 요청 함수, auth 라는 미들웨어를 만들어, 해당 미들웨어에서 인증에 관한 모든 것을 처리한다.
router.post("/auth", auth, (req, res) => {});

// password를 해시값으로 만들어 저장한다. 1234와 같은 비밀번호라면, 1234가 아닌, 긴 문자열로 만들어 저장 후 return
function passwordEncryption(password) {
  return crypto.createHash("sha512").update(password).digest("hex");
}

// jwt 라이브러리를 이용해서, user_id를 token 값으로 만들어 return.
function createToken(user_id) {
  let token = jwt.sign(user_id, "secretToken");
  return token;
}

module.exports = router;
