'use strict';

var cors = require('cors');
var express = require('express');
var request = require('request');
var path = require('path');

var civic = 'https://www.googleapis.com/civicinfo/v2';
var location = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
var place = 'https://maps.googleapis.com/maps/api/place/details/json';
var photo = 'https://maps.googleapis.com/maps/api/place/photo';
var geolocation = 'https://maps.googleapis.com/maps/api/geocode/json';
var key = process.env.GOOGLE_KEY;

// Express App
var app = express();

// Enabl`e CORS
app.use(cors());

app.set('port', (process.env.PORT || 5000));

var router = express.Router();

// Endpoint to load places
router.get('/civic/places', function(req, res) {
  var validOptions = ['hospital', 'library', 'museum', 'park'];
  
  function isValid() {
    // Ensure location is attached, and not super long
    if (!req.query.location || !req.query.location.length > 20) {
      return false;
    }
    // Ensure type or query exists
    else if (!req.query.query && !req.query.type) {
      return false;
    }
    // If type, ensure it is valid
    else if (req.query.type) {
      var valid = false;
      for (var i = 0; i < validOptions.length; i++) {
        if (req.query.type === validOptions[i]) {
          valid = true;
        }
      }
      return valid;
    }
    else if (req.query.query) {
      var valid = true;
      var query = req.query.query.split('|');
      for (var i = 0; i < query.length; i++) {
        if (validOptions.indexOf(query[i]) < 0) {
          valid = false;
        }
      }
      return valid;
    } else {
      return false;
    }
  }
 
  
  // Validate types and inputs
  if (isValid()) {

    var params = [];
    if (req.query.token) {
      params.push('pagetoken=' + req.query.token);
    } else {
      params.push('location=' + req.query.location);
      params.push('radius=10000');
    }
    params.push('key=' + key);
    if (req.query.type) {
      params.push('type=' + req.query.type);
    } else {
      params.push('query=' + req.query.query);
    }

    request.get(location + '?' + params.join('&'), {json: true}, function(err, response, body) {
      res.status(response.statusCode).send(body);
    });
  } else {
    res.status(400).send({message: 'The request is invalid. Please check your parameters.'});
  }
});

// Endpoint to load places
router.get('/civic/photo', function(req, res) {
  if (req.query.photo_id) {
    var width = req.query.width || 320;
    var height = req.query.height || 480;
    req.pipe(
      request.get(photo + '?photoreference=' + req.query.photo_id + '&maxwidth=' + width + '&maxheight=' + height + '&key=' + key)
    ).pipe(res);
  } else {
    res.status(400).send({message: 'The request requires a place_id. Try adding "?place_id={place_id}" to the request.'});
  }
});

// Endpoint to load place
router.get('/civic/place', function(req, res) {
  if (req.query.place_id) {
    request.get(place + '?placeid=' + req.query.place_id + '&key=' + key, {json: true}, function(err, response, body) {
      res.status(response.statusCode).send(body);
    });
  } else {
    res.status(400).send({message: 'The request requires a place_id. Try adding "?place_id={place_id}" to the request.'});
  }
});

// Endpoint to load geolocation
router.get('/civic/geolocation', function(req, res) {
  if (req.query.latlng) {
    request.get(geolocation + '?latlng=' + req.query.latlng + '&key=' + key, {json: true}, function(err, response, body) {
      res.status(response.statusCode).send(body);
    });
  } else {
    res.status(400).send({message: 'The request requires a latlng. Try adding "?latlng=12345,12345" to the request.'});
  }
});

router.get('/', function(req, res) {
  res.status(200).send('Sample APIs. See <a href="https://github.com/gnomeontherun/sample-apis#readme">https://github.com/gnomeontherun/sample-apis#readme</a> for details.');
});

app.use('/', router);

app.listen(app.get('port'), function() {
  console.log('App is running on port ', app.get('port'));
});
