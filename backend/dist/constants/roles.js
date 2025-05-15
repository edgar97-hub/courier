"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_LEVEL = exports.ROLES = void 0;
var ROLES;
(function (ROLES) {
    ROLES["ADMIN"] = "ADMIN";
    ROLES["CUSTOMER"] = "CUSTOMER";
    ROLES["MOTORIZED"] = "MOTORIZED";
})(ROLES || (exports.ROLES = ROLES = {}));
var ACCESS_LEVEL;
(function (ACCESS_LEVEL) {
    ACCESS_LEVEL[ACCESS_LEVEL["DEVELOPER"] = 30] = "DEVELOPER";
    ACCESS_LEVEL[ACCESS_LEVEL["MANTEINER"] = 40] = "MANTEINER";
    ACCESS_LEVEL[ACCESS_LEVEL["OWNER"] = 50] = "OWNER";
})(ACCESS_LEVEL || (exports.ACCESS_LEVEL = ACCESS_LEVEL = {}));
//# sourceMappingURL=roles.js.map