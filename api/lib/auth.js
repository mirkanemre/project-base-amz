const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const Users = require("../db/models/Users");
const UserRoles = require("../db/models/UserRoles");
const RolePrivileges = require("../db/models/RolePrivileges");
const config = require("../config");


module.exports = function(passport) {
    let strategy = new Strategy({
            secretOrKey: config.JWT.SECRET, 
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() 
        },  async (payload, done) => {
            try {
                let user = await Users.findOne({ _id: payload.id });

                if (user) {
                    let userRoles = await UserRoles.find({ user_id: payload.id });
                    let rolePrivileges = await RolePrivileges.find({ role_id: { $in: userRoles.map(ur => ur.role_id) }});

                    return done(null, {
                        id: user._id,
                        roles: rolePrivileges,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
                    });

                } else {
                    // Kullanıcı bulunamazsa
                    return done(null, false);
                }
            } catch (err) {
                // Hata durumunda
                return done(err, false);
            }
        });

    passport.use(strategy);

    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate("jwt", { session: false })
    };
};

