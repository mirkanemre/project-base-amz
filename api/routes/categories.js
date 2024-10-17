var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");  // Mongoose modülünü ekleyin
const ObjectId = mongoose.Types.ObjectId;  // ObjectId'yi mongoose'dan alın
const Categories = require("../db/models/Categories");
const Response = require("../lib/Response");
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');

// Kategori listeleme route'u
router.get('/', async (req, res, next) => {
    try {
        let categories = await Categories.find({});
        Response.successResponse(res, categories);  // Response.successResponse fonksiyonuna 'res' ekledik
    } catch (err) {
        Response.errorResponse(res, err);  // Hata durumunda 'res' ekledik
    }
});

// Kategori ekleme route'u
router.post("/add", async (req, res) => {
    let body = req.body;
    try {
        // body.name boşsa hata fırlat
        if (!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "name field must be filled");

        let category = new Categories({
            name: body.name,
            is_active: true,
            created_by: req.user?.id
        });

        await category.save();
        Response.successResponse(res, { success: true });  // Başarı durumunda 'res' ekledik
    } catch (err) {
        Response.errorResponse(res, err);  // Hata durumunda 'res' ekledik
    }
});

// Kategori güncelleme route'u
router.post("/update", async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        let updates = {};
        if (body.name) updates.name = body.name;
        if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

        let objectId = new mongoose.Types.ObjectId(body._id);

        let result = await Categories.updateOne({ _id: objectId }, updates);

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

router.post("/delete", async (req, res) => {
    let body = req.body;
    try {
        // Eğer _id gönderilmediyse hata fırlat
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        let objectId = new mongoose.Types.ObjectId(body._id);

        // Belgeyi silme işlemi
        let result = await Categories.deleteOne({ _id: objectId });

        console.log("Silme Sonucu:", result);

        // Eğer belge silindiyse
        if (result.deletedCount > 0) {
            console.log("Silme işlemi başarılı");

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
            // Belge bulunamadıysa hata fırlat
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Delete Failed", "No document was deleted.");
        }

    } catch (err) {
        console.error("Hata: ", err);
        return Response.errorResponse(res, err);
    }
});



module.exports = router;
