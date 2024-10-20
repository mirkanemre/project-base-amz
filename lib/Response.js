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

        // Eğer bir hata varsa, hata mesajını ve açıklamasını al
        if (error) {
            if (error instanceof CustomError) {
                statusCode = error.code || Enum.HTTP_CODES.INT_SERVER_ERROR;
                errorMessage = error.message || "An unexpected error occurred.";
                errorDescription = error.description || "No additional details.";
            } else {
                errorMessage = error.message || "Unknown Error!";
                errorDescription = error.message || "An unexpected error occurred.";
            }
        }

        // Yanıtın zaten gönderilip gönderilmediğini kontrol edin
        if (res.headersSent) {
            console.error("Response has already been sent, skipping sending another response.");
            return { code: statusCode, error: { message: errorMessage, description: errorDescription } };
        }

        // Yanıt nesnesinin geçerli olup olmadığını kontrol edin
        if (!res || typeof res.status !== "function") {
            console.error("Invalid response object passed to errorResponse");
            return { code: 500, error: { message: "Invalid response object", description: "The response object passed to errorResponse is not valid." } };
        }

        // Hata yanıtını gönder
        try {
            return res.status(statusCode).json({
                code: statusCode,
                error: {
                    message: errorMessage,
                    description: errorDescription
                }
            });
        } catch (err) {
            console.error("Error sending response:", err);
            return { code: 500, error: { message: "Unknown Error!", description: "Failed to send error response." } };
        }
    }
}

module.exports = Response;

