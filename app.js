//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
var _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);
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
  const listName = req.body.list;

  var newItem = new Item({
    name: item,
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function (req, res) {

  const checkedItemID = new mongoose.mongo.ObjectId(req.body.checkbox.trim());
  const listName = req.body.listName;
  console.log(listName.trim());
  console.log(req.body.checkbox);

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemID, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted");
        res.redirect("/");
      }
    });
  } else {
    // deleting the item in array from document.
    List.findOne({name : listName}, function (err, foundList) {
      foundList.items.pull({_id : checkedItemID});
      foundList.save();
      res.redirect("/" + listName);
      });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (foundList) {
        // console.log(foundList + " EXIST");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        console.log("new list created");
        res.redirect("/" + customListName);
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
