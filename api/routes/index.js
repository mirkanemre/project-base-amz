var express = require('express');
var router = express.Router();
const fs = require('fs');

// Tüm route dosyalarını yükle
let routes = fs.readdirSync(__dirname);

for (let route of routes) {
    if (route !== 'index.js' && route.includes('.js')) {
        const routePath = require('./' + route); // Route dosyasını içeri aktarıyor
        const routeName = route.replace('.js', '');
        
        if (typeof routePath === 'function') {  // Middleware olduğundan emin olunuyor
            router.use('/' + routeName, routePath); // Route'u middleware olarak kullan
            console.log(`Route loaded: /${routeName}`);  // Yüklenen rotayı logla
        }
    }
}

module.exports = router;
