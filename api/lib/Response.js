const Enum = require("../config/Enum");
const CustomError = require("./Error");

class Response {
    constructor() { }

    static successResponse(res, data, code = 200) {
        // 'res' bir 'response' objesi olmalı
        if (typeof res.status !== "function") {
            throw new TypeError("Invalid response object passed to successResponse");
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

        // 'res' bir 'response' objesi olmalı
        if (typeof res.status !== "function") {
            throw new TypeError("Invalid response object passed to errorResponse");
        }

        res.status(statusCode).json({
            code: statusCode,
            error: {
                message: errorMessage,
                description: errorDescription
            }
        });
    }
}

module.exports = Response;
