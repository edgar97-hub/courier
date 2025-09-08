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
exports.PlanningEvent = exports.PlanningEventStatus = void 0;
const typeorm_1 = require("typeorm");
const route_entity_1 = require("./route.entity");
var PlanningEventStatus;
(function (PlanningEventStatus) {
    PlanningEventStatus["PENDING"] = "PENDING";
    PlanningEventStatus["COMPLETED"] = "COMPLETED";
    PlanningEventStatus["CANCELLED"] = "CANCELLED";
})(PlanningEventStatus || (exports.PlanningEventStatus = PlanningEventStatus = {}));
let PlanningEvent = class PlanningEvent {
};
exports.PlanningEvent = PlanningEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanningEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], PlanningEvent.prototype, "planningEventIdExternal", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlanningEvent.prototype, "planningDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PlanningEventStatus,
        default: PlanningEventStatus.PENDING,
    }),
    __metadata("design:type", String)
], PlanningEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => route_entity_1.Route, (route) => route.planningEvent, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], PlanningEvent.prototype, "routes", void 0);
exports.PlanningEvent = PlanningEvent = __decorate([
    (0, typeorm_1.Entity)('planning_events')
], PlanningEvent);
//# sourceMappingURL=planning-event.entity.js.map