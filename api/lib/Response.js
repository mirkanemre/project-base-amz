const Enum = require("../config/Enum");
const config = require("../config");
const CustomError = require("./Error");
const i18n = new (require("./i18n"))(config.DEFAULT_LANG);

class Response {
    constructor() {}

    // Başarı yanıtı gönderme fonksiyonu
    static successResponse(res, data, code = 200, lang = config.DEFAULT_LANG) {
        if (typeof res.status !== 'function' || res.headersSent) {
            console.error("Invalid or already used response object passed to successResponse");
            throw new TypeError("Invalid or already used response object passed to successResponse");
        }

        return res.status(code).json({
            code,
            message: i18n.translate("COMMON.SUCCESS", lang),  // Başarı mesajı
            data
        });
    }

    // Hata yanıtı gönderme fonksiyonu
    static errorResponse(res, error, lang = config.DEFAULT_LANG) {
        let statusCode = Enum.HTTP_CODES.INT_SERVER_ERROR;
        let errorMessage = i18n.translate("COMMON.UNKNOWN_ERROR", lang);
        let errorDescription = "An unexpected error occurred.";

        // CustomError ise
        if (error instanceof CustomError) {
            statusCode = error.code || Enum.HTTP_CODES.INT_SERVER_ERROR;
            errorMessage = i18n.translate(error.message, lang);  // Özel hata mesajı
            errorDescription = i18n.translate(error.description, lang);  // Özel hata açıklaması
        } 
        // MongoDB unique key violation (E11000) hatası kontrolü
        else if (error.message && error.message.includes("E11000")) {
            statusCode = Enum.HTTP_CODES.CONFLICT;
            errorMessage = i18n.translate("COMMON.ALREADY_EXIST", lang);  // Benzersiz kayıt hatası
            errorDescription = i18n.translate("COMMON.ALREADY_EXIST_DESC", lang);  // Özel açıklama eklenebilir
        } 
        // Diğer hatalar
        else {
            errorMessage = i18n.translate("COMMON.UNKNOWN_ERROR", lang);  // Genel hata mesajı
            errorDescription = error.message || "An unexpected error occurred.";
        }

        // Eğer yanıt zaten gönderildiyse
        if (res.headersSent) {
            console.error("Response has already been sent, skipping sending another response.");
            return { code: statusCode, error: { message: errorMessage, description: errorDescription } };
        }

        // Hata yanıtını gönder
        try {
            return res.status(statusCode).json({
                code: statusCode,
                error: {
                    // Arkadaşınızın yapısına uygun olarak hata mesajı ve açıklama ayrı ele alınır
                    message: errorMessage,  // Çevrilen hata mesajı
                    description: errorDescription  // Çevrilen hata açıklaması
                }
            });
        } catch (err) {
            console.error("Error sending response:", err);
            return { code: 500, error: { message: "Unknown Error!", description: "Failed to send error response." } };
        }
    }
}

module.exports = Response;
