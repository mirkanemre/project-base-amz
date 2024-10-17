var express = require('express');
var router = express.Router();
const fs = require('fs');

// Tüm route dosyalarını yükle
let routes = fs.readdirSync(__dirname);

for (let route of routes) {
    if (route !== 'index.js' && route.includes('.js')) {
        const routePath = require('./' + route); // Route dosyasını içeri aktarıyor
        if (typeof routePath === 'function') {  // Middleware olduğundan emin olunuyor
            router.use('/' + route.replace('.js', ''), routePath); // Route'u middleware olarak kullan
        }
    }
}

module.exports = router;
