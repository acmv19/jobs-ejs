//<<<<<<-------------need help ????????????------->>>>>>>>>>
import * as chai from "chai";

//import chai from "chai";
import chaiHttp from "chai-http";
import puppeteer from "puppeteer";
import { app, server } from "../app.js";
import music from "../models/music.js";

// Configurar chaiHttp
chai.use(chaiHttp);
const { expect } = chai;

// Abre el navegador Puppeteer antes de todas las pruebas
let browser;
let page;

before(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

// Cierra el navegador Puppeteer después de todas las pruebas
after(async () => {
  await browser.close();
  server.close();
});

// código de prueba actual...

describe("test music operations", function () {
  describe("test viewing music listings", function () {
    it("should display the music listings page ", async () => {
      await page.goto("http://localhost:3000/musics");
      const content = await page.content();
      const entries = content.split("<li>").length - 1;
      expect(entries).to.equal(20);
    });
  });

  describe("test adding music", function () {
    it("should display the 'Add A music' form", async () => {
      await page.goto("http://localhost:3000/musics");
      await page.click("#addMusicButton");
      await page.waitForSelector("#musicForm");
      const formVisible = await page.$eval(
        "#musicForm",
        (form) => form !== null
      );
      expect(formVisible).to.be.true;
    });

    it("should add a new music listing", async () => {
      await page.goto("http://localhost:3000/musics");
      await page.click("#addMusicButton");
      await page.waitForSelector("#musicForm");

      // Simulate form submission
      const musicData = await factory.build("music");
      await page.type("#musicTitleInput", musicData.title);
      await page.type("#musicDescriptionInput", musicData.description);
      await page.type("#musicLocationInput", musicData.location);
      await page.click("#addMusicSubmitButton");

      // Wait for musics list to reload
      await page.waitForSelector("#musicsList");

      // Verify success message
      const successMessage = await page.$eval(
        "#successMessage",
        (message) => message.textContent
      );
      expect(successMessage).to.include("music listing has been added");

      // Check database for latest entry
      const latestMusic = await music.findOne({ title: musicData.title });
      expect(latestMusic).to.exist;
      expect(latestMusic.title).to.equal(musicData.title);
      expect(latestMusic.description).to.equal(musicData.description);
      expect(latestMusic.location).to.equal(musicData.location);
    });
  });
});
