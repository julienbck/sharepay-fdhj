const express = require("express");
const nunjucks = require("nunjucks");
const fetch = require("node-fetch");
const passport = require("passport");
const shajs = require('sha.js');
const loginRequests = require('./requests/loginRequests.js');
const newExpenseRequest = require('./requests/newExpenseRequest.js');
const spendingsRequests = require('./requests/spendingRequests.js');
const eventsRequests = require ('./requests/eventsRequests.js');

const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const pg = require("pg");
const FB = require("fb");
const client = new pg.Client();

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

app.get("/register", function(request, result) {
  result.render("register");
});


app.post("/register",
 function(request, result) {
  client.connect();
  const user = request.body;
  //console.log(request.body);
  client.query("SELECT email FROM users")
  .then(dbResult => {
    if (!dbResult.rows.some(u => u.email === user.username)) {
      client.query("INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)", [user.firstname, user.lastname, user.username, shajs('sha256').update(user.password).digest('hex')])
      result.redirect("/login")
    } else {
      result.render("register", {error : true})
    }
  })
  .catch(error => {
    console.warn(error);
    result.redirect("/register");
  });

});

// liste des evenements
app.get("/events",

  require("connect-ensure-login").ensureLoggedIn("/"),
  function(request, result) {

  eventsRequests.getAllEvents(
    function(events){
      result.render("events", {events: events })
    }
  );

});

// get balance
app.get("/events/:id/balance",

  require("connect-ensure-login").ensureLoggedIn("/login"),
  function(request, result) {

  result.render("balance");

})

// GET new event
app.get("/events/new",

  require("connect-ensure-login").ensureLoggedIn("/login"),
  function(request, result) {

  eventsRequests.getEvent(request.params.id,
    function(event, users){
      result.render("eventEdit", {event: event, users:users, titre:"Créer", route:"/events/new"})
    }
  )
});






// post new event
app.post("/events/new",
  require("connect-ensure-login").ensureLoggedIn("/"),
  function(request, result) {

  // console.log("post new event " + request.body);

  eventsRequests.fullInsertEvent({id:request.body.id, title:request.body.title, place:request.body.place, date:request.body.date, status:request.body.status}, { participants:request.body.participants}, request.user)
  .then( () => result.redirect("/events"));

});


// get modify and event
app.get("/events/:id/edit",

  require("connect-ensure-login").ensureLoggedIn("/login"),
  function(request, result) {

  eventsRequests.getEvent(request.params.id,
    function(event, users){
      result.render("eventEdit", {event: event, users:users, titre:"Modifier", route:"/events/"+request.params.id+"/edit"});
    }
  )
})

// post modify event
app.post("/events/:id/edit",

  require("connect-ensure-login").ensureLoggedIn("/"),
  function(request, result) {

  // console.log(request.body);
  const event = {
    id:request.body.id,
    title:request.body.title,
    place:request.body.place,
    date:request.body.date,
    status:request.body.status};

  const participants = {
    participants:request.body.participants
  };

  eventsRequests.fullUpdateEvent(event, participants)
  .then(() => result.redirect("/events"));

});



passport.serializeUser(function(user, callback) {
  return callback(null, user);
});




app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(request, result) {
    result.redirect("/events");
  }
);

app.get("/events/:id/spendings/new",
require("connect-ensure-login").ensureLoggedIn("/"),
function(request, result) {
  newExpenseRequest.getAllUsersForEventId(request.params.id)
  .then (elements => {
    console.log(elements.rows)
    result.render("newExpenseRequest", {elements: elements.rows});
  }
)
});

app.post("/events/:id/spendings/new",
require("connect-ensure-login").ensureLoggedIn("/"),
 function(request, result){
  const input = request.body;
  console.log(input);
  result.redirect("/events");
});

app.get("/events/:id/spendings/list",
require("connect-ensure-login").ensureLoggedIn("/"),
function(request, result) {
  spendingsRequests.getAllSpendingForEventID(request.params.id)
  .then(elements => {
  result.render("spendings", {elements: elements.rows, id_event : request.params.id} )
  })
});

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn("/"),
  function(request, result) {
    result.render("profile", {
      id: request.user.id,
      email: request.user.email,
      firstname: request.user.first_name
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
