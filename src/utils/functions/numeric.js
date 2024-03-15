/* eslint-disable */

export function stringToInt(str) {
    const int = parseInt(str + "");
    if (isNaN(int)) {
        return 0;
    }
    return int;
}
