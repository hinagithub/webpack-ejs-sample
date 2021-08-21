var express = require('express');
var path = require('path');
var app = express();

app.set('views', path.join(__dirname, 'dist/views'));
app.set('view engine', 'ejs');
app.use(express.static('dist/public'));
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.render('./index.ejs');
});

app.listen(3000);
