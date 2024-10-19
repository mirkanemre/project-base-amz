const Enum = require("../config/Enum");
const CustomError = require("./Error");

class Response {
    constructor() {}

    static successResponse(res, data, code = 200) {
        // Yanıtın daha önce gönderilip gönderilmediğini kontrol et
        if (typeof res.status !== 'function' || res.headersSent) {
            console.error("Invalid or already used response object passed to successResponse");
            throw new TypeError("Invalid or already used response object passed to successResponse");
        }
        // Başarı yanıtını gönder
        res.status(code).json({
            code,
            data
        });
    }

    static errorResponse(res, error) {
        let statusCode = Enum.HTTP_CODES.INT_SERVER_ERROR || 500;
        let errorMessage = "Unknown Error!";
        let errorDescription = "An unexpected error occurred.";
    
        if (error) {
            if (error instanceof CustomError) {
                statusCode = error.code || Enum.HTTP_CODES.INT_SERVER_ERROR;
                errorMessage = error.message || "An unexpected error occurred.";
                errorDescription = error.description || "No additional details.";
            } else {
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
        res.status(statusCode).json({
            code: statusCode,
            error: {
                message: errorMessage,
                description: errorDescription
            }
        });

        // Hata yanıtını geri döndür
        return { code: statusCode, error: { message: errorMessage, description: errorDescription } };
    }
}

module.exports = Response;
