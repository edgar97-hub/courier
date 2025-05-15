"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLevel = void 0;
const common_1 = require("@nestjs/common");
const key_decorators_1 = require("../../constants/key-decorators");
const AccessLevel = (level) => (0, common_1.SetMetadata)(key_decorators_1.ACCESS_LEVEL_KEY, level);
exports.AccessLevel = AccessLevel;
//# sourceMappingURL=access-level.decorator.js.map