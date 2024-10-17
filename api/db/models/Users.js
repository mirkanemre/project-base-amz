const mongoose = require("mongoose");
const { version } = require("react");

const schema = mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    is_active:{type: Boolean, default: true},
    first_name: String,
    last_name: String,
    Phone_number: String
},{
    versionKey: false,
    timetamps :{
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});
class Roles extends mongoose.Model {

}

schema.loadClass(Roles);
module.exports = mongoose.model("roles",schema);