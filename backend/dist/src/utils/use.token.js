"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToken = void 0;
const jwt = require("jsonwebtoken");
const useToken = (token) => {
    try {
        const decode = jwt.decode(token);
        const currentDate = new Date();
        const expiresDate = new Date(decode.exp);
        return {
            sub: decode.sub,
            role: decode.role,
            isExpired: +expiresDate <= +currentDate / 1000,
        };
    }
    catch (error) {
        return 'Token is invalid';
    }
};
exports.useToken = useToken;
//# sourceMappingURL=use.token.js.map