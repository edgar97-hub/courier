"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAccess = void 0;
const common_1 = require("@nestjs/common");
const key_decorators_1 = require("../../constants/key-decorators");
const roles_1 = require("../../constants/roles");
const AdminAccess = () => (0, common_1.SetMetadata)(key_decorators_1.ADMIN_KEY, roles_1.ROLES.ADMIN);
exports.AdminAccess = AdminAccess;
//# sourceMappingURL=admin.decorator.js.map