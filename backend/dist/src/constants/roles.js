"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATES = exports.ROLES = void 0;
var ROLES;
(function (ROLES) {
    ROLES["ADMINISTRADOR"] = "ADMINISTRADOR";
    ROLES["EMPRESA"] = "EMPRESA";
    ROLES["MOTORIZADO"] = "MOTORIZADO";
    ROLES["RECEPCIONISTA"] = "RECEPCIONISTA";
    ROLES["EMPRESA_DISTRIBUIDOR"] = "EMPRESA_DISTRIBUIDOR";
})(ROLES || (exports.ROLES = ROLES = {}));
var STATES;
(function (STATES) {
    STATES["REGISTERED"] = "REGISTRADO";
    STATES["PICKUP"] = "RECOGIDO";
    STATES["IN_WHAREHOUSE"] = "EN ALMACEN";
    STATES["IN_TRANSIT"] = "EN TRANSITO";
    STATES["DELIVERED"] = "ENTREGADO";
    STATES["CANCELED"] = "CANCELADO";
    STATES["ANNULLED"] = "ANULADO";
    STATES["REJECTED"] = "RECHAZADO EN PUNTO";
    STATES["RESCHEDULED"] = "REPROGRAMADO";
})(STATES || (exports.STATES = STATES = {}));
//# sourceMappingURL=roles.js.map