/* 라이브러리 영역 */

const express = require("express");
const router = express.Router();
const models = require("../models");

// 현재 업로드 된 비디오 전부를 찾아서, 조회수 순으로 정렬해서, attributes에 선언된 key값의 value를 보내는 get 요청 함수
router.get("/videomain", async (req, res) => {
  models.videoUploads
    .findAll({
      order: [["view", "DESC"]],
      attributes: ["thumbnailUrl", "title", "nickname", "view", "createdAt", "id", "profileUrl"],
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

// 이건, 아직 사용하지 않았지만, 해당 tag를 클릭하면, tag가 맞는 영상들만 조회수 순으로 정렬해서 보내는 get 요청 함수
router.get("/videotag/:tag", async (req, res) => {
  const params = req.params;
  const { tag } = params;
  models.videoUploads
    .findOne({
      where: {
        tag: tag,
      },
      order: [["view", "DESC"]],
      attributes: ["thumbnailUrl", "title", "nickname", "view", "createdAt", "id"],
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

// 비디오를 클릭했을 때, 해당 비디오의 id의 비디오 정보만을 넘겨주는 get 요청 함수
router.get("/videoGet/:id", async (req, res) => {
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

// 클릭한 video와 같은 tag를 가진 영상들이 있는 지 확인하고 있다면, 전부 넘겨주는 get 요청 함수
router.get("/videoGet/:id/recommendation", async (req, res) => {
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

// 클릭한 비디오의 조회수를 올려주는 get 요청 함수
router.get("/viewupdate/:id", async (req, res) => {
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

module.exports = router;
