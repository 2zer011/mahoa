const fs = require('fs');
const content = fs.readFileSync('script.js', 'utf8');

// Extract the necessary constants and functions from script.js using regex
const V5_ALPHABET_MATCH = content.match(/const V5_ALPHABET = Array\.from\("(.*?)"\);/);
const V5_ALPHABET = Array.from(V5_ALPHABET_MATCH[1]);

function v5_get_shift(pos) {
    let state = 2024;
    for (let i = 0; i < 100000; i++) {
        state = (state ^ (i + pos)) + (state << 1) ^ (state >> 3);
        state = (state & 0xFFFFFFFF) >>> 0;
    }
    return state;
}

function v5_hyper_expansion(char, pos, saltIdx = 0) {
    let inputIdx = char.charCodeAt(0) % 256;
    let shift = v5_get_shift(pos);
    let outputIdx = (inputIdx + (shift % 256) + saltIdx) % 256;
    return V5_ALPHABET[outputIdx];
}

function v5_reverse_lookup(targetChar, pos, saltIdx = 0) {
    let outputIdx = V5_ALPHABET.indexOf(targetChar);
    if (outputIdx === -1) return '?';
    let shift = v5_get_shift(pos);
    let inputIdx = (outputIdx - (shift % 256) - saltIdx + 512) % 256;
    return String.fromCharCode(inputIdx);
}

const VERSION_PREFIX = 'v6_';

function encode(text, forcedSaltIdx = null) {
    const saltIdx = forcedSaltIdx !== null ? forcedSaltIdx : Math.floor(Math.random() * V5_ALPHABET.length);
    const saltChar = V5_ALPHABET[saltIdx];
    let result = [VERSION_PREFIX, saltChar];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let compact = v5_hyper_expansion(char, i, saltIdx);
        result.push(compact);
    }
    return result.join('');
}

function decode(text) {
    let result = [];
    let cleanText = text.trim();
    if (cleanText.startsWith('v6_')) {
        const charsAfterPrefix = Array.from(cleanText.substring(3));
        if (charsAfterPrefix.length < 1) return '';
        const saltChar = charsAfterPrefix[0];
        const saltIdx = V5_ALPHABET.indexOf(saltChar);
        const data = charsAfterPrefix.slice(1);
        for (let i = 0; i < data.length; i++) {
            result.push(v5_reverse_lookup(data[i], i, saltIdx));
        }
        return result.join('');
    }
    return 'Not v6';
}

// Test cases
const testCases = [
    "Hello World",
    "Xin chào tiếng Việt",
    "Emoji 🍎🔥🌟",
    "Capital LETTERS and symbols !@#$%",
    "Mixed 123 áàảãạ"
];

let allPassed = true;

// Helper to find salt index for an emoji
function findSaltIdx(char) {
    return V5_ALPHABET.indexOf(char);
}

// Specifically test with an emoji salt (e.g., 🍎 which caused the issue)
const emojiSalt = '🍎';
const emojiSaltIdx = findSaltIdx(emojiSalt);

console.log(`--- Testing with Emoji Salt: ${emojiSalt} ---`);

testCases.forEach(input => {
    const encoded = encode(input, emojiSaltIdx);
    const decoded = decode(encoded);
    const passed = input === decoded;
    console.log(`Input: ${input}`);
    console.log(`Encoded: ${encoded}`);
    console.log(`Decoded: ${decoded}`);
    console.log(`Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('---');
    if (!passed) allPassed = false;
});

console.log(`\nFinal Result: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
process.exit(allPassed ? 0 : 1);
