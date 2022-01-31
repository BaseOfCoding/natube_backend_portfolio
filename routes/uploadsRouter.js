/* 라이브러리 영역 */

const express = require("express");
const app = express();
const router = express.Router();
const models = require("../models");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

// 업로드 되는 비디오의 위치와, 파일이름을 지정한다.
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

// 업로드 되는 썸네일의 위치와, 파일이름을 지정한다.
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

// 업로드 되는 프로필 이미지의 위치와, 파일이름을 지정한다.
const profileImages = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "profileImages");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

app.use("/videos", express.static("videos"));
app.use("/thumbnails", express.static("thumbnails"));
app.use("/profileImages", express.static("profileImages"));

// 업로드 창에서의 비디오 / 썸네일 / 제목 / 설명 / 태그 등등의 정보들을 받아서, db에 저장하는 post 요청 함수
router.post("/videouploads", async (req, res) => {
  const body = req.body;
  const { videoUrl, thumbnailUrl, title, description, tag, nickname, view, profileUrl, userIP } = body;
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
      userIP,
    })
    .then((result) => {
      res.send({ result });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send("업로드에 문제가 발생했습니다.");
    });
});

// 비디오를 업로드하면, videos 폴더에 해당 파일이 올라가고, 해당 video 폴더의 url과 파일이름을 클라이언트에 보내주는 post 요청 함수
router.post("/videos", videos.single("video"), (req, res) => {
  const file = req.file;
  res.send({
    videoUrl: file.path,
  });
});

// 위와 같이 썸네일을 업로드 할 경우 thumbnails 폴더에 해당 이미지 파일이 올라가지만, sharp라는 라이브러리를 이용해서, 썸네일 이미지를 1280 * 720 사이즈로 리사이징해서 저장하는 post 요청 함수
router.post("/thumbnails", thumbnails.single("image"), (req, res) => {
  const file = req.file;
  try {
    sharp(file.path)
      .resize({ fit: "fill", width: 1280, height: 720 })
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

// 프로필 이미지를 저장하는 post 요청 함수, 이것도 마찬가지로, 200 * 200 사이즈로 리사이징해서 저장하는 post 요청하는 함수
router.post("/profileImages", profileImages.single("image"), (req, res) => {
  const file = req.file;
  try {
    sharp(file.path)
      .resize({ fit: "fill", width: 200, height: 200 })
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
    profileUrl: file.path,
  });
});

module.exports = router;
