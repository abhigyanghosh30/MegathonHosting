const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./participants.db');

app.use(bodyParser.urlencoded({ extended: true })); 
app.use('/public',express.static('public'));
app.set('view engine', 'pug')
app.set('views', './public')
app.use(session({
	secret:'keycat',
	resave: false,
	saveUninitialized: false
}));

db.serialize(function() {

	db.run("CREATE TABLE IF NOT EXISTS Participants(id INTEGER NOT NULL, name TEXT,password TEXT,PRIMARY KEY  (`id`))");
	// var stmt = db.prepare("INSERT INTO user_info VALUES (?)");
	// for (var i = 0; i < 10; i++) {
 //    	stmt.run("Ipsum " + i);
	// }
	// stmt.finalize();

	db.each("SELECT name FROM Participants", function(err, row) {
		if(err){
			console.error(err);
		}
	console.log(row.name);
  });
});

// VIEWS
app.get('/',(req,res)=>{

	res.render('login',{title: 'Login', success:false, errors: req.session.errors});
});
app.get('/login',(req,res)=>{
	res.redirect('/');
});

app.post('/enter',(req,res)=>{
	
	var post = req.body;
	if (post.name == 'admin')
		if(post.password == 'admin123')
			res.redirect('/admin_home');
		else
			res.send('Incorrect password');
	var query_row;
	db.get(`SELECT * FROM Participants WHERE name = ?`,[post.name],(err,row)=>{
		if(err)
		{
			console.error(err.message); 
		}
		else{ 
			query_row = row;
			if(row && row.password == post.password){
				req.session.username = post.name;
				res.redirect('/home');
			}
			else{
				res.send('No Result Found')
			}
		}
			
	});	
});

app.get('/home',(req,res)=>{
	req.session.username;
	res.render('home',{ title:`Home of ${req.session.username}`});
});

app.post('/upload',(req,res)=>{
	var form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });
	form.on('file',(name,file)=>{
		console.log('Uploaded'+file.name);
	});
    res.redirect('/home');
});

// PORT
const port = process.env.PORT || 3000;

app.listen(port, ()=>console.log(`Listening on ${port} `))