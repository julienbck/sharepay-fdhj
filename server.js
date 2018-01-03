const express = require("express");
const nunjucks = require("nunjucks");
const fetch = require("node-fetch");

const port = process.env.PORT || 3000;

const app = express();

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

app.use(express.static(__dirname + "/public"));







app.listen(port, function () {
  console.log("Server listening on port:" + port);
});
