//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "homework on CS"
});
const item2 = new Item({
  name: "homework on Math"
});
const item3 = new Item({
  name: "homework on Physics"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({},function(err, foundItems){
     if(foundItems.length === 0){
       Item.insertMany(defaultItems, function(err){
         if (err){
           console.log(err);
         }
         else{
           console.log("insertMany successfully");
         }
       });
       res.redirect("/");
     }else{
       res.render("list", {listTitle: "Today", newListItems: foundItems});
     }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function (err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});



app.post("/delete", function(req, res){
  const checkBoxId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkBoxId,function(err){
      if (err){
        console.log(err);
      }else{
        console.log("successfully removed Item");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkBoxId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
        console.log("successfully removed Item");
      }
    });

  }




});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName);


  List.findOne({name: customListName}, function(err, results){
  if(!err){
    if(!results){
      const list = new List({
        name :customListName,
        items: defaultItems
      });
      list.save();
      console.log("created new list");
      res.redirect("/"+ customListName);
    }
    else{
      console.log("Items Founded !!!");
      res.render("list", {listTitle: results.name, newListItems:results.items})
    }
  }

  });

});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
