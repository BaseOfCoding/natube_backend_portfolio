const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;
const models = require("../models");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const { sequelize } = require("../models");
const { send } = require("express/lib/response");

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

app.use(express.json());
app.use(cors());
app.use("/videos", express.static("videos"));
app.use("/thumbnails", express.static("thumbnails"));

// gets

app.get("/videomain", async (req, res) => {
  models.videoUploads
    .findAll({
      order: [["view", "DESC"]],
      attributes: ["thumbnailUrl", "title", "nickname", "view", "updatedAt", "id"],
    })
    .then((result) => {
      console.log(result);
      res.send({
        videoDatas: result,
      });
    })
    .catch((err) => {
      console.error(`error message : ${err}`);
      res.send("에러 발생!!");
    });
});

app.get("/videotag/:tag", async (req, res) => {
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
      // res.send(result);
      res.send({
        videoDatas: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send("tag send error");
    });
});

app.get("/videoGet/:id", async (req, res) => {
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

app.get("/videoGet/:id/recommendation", async (req, res) => {
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

app.get("/viewupdate/:id", async (req, res) => {
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

app.post("/videouploads", async (req, res) => {
  const body = req.body;
  const { videoUrl, thumbnailUrl, title, description, tag, nickname, view } = body;
  models.videoUploads
    .create({
      videoUrl,
      thumbnailUrl,
      title,
      description,
      tag,
      nickname,
      view,
    })
    .then((result) => {
      res.send({ result });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send("업로드에 문제가 발생했습니다.");
    });
});

app.post("/videos", videos.single("video"), (req, res) => {
  const file = req.file;
  res.send({
    videoUrl: file.path,
  });
});

app.post("/thumbnails", thumbnails.single("image"), (req, res) => {
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
