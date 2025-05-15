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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users_service_1 = require("../../users/services/users.service");
let AuthService = class AuthService {
    constructor(userService) {
        this.userService = userService;
    }
    async validateUser(username, password) {
        const userByUsername = await this.userService.findBy({
            key: 'username',
            value: username,
        });
        const userByEmial = await this.userService.findBy({
            key: 'email',
            value: username,
        });
        if (userByUsername) {
            const match = await bcrypt.compare(password, userByUsername.password);
            if (match)
                return userByUsername;
        }
        if (userByEmial) {
            const match = await bcrypt.compare(password, userByEmial.password);
            if (match)
                return userByEmial;
        }
        return null;
    }
    signJWT({ payload, secret, expires, }) {
        return jwt.sign(payload, secret, { expiresIn: expires });
    }
    async generateJWT(user) {
        const getUser = await this.userService.findUserById(user.id);
        const payload = {
            role: getUser.role,
            sub: getUser.id,
        };
        return {
            accessToken: this.signJWT({
                payload,
                secret: process.env.JWT_SECRET ?? '',
                expires: '365d',
            }),
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map