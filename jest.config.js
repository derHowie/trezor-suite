module.exports = {
    collectCoverage: true,
    testURL: 'http://localhost',

    modulePathIgnorePatterns: [
        'node_modules',
    ],
    transformIgnorePatterns: [
        'src/babel',
    ],
};
