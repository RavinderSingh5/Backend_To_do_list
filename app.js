const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "Hit the delete button to delete an item from the todolist"
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Successfully saved default items to DB.");
//     }
// });

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/', (req, res) => {
    Item.find({}, function (err, foundItems) {
        res.render("index", {
            listTitle: "TODAY",
            newlistitems: foundItems
        });
    });
});

app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an existing list
                res.render("index", { listTitle: foundList.name, newlistitems: foundList.items })
            }

        }
    });

});

app.post("/action_two", (req, res) => {
    let itemName = req.body.newitem;
    let listName = req.body.list;

    const item = new Item({     
        name: itemName
    });

    //Condition for adding new items in custom list without redirecting to the "/" 
    if (listName === "TODAY") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            if(!err) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }
});

app.post("/action_one", (req, res) => {
    let item_to_delete = req.body.delete;
    let listName = req.body.listName;

    if(listName === "TODAY"){
        Item.findByIdAndRemove(item_to_delete, function (err) {
            if (!err) {
                res.redirect("/");
            }
        });
    }
    else {
        Item.findByIdAndRemove(item_to_delete, function (err) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
         
    }

    //Will apply the working for the delete button of customlist page similarly we have applied the working of submit button

    res.redirect("/");
})

app.listen(3000, function () {
    console.log("Server is started on port 3000");

});