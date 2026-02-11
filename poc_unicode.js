const V5_ALPHABET = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",.<>/?`~ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỈịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ✨🌟🔥🌈🍀💎🍎🚀💡🎉🎸🎮👾🤖👻🐲🌍🌈☀️⭐🌙🌑🌓🌔🌕🌻🌷🌼🌸🌹🍀🍎🍊🍋🍓🍇🍒🍍🥝🌽🍆🍅🌶️🍔🍟🍕🌭🥪🌮🌯🥗🍿🍱🍣🍜🍛🍚🍦🍰🍩🍪🍫🍬🍭🍯🥛☕🍵🍶🍷🍹🍺🍻🥂🥃🥤🥢🍵🍳🧂🥣🥄🍴");

function v5_get_shift(pos) {
    let state = 2024;
    for (let i = 0; i < 100000; i++) {
        state = (state ^ (i + pos)) + (state << 1) ^ (state >> 3);
        state = (state & 0xFFFFFFFF) >>> 0;
    }
    return state;
}

function v5_encode_byte(byte, pos, saltIdx = 0) {
    let shift = v5_get_shift(pos);
    let outputIdx = (byte + (shift % 256) + saltIdx) % 256;
    return V5_ALPHABET[outputIdx];
}

function v5_decode_byte(targetChar, pos, saltIdx = 0) {
    let outputIdx = V5_ALPHABET.indexOf(targetChar);
    if (outputIdx === -1) return -1;
    let shift = v5_get_shift(pos);
    let byte = (outputIdx - (shift % 256) - saltIdx + 512) % 256;
    return byte;
}

function full_unicode_encode(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const saltIdx = 42; // Fixed for test
    const saltChar = V5_ALPHABET[saltIdx];
    let result = ["v6_", saltChar];
    for (let i = 0; i < bytes.length; i++) {
        result.push(v5_encode_byte(bytes[i], i, saltIdx));
    }
    return result.join('');
}

function full_unicode_decode(text) {
    if (!text.startsWith('v6_')) return null;
    const chars = Array.from(text.substring(3));
    const saltChar = chars[0];
    const saltIdx = V5_ALPHABET.indexOf(saltChar);
    const data = chars.slice(1);
    const bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        bytes[i] = v5_decode_byte(data[i], i, saltIdx);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

const input = "Xin chào tiếng Việt, ếệđ! 🍎";
console.log("Original:", input);
const encoded = full_unicode_encode(input);
console.log("Encoded:", encoded);
const decoded = full_unicode_decode(encoded);
console.log("Decoded:", decoded);
console.log("Result:", input === decoded ? "SUCCESS" : "FAIL");
