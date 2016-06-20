
var express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer');

var app = express();
var port = process.env.PORT || 8080;

// see body-parser middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// Setting Route, inject Book
// var upload = require('./routes')();

// app.use('/api/books', bookRouter);
// // app.use('/api/author', authorRouter);

var upload = multer({
  dest: __dirname + '/dist/uploads/',
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
  },
  onFileUploadStart: function (file) {
    console.log(file.fieldname + ' is starting ...')
  },
  inMemory: true
});



app.post('/uploads', upload.single('file'), function(req, res){
  console.log(req.file);
  res.status(204).end();
});

app.get('/', function(request, response){
  response.send('welcome to my API!');
});


app.listen(port, function(){
  console.log('Express is running on port: ' + port );
});
