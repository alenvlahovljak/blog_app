var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

//define constants
var PORT = process.env.PORT || 3000;
var ATLAS_DB = process.env.ATLAS_DB;

//App config
mongoose.connect(ATLAS_DB || "mongodb://localhost:27017/blog_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//must be after body-parser
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Mongoose/model config

var blogSchema = mongoose.Schema({
	title: String,
	image: String,
	body: String,
	//default date
	created: { type: Date, default: Date.now }
});
var Blog = mongoose.model("Blog", blogSchema);

/* test
Blog.create(
    {
        title: "Test blog", 
        image: "https://images.unsplash.com/photo-1556742077-0a6b6a4a4ac4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
        body:"Lorem ipsum",
    });
*/

//RESTfull routes

app.get("/", function (req, res) {
	res.redirect("/blogs");
});

//INDEX route
app.get("/blogs", function (req, res) {
	Blog.find({}, function (err, blogs) {
		if (err) console.log(err);
		else res.render("index", { blogs: blogs });
	});
});

//NEW route
app.get("/blogs/new", function (req, res) {
	res.render("new");
});

//CREATE route
app.post("/blogs", function (req, res) {
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function (err, newBlog) {
		if (err) res.render("new");
		//redirect to the index page
		else res.redirect("/blogs");
	});
});

//SHOW route
app.get("/blogs/:id", function (req, res) {
	Blog.findById(req.params.id, function (err, foundBlog) {
		console.log("BLOg", foundBlog.image.length == 0);
		if (err) res.redirect("index");
		else res.render("show", { blog: foundBlog });
	});
});

//EDIT route
app.get("/blogs/:id/edit", function (req, res) {
	Blog.findById(req.params.id, function (err, foundBlog) {
		if (err) res.redirect("/blogs");
		else res.render("edit", { blog: foundBlog });
	});
});

//UPDATE route
app.put("/blogs/:id", function (req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
		if (err) res.redirect("/blogs");
		else res.redirect("/blogs/" + req.params.id);
	});
});

//DELETE route
app.delete("/blogs/:id", function (req, res) {
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function (err) {
		if (err)
			//redirect somewhereS
			res.redirect("/blogs");
		else res.redirect("/blogs");
	});
});

app.listen(PORT, function () {
	console.log(`Blog app has started on port ${PORT}!`);
});
