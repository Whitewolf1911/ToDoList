//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const dbItem = new Item({
  name: "Do something !!!",
});

const dbItem1 = new Item({
  name: "Buy some sausage",
});

const defaultItems = [dbItem, dbItem1];

app.get("/", function (req, res) {
  Item.find({}, function (err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("everything inserted.");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: results });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;

  var newItem = new Item({
    name: req.body.newItem,
  });
  newItem.save();
  res.redirect("/");
});

app.post("/delete", function (req, res) {

  const checkedItemID = req.body.checkbox.trim();
  
  console.log(req.body.checkbox);

  Item.findByIdAndDelete(checkedItemID, function (err) {
    if(err){
      console.log(err);
    }
    else{
      console.log("Item deleted");
    }
    });
  res.redirect("/");

});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
