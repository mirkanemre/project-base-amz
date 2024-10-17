var express = require('express');
var router = express.Router();

// Kullanıcılarla ilgili işlemler
router.get('/', function(req, res, next) {
  res.send({success: true});
});

module.exports = router;


