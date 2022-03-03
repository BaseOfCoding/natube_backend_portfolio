/* 라이브러리 영역 */

const express = require("express");
const app = express();
const router = express.Router();
const models = require("../models");
const multer = require("multer");
const multerS3 = require("multer-s3");
const sharp = require("sharp");
const fs = require("fs");

// AWS
const AWS = require("aws-sdk");
const BUCKET_NAME = "natubemediaserver";
const ACCESS_KEY = "AKIATOVVDUL6D6MRYM25";
const PRIVATE_ACCESS_KEY = "Xij+FZTYIKEyXvhy69HrOE+Ye/yjsXvh/KFkhXEo";
const s3 = new AWS.S3({ accessKeyId: ACCESS_KEY, secretAccessKey: PRIVATE_ACCESS_KEY });

// 업로드 되는 비디오의 위치와, 파일이름을 지정한다.
const videos = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `videos/${Date.now()}_${file.originalname.split(".").pop()}`);
    },
  }),
});

// 업로드 되는 썸네일의 위치와, 파일이름을 지정한다.
const thumbnails = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `thumbnails/${Date.now()}_${file.originalname.split(".").pop()}`);
    },
  }),
});

// 업로드 되는 프로필 이미지의 위치와, 파일이름을 지정한다.
const profileImages = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `profileImages/${Date.now()}_${file.originalname.split(".").pop()}`);
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
    videoUrl: file.location,
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
    thumbnailUrl: file.location,
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
    profileUrl: file.location,
  });
});

module.exports = router;
