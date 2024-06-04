const Music = require("../models/music");

// GET /musics(Mostrar todas las canciones pertenecientes a este user)
const getAllMusics = async (req, res) => {
  try {
    const musics = await Music.find({ createdBy: req.user._id });
    res.render("musics", { musics });
  } catch (error) {
    console.error(error);
    res.status(500).send("error music not found");
  }
};

//POST add new music
const createMusic = async (req, res) => {
  try {
    const { singer, song, genre } = req.body;
    const newMusic = new Music({
      singer,
      song,
      genre,
      createdBy: req.user._id,
    });

    await newMusic.save();
    res.redirect("/musics");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error on add new music");
  }
};
// GET /musics/new (Mostrar el formulario para crear una nueva canción)
const newMusicForm = (req, res) => {
  res.render("music", { music: null });
};
// GET /musics/edit/:id(Obtener una canción específica y mostrarla en el formulario de edición)
const editMusicForm = async (req, res) => {
  try {
    const musicId = req.params.id;
    const music = await Music.findById(musicId);

    if (!music) {
      return res.status(404).send("music not found");
    }

    if (music.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not authorized");
    }

    res.render("music", { music });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error when retrieving a music for editing");
  }
};

// POST /musics/update/:id(Actualizar una canción específica)
const updateMusic = async (req, res) => {
  try {
    const musicId = req.params.id;
    const { singer, song, genre } = req.body;

    const music = await Music.findById(musicId); //si music existe

    if (!music) {
      return res.status(404).send("music not found");
    }

    if (music.createdBy.toString() !== req.user._id.toString()) {
      //verificar si user esta autorizado para actualizar
      return res.status(403).send(" Not authorized");
    }
    //actualizar datos de music
    music.singer = singer;
    music.song = song;
    music.genre = genre;

    await music.save(); //guardar cambios
    res.redirect("/musics"); //redirigir a pgcuando
  } catch (error) {
    console.error(error);
    res.status(500).send("Error when update music");
  }
};

// POST /musics/delete/:id(Eliminar una canción específica)
const deleteMusic = async (req, res) => {
  try {
    const musicId = req.params.id;
    const music = await Music.findById(musicId);

    if (!music) {
      return res.status(404).send("music not found");
    }

    if (music.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not authorized");
    }

    await Music.deleteOne({ _id: musicId });
    res.redirect("/musics");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting music");
  }
};

module.exports = {
  getAllMusics,
  createMusic,
  newMusicForm,
  editMusicForm,
  updateMusic,
  deleteMusic,
};
