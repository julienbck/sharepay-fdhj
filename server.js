const express = require("express");
const nunjucks = require("nunjucks");
const fetch = require("node-fetch");
const passport = require("passport");
const shajs = require('sha.js');
const loginRequests = require('./requests/loginRequests.js');
const LocalStrategy = require("passport-local").Strategy;
const pg = require("pg");
<<<<<<< HEAD
const FacebookStrategy = require("passport-facebook").Strategy;
const FB = require("fb");
const client = new pg.Client();
client.connect();
=======
const { createTransaction, payback } = require('./payback');
>>>>>>> payback page work in progress

const port = process.env.PORT || 3000;
const app = express();



const eventsRequests = require ('./requests/eventsRequests.js');

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

passport.use(
  new LocalStrategy(function(username, password, callback) {
    loginRequests.fetchRessourceById(username)
    .then(user => {
      if (user.rowCount === 0) {
        callback("User not foundt in Database")
      } else if(user.rows[0].email === username && user.rows[0].password === shajs('sha256').update(password).digest('hex') ) {
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

app.get("/login", function(request, result) {
  result.render("login")
});

// liste des evenements
app.get("/events", function(request, result) {

  eventsRequests.getAllEvents(
    function(events){
      result.render("events", {events: events })
    }
  );

});

passport.serializeUser(function(user, callback) {
  return callback(null, user);
});

// app.post(
//   "/login", passport.authenticate('local', { successRedirect: "/profile", failureRedirect: "/login" })
// );
app.get("/register", function(request, result) {
  result.render("register");
});

app.post("/register",
 function(request, result) {
  const user = request.body;
  //console.log(request.body);
  client.query("SELECT email FROM users")
  .then(dbResult => {
    if (!dbResult.rows.some(u => u.email === user.username)) {
      client.query("INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)", [user.firstname, user.lastname, user.username, shajs('sha256').update(user.password).digest('hex')]);
    }
    result.redirect("/login");
  })
  .catch(error => {
    console.warn(error);
    result.redirect("/register");
  });
});



app.get("/events", function(request, result) {
  result.render("events")
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
    console.log("redirect to /profile");
    result.redirect("/profile");
  }
);


app.get("/logout", function(request, result) {
  request.logout();
  result.redirect("/");
});

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn("/"),
  function(request, result) {
    //console.log("toto", request.user)
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
