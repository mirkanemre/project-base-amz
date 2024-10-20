require('dotenv').config();
const mongoose = require("mongoose");

let instance = null;
class Database {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    async connect() {
        try {
            console.log("DB Connecting.");
            const connectionString = process.env.CONNECTION_STRING;
            console.log("Connection String:", connectionString);
    
            if (!connectionString) {
                throw new Error("CONNECTION_STRING is undefined.");
            }
    
            // Bağlantıyı artık bu parametreler olmadan yapın
            let db = await mongoose.connect(connectionString);
    
            this.mongoConnection = db;
            console.log("DB Connected.");
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }
}

module.exports = Database;
