const AuditLogsModel = require("../db/models/AuditLogs");  // Veritabanı modeli
const Enum = require("../config/Enum");  // Enum dosyasını doğru şekilde import edin

let instance = null;

class AuditLogs {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    // Bilgi log'u
    static info(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.INFO, 
            email, 
            location, 
            proc_type, 
            log  // Log bilgisi
        });
    }

    // Uyarı log'u
    static warn(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.WARN, 
            email, 
            location, 
            proc_type, 
            log  // Log bilgisi
        });
    }

    // Hata log'u
    static error(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.ERROR, 
            email, 
            location, 
            proc_type, 
            log  // Log bilgisi
        });
    }

    // Hata ayıklama (debug) log'u
    static debug(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.DEBUG, 
            email, 
            location, 
            proc_type, 
            log  // Log bilgisi
        });
    }

    // Ayrıntılı (verbose) log
    static verbose(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.VERBOSE, 
            email, 
            location, 
            proc_type, 
            log  // Log bilgisi
        });
    }

    // HTTP log'u
    static http(email, location, proc_type, log) {
        this.#saveToDB({
            level: Enum.LOG_LEVELS.HTTP, 
            email, 
            location, 
            proc_type, 
            log  // Log bilgisi
        });
    }

    // Veritabanına log kaydetme fonksiyonu (private)
    static async #saveToDB({ level, email, location, proc_type, log }) {
        try {
            await AuditLogsModel.create({
                level, 
                email, 
                location, 
                proc_type, 
                log
            });
        } catch (error) {
            console.error("Error saving log to DB:", error);
        }
    }
}

module.exports = AuditLogs;
