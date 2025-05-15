"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicAccess = void 0;
const common_1 = require("@nestjs/common");
const key_decorators_1 = require("../../constants/key-decorators");
const PublicAccess = () => (0, common_1.SetMetadata)(key_decorators_1.PUBLIC_KEY, true);
exports.PublicAccess = PublicAccess;
//# sourceMappingURL=public.decorator.js.map