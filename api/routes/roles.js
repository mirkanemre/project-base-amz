var express = require('express');
var router = express.Router();

// Örnek bir kullanıcı listesi route'u
router.get('/', function(req, res, next) {
  res.send({success: true});
});

module.exports = router;
