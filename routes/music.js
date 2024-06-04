const express = require("express");
const router = express.Router();

const {
  getAllMusics,
  createMusic,
  newMusicForm,
  editMusicForm,
  updateMusic,
  deleteMusic,
} = require("../controllers/music");

router.route("/").get(getAllMusics).post(createMusic); // GET /musics

router.route("/new").get(newMusicForm); // GET /musics/new

router.route("/edit/:id").get(editMusicForm); // GET /musics/edit/:id

router.route("/update/:id").post(updateMusic); // POST /musics/update/:id

router.route("/delete/:id").post(deleteMusic); // POST /musics/delete/:id

module.exports = router;
