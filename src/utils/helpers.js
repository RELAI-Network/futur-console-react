export function isArray(o) {
    if (typeof Array.isArray === "undefined") {
        // Seem the best approach, according to this article : http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
        return Object.prototype.toString.call(o) === "[object Array]";
    }

    // https://stackoverflow.com/questions/4775722/how-can-i-check-if-an-object-is-an-array
    return Array.isArray(o);
}

export function isFunction(functionToCheck) {
    return (
        functionToCheck && {}.toString.call(functionToCheck) === "[object Function]"
        );
}

export function isAsyncFunction(functionToCheck) {
    return (
        functionToCheck &&
        {}.toString.call(functionToCheck) === "[object AsyncFunction]"
        );
}