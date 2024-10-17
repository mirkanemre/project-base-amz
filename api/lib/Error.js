class CustomError extends Error {
    constructor(code, message, description) {
        // Mesaj sadece message olarak geçmeli, super ile parent class'a gönderiyoruz.
        super(message); 
        this.code = code;
        this.description = description;
    }
}

module.exports = CustomError;
