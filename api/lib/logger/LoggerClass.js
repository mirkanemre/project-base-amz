const logger = require("./logger");
let instance = null;

class LoggerClass {

    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    // Log objesini oluşturma
    #createLogObject(email, location, proc_type, log) {
        return {
            email,
            location,
            proc_type,
            log
        };
    }

    // Info log
    info(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.info(logObject);
    }

    // Warn log
    warn(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.warn(logObject);
    }

    // Error log
    error(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.error(logObject);
    }

    // Verbose log
    verbose(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.verbose(logObject);
    }

    // Silly log
    silly(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.silly(logObject);
    }

    // HTTP log
    http(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.http(logObject);
    }

    // Debug log
    debug(email, location, proc_type, log) {
        let logObject = this.#createLogObject(email, location, proc_type, log);
        logger.debug(logObject);
    }
}

module.exports = new LoggerClass();
