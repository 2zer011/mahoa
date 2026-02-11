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
    if (outputIdx === -1) return -1;
    let shift = v5_get_shift(pos);
    let inputIdx = (outputIdx - (shift % 256) - saltIdx + 512) % 256;
    return inputIdx;
}

const VERSION_PREFIX = 'v6_';

function encode(text) {
    const saltIdx = Math.floor(Math.random() * V5_ALPHABET.length);
    const saltChar = V5_ALPHABET[saltIdx];
    let result = [VERSION_PREFIX, saltChar];

    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        let compact = v5_hyper_expansion(String.fromCharCode(byte), i, saltIdx);
        result.push(compact);
    }
    return result.join('');
}

function decode(text) {
    let cleanText = text.trim();
    if (cleanText.startsWith('v6_')) {
        const charsAfterPrefix = Array.from(cleanText.substring(3));
        const saltChar = charsAfterPrefix[0];
        const saltIdx = V5_ALPHABET.indexOf(saltChar);
        const data = charsAfterPrefix.slice(1);

        const bytes = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            bytes[i] = v5_reverse_lookup(data[i], i, saltIdx);
        }

        return new TextDecoder().decode(bytes);
    }
    return null;
}

// Test cases
const testCases = [
    "Hello World",
    "HELLO WORLD",
    "Xin chào tiếng Việt",
    "ẾỆĐ áàảãạ",
    "Emoji 🍎 inside 🍎",
    "Ký tự đặc biệt: !@#$%^&*()",
    "Trường hợp viết HOA viết thường lẫn lộn: AbCdEfGhIj"
];

let allPassed = true;

testCases.forEach(input => {
    const encoded = encode(input);
    const decoded = decode(encoded);
    const passed = input === decoded;
    console.log(`Input: ${input}`);
    console.log(`Decoded: ${decoded}`);
    console.log(`Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('---');
    if (!passed) allPassed = false;
});

console.log(`\nFinal Result: ${allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
process.exit(allPassed ? 0 : 1);
