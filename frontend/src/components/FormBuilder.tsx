import React, { useMemo, useCallback } from 'react';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Autocomplete,
  Chip,
  FormHelperText
} from '@mui/material';

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'autocomplete' 
  | 'textarea'
  | 'multiselect';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  gridSize?: number;
  placeholder?: string;
  options?: SelectOption[];
  multiline?: boolean;
  rows?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}

export interface FormBuilderProps {
  fields: FormField[];
  values: Record<string, any>;
  errors?: Record<string, string>;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  disabled?: boolean;
  sx?: any;
}

const MemoizedTextField = React.memo(({ 
  field, 
  value, 
  error, 
  onChange, 
  onBlur, 
  disabled 
}: {
  field: FormField;
  value: any;
  error?: string;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  disabled?: boolean;
}) => (
  <TextField
    name={field.name}
    label={field.label}
    value={value || ''}
    onChange={(e) => onChange(field.name, e.target.value)}
    onBlur={() => onBlur?.(field.name)}
    error={!!error}
    helperText={error}
    required={field.required}
    disabled={disabled || field.disabled}
    placeholder={field.placeholder}
    type={field.type === 'number' ? 'number' : 'text'}
    multiline={field.multiline}
    rows={field.rows}
    fullWidth
    variant="outlined"
  />
));

const MemoizedSelectField = React.memo(({ 
  field, 
  value, 
  error, 
  onChange, 
  onBlur, 
  disabled 
}: {
  field: FormField;
  value: any;
  error?: string;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  disabled?: boolean;
}) => (
  <FormControl fullWidth error={!!error}>
    <InputLabel>{field.label}</InputLabel>
    <Select
      name={field.name}
      value={value || ''}
      onChange={(e) => onChange(field.name, e.target.value)}
      onBlur={() => onBlur?.(field.name)}
      label={field.label}
      disabled={disabled || field.disabled}
    >
      {field.options?.map((option) => (
        <MenuItem 
          key={option.value} 
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </MenuItem>
      ))}
    </Select>
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
));

const MemoizedAutocompleteField = React.memo(({ 
  field, 
  value, 
  error, 
  onChange, 
  onBlur, 
  disabled 
}: {
  field: FormField;
  value: any;
  error?: string;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  disabled?: boolean;
}) => (
  <Autocomplete
    options={field.options || []}
    getOptionLabel={(option) => option.label}
    value={field.options?.find(opt => opt.value === value) || null}
    onChange={(_, newValue) => onChange(field.name, newValue?.value || null)}
    onBlur={() => onBlur?.(field.name)}
    disabled={disabled || field.disabled}
    renderInput={(params) => (
      <TextField
        {...params}
        label={field.label}
        error={!!error}
        helperText={error}
        required={field.required}
        placeholder={field.placeholder}
      />
    )}
  />
));

const MemoizedMultiSelectField = React.memo(({ 
  field, 
  value, 
  error, 
  onChange, 
  onBlur, 
  disabled 
}: {
  field: FormField;
  value: any;
  error?: string;
  onChange: (name: string, value: any) => void;
  onBlur?: (name: string) => void;
  disabled?: boolean;
}) => (
  <Autocomplete
    multiple
    options={field.options || []}
    getOptionLabel={(option) => option.label}
    value={field.options?.filter(opt => 
      Array.isArray(value) && value.includes(opt.value)
    ) || []}
    onChange={(_, newValue) => 
      onChange(field.name, newValue.map(v => v.value))
    }
    onBlur={() => onBlur?.(field.name)}
    disabled={disabled || field.disabled}
    renderTags={(selected, getTagProps) =>
      selected.map((option, index) => (
        <Chip
          variant="outlined"
          label={option.label}
          {...getTagProps({ index })}
          key={option.value}
        />
      ))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label={field.label}
        error={!!error}
        helperText={error}
        required={field.required}
        placeholder={field.placeholder}
      />
    )}
  />
));



export default function FormBuilder({
  fields,
  values,
  errors = {},
  onChange,
  onBlur,
  disabled = false,
  sx
}: FormBuilderProps) {
  
  const renderField = useCallback((field: FormField) => {
    const value = values[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'number':
        return (
          <MemoizedTextField
            field={field}
            value={value}
            error={error}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <MemoizedSelectField
            field={field}
            value={value}
            error={error}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
        );

      case 'autocomplete':
        return (
          <MemoizedAutocompleteField
            field={field}
            value={value}
            error={error}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
        );

      case 'multiselect':
        return (
          <MemoizedMultiSelectField
            field={field}
            value={value}
            error={error}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
          />
        );

      default:
        return null;
    }
  }, [values, errors, onChange, onBlur, disabled]);

  const memoizedFields = useMemo(() => 
    fields.map((field) => (
      <Grid 
        size={{ xs: 12, md: field.gridSize || 6 }}
        key={field.name}
      >
        {renderField(field)}
      </Grid>
    )),
    [fields, renderField]
  );

  return (
    <Box sx={sx}>
      <Grid container spacing={2}>
        {memoizedFields}
      </Grid>
    </Box>
  );
}