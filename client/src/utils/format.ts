/**
 * Formats number to a short string.
 * E.g. 1000 => 1k
 */
export function nFormatter(num: number, digits: number) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
    const item = lookup.slice().reverse().find(item => num >= item.value);
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
}

/**
 * Formats string to titleCase.
 * E.g. hello world => Hello World
 */
export function titleCase(str: string) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

/**
 * Adds https:// if it's missing
 * E.g. linkedin.com https://linkedin.com
 */
export function formatBrokenLink(link: string) {
    if (!link.includes('http')) {
        return 'https://'+ link
    }
    return link
}