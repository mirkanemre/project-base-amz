const mongoose = require("mongoose");

const schema = mongoose.Schema({
    email: { type: String, required: true, unique: true },  // E-posta benzersiz olmalı
    password: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    first_name: String,
    last_name: String,
    phone_number: String // 'Phone_number' -> 'phone_number' olarak düzeltildi
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

// 'Users' modelini tanımlayın (Roles yerine Users olmalı)
class Users extends mongoose.Model {
    
}

schema.loadClass(Users);
module.exports = mongoose.model("Users", schema);
