const express = require("express");
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./participants.db");

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.set("view engine", "pug");
app.set("views", "./public");
app.use(
    session({
        secret: "keycat",
        resave: false,
        saveUninitialized: false
    })
);

db.serialize(function() {
    db.run(
        "CREATE TABLE IF NOT EXISTS Participants(`name`	TEXT,`password`	TEXT,`regno` TEXT UNIQUE, PRIMARY KEY(name))"
    );
    db.run("CREATE TABLE IF NOT EXISTS Files(`name` TEXT,`path` TEXT,`regno` TEXT, FOREIGN KEY(regno) REFERENCES Participants(regno) )");
    // for(var i=1;i<=20;i++)
    // {
    // 	db.run(`INSERT INTO Participants(name,password) VALUES(?,?)`,['Participant'+i,'pass'+i]);
    // }
    db.each("SELECT * FROM Participants", function(err, row) {
        if (err) {
            console.error(err);
        }
        console.log(row);
    });
});

// VIEWS
app.get("/", (req, res) => {
    if (!req.session.username)
        res.render("login", {
            title: "Login",
            success: false,
            errors: req.session.errors
        });
    else res.redirect("/home");
});
app.get("/login", (req, res) => {
    req.session.username = undefined;
    res.redirect("/");
});

app.post("/enter", (req, res) => {
    var post = req.body;
    if (post.name == 'admin')
    	if(post.password == 'mastergworksinc@123')
    	{
			req.session.username='admin';
			req.session.regno='admin';
			res.redirect('/admin_home');
			return;
    	}
    	else
    		res.send('Incorrect password');
    var query_row;
    db.get(
        "SELECT * FROM Participants WHERE name = ?",
        [post.name],
        (err, row) => {
            if (err) {
                console.error(err.message);
            } else {
                query_row = row;
                if (row && row.password == post.password) {
					req.session.username = post.name;
					req.session.regno = row.regno;
                    res.redirect("/home");
                } else {
                    res.send("No Result Found");
                }
            }
        }
    );
});

app.get("/home", (req, res) => {
    if (!req.session.username) res.redirect("/");
    db.serialize(() => {
        db.all(
            "SELECT path FROM Files WHERE name = (?)",
            [req.session.username],
            function(err, rows) {
                if (err) {
                    console.error(err);
                }
                console.log(rows);
                res.render("home", {
                    title: `Home of ${req.session.username}`,
                    files: rows,
                    filesExist: !!rows.length
                });
            }
        );
    });
});

app.get("/download/:file", (req, res) => {
    if (!req.session.username) res.redirect("/");
    res.download(__dirname + "/uploads/" + req.params.file);
    res.status(200);
});

app.get("/delete/:file", (req, res) => {
    if (!req.session.username) res.redirect("/");
    db.serialize(() => {
        db.run("DELETE FROM Files WHERE name = (?) AND path = (?)", [
            req.session.username,
            req.params.file
        ]);
        fs.unlinkSync(__dirname + "/uploads/" + req.params.file);
        console.log("File Deleted");
        res.redirect("/home");
    });
});

app.post("/upload", (req, res) => {
    if (!req.session.username) res.redirect("/home");
    var form = new formidable.IncomingForm();
    form.parse(req);
    form.maxFileSize = 50 * 1024 * 1024;
    form.on("fileBegin", function(name, file) {
		if(file.name=="")
			file.name = "empty";
			file.path = __dirname + "/uploads/" + file.name;
    });
    form.on("file", (name, file) => {
		if(file.name=="")
			file.name="empty";

		console.log("Uploaded", file.name);

		db.run("INSERT INTO Files(name,path,regno) VALUES (?,?,?)", [
			req.session.username,
			file.name,
			req.session.req
		]);
		res.redirect("/home");
    });
    form.on("error", err => {
        res.render("error", {
            title: "Error",
            error: "File size not within 50MB."
        });
    });
});

app.get("/admin_home",(req,res)=>{
	if(req.session.username!="admin")
		res.redirect('/login');
	db.serialize(()=>{
		db.all("SELECT * FROM Files", (err, rows)=>{
			if(err){
				console.log(err);
			}
			else{
				console.log(rows);
				res.render('admin_home',{title:"Admin Home",files:rows});
			}
		});
	});
});

// PORT
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on ${port} `));
