var express = require('express');
const bcrypt = require("bcrypt-nodejs");
const is = require("is_js");
const jwt = require("jwt-simple");
// config.js dosyanız bir üst dizinde olabilir


const Users = require('../db/models/Users');
const Response = require("../lib/Response");
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');
const config = require('../config');  
var router = express.Router();

// Örnek bir kullanıcı listesi route'u
router.get('/', async (req, res, ) => {
  try {
    let users = await Users.find({});
    
    // Başarılı yanıtı döndür
    return Response.successResponse(res, users);

  } catch (err) {
    // Hata yanıtını döndür
    return Response.errorResponse(res, err);
  }
});

router.post("/add", async (req, res) => {
  let body = req.body;
  try {
      // Gerekli alanları kontrol et
      if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email field must be filled");
      if (!is.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Invalid email format");
      if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Password field must be filled");
      if (body.password.length < Enum.PASS_LENGTH) {
          throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least " + Enum.PASS_LENGTH + " characters long");
      }

      if (!Array.isArray(body.roles) || body.roles.length === 0) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "roles field must be a non-empty array");
      }

      // Girilen rollerin kontrolü
      let roles = await Roles.find({ _id: { $in: body.roles } });
      if (roles.length === 0) {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Invalid roles provided");
      }

      // Şifreyi bcrypt ile hashle
      let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

      // Yeni kullanıcıyı oluştur ve sonucunu sakla
      let createdUser = await Users.create({
          email: body.email,
          password,
          is_active: true,
          first_name: body.first_name,
          last_name: body.last_name,
          phone_number: body.phone_number
      });

      // UserRoles'e kaydetme işlemi
      for (let i = 0; i < roles.length; i++) {
        await UserRoles.create({
          role_id: roles[i]._id,
          user_id: createdUser._id
        });
      }

      // Başarılı yanıt
      return res.status(Enum.HTTP_CODES.CREATED).json({ success: true });

  } catch (err) {
      // Duplicate key hatasını yakalayıp özelleştirilmiş bir hata mesajı döndür
      if (err.code === 11000) {
          return res.status(Enum.HTTP_CODES.CONFLICT).json({ message: "Email already exists" });
      }

      // Diğer hatalar için yanıtı gönder
      return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: err.message });
  }
});


router.post("/update", async (req, res) => {
  try {
      let body = req.body;
      let updates = {};

      // _id kontrolü, boşsa hata fırlat
      if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

      // Şifre güncelleme
      if (body.password && body.password.length >= Enum.PASS_LENGTH) {
          updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
      } else if (body.password) {
          throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least " + Enum.PASS_LENGTH + " characters long");
      }

      // is_active güncelleme
      if (typeof body.is_active === "boolean") {
          updates.is_active = body.is_active;
      }

      // İlk isim güncelleme
      if (body.first_name) {
          updates.first_name = body.first_name;
      }

      // Soyisim güncelleme
      if (body.last_name) {
          updates.last_name = body.last_name;
      }

      // Telefon numarası güncelleme
      if (body.phone_number) {
          updates.phone_number = body.phone_number;
      }

      // Kullanıcı bilgilerini güncelleme
      const result = await Users.updateOne({ _id: body._id }, updates);

      // Güncelleme başarılıysa
      if (result.modifiedCount > 0) {
          // Rollerin güncellenmesi
          if (Array.isArray(body.roles) && body.roles.length > 0) {

            let userRoles = await UserRoles.find({ user_id: body._id });

            let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id.toString()));
            let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x));

            if (removedRoles.length > 0) {
              await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id) } });
            }

            if (newRoles.length > 0) {
              for (let i = 0; i < newRoles.length; i++) {
                let userRole = new UserRoles({
                  role_id: newRoles[i],
                  user_id: body._id
                });
                await userRole.save();
              }
            }
          }
          return res.json({ success: true });
      } else {
          throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Update Failed", "No document was updated.");
      }

  } catch (err) {
      // Hata yanıtı
      return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: err.message });
  }
});

      
router.delete("/delete", async (req, res) => {
  try {
      let body = req.body;

      // _id kontrolü, boşsa hata fırlat
      if (!body._id) {
          throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");
      }

      // Kullanıcıyı silme işlemi
      const result = await Users.deleteOne({ _id: body._id });

      await UserRoles.deleteMany({ user_id: body._id });



      // Silme işlemi başarılıysa
      if (result.deletedCount > 0) {
          // Başarılı silme işlemi için yanıt gönder
          return res.json(Response.successResponse(res, { success: true }));
      } else {
          // Kullanıcı bulunamadıysa hata fırlat
          throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Delete Failed", "No document was deleted.");
      }

  } catch (err) {
      // Hata varsa ve headers henüz gönderilmediyse yanıt gönder
      if (!res.headersSent) {
          let errorResponse = Response.errorResponse(res, err);
          return res.status(errorResponse.code).json(errorResponse);
      } else {
          // Headers zaten gönderildiyse hatayı logla
          console.error("Headers already sent (error):", err);
      }
  }
});

router.post("/register", async (req, res) => {
  let body = req.body;

  try {

    let user = await Users.findOne({});
    
    if (user) {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    // Alanların validasyonu
    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email field must be filled.");
    
    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Invalid email format.");
    
    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Password field must be filled.");
    
    if (body.password.length < Enum.PASS_LENGTH) 
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", `Password length must be greater than ${Enum.PASS_LENGTH}`);

    // Şifr
    
    
    
   
    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    // Kullanıcı oluşturma işlemi
    let createdUser = await Users.create({
      email: body.email,
      password,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    // Rol oluşturma işlemi
    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id
    });

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
    })
   
    res.status(Enum.HTTP_CODES.CREATED).json({ success: true, message: "Super Admin created successfully." });

  } catch (err) {
    // Hata yanıtı gönderme
    let errorResponse = Response.errorResponse(res, err);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/auth", async (req, res) => {
  try {

    let { email, password } = req.body;

    // Doğrulama
    Users.validateFieldBeforeAuth(email, password);

    // Kullanıcıyı bul
    let user = await Users.findOne({ email });

    // Eğer kullanıcı bulunamazsa hata fırlat
    if (!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Error", "Email or password wrong");
    

    // Şifreyi doğrula
    if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Error", "Email or password wrong");
    

    // JWT token oluştur
    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME // Geçerlilik süresi ekle
    };

    let token = jwt.encode(payload, config.JWT.SECRET);

    // Kullanıcı verileri
    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // Başarılı yanıt gönder
    Response.successResponse(res, { token, user: userData });  // Yanıtın return edilmesini sağla

  } catch (err) {
    let errorResponse =Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);  // Yanıtın return edilmesini sağla
  }
})



module.exports = router;