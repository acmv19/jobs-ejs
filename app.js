const express = require("express");
require("express-async-errors");
require("dotenv").config(); // to load the .env file into the process.env object
const secretWordRouter = require("./routes/secretWord");
const musicRouter = require("./routes/music");
const auth = require("./middleware/auth");
const app = express();
//security packages:
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParse = require("cookie-parser");
const csrf = require("host-csrf");

const session = require("express-session");
/*app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);*/
const passport = require("passport");
const passportInit = require("./passport/passportInit");

const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")()); //

app.use(require("./middleware/storeLocals"));

// Security middleware
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 min
    max: 100, // limit each IP to 100 request per window
  })
);
//extra security package
app.use(helmet());
app.use(xss());

// CSRF Protection Middleware
app.use(cookieParse(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

let csrf_development_mode = true;

if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}
const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options); // <-- Inicializar middleware CSRF

app.use(csrf_middleware); // Must come after cookie-parser and body-parser, but before routes

//routes

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

// secret word handling
//let secretWord = "syzygy";
/*app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("errors");
  res.render("secretWord", { secretWord: req.session.secretWord });
});
app.post("/secretWord", (req, res) => {
  if (req.body.secretWord.toUpperCase([0] == "P")) {
    req.flash("error", "that word won't work!!");
    req.flash("error", "you can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("inf", "the secret word was changed");
  }
  //secretWord = req.body.secretWord;
  res.redirect("/secretWord");
});*/ //

app.use("/secretWord", secretWordRouter);
app.use("/secretWord", auth, secretWordRouter);
app.use("/musics", auth, musicRouter); //<-----aqui----->

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403).send("CSRF token validation failed");
  } else {
    res.status(500).send(err.message);
    console.log(err);
  }
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
