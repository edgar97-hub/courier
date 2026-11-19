"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorManager = void 0;
const common_1 = require("@nestjs/common");
class ErrorManager extends Error {
    constructor({ type, message, }) {
        super(`${type} :: ${message}`);
    }
    static createSignatureError(message) {
        const name = message.split(' :: ')[0];
        if (name) {
            throw new common_1.HttpException(message, common_1.HttpStatus[name]);
        }
        else {
            throw new common_1.HttpException(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.ErrorManager = ErrorManager;
//# sourceMappingURL=error.manager.js.map