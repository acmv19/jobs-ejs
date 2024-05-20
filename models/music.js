const { string } = require("joi");
const mongoose = require("mongoose");

const MusicSchema = new mongoose.Schema(
  {
    singer: {
      type: String,
      required: [true, "please provide singer name"],
      maxLength: 50,
    },
    song: {
      type: String,
      required: [true, "please provide a song name"],
      maxLength: 100,
    },
    Genre: {
      type: String,
      enum: [
        "pop",
        "country",
        "rock",
        "classic",
        "electronic",
        "latina",
        "salsa",
        "merengue",
        "pasodoble",
        "blues",
        "jazz",
        "soul",
        "rap",
      ],
      default: "pop",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Music", MusicSchema);
