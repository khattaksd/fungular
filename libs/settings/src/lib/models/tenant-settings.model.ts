export interface TenantSettings {
  name: string;
  domain: string;
  seats: number;
  seatsUsed: number;
  logo: string;
}

export interface LogoUploadResult {
  url: string;
  name: string;
}