const express = require("express");
const moment = require("moment");
const Response = require("../lib/Response");  // lib/Response doğru yolda olmalı
const AuditLogs = require("../db/models/AuditLogs");  // Modeller doğru yolda olmalı
const router = express.Router();  // Router'ın doğru tanımlanması

// Post isteği
router.post("/", async (req, res) => {
    try {
        let body = req.body;
        let query = {};
        let skip = Number(body.skip);
        let limit = Number(body.limit);

        // Skip ve limit'in sayısal olup olmadığını kontrol et, eğer sayısal değilse varsayılan değerleri kullan
        if (isNaN(skip) || skip < 0) {
            skip = 0;
        }

        if (isNaN(limit) || limit > 500 || limit <= 0) {
            limit = 500;
        }

        // Eğer begin_date ve end_date varsa, zaman aralığını kullan
        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date).startOf('day'),  // Başlangıç tarihi
                $lte: moment(body.end_date).endOf('day')  // Bitiş tarihi
            };
        } else {
            // Eğer tarih aralığı verilmemişse, son 1 günü al
            query.created_at = {
                $gte: moment().subtract(1, "day").startOf("day"),  // Bir gün önceki başlangıç
                $lte: moment().endOf("day")  // Şu anki zaman
            };
        }

        // Veritabanında sorgu yap
        let auditLogs = await AuditLogs.find(query)
            .sort({ created_at: -1 })  // Tarihe göre ters sırala (yeni kayıtlar önce gelir)
            .skip(skip)
            .limit(limit);

        // Başarılı yanıt gönder
        Response.successResponse(res, auditLogs);
        return;

    } catch (err) {
        // Hata durumunda hata yanıtı gönder
        Response.errorResponse(res, err);
        return;
    }
});

module.exports = router;
