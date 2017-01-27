var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var SunCalc = require('suncalc');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'jade');

// This interface will trigger the given event if the given time/location is at "dusk"
// Here "dusk" is defined as half an hour before the sunset
// Example query: http://lab.grapeot.me/ifttt/dusk?key=MY_KEY&lat=51.5&lon=-0.1&event=lightson
app.get('//dusk', function(req, res) {
    var key = req.query.key;
    var lat = parseFloat(req.query.lat);
    var lon = parseFloat(req.query.lon);
    var event = req.query.event;

    // get sunset time
    var times = SunCalc.getTimes(new Date(), lat, lon);
    var sunsetTime = times.sunset;
    var triggered = false;
    if (sunsetTime - new Date() < 0.5 * 3600 * 1000) {
        var url = 'https://maker.ifttt.com/trigger/' + event + '/with/key/' + key;
        console.log('URL = ' + url);
        request.post(url);
        triggered = true;
    }
    res.send('Request recorded. Sunset time = ' + sunsetTime + '. ' + (triggered ? 'Triggered. ' : 'Not triggered.'));
});

// consolidates multiple requests happened multiple times within 5 seconds.
var consolidateData = {};
app.use('//consolidate', function(req, res) {
    var timeout = 5000; // ms
    var key = req.query.key;
    var event = req.query.event;
    var dataKey = key + '_' + event;
    
    // Fetch the values from the POST body
    var value1 = req.body.Value1;
    var value2 = req.body.Value2;
    var value3 = req.body.Value3;
    var bodyToSend = {
        value1: value1,
        value2: value2,
        value3: value3
    };
    console.log('body = ' + JSON.stringify(bodyToSend));
    if (consolidateData[dataKey] == undefined) {
        // first time. Record and fire it.
        var url = 'https://maker.ifttt.com/trigger/' + event + '/with/key/' + key;
        request.post(url, { form: bodyToSend }, function(error, response, body) {} );
        consolidateData[dataKey] = 0;
        setTimeout(function() { consolidateData[dataKey] = undefined; }, timeout); 
        res.status(200).json({ 'status': 'ok', 'msg': 'Request sent.' });
    }
    else {
        res.status(200).json({ 'status': 'ok', 'msg': 'Request blocked.' });
    }
});

app.use('/', function(req, res) {
    res.status(200).json({"status": "ok"});
});

app.use('//delay', function(req, res) {
    var delay = parseInt(req.query.t); // in minutes
    var key = req.query.key;
    var event = req.query.event;
    
    // Fetch the values from the POST body
    var value1 = req.body.Value1;
    var value2 = req.body.Value2;
    var value3 = req.body.Value3;
    var bodyToSend = {
        value1: value1,
        value2: value2,
        value3: value3
    };
    console.log('body = ' + JSON.stringify(bodyToSend));
    
    setTimeout(function() {
        var url = 'https://maker.ifttt.com/trigger/' + event + '/with/key/' + key;
        console.log('URL = ' + url);
        request.post(url, { form: bodyToSend }, function(error, response, body) {
        });
    }, delay * 60 * 1000);
    res.send('Request recorded. Delay = ' + delay + ' minutes, event = ' + event + ', key = ' + key);
});

app.use('/', function(req, res) {
    res.status(200).json({"status": "ok"});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
