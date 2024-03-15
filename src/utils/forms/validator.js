/**
 * This callback type is called `setFieldError`. It set the helperText of an invalid form field.
 *
 * @callback setFieldError
 * @param {string} field
 * @param {string} message
 */
import { isArray, isFunction, isAsyncFunction } from '../helpers';
import StepFormValidationError from './models/StepFormValidationError';

/**
 * Summary. Validate forms values based on a schema format.
 *
 * Description. This method will mainly be used to validate a step of a form, but it has a standard API that
 * will allow its use in other contexts.
 *
 * @access     public
 *
 * @param {Object} validationSchemas  Collection of receipts
 * @param {function} setFieldError  Function that invalides a field (with a helper text).
 * @param {Object} values  All form fields values.
 * @param {boolean=} stopValidationOnFirstError  If true, when a field is not valid the method return immediately false,
 * without validating the rest of the fields, if any. Default false
 *
 * @return {bool} Return true if all fields are valid, according to the validation schema.
 */
export async function validateSchemas({
  validationSchemas = {},
  setFieldError,
  values,
  stopValidationOnFirstError = false,
}) {
  const fields = Object.keys(validationSchemas);

  // Will hold for each field, it validation status (true is valid according to schema(no error), or false it's not);
  const fieldsAndValidations = {};

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    // Can be a string helper text, or a function that returns the helper text only when field is invalid.
    const validation = validationSchemas[field];

    // Value of the field.
    const value = values[field];

    // Initially, we assume there is no error.
    let errors;

    // If validation is a function.
    if (isFunction(validation)) {
      // We try to validate the field with its value.
      errors = validation({ value, values, otherValues: values });
    } else if (isAsyncFunction(validation)) {
      // We try to validate the field with its value.
      // eslint-disable-next-line no-await-in-loop
      errors = await validation({ value, values, otherValues: values });
    } else if (!value) {
      // If there are no custom validation function, and the value isn't defined, we assumed this field is not valid.
      errors = validation;
    }

    if (isArray(errors)) {
      if ((errors ?? []).length === 0) {
        // This field is valid.

        // We set the field as valid.
        fieldsAndValidations[field] = true;

        // We set there are no error (so no helper text|message).
        setFieldError(field, undefined);
      } else {
        if (!(errors[0] instanceof StepFormValidationError)) {
          throw Error(
            'Validation error is not a StepFormValidationError. Not handled. At this point return either ' +
              'undefined(no error), a string(helper text), or an array of StepFormValidationError.',
            errors[0]
          );
        }

        // Group Lines of fields meaning several lines of fields.
        // name1 | age1 | sex1
        // name2 | age2 | sex2
        const groupLinesOfFieldsErrors = [];

        // Is a complex validation error, designed to be a StepFormValidationError.
        // eslint-disable-next-line
        for (const validationError of errors) {
          // Field designed like "field.arrayIndex.arrayField". // * Eg: "users.name.0"
          const fieldPointIndexed = `${field}.${validationError.arrayIndex}.${validationError.arrayField}`;

          // We set the field as invalid.
          fieldsAndValidations[fieldPointIndexed] = false;

          // We set the error message.
          setFieldError(fieldPointIndexed, validationError.message);

          // Group Line of field : // name1 | age1 | sex1
          const groupLineFieldsErrors = groupLinesOfFieldsErrors?.[validationError.arrayIndex];

          // If there is no group errors for this line, we create it.
          if (groupLineFieldsErrors === undefined) {
            groupLinesOfFieldsErrors[validationError.arrayIndex] = {
              [validationError.arrayField]: validationError.message,
            };
          } else {
            // If there is a group errors for this line, we update it.
            groupLinesOfFieldsErrors.splice(validationError.arrayIndex, 1, {
              ...groupLineFieldsErrors,
              [validationError.arrayField]: validationError.message,
            });
          }
        }

        // List of errors must concern a same group of fields.
        // We set the group of fields as invalid.
        fieldsAndValidations[field] = false;

        // We set the group of fields errors message.
        setFieldError(field, groupLinesOfFieldsErrors);

        // So after this group invalidation, we can return false if it's the behavior expected.
        // For this specific, array not empty mean that at least one field of the group is invalid.
        if (stopValidationOnFirstError) return false;
      }
    } else if (errors) {
      // This field is not valid.

      // We set the field as invalid.
      fieldsAndValidations[field] = false;

      // We set the error message.
      setFieldError(field, errors);

      if (stopValidationOnFirstError) return false;
    } else {
      // This field is valid.

      // We set the field as valid.
      fieldsAndValidations[field] = true;

      // We set there are no error (so no helper text|message).
      setFieldError(field, undefined);
    }
  }

  return Object.values(fieldsAndValidations).every((v) => v);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
