const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");

const schema = mongoose.Schema({
    role_name: { type: String, required: true, unique:  true },

    is_active: { type: Boolean, default: true },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Roles extends mongoose.Model {

    static async remove(query) {
        if (query._id) {
            console.log("Removing RolePrivileges for role_id:", query._id);
            const rolePrivilegesDelete = await RolePrivileges.deleteMany({ role_id: query._id });

            if (!rolePrivilegesDelete.deletedCount) {
                console.log(`No RolePrivileges found for role_id: ${query._id}`);
            } else {
                console.log(`Deleted ${rolePrivilegesDelete.deletedCount} RolePrivileges for role_id: ${query._id}`);
            }
        }

        console.log("Removing Role:", query);
        const deletedRole = await super.findOneAndDelete(query);
        if (!deletedRole) {
            throw new Error(`Role with _id: ${query._id} could not be deleted or does not exist`);
        }

        return deletedRole;
    }
}


schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema);
