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

	db.run("CREATE TABLE IF NOT EXISTS Participants(`name`	TEXT,`password`	TEXT)");
	db.run("CREATE TABLE IF NOT EXISTS Files(name TEXT,path TEXT)");
	// for(var i=1;i<=20;i++)
	// {
	// 	db.run(`INSERT INTO Participants(name,password) VALUES(?,?)`,['Participant'+i,'pass'+i]);
	// }
	db.each("SELECT * FROM Participants", function(err, row) {
		if(err){
			console.error(err);
		}
	console.log(row);
  });
});

// VIEWS
app.get('/',(req,res)=>{
	if(req.session.username)
		res.redirect('/home')
	res.render('login',{title: 'Login', success:false, errors: req.session.errors});
});
app.get('/login',(req,res)=>{
	res.redirect('/');
});

app.post('/enter',(req,res)=>{
	
	var post = req.body;
	if (post.name == 'admin')
		if(post.password == 'admin123')
		{
			req.session.username='admin';
			res.redirect('/admin_home');
		}
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
	if(!req.session.username)
		res.redirect('/');
	db.serialize(()=>{
		db.all(`SELECT path FROM Files WHERE name = (?)`,[req.session.username], function(err, rows) {
			if(err){
				console.error(err);
			}
			console.log(rows);
			res.render('home',{ title:`Home of ${req.session.username}`,files:rows});
		});
	});
	
});

app.get('/download/:file',(req,res)=>{
	if(!req.session.username)
		res.redirect('/');
	res.download(__dirname+'/uploads/'+req.params.file);
	res.status(200);
});

app.get('/delete/:file',(req,res)=>{
	if(!req.session.username)
		res.redirect('/');
	db.serialize(()=>{
		db.run(`DELETE FROM Files WHERE name = (?) AND path = (?)`,[req.session.username,req.params.file]);
		fs.unlinkSync(__dirname+'/uploads/'+req.params.file);
		console.log('File Deleted');
		res.redirect('/home');
	});
});

app.post('/upload',(req,res)=>{
	var form = new formidable.IncomingForm();
	form.parse(req);
	form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });
	form.on('file',(name,file)=>{
		console.log('Uploaded'+file.name);
		db.run(`INSERT INTO Files(name,path) VALUES (?,?)`,[req.session.username,file.name]);
	});
    res.redirect('/home');
});

app.get('/admin_home',(req,res)=>{
	if(!req.session.username=='admin')
		res.redirect('/');
	db.all
	res.render('admin_home',{title:'Admin'})
});

app.get('/files',(req,res)=>{
	
});

// PORT
const port = process.env.PORT || 3000;

app.listen(port, ()=>console.log(`Listening on ${port} `))