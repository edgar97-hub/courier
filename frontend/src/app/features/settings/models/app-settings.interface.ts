export interface AppSettings {
  id?: string; // Opcional, si tu backend devuelve un ID para el registro de configuración
  business_name: string | null;
  address: string | null;
  phone_number: string | null;
  logo_url: string | null;
  terms_conditions_url: string | null;
}

// Valor inicial para el formulario, útil si la API no devuelve nada la primera vez
export const initialAppSettings: AppSettings = {
  business_name: null,
  address: null,
  phone_number: null,
  logo_url: null,
  terms_conditions_url: null,
};
