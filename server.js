const express = require("express");
const nunjucks = require("nunjucks");
const fetch = require("node-fetch");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pg = require("pg");

const port = process.env.PORT || 3000;
const app = express();

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("cookie-parser")());
app.use(
  require("express-session")({
    secret: "pr4sesupersecretedelamortquitue2018",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());



nunjucks.configure("views", {
  autoescape: true,
  express: app
});


app.set("views", __dirname + "/views");
app.set("view engine", "njk");

app.get("/", function(request, result) {
  result.render("home")
});

app.get("/login", function(request, result) {
  result.render("login")
});

passport.serializeUser(function(user, callback) {
  return callback(null, user);
});

passport.deserializeUser(function(username, callback) {
  console.log('je suisicic');
});

passport.use(
  new LocalStrategy(function(username, password, callback) {
    const client = new pg.Client();
    client.connect();
    client.query(
      `SELECT email FROM users WHERE email = '${username}'`,
        function(error, result) {
          if (error) {
              callback(new Error("no user found"));
              client.end();
          } else {
            //console.log(result.rows[0]);
              callback (null, result.rows[0]);
          }
        }
    );
  })
);

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(request, result) {
    result.redirect("/profile");
  }
);


app.get("/logout", function(request, result) {
  request.logout();
  result.redirect("/");
});

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn("/login"),
  function(request, result) {
    console.log("toto1", request.user)
    result.render("profile", {
      id: request.user.id,
      name: request.user.displayName,
      email: request.user.email
    });
});









app.use(express.static(__dirname + "/public"));
app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
