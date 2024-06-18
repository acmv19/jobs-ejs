import { launch } from "puppeteer";
import { server } from "../app.js";
import { seed_db, testUserPassword } from "../util/seed_db.js";

let testUser = null;

const runTests = async () => {
  let page = null;
  let browser = null;

  describe("index page test", function () {
    // Configuración antes de las pruebas
    before(async function () {
      this.timeout(10000); // Extiende el tiempo de espera para la inicialización
      browser = await launch();
      page = await browser.newPage();
      await page.goto("http://localhost:3000");
    });

    // Limpieza después de las pruebas
    after(async function () {
      this.timeout(5000); // Extiende el tiempo de espera para la limpieza
      if (browser) await browser.close();
      if (server) server.close();
    });

    // Prueba de conexión básica
    describe("got to site", function () {
      it("should have completed a connection", function (done) {
        // Este test es trivial y solo llama a done para indicar que se completó
        done();
      });
    });

    // Prueba de la página de índice
    describe("index page test", function () {
      this.timeout(10000);

      it("finds the index page logon link", async function () {
        // Espera a que aparezca el enlace de logon en la página de índice
        this.logonLink = await page.waitForSelector(
          'a[href="/sessions/logon"]'
        );
      });

      it("gets to the logon page", async function () {
        await this.logonLink.click();
        await page.waitForNavigation(); // Espera a que la navegación se complete
        const email = await page.waitForSelector('input[name="email"]');
      });
    });

    // Prueba de la página de inicio de sesión
    describe("logon page test", function () {
      console.log("at line 48", this.outerd, this.innerd, this.secondIt);
      this.timeout(200000);

      it("resolves all the fields", async function () {
        this.email = await page.waitForSelector('input[name="email"]');
        this.password = await page.waitForSelector('input[name="password"]');
        this.submit = await page.waitForSelector('button[type="submit"]');
      });

      it("sends the logon", async function () {
        testUser = await seed_db();
        await this.email.type(testUser.email);
        await this.password.type(testUserPassword);
        await this.submit.click();
        await page.waitForNavigation(); // Espera a que la navegación se complete
        await page.waitForSelector(
          `p:contains('${testUser.name} is logged on.')`
        );
        await page.waitForSelector('a[href="/secretWord"]');

        // Busca el texto "copyright" en la página
        const copyrText = await page.evaluate(() => {
          const element = document.querySelector('p:contains("copyright")');
          return element ? element.textContent : null;
        });

        console.log("copyright text: ", copyrText);
      });
    });
  });
};

// Ejecutar las pruebas
runTests();
