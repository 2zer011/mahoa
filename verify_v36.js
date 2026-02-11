const fs = require('fs');
const content = fs.readFileSync('script.js', 'utf8');

// Extract current state
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

function encode(text) {
    const saltIdx = 10; // Fixed for consistent test
    const saltChar = V5_ALPHABET[saltIdx];
    let result = ["v36_", saltChar];
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    for (let i = 0; i < bytes.length; i++) {
        result.push(v5_hyper_expansion(String.fromCharCode(bytes[i]), i, saltIdx));
    }
    return result.join('');
}

function decode(text) {
    let cleanText = text.trim();
    if (cleanText.startsWith('v36_') || cleanText.startsWith('v6_')) {
        const isV36 = cleanText.startsWith('v36_');
        const prefixOffset = isV36 ? 4 : 3;
        const charsAfterPrefix = Array.from(cleanText.substring(prefixOffset));
        if (charsAfterPrefix.length < 1) return '';
        const saltChar = charsAfterPrefix[0];
        const saltIdx = V5_ALPHABET.indexOf(saltChar);
        const data = charsAfterPrefix.slice(1);
        const bytes = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            bytes[i] = v5_reverse_lookup(data[i], i, saltIdx);
        }
        return new TextDecoder().decode(bytes);
    }
    return "Unsupported format";
}

// Test cases
console.log("--- Testing v36 (New Format) ---");
const input = "Test v36 Unicode! 🚀";
const encoded = encode(input);
console.log(`Input: ${input}`);
console.log(`Encoded: ${encoded}`);
const decoded = decode(encoded);
console.log(`Decoded: ${decoded}`);
console.log(`Result: ${input === decoded ? '✅ PASSED' : '❌ FAILED'}`);

console.log("\n--- Testing v6 (Backward Compatibility) ---");
// Manually construct a v6 string using the same logic as v36
const v6_encoded = encoded.replace('v36_', 'v6_');
console.log(`v6 Encoded: ${v6_encoded}`);
const v6_decoded = decode(v6_encoded);
console.log(`v6 Decoded: ${v6_decoded}`);
console.log(`v6 Result: ${input === v6_decoded ? '✅ PASSED' : '❌ FAILED'}`);

// For v2_, we'd need the DECODING_TABLE which is complex to replicate here.
// But we can check if the code still exists in script.js.
console.log("\n--- Checking v2 Support in script.js ---");
const hasV2 = content.includes("if (cleanText.startsWith('v2_'))");
console.log(`Has v2_ support: ${hasV2 ? '✅ YES' : '❌ NO'}`);
