const i18n = require("../i18n");  // Dil dosyalarını alıyoruz

class I18n {
    constructor(lang) {
        this.lang = lang || 'en';  // Varsayılan dil İngilizce
    }

    translate(text, lang = this.lang, params = []) {
        let arr = text.split(".");  // 'COMMON.VALIDATION_ERROR_TITLE' -> ['COMMON', 'VALIDATION_ERROR_TITLE']
        let val = i18n[lang];  // Seçilen dil ('en' ya da 'tr')

        if (!val) {
            return `Dil dosyası ${lang} bulunamadı.`;  // Eğer dil dosyası bulunamazsa
        }

        // Anahtarları kontrol ederek çeviri yapıyoruz
        for (let i = 0; i < arr.length; i++) {
            if (!val[arr[i]]) {
                return text;  // Eğer anahtar bulunamazsa orijinal metni döndür
            }
            val = val[arr[i]];  // Anahtarları sırayla alıyoruz
        }

        val = val + "";  // Çeviriyi string'e çeviriyoruz

        // Eğer parametreler varsa, '{}' yer tutucularını parametrelerle değiştiriyoruz
        for (let i = 0; i < params.length; i++) {
            val = val.replace("{}", params[i]);
        }

        return val;  // Sonucu döndürüyoruz
    }
}

module.exports = I18n;
