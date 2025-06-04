"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimezoneInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const moment = require("moment-timezone");
let TimezoneInterceptor = class TimezoneInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => this.convertDatesToPeruTime(data)));
    }
    convertDatesToPeruTime(data) {
        if (Array.isArray(data)) {
            return data.map((item) => this.convertDatesToPeruTime(item));
        }
        if (data && typeof data === 'object') {
            const converted = {};
            for (const key in data) {
                const value = data[key];
                if (value instanceof Date) {
                    converted[key] = moment(value).tz('America/Lima').toDate();
                }
                else if (Array.isArray(value) || typeof value === 'object') {
                    converted[key] = this.convertDatesToPeruTime(value);
                }
                else {
                    converted[key] = value;
                }
            }
            return converted;
        }
        return data;
    }
};
exports.TimezoneInterceptor = TimezoneInterceptor;
exports.TimezoneInterceptor = TimezoneInterceptor = __decorate([
    (0, common_1.Injectable)()
], TimezoneInterceptor);
//# sourceMappingURL=lima-timezone.interceptor.js.map