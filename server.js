let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");

let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
let axios = require("axios");
let cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var app = express();

app.engine(
  "handlebars",
  exphbs({
      defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express


// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// A GET route for scraping the NYT website
app.get("/api/scraper", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    const articleArr = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
        
      //console.log();
      result.description = $(this).parent().parent().find("ul").text();
      result.link = "https://www.nytimes.com" + $(this).parent().parent().attr("href");

      articleArr.push(result);
    });

    // Send a message to the client
    res.json(articleArr);
  });
});

app.get("/", function(req, res) {
  res.render("index");
});

// Route for getting all Articles from the db
app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      console.log(dbArticle);
      // If we were able to successfully find Articles, send them back to the client
      res.render("saved",dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/saveArticle", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Article.findOne({ title: req.body.title })
  .then(function(dbArticle) {
    if(dbArticle){
      console.log("Duplicate found");
      res.send("You've already saved this article.");
    }
    else{
      db.Article.create(req.body)
      .then(function(dbArticle) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
      res.send("Article Saved!");
    }
    // If we were able to successfully find an Article with the given id, send it back to the client
    //res.json("dbArticle");
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
  //console.log(req.body);
  
});

app.delete("/deleteArticle",function(req,res){
  console.log(req.body.id);
  db.Article.deleteOne({ _id: req.body.id })
    .then(function() { 
      res.json("removed");
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.delete("/deleteNote",function(req,res){
  console.log(req.body.id);
  db.Note.deleteOne({ _id: req.body.id })
    .then(function() { 
      res.json("removed");
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/getComment/:id", function(req,res){
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      console.log(dbArticle);
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/addComment/:id", function(req, res) {
  console.log(req.body);
  console.log(req.params.id);
  db.Note.create(req.body)
    .then(function(dbNote) {
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
  })
  .then(function(dbArticle) {
    // If we were able to successfully update an Article, send it back to the client
    console.log("-------------------------------------------");
    console.log(dbArticle);
    console.log("-------------------------------------------");
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});