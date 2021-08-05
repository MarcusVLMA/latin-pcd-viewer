export function getRandomColorAndSize() {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const randomSize = Math.round(10 * (Math.random() * (1.6 - 0.8) + 0.8)) / 10;

    return [randomColor, randomSize];
}
