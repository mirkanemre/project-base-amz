const Enum = require("../config/Enum");
const CustomError = require("./Error");

class Response {
    constructor() {}

    // Başarı yanıtı gönderme fonksiyonu
    static successResponse(res, data, code = 200) {
        // Yanıtın daha önce gönderilip gönderilmediğini kontrol et
        if (typeof res.status !== 'function' || res.headersSent) {
            console.error("Invalid or already used response object passed to successResponse");
            throw new TypeError("Invalid or already used response object passed to successResponse");
        }

        // Başarı yanıtını gönder
        return res.status(code).json({
            code,
            data
        });
    }

    // Hata yanıtı gönderme fonksiyonu
    static errorResponse(res, error) {
        // Varsayılan durum kodu olarak 500'ü ayarla
        let statusCode = error?.code || Enum.HTTP_CODES.INT_SERVER_ERROR || 500;
        let errorMessage = "Unknown Error!";
        let errorDescription = "An unexpected error occurred.";

        if (error) {
            // CustomError kontrolü ile özel hata mesajları
            if (error instanceof CustomError) {
                statusCode = error.code || Enum.HTTP_CODES.INT_SERVER_ERROR || 500;
                errorMessage = error.message || "An unexpected error occurred.";
                errorDescription = error.description || "No additional details.";
            } else {
                // Diğer hata türleri için varsayılan mesaj
                errorDescription = error.message || "An unexpected error occurred.";
            }
        }

        // Yanıtın zaten gönderilip gönderilmediğini kontrol edin
        if (res.headersSent) {
            console.error("Response has already been sent, skipping sending another response.");
            return { code: statusCode, error: { message: errorMessage, description: errorDescription } };
        }

        // Yanıt nesnesinin geçerli olup olmadığını kontrol edin
        if (typeof res.status !== "function") {
            console.error("Invalid response object passed to errorResponse");
            return { code: statusCode, error: { message: errorMessage, description: "Invalid response object" } };
        }

        // Hata yanıtını gönder
        return res.status(statusCode).json({
            code: statusCode,
            error: {
                message: errorMessage,
                description: errorDescription
            }
        });
    }
}

module.exports = Response;
