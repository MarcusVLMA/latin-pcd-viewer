export function getRandomColorAndSize() {
    const randomColor = `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`;
    const randomSize = Math.round(10 * (Math.random() * (1.6 - 0.8) + 0.8)) / 10;

    return [randomColor, randomSize];
}
