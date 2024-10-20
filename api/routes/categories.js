var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");  // Mongoose modülünü ekleyin
const ObjectId = mongoose.Types.ObjectId;  // ObjectId'yi mongoose'dan alın
const Categories = require("../db/models/Categories");
const Response = require("../lib/Response");
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const AuditLogs =  require("../lib/AuditLogs");
const RolePrivileges = require("../db/models/RolePrivileges");  // Model yolunu doğru yazdığınızdan emin olun
const logger = require("../lib/logger/LoggerClass");
const config = require('../config');
const auth = require("../lib/auth")();
const i18n =  new (require("../lib/i18n"))(config.DEFAULT_LANG);


router.all("*",auth.authenticate(), (req, res, next) => {
    next();
});


// Kategori listeleme route'u
router.get('/', auth.checkRoles("category_view"), async (req, res, next) => {

    try {
        console.log("GET /categories çalıştı");  // Route'un çalışıp çalışmadığını görmek için log ekleyin
        let categories = await Categories.find({});
        Response.successResponse(res, categories);
    } catch (err) {
        console.error("Hata: ", err);  // Hata durumunu loglayın
        Response.errorResponse(res, err);
    }
});



// Kategori ekleme route'u
router.post("/add", auth.checkRoles("category_add"), async (req, res) => {
    let body = req.body;
   

    try {
        // body.name boşsa hata fırlat
        if (!body.name) {
            throw new CustomError(
                Enum.HTTP_CODES.BAD_REQUEST,
                i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), // Bu çalışıyor
                i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["name"]) // Burada parametre yerleştirme kontrolü yapılacak
            );
        }
        // req.user tanımlı değilse manuel bir ID koyabilirsiniz
        let category = new Categories({
            name: body.name,
            is_active: true,
            created_by: req.user?.id 
        });

        await category.save();

        // req.user?.email olmadan deneme için log kaydını düzeltin
        AuditLogs.info("test@example.com", "Categories", "Add", category);
        logger.info(req.user?.email, "Categories", "Add", category);

        Response.successResponse(res, { success: true });  // Başarı durumunda 'res' ekledik

    } catch (err) {
        logger.error(req.user?.email, "Categories", "Add", err);
        Response.errorResponse(res, err, req.user?.language);  // Hata durumunda 'res' ve 'lang' ekledik
    }  
});


// Kategori güncelleme route'u
router.post("/update", auth.checkRoles("category_update"), async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,
            i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), // Bu çalışıyor
            i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]) // Burada parametre yerleştirme kontrolü yapılacak
        );
        let updates = {};

        if (body.name) updates.name = body.name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        let objectId = new mongoose.Types.ObjectId(body._id);

        let result = await Categories.updateOne({ _id: objectId }, updates);

        AuditLogs.info(req.user?.email, "Categories", "Update", { _id: body._id, ...updates});

        console.log("Güncelleme Sonucu:", result);

        // Güncelleme başarılıysa
        if (result.modifiedCount > 0) {
            console.log("Güncelleme başarılı");

            // Res nesnesini loglayalım
            console.log("Res nesnesi:", res);

            // Yanıtın ikinci kez gönderilmediğinden emin olun
            if (typeof res.status !== 'function') {
                console.error("Invalid response object passed to successResponse");
                throw new Error("Invalid response object passed to successResponse");
            }

            // Başarılı yanıt
            return Response.successResponse(res, { success: true });
        } else {
            // Belge güncellenmediyse hata fırlat
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Update Failed", "No document was updated.");
        }

    } catch (err) {
        console.error("Hata: ", err);
        return Response.errorResponse(res, err);
    }
});

// Role silme route'u
router.delete("/delete", auth.checkRoles("category_delete"), async (req, res) => {
    let body = req.body;
    try {
        console.log("Silme isteği alındı. Body:", body); // Body'nin geldiğinden emin olun
        
        // _id kontrolü, boşsa hata fırlat
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, 
        i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), // Bu çalışıyor
        i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]) // Burada parametre yerleştirme kontrolü yapılacak
    );
        // Role ile ilgili yetkileri de sil
        await RolePrivileges.deleteMany({ role_id: body._id });

        // Kategori silme işlemi
        let result = await Categories.deleteOne({ _id: body._id });

        // Silme işlemi başarılıysa log tut (Eğer req.user mevcutsa email loglanır, yoksa "unknown" loglanır)
        AuditLogs.info(req.user?.email || "unknown", "Categories", "Delete", { _id: body._id });

        // Silme başarılıysa
        if (result.deletedCount > 0) {
            console.log("Silme işlemi başarılı:", result); // Başarılı silme işlemi
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



module.exports =  router;