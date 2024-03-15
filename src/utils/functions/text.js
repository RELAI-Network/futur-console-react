/* eslint-disable */

export function formatText(
    text = "",
    {blockLength = 1, separator = " "} = {}
) {
    let noSeparator = ((text ?? "") + "").replaceAll(separator, "") ?? "";

    if (noSeparator.length >= blockLength) {
        let temp = "";
        let k = 0;
        let modulo = noSeparator.length % blockLength;
        let start = modulo === 0 ? blockLength : modulo;
        for (let i = start; i < noSeparator.length; i += blockLength) {
            temp += noSeparator.substring(i - blockLength, i) + separator;
            k = i;
        }
        noSeparator = temp + noSeparator.substring(k, noSeparator.length);
    }

    return noSeparator.trim();
}

export const capitalizeAllWords = (string) => {
    return string.split(" ").map(capitalize).join(" ");
};

export const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
