const models = require("../models");

// 인증 미들웨어, token값이 맞는 지 아닌 지를 판단하고, 맞다면 인증과 함께, user_id, 닉네임, 프로필이 저장 된 폴더 url을 넘긴다.
let auth = (req, res, next) => {
  let token = req.body.token;

  if (token != undefined) {
    models.users
      .findOne({
        where: {
          token: token,
        },
        attributes: ["user_id", "nickname", "profileUrl"],
      })
      .then((result) => {
        if (result == null) {
          res.send("auth error");
          return;
        }
        res.send({
          user_data: result,
        });
        next();
      })
      .catch((err) => {
        console.error(err);
        res.send("error");
        return;
      });
  } else {
    res.send("error");
  }
};

module.exports = { auth };
