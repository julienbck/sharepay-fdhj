const express = require("express");
const nunjucks = require("nunjucks");
const fetch = require("node-fetch");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const pg = require("pg");
const loginRequests = require("./requests/loginRequests.js");
const FacebookStrategy = require("passport-facebook").Strategy;
const FB = require("fb");

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

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.callbackURL
    },
    function(accessToken, refreshToken, profile, callback) {
      FB.api(
        "me",
        { fields: "id,name,email", access_token: accessToken },
        function(user) {
          findOrCreateUser(user)
            .then(user => {
              callback(null, user);
            })
            .catch(error => {
              callback(error);
            })
        }
      );
    }
  )
);

app.set("views", __dirname + "/views");
app.set("view engine", "njk");

passport.use(
  new LocalStrategy(function(username, password, callback) {
    loginRequests.fetchRessourceById(username)
    .then(user => {
      if (user.rowCount === 0) {
        callback("User not foundt in Database")
      } else if(user.rows[0].email === username && user.rows[0].password === password ) {
        callback(null, user.rows[0]);
      } else {
        callback("Password incorrect")//comment envoyer l'erreur
      }
    })
    .catch(error => {
      callback(error);
    });
})
);


passport.serializeUser(function(user, callback) {
  return callback(null, user.email);
});

passport.deserializeUser(function(username, callback) {
  loginRequests.fetchRessourceAll(username)
  .then(user => {
    callback(null, user);
  })
  .catch(error => {
    callback(error);
  });
});

app.get("/", function(request, result) {
  result.render("home", {
    user: request.user
  });
});

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    authType: "rerequest", // rerequest is here to ask again if login was denied once,
    scope: ["email"]
  })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  function(request, result) {
    result.redirect("/profile");
  }
);

app.get("/login", function(request, result) {
  result.render("login")
});



app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(request, result) {
    result.redirect("/profile");
  }
);

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn("/login"),
  function(request, result) {
    result.render("profile", {
      id: request.user.id,
      email: request.user.email
    });
  }
);

app.get("/logout", function(request, result) {
  request.logout();
  result.redirect("/");
});

app.use(express.static(__dirname + "/public"));
app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
