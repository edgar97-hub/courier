import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/services/users.service';
export declare class AccessLevelGuard implements CanActivate {
    private readonly reflector;
    private readonly userService;
    constructor(reflector: Reflector, userService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
