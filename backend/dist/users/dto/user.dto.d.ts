import { ROLES } from 'src/constants/roles';
export declare class UserDTO {
    email: string;
    username: string;
    password: string;
    role: ROLES;
    business_type: string;
    business_name: string;
    business_district: string;
    business_address: string;
    business_phone_number: string;
    business_sector: string;
    business_document_type: string;
    business_email: string;
    assumes_5_percent_pos: boolean;
    business_document_number: string;
    owner_name: string;
    owner_phone_number: string;
    owner_document_type: string;
    owner_document_number: string;
    owner_email_address: string;
    owner_bank_account: string;
}
export declare class UserUpdateDTO {
    email: string;
    username: string;
    password?: string;
    role: ROLES;
    business_type: string;
    business_name: string;
    business_district: string;
    business_address: string;
    business_phone_number: string;
    business_sector: string;
    business_document_type: string;
    business_email: string;
    assumes_5_percent_pos: boolean;
    business_document_number: string;
    owner_name: string;
    owner_phone_number: string;
    owner_document_type: string;
    owner_document_number: string;
    owner_email_address: string;
    owner_bank_account: string;
}
