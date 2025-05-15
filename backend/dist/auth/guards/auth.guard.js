"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const key_decorators_1 = require("../../constants/key-decorators");
const users_service_1 = require("../../users/services/users.service");
const use_token_1 = require("../../utils/use.token");
let AuthGuard = class AuthGuard {
    constructor(userService, reflector) {
        this.userService = userService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.get(key_decorators_1.PUBLIC_KEY, context.getHandler());
        if (isPublic) {
            return true;
        }
        const req = context.switchToHttp().getRequest();
        const token = req.headers['codrr_token'];
        if (!token || Array.isArray(token)) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const manageToken = (0, use_token_1.useToken)(token);
        if (typeof manageToken === 'string') {
            throw new common_1.UnauthorizedException(manageToken);
        }
        if (manageToken.isExpired) {
            throw new common_1.UnauthorizedException('Token expired');
        }
        const { sub } = manageToken;
        const user = await this.userService.findUserById(sub);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid user');
        }
        req.idUser = user.id;
        req.roleUser = user.role;
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map