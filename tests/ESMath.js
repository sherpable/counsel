export function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

export function avg(...numbers) {
    return sum(...numbers) / numbers.length;
}