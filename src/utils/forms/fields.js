export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalizeAllWords(string) {
    return string.split(" ").map(capitalize).join(" ");
}

export function handleInputChange(
    event,
    setFieldValue,
    {
        capitalizeFirstLetter = true,
        capitalizeFirstLetterOfWords = false,
        capitalizeAllLetters = false,
    } = {}
) {
    const input = event.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (capitalizeAllLetters) {
      setFieldValue(input.value.toUpperCase());
    } else if (capitalizeFirstLetterOfWords) {
        setFieldValue(capitalizeAllWords(input.value));
      } else {
        setFieldValue(capitalizeFirstLetter ? capitalize(input.value) : input.value);
      }

    input.setSelectionRange(start, end);
}
