import * as chai from "chai";
//import chai from "chai";
import chaiHttp from "chai-http";
import { app, server } from "../app.js";

// Configurar chaiHttp
chai.use(chaiHttp);
const { expect } = chai;

//<--------------------->
import { factory, seed_db } from "../util/seed_db.js";
import { faker, fakerEN_US } from "@faker-js/faker";
import User from "../models/User.js";
//<--------------------->

describe("test multiply api", function () {
  after(() => {
    server.close();
  });
  it("should multiply two numbers", (done) => {
    chai
      .request(app)
      .get("/multiply")
      .query({ first: 7, second: 6 })
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("body");
        expect(res.body).to.have.property("result");
        expect(res.body.result).to.equal(42);
        done();
      });
  });
});

//<---------------TEST_UI.MJS------------>

describe("test getting a page", function () {
  after(() => {
    server.close();
  });
  it("should get the index page", (done) => {
    chai
      .request(app)
      .get("/")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Click this link");
        done();
      });
  });
});

//<-----------REGISTRATTION &LOGON------------>(????NO FILE APARTE??)
describe("tests for registration and logon & logon", function () {
  after(() => {
    server.close();
  });

  it("should get the registration page", (done) => {
    chai
      .request(app)
      .get("/session/register")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");
        const textNoLineEnd = res.text.replaceAll("\n", "");
        const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        const cookies = res.headers["set-cookie"];
        const csrfCookie = cookies.find((element) =>
          element.startsWith("csrfToken")
        );
        expect(csrfCookie).to.not.be.undefined;
        const cookieValue = /csrfToken=(.*?);\s/.exec(csrfCookie);
        this.csrfCookie = cookieValue[1];
        done();
      });
  });

  it("should register the user", async () => {
    this.password = faker.internet.password();
    this.user = await factory.build("user", { password: this.password });
    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request = chai
        .request(app)
        .post("/session/register")
        .set("Cookie", `csrfToken=${this.csrfCookie}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(dataToPost);
      res = await request;
      console.log("got here");
      expect(res).to.have.status(200);
      expect(res).to.have.property("text");
      expect(res.text).to.include("Music List");
      newUser = await User.findOne({ email: this.user.email });
      expect(newUser).to.not.be.null;
      console.log(newUser);
    } catch (err) {
      console.log(err);
      expect.fail("Register request failed");
    }
  });
});
//<----------LOGON---------->

describe("test getting a page", function () {
  after(() => {
    server.close();
  });
  it("should log the user on", async () => {
    const dataToPost = {
      email: this.user.email, // Se modificó aquí
      password: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request = chai
        .request(app)
        .post("/session/logon")
        .set("Cookie", this.csrfCookie)
        .set("content-type", "application/x-www-form-urlencoded")
        .redirects(0)
        .send(dataToPost);
      res = await request;
      expect(res).to.have.status(302);
      expect(res.headers.location).to.equal("/");
      const cookies = res.headers["set-cookie"];
      this.sessionCookie = cookies.find((element) =>
        element.startsWith("connect.sid")
      );
      expect(this.sessionCookie).to.not.be.undefined;
    } catch (err) {
      console.log(err);
      expect.fail("Logon request failed :(");
    }
  });
  it("should get the index page", (done) => {
    chai
      .request(app)
      .get("/")
      .set("Cookie", this.sessionCookie)
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include(this.user.name);
        done();
      });
  });
});

//<<<<<<<-----------AQUI------------>>>>>>>>>>>>

//<----------LOGON OFF-------------->
/*("should log the user off", async () => {
  try {
    const res = await chai
      .request(app)
      .get("/session/logoff")
      .set("Cookie", `${this._csrf}; ${this.sessionCookie}`)
      .send();

    expect(res).to.have.status(200);

    const indexRes = await chai
      .request(app)
      .get("/")
      .set("Cookie", this.sessionCookie)
      .send();

    expect(indexRes).to.have.status(200);
    expect(indexRes.text).to.include("Click this link to logon");
    expect(indexRes.text).to.not.include(this.user.name);
  } catch (err) {
    console.log(err);
    expect.fail("Logoff request failed");
  }
});*/
