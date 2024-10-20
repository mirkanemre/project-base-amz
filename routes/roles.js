const express = require("express");
const router = express.Router();
const CustomError = require("../lib/Error"); // Doğru şekilde import edildiğinden emin olun

const Enum = require('../config/Enum');  // Enum'ı doğru şekilde dahil et
const Roles = require("../db/models/Roles");
const RolePrivileges = require("../db/models/RolePrivileges");
const Response = require("../lib/Response");
const role_privileges =  require("../config/role_privileges");


router.get("/", async (req, res) => {
    try {
        let roles = await Roles.find({});

        // Başarılı yanıtı döndürürken 'res' nesnesini iletmeniz gerekiyor
        Response.successResponse(res, roles);
    } catch (err) {
        // Hata yanıtını döndürürken de 'res' nesnesini iletmeniz gerekiyor
        Response.errorResponse(res, err);
    }
});

router.post("/add", async (req, res) => {
    let body = req.body;
    try {
        // role_name ve permissions kontrolü
        if (!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "role_name field must be filled");
        if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "permissions field must be an array");
        }

        // Yeni rol ekle
        let role = new Roles({
            role_name: body.role_name,
            is_active: true,
            created_by: req.user?.id // Kullanıcı bilgisi varsa ekle
        });

        await role.save();

        // Her bir izin için RolePrivileges ekle
        for (let i = 0; i < body.permissions.length; i++) {
            let priv = new RolePrivileges({
                role_id: role._id,
                permission: body.permissions[i],  // permissions yerine permission alanı doğru kullanılıyor
                created_by: req.user?.id
            });
            await priv.save();
        }

        // Başarılı yanıt
        return Response.successResponse(res, { success: true });

    } catch (err) {
        // Hata yanıtı
        return Response.errorResponse(res, err);
    }
});



router.post("/update", async (req, res) => {
    let body = req.body;
    try {
        // _id veya id kontrolü yapalım ve id varsa _id olarak ayarlayalım
        const _id = body._id || body.id;
        if (!_id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        let updates = {};

        // role_name varsa güncelle
        if (body.role_name) updates.role_name = body.role_name;

        // is_active boolean ise güncelle
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        // permissions varsa, yetkileri güncelle
        if (body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0) {
            console.log("Updating permissions...");

            let permissions = await RolePrivileges.find({ role_id: _id });
            let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission)); // x.permissions -> x.permission
            let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

            console.log("Removed permissions:", removedPermissions);
            console.log("New permissions:", newPermissions);

            if (removedPermissions.length > 0) {
                await RolePrivileges.deleteMany({ _id: { $in: removedPermissions.map(x => x._id) } });
            }

            if (newPermissions.length > 0) {
                for (let i = 0; i < newPermissions.length; i++) {
                    let priv = new RolePrivileges({
                        role_id: _id,
                        permission: newPermissions[i],  // Tekil `permission` alanı
                        created_by: req.user?.id  // req.user kontrolü
                    });
                    await priv.save();
                }
            }
        }

        // Güncelleme işlemi
        let result = await Roles.updateOne({ _id }, updates);

        // Güncelleme başarılıysa
        if (result.modifiedCount > 0) {
            console.log("Update successful:", result);
            return Response.successResponse(res, { success: true });
        } else {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Update Failed", "No document was updated.");
        }

    } catch (err) {
        console.error("Update error:", err);  // Hata detaylarını loglayın
        // Hata durumunda doğru yanıtın gönderilmesini kontrol edin
        return Response.errorResponse(res, err);
    }
});



// Role silme route'u
router.delete("/delete", async (req, res) => {
    let body = req.body;
    try {
        console.log("Silme isteği alındı. Body:", body); // Body'nin geldiğinden emin olun
        
        // _id kontrolü, boşsa hata fırlat
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        // Önce role_id ile ilişkili RolePrivileges kayıtlarını sil
        const privilegesResult = await RolePrivileges.deleteMany({ role_id: body._id });

        // Rolü silme işlemi
        let result = await Roles.deleteOne({ _id: body._id });

        // Silme başarılıysa
        if (result.deletedCount > 0) {
            console.log(`Role silme işlemi başarılı: ${result.deletedCount} rol silindi`);
            console.log(`RolePrivileges silme işlemi: ${privilegesResult.deletedCount} kayıt silindi`);
            return Response.successResponse(res, { success: true });
        } else {
            console.log("Silme işlemi başarısız:", result); // Başarısız silme işlemi
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Delete Failed", "No document was deleted.");
        }

    } catch (err) {
        console.error("Silme işlemi sırasında hata oluştu:", err); // Hata loglama
        // Hata durumu
        return Response.errorResponse(res, err);
    }
});



module.exports = router;