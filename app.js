const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const bodyParser = require('body-parser');
const {freeCurrency} = require("./lib/free-currency-service");
const { getSymbols } = require('./lib/fixer-service');
require('dotenv').config(); // read .env files

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);


//////
// Set public folder as root
app.use(express.static('public'));

// Parse POST data as URL encoded data
app.use(bodyParser.urlencoded({
  extended: true,
}));
// Parse POST data as JSON
app.use(bodyParser.json());



// Express Error handler

const errorHandler = (err, req, res) => {
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    res.status(403).send({ title: 'Server responded with an error', message: err.message });
  } else if (err.request) {
    // The request was made but no response was received
    res.status(503).send({ title: 'Unable to communicate with server', message: err.message });
  } else {
    // Something happened in setting up the request that triggered an Error
    res.status(500).send({ title: 'An unexpected error occurred', message: err.message });
  }
};

// Fetch Symbols
app.get('/api/symbols', async (req, res) => {
  try {
    const data = await getSymbols();
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Convert Currency question to API server
app.post('/api/convert', async (req, res) => {
  try {
    const {from,to, amount} = req.body;

    const data = await freeCurrency(amount, from,to,function cb(err, total){        //question to api server
        res.setHeader('Content-Type', 'application/json');             //answer from server
        res.send({val:total});
        console.log('total value send to client:',total)

    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

//////
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res,) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Test Currency Conversion Endpoint
/*
const test = async() => {
  const data = await freeCurrency(10, 'EUR', 'CZK', function (err, amount) {
    console.log(amount);
  });
};
test();

*/

module.exports = app;
