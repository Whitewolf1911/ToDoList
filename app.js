const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
var items = [];
app.get("/", function (req, res) {
  var today = new Date();
  var options = { weekday: "long", day: "numeric", month: "long" };
  var day = today.toLocaleDateString("tr", options);

  res.render("list", { dayofWeek: day, listArray: items });
});

app.listen(3000, function () {
  console.log("server is running at port 3000");
});

app.post("/", function (req, res) {
  var newItem = req.body.todoItem;
  items.push(newItem);
  res.redirect("/");
});
