var express = require('express');
var router = express.Router();
var httpLib = require('./http-lib');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  httpLib.fetchDetails(req, res);
});

module.exports = router;
