import { HttpService } from '@nestjs/axios';
export declare class HttpCustomService {
    private readonly httpService;
    constructor(httpService: HttpService);
    apiFindAll(): Promise<any>;
}
