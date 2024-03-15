class StepFormValidationError {
    message;

    field;

    isDynamic;

    isArray = false;

    arrayIndex = false;

    arrayField;

    constructor(
        message,
        field,
        {is_dynamic = false, is_array = false, array_index, array_field} = {}
    ) {
        this.message = message;
        this.field = field;
        this.isDynamic = is_dynamic;
        this.isArray = is_array;
        this.arrayIndex = array_index;
        this.arrayField = array_field;
    }
}

export default StepFormValidationError;
