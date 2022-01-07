const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;
const models = require("../models");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { auth } = require("../middleware/auth");

const videos = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "videos");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

const thumbnails = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "thumbnails");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

const profiles = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "profileImages");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use("/videos", express.static("videos"));
app.use("/thumbnails", express.static("thumbnails"));
app.use("/profileImages", express.static("profileImages"));
app.use(cookieParser());

// gets

app.get("/api/videomain", async (req, res) => {
  models.videoUploads
    .findAll({
      order: [["view", "DESC"]],
      attributes: ["thumbnailUrl", "title", "nickname", "view", "updatedAt", "id"],
    })
    .then((result) => {
      res.send({
        videoDatas: result,
      });
    })
    .catch((err) => {
      console.error(`error message : ${err}`);
      res.send("에러 발생!!");
    });
});

app.get("/api/videotag/:tag", async (req, res) => {
  const params = req.params;
  const { tag } = params;
  models.videoUploads
    .findOne({
      where: {
        tag: tag,
      },
      order: [["view", "DESC"]],
      attributes: ["thumbnailUrl", "title", "nickname", "view", "updatedAt", "id"],
    })
    .then((result) => {
      res.send({
        videoDatas: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.send("tag send error");
    });
});

app.get("/api/videoGet/:id", async (req, res) => {
  const params = req.params;
  const { id } = params;
  models.videoUploads
    .findOne({
      where: { id: id },
    })
    .then((result) => {
      res.send({
        videoData: result,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/api/videoGet/:id/recommendation", async (req, res) => {
  const { id } = req.params;

  models.videoUploads
    .findOne({
      where: { id: id },
    })
    .then((videos) => {
      models.videoUploads
        .findAll({
          where: {
            tag: videos.tag,
            id: { [models.Sequelize.Op.ne]: id },
          },
          order: [["view", "DESC"]],
        })
        .then((result) => {
          res.send({ videoDatas: result });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("에러 발생!");
        });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/api/viewupdate/:id", async (req, res) => {
  const { id } = req.params;

  models.videoUploads
    .increment({ view: 1 }, { where: { id } })
    .then((result) => {
      res.send({
        result: true,
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

// posts

app.post("/api/videouploads", async (req, res) => {
  const body = req.body;
  const { videoUrl, thumbnailUrl, title, description, tag, nickname, view, profileUrl } = body;
  models.videoUploads
    .create({
      videoUrl,
      thumbnailUrl,
      title,
      description,
      tag,
      nickname,
      view,
      profileUrl,
    })
    .then((result) => {
      res.send({ result });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send("업로드에 문제가 발생했습니다.");
    });
});

app.post("/api/videos", videos.single("video"), (req, res) => {
  const file = req.file;
  res.send({
    videoUrl: file.path,
  });
});

app.post("/api/thumbnails", thumbnails.single("image"), (req, res) => {
  const file = req.file;
  try {
    sharp(req.file.path)
      .resize({ width: 1024, height: 768 })
      .withMetadata()
      .toBuffer((err, buffer) => {
        if (err) {
          throw err;
        }
        fs.writeFile(req.file.path, buffer, (err) => {
          if (err) {
            throw err;
          }
        });
      });
  } catch (err) {
    console.error("image resize error : " + err);
  }

  res.send({
    thumbnailUrl: file.path,
  });
});

app.post("/api/profileImages", thumbnails.single("image"), (req, res) => {
  const file = req.file;
  try {
    sharp(file.path)
      .resize({ width: 200, height: 200 })
      .withMetadata()
      .toBuffer((err, buffer) => {
        if (err) {
          throw err;
        }
        fs.writeFile(file.path, buffer, (err) => {
          if (err) {
            throw err;
          }
        });
      });
  } catch (err) {
    console.error("image resize error : " + err);
  }

  res.send({
    thumbnailUrl: file.path,
  });
});

app.post("/api/users/signin", async (req, res) => {
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
        res.cookie("x_auth", token).status(200).send({ resultData: result });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/api/users/signup", async (req, res) => {
  const body = req.body;
  const { user_id, password, profile_url, nickname } = body;
  let tempCryptoPassword = password;

  models.users
    .findAll({
      where: {
        user_id: user_id,
      },
    })
    .then((result) => {
      if (result.length == 0) {
        models.users
          .create({
            user_id,
            password: passwordEncryption(tempCryptoPassword),
            nickname,
            profileUrl: profile_url,
          })
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            console.error(err);
            res.send("error");
          });
      } else {
        res.send("아이디 존재");
      }
    })
    .catch((err) => {
      console.error("signup error : ", err);
      res.send("signup error");
    });
});

app.post("/api/users/auth", auth, (req, res) => {});

app.listen(port, () => {
  console.log("서버 돌아가는 중...");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB 연결 성공");
    })
    .catch((err) => {
      console.error(err);
      process.exit();
    });
});

function passwordEncryption(password) {
  return crypto.createHash("sha512").update(password).digest("hex");
}

function createToken(user_id) {
  let token = jwt.sign(user_id, "secretToken");
  return token;
}
