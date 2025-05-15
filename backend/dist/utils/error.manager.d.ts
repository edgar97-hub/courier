import { HttpStatus } from '@nestjs/common';
export declare class ErrorManager extends Error {
    constructor({ type, message, }: {
        type: keyof typeof HttpStatus;
        message: string;
    });
    static createSignatureError(message: string): void;
}
