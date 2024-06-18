const Music = require("../models/music");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);
factory.define("music", Music, {
  singer: () => faker.singer.name(),
  song: () => faker.person.MusicTitle(),
  genre: () =>
    [
      "pop",
      "rock",
      "classic",
      "country",
      "electronic",
      "latina",
      "salsa",
      "merengue",
      "pasodoble",
      "blues",
      "jazz",

      "soul",
      "rap",
    ][Math.floor(3 * Math.random())], // random one of these
});
factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Music.deleteMany({}); // deletes all music records
    await User.deleteMany({}); // and all the users
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("music", 20, { createdBy: testUser._id }); // put 30 music entries in the database.
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };
