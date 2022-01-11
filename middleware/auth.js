const models = require("../models");

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
