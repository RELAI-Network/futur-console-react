import { useState, useCallback } from 'react';

export const useFormValidation = ({ initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState('');

  const [validationErrors, setValidationErrors] = useState({});

  // Shortcut function that set validation error (and message) for a step field.
  // Called when validating step with {validateStep} function.
  const setFieldError = useCallback((field, value) => {
    setValidationErrors((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }, []);

  const setFieldValue = useCallback((field, value) => {
    setValidationErrors({});
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }, []);

  const hasValidationError = useCallback(
    (field) => !!validationErrors?.[[field]],
    [validationErrors]
  );

  const setFieldsValues = useCallback((fieldsAndValues) => {
    setValidationErrors({});
    setFormData((prevState) => ({
      ...prevState,
      ...fieldsAndValues,
    }));
  }, []);

  return {
    setFieldError,
    setFieldsValues,
    setFieldValue,
    submitting,
    submitError,
    setSubmitting: (value) => {
      if (value) setSubmitError('');
      setSubmitting(value);
    },
    setSubmitError,
    data: formData,
    fieldHasValidationError: hasValidationError,
    validationErrors,
  };
};
