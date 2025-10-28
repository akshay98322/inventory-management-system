import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Settings, Business, Save, Phone, LocationOn, Article, AccountBalance, Person, Email } from '@mui/icons-material';
import { getCompanySettings, updateCompanySettings, CompanySettings, UpdateCompanySettingsData } from '../services/companySettingsService';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState<UpdateCompanySettingsData>({
    company_name: '',
    owner_name: '',
    email: '',
    phone_number: '',
    address: '',
    drug_license_number: '',
    gst_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCompanySettings();
      setSettings(data);
      setFormData({
        company_name: data.company_name,
        owner_name: data.owner_name,
        email: data.email,
        phone_number: data.phone_number,
        address: data.address,
        drug_license_number: data.drug_license_number,
        gst_number: data.gst_number
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load company settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateCompanySettingsData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate company name
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    // Validate GST number format if provided
    if (formData.gst_number && formData.gst_number.length > 0) {
      if (formData.gst_number.length !== 15) {
        newErrors.gst_number = 'GST number must be exactly 15 characters';
      }
    }

    // Validate drug license number if provided
    if (formData.drug_license_number && formData.drug_license_number.length > 0) {
      if (formData.drug_license_number.length < 5) {
        newErrors.drug_license_number = 'Drug license number must be at least 5 characters';
      }
    }

    // Validate phone number format if provided
    if (formData.phone_number && formData.phone_number.length > 0) {
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      
      const updatedSettings = await updateCompanySettings(formData);
      setSettings(updatedSettings);
      setMessage({ type: 'success', text: 'Company settings updated successfully!' });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data) {
        const backendErrors: { [key: string]: string } = {};
        Object.keys(error.response.data).forEach(key => {
          if (Array.isArray(error.response.data[key])) {
            backendErrors[key] = error.response.data[key][0];
          } else {
            backendErrors[key] = error.response.data[key];
          }
        });
        setErrors(backendErrors);
        setMessage({ type: 'error', text: 'Please correct the errors below' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update company settings' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Settings sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Company Settings
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Company Name */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Basic Information</Typography>
              </Box>
              <TextField
                fullWidth
                label="Company Name *"
                value={formData.company_name}
                onChange={handleInputChange('company_name')}
                error={!!errors.company_name}
                helperText={errors.company_name}
                variant="outlined"
                placeholder="Enter your company name"
              />
            </Box>

            {/* Owner Name */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Owner Name</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Owner Name"
                  value={formData.owner_name}
                  onChange={handleInputChange('owner_name')}
                  error={!!errors.owner_name}
                  helperText={errors.owner_name}
                  variant="outlined"
                  placeholder="Enter owner/proprietor name"
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Email Address</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email || 'Business email address'}
                  variant="outlined"
                  placeholder="company@example.com"
                />
              </Box>
            </Box>

            {/* Phone Number */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Phone Number</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleInputChange('phone_number')}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number || 'Include country code if international'}
                  variant="outlined"
                  placeholder="+1-XXX-XXX-XXXX"
                />
              </Box>
            </Box>

            {/* Address */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1">Address</Typography>
              </Box>
              <TextField
                fullWidth
                label="Company Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                error={!!errors.address}
                helperText={errors.address}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Enter complete company address"
              />
            </Box>

            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Regulatory Information
              </Typography>
            </Box>

            {/* Drug License and GST Number Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Article sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Drug License Number</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Drug License Number"
                  value={formData.drug_license_number}
                  onChange={handleInputChange('drug_license_number')}
                  error={!!errors.drug_license_number}
                  helperText={errors.drug_license_number || 'Required for pharmaceutical business'}
                  variant="outlined"
                  placeholder="DL-XXXX-XXXX"
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">GST Number</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={formData.gst_number}
                  onChange={handleInputChange('gst_number')}
                  error={!!errors.gst_number}
                  helperText={errors.gst_number || 'Must be exactly 15 characters'}
                  variant="outlined"
                  placeholder="XXXXXXXXXXXXXXXXXXXX"
                  inputProps={{ maxLength: 15 }}
                />
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                sx={{ minWidth: 150 }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Box>
        </form>

        {settings && (
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(settings.updated_at).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;