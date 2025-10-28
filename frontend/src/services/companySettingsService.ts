import apiClient from './apiClient';

export interface CompanySettings {
  id: number;
  company_name: string;
  owner_name: string;
  email: string;
  phone_number: string;
  address: string;
  drug_license_number: string;
  gst_number: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateCompanySettingsData {
  company_name: string;
  owner_name: string;
  email: string;
  phone_number: string;
  address: string;
  drug_license_number: string;
  gst_number: string;
}

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const response = await apiClient.get('/settings/company/');
  return response.data;
};

export const updateCompanySettings = async (settingsData: UpdateCompanySettingsData): Promise<CompanySettings> => {
  const response = await apiClient.put('/settings/company/', settingsData);
  return response.data;
};