const mongoose = require("mongoose");
const { version } = require("react");

const schema = mongoose.Schema({
    
    parole_name:{type: String, required: true},
    is_active:{type: Boolean, default: true},
    created_by:{
        type: mongoose.SchemaTypes.ObjectId,
        required:  true
    }
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