export declare class DistributorRecordDTO {
    clientName: string;
    clientDni: string;
    clientPhone: string;
    destinationAddress: string;
}
declare const UpdateDistributorRecordDTO_base: import("@nestjs/common").Type<Partial<DistributorRecordDTO>>;
export declare class UpdateDistributorRecordDTO extends UpdateDistributorRecordDTO_base {
}
export {};
