const Enum = require("../config/Enum");
const CustomError = require("./Error");

class Response {
    constructor() {}

    static successResponse(res, data, code = 200) {
        if (typeof res.status !== 'function' || res.headersSent) {
            console.error("Invalid or already used response object passed to successResponse");
            throw new TypeError("Invalid or already used response object passed to successResponse");
        }
        res.status(code).json({
            code,
            data
        });
    }

    static errorResponse(res, error) {
        let statusCode = Enum.HTTP_CODES.INT_SERVER_ERROR;
        let errorMessage = "Unknown Error!";
        let errorDescription = "An unexpected error occurred.";
    
        if (error) {
            if (error instanceof CustomError) {
                statusCode = error.code;
                errorMessage = error.message;
                errorDescription = error.description;
            } else {
                errorDescription = error.message || "An unexpected error occurred.";
            }
        }
    
        // Yanıtın zaten gönderilmiş olup olmadığını kontrol edin
        if (res.headersSent) {
            console.error("Response has already been sent, skipping sending another response.");
            return { code: statusCode, error: { message: errorMessage, description: errorDescription } };
        }
    
        // Geçersiz `res` objesi kontrolü
        if (typeof res.status !== "function") {
            console.error("Invalid response object passed to errorResponse");
            return { code: statusCode, error: { message: errorMessage, description: "Invalid response object" } };
        }
    
        // Hata yanıtını gönderin
        res.status(statusCode).json({
            code: statusCode,
            error: {
                message: errorMessage,
                description: errorDescription
            }
        });
    
        return { code: statusCode, error: { message: errorMessage, description: errorDescription } };
    }
    
}

module.exports = Response;

