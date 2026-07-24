export interface User {
  id: string;
  code: number;
  username: string;
  email: string;
  password?: string;
  role: string;
  driverCode?: string;
  photo_url?: string;
  business_type?: string;
  business_name?: string;
  business_district?: string;
  business_address?: string;
  business_phone_number?: string;
  business_sector?: string;
  business_document_type?: string;
  business_email?: string;
  business_document_number?: string;
  assumes_5_percent_pos?: boolean;
  owner_name?: string;
  owner_phone_number?: string;
  owner_document_type?: string;
  owner_document_number?: string;
  owner_email_address?: string;
  owner_bank_account?: string;
  name_account_number_owner?: string;
  isVolumeDiscountEnabled?: boolean;
  assignedVolumeDiscountRuleIds?: string[];
  isFulfillmentEnabled?: boolean;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  role: string;
  driverCode?: string;
  business_type?: string;
  business_name?: string;
  business_district?: string;
  business_address?: string;
  business_phone_number?: string;
  business_sector?: string;
  business_document_type?: string;
  business_email?: string;
  business_document_number?: string;
  assumes_5_percent_pos?: boolean;
  owner_name?: string;
  owner_phone_number?: string;
  owner_document_type?: string;
  owner_document_number?: string;
  owner_email_address?: string;
  owner_bank_account?: string;
  name_account_number_owner?: string;
  isFulfillmentEnabled?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
  role?: string;
  driverCode?: string;
  business_type?: string;
  business_name?: string;
  business_district?: string;
  business_address?: string;
  business_phone_number?: string;
  business_sector?: string;
  business_document_type?: string;
  business_email?: string;
  business_document_number?: string;
  assumes_5_percent_pos?: boolean;
  owner_name?: string;
  owner_phone_number?: string;
  owner_document_type?: string;
  owner_document_number?: string;
  owner_email_address?: string;
  owner_bank_account?: string;
  name_account_number_owner?: string;
  isFulfillmentEnabled?: boolean;
}

export const ROLES_LIST = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
  { value: 'MOTORIZADO', label: 'Motorizado' },
  { value: 'EMPRESA', label: 'Empresa' },
  { value: 'EMPRESA_DISTRIBUIDOR', label: 'Empresa Distribuidor' },
];

 