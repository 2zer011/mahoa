// Bảng mã hóa: mỗi ký tự a-z, 0-9 và dấu cách tương ứng với một chuỗi 10 ký tự
const ENCODING_TABLE = {
    'a': '2c[kpj3Abe',
    'b': '_]]oB(C_&1',
    'c': 'lsk*$6w@mL',
    'd': '4uqG-(jB}#',
    'e': '8#9})7{[BN',
    'f': '}1:I#5y5-Q',
    'g': 'y<H^S.HP6(',
    'h': 'mO9(8=URpM',
    'i': '*}&HjTDrnG',
    'j': 'wt;Wz;lv1a',
    'k': '>5EkAoPs6n',
    'l': '{5-i>d^9?c',
    'm': 'h_D^+FrSn<',
    'n': '4gYDz>LRLI',
    'o': '*&USfCsCxT',
    'p': 'dG-as9m$s*',
    'q': '8O;9{6^,7L',
    'r': 'vDk;[]u!jl',
    's': '{)qI+;AGLW',
    't': 'FrZ]z:HWJL',
    'u': 'yf#H}{wN$i',
    'v': 'v?JHiOv%I7',
    'w': 'iE<qVBIxA+',
    'x': ')87xYd2Sb}',
    'y': 'RKQ<HD4I:_',
    'z': '}Yr-+OY>nA',
    '0': 'J-#s4+@#th',
    '1': '@GTC#T}EGc',
    '2': '=FTk2_b28I',
    '3': 'o<^deWpR(I',
    '4': '>E-GP6>*,T',
    '5': '!@>N%_*KVc',
    '6': '$M!wmTTkc{',
    '7': '?P}XI&Z$p:',
    '8': 'H:X3Ou$gDj',
    '9': '[anJ&rM1:H',
    ' ': 'Xz@#Sp!9Vk',  // Dấu cách
    // Ký tự đặc biệt
    ',': 'Qw3$kLm8Np',
    '.': 'Zt7%rXy2Hv',
    '/': 'Bn5^tYu4Kl',
    ';': 'Mj9&wQe6Op',
    "'": 'Sd1*fGh7Iu',
    '[': 'Px2(bNc5Wr',
    ']': 'Yl6)vMd3Ea',
    '`': 'Hf8!zKj4Tb',
    '-': 'Uc0@xSl9Gn',
    '=': 'Vr4#qWp1Dm',
    '+': 'Ki7$aTb2Fo',
    '*': 'Jn3%eYc8Ls',
    '<': 'Wg5^oUi6Hp',
    '>': 'Xd9&sRf0Mq',
    '?': 'Eb1*tNg7Kv',
    ':': 'Fl2(yHj4Ow',
    '"': 'Gc3)uPk5Ra',
    '~': 'Hs4!iQl6Tb',
    '!': 'It5@oRm7Uc',
    '@': 'Ju6#aSn8Vd',
    '#': 'Kv7$bTp9We',
    '$': 'Lw8%cUq0Xf',
    '%': 'Mx9^dVr1Yg',
    '^': 'Ny0&eWs2Zh',
    '&': 'Oz1*fXt3Ai',
    '(': 'Pa2(gYu4Bj',
    ')': 'Qb3)hZv5Ck',
    '_': 'Rc4!iAw6Dl'
};

// Tạo bảng giải mã từ bảng mã hóa
const DECODING_TABLE = {};
for (const [key, value] of Object.entries(ENCODING_TABLE)) {
    DECODING_TABLE[value] = key;
}

// Các phần tử DOM
const modeBtns = document.querySelectorAll('.mode-btn');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const convertBtn = document.getElementById('convert-btn');
const convertText = document.getElementById('convert-text');
const copyBtn = document.getElementById('copy-btn');
const charCount = document.querySelector('.char-count');
const inputLabel = document.getElementById('input-label');
const outputLabel = document.getElementById('output-label');
const toast = document.getElementById('toast');

let currentMode = 'encode';

// Cập nhật đếm ký tự
inputText.addEventListener('input', () => {
    const count = inputText.value.length;
    charCount.textContent = `${count} ký tự`;
});

// Chuyển đổi chế độ
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateUI();
    });
});

function updateUI() {
    if (currentMode === 'encode') {
        inputLabel.textContent = '📝 Nhập văn bản cần mã hóa';
        outputLabel.textContent = '🎯 Kết quả mã hóa';
        convertText.textContent = 'Mã Hóa Ngay';
        inputText.placeholder = 'Nhập văn bản (a-z, 0-9, ký tự đặc biệt) tại đây...';
    } else {
        inputLabel.textContent = '🔐 Nhập chuỗi đã mã hóa';
        outputLabel.textContent = '📄 Văn bản gốc';
        convertText.textContent = 'Giải Mã Ngay';
        inputText.placeholder = 'Dán chuỗi đã mã hóa vào đây...';
    }
    // Xóa kết quả cũ
    outputText.textContent = '';
    inputText.value = '';
    charCount.textContent = '0 ký tự';
}

// Cấu hình mã hóa
const CHUNK_SIZE_V2 = 10;
const V4_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';

// --- Hệ thống mã hóa v5 (Hyper-Expansion 100,000 loops) ---
// --- Hệ thống mã hóa v6 (Randomized Hyper-Expansion) ---
const VERSION_PREFIX = 'v36_';
// Bảng chữ cái 256 ký tự duy nhất (Xử lý dưới dạng mảng để tránh lỗi Emoji surrogate pairs)
const V5_ALPHABET = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",.<>/?`~ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ✨🌟🔥🌈🍀💎🍎🚀💡🎉🎸🎮👾🤖👻🐲🌍☀️⭐🌙🌑🌓🌔🌕🌻🌷🌼🌸🌹");

function v5_get_shift(pos) {
    let state = 2024; // Seed cố định
    for (let i = 0; i < 100000; i++) {
        state = (state ^ (i + pos)) + (state << 1) ^ (state >> 3);
        state = (state & 0xFFFFFFFF) >>> 0;
    }
    return state;
}

function v5_hyper_expansion(char, pos, saltIdx = 0) {
    let inputIdx = char.charCodeAt(0) % 256;
    let shift = v5_get_shift(pos);
    // V6: Cộng thêm salt vào shift để tạo sự ngẫu nhiên
    let outputIdx = (inputIdx + (shift % 256) + saltIdx) % 256;
    return V5_ALPHABET[outputIdx];
}

function v5_reverse_lookup(targetChar, pos, saltIdx = 0) {
    let outputIdx = V5_ALPHABET.indexOf(targetChar);
    if (outputIdx === -1) return -1;

    let shift = v5_get_shift(pos);
    // V6: Trừ đi cả salt để quay về index gốc
    let inputIdx = (outputIdx - (shift % 256) - saltIdx + 512) % 256; // +512 để đảm bảo kết quả dương trước khi modulo
    return inputIdx;
}

// --- Các hệ thống cũ (Hỗ trợ giải mã) ---
function v4_pass1(char) {
    // 1 ký tự -> 10 số (dựa trên CharCode)
    const code = char.charCodeAt(0);
    let res = [];
    for (let i = 0; i < 10; i++) res.push((code + i * 7) % 256);
    return res;
}

function v4_pass2(arr) {
    // 10 số -> 20 số
    let res = [...arr];
    for (let i = 0; i < 10; i++) res.push((arr[i] * 3 + 13) % 256);
    return res;
}

function v4_pass3(arr) {
    // 20 số -> 30 số
    let res = [...arr];
    for (let i = 0; i < 10; i++) res.push((arr[i] ^ arr[i + 1] ^ 0xFF) % 256);
    return res;
}

function v4_pass4(arr) {
    // 30 số -> 40 số
    let res = [...arr];
    for (let i = 0; i < 10; i++) res.push((arr[i] << 1 | arr[i] >> 7) % 256);
    return res;
}

function v4_pass5(arr) {
    // 40 số -> 50 số
    let res = [...arr];
    for (let i = 0; i < 10; i++) res.push((arr[i] + arr[i + 1] + i) % 256);
    return res;
}

function v4_pass6_compact(arr, pos) {
    // Nén 50 số thành 4 ký tự ngắn gọn (Lớp 6)
    // Sử dụng thuật toán băm (hashing) đơn giản để lấy 4 giá trị đại diện
    let h1 = 0, h2 = 0, h3 = 0, h4 = 0;
    for (let i = 0; i < 50; i++) {
        if (i % 4 === 0) h1 = (h1 + arr[i]) % 64;
        else if (i % 4 === 1) h2 = (h2 + arr[i] + pos) % 64;
        else if (i % 4 === 2) h3 = (h3 ^ arr[i]) % 64;
        else h4 = (h4 + arr[i] * 2) % 64;
    }
    return V4_CHARSET[h1] + V4_CHARSET[h2] + V4_CHARSET[h3] + V4_CHARSET[h4];
}

// Hàm xoay chuỗi (Dành cho v2)
function rotateString(str, count) {
    count = count % str.length;
    if (count === 0) return str;
    return str.slice(-count) + str.slice(0, -count);
}

// Hàm xoay ngược lại
function unrotateString(str, count) {
    count = count % str.length;
    if (count === 0) return str;
    return str.slice(count) + str.slice(0, count);
}

// Hàm mã hóa
function encode(text) {
    // 1. Sinh Salt ngẫu nhiên (chọn 1 ký tự từ bảng alphabet v5)
    const saltIdx = Math.floor(Math.random() * V5_ALPHABET.length);
    const saltChar = V5_ALPHABET[saltIdx];

    let result = [VERSION_PREFIX, saltChar];

    // FIX: Sử dụng TextEncoder để hỗ trợ đầy đủ Unicode (dấu, hoa/thường)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);

    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        // 2. Mã hóa với Salt đã chọn
        let compact = v5_hyper_expansion(String.fromCharCode(byte), i, saltIdx);
        result.push(compact);
    }

    if (result.length === 2) return ''; // Nếu chỉ có tiền tố và salt, không có dữ liệu
    return result.join('');
}

// Hàm giải mã
function decode(text) {
    let result = [];
    let cleanText = text.trim();

    // --- Giải mã v36 (Mới) ---
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

        try {
            return new TextDecoder().decode(bytes);
        } catch (e) {
            return "Lỗi giải mã UTF-8";
        }
    }

    // --- Giải mã v5 (Static) ---
    if (cleanText.startsWith('v5_')) {
        const data = Array.from(cleanText.substring(3));
        for (let i = 0; i < data.length; i++) {
            const charCode = v5_reverse_lookup(data[i], i, 0); // Salt mặc định = 0
            result.push(String.fromCharCode(charCode));
        }
        return result.join('');
    }

    // --- Giải mã v4 ---
    if (cleanText.startsWith('v4_')) {
        const data = cleanText.substring(3);
        for (let i = 0; i < data.length; i += 4) {
            const chunk = data.substring(i, i + 4);
            if (chunk.length === 4) {
                // Với v4, vì sử dụng hàm băm (hashing) có va chạm để nén, 
                // ta sẽ tìm ngược lại trong bảng alphabet để giải mã.
                // Tìm ký tự nào khi qua 6 bước mã hóa cho ra kết quả này.
                let found = false;
                for (let charCode = 0; charCode < 256; charCode++) {
                    let char = String.fromCharCode(charCode);
                    let test_p1 = v4_pass1(char);
                    let test_p2 = v4_pass2(test_p1);
                    let test_p3 = v4_pass3(test_p2);
                    let test_p4 = v4_pass4(test_p3);
                    let test_p5 = v4_pass5(test_p4);
                    let test_compact = v4_pass6_compact(test_p5, result.length);

                    if (test_compact === chunk) {
                        result.push(char);
                        found = true;
                        break;
                    }
                }
                if (!found) result.push('?');
            }
        }
        return result.join('');
    }

    // --- Giải mã v2 ---
    if (cleanText.startsWith('v2_')) {
        const data = cleanText.substring(3);
        let charIndex = 0;
        for (let i = 0; i < data.length; i += CHUNK_SIZE_V2) {
            const chunk = data.substring(i, i + CHUNK_SIZE_V2);
            if (chunk.length === CHUNK_SIZE_V2) {
                const unrotatedChunk = unrotateString(chunk, charIndex + 1);
                if (DECODING_TABLE[unrotatedChunk]) {
                    result.push(DECODING_TABLE[unrotatedChunk]);
                } else {
                    result.push('?');
                }
                charIndex++;
            }
        }
        return result.join('');
    }

    // --- Giải mã v1 (Hỗ trợ cũ) ---
    for (let i = 0; i < cleanText.length; i += 10) {
        const chunk = cleanText.substring(i, i + 10);
        if (chunk.length === 10 && DECODING_TABLE[chunk]) {
            result.push(DECODING_TABLE[chunk]);
        }
    }

    return result.join('');
}

// Xử lý nút chuyển đổi
convertBtn.addEventListener('click', () => {
    const input = inputText.value.trim();

    if (!input) {
        showToast('⚠️ Vui lòng nhập dữ liệu!', false);
        return;
    }

    // Hiệu ứng nhấn nút
    convertBtn.style.transform = 'scale(0.98)';
    setTimeout(() => {
        convertBtn.style.transform = '';
    }, 150);

    let result;
    if (currentMode === 'encode') {
        result = encode(input);
        if (!result) {
            showToast('⚠️ Không có ký tự hợp lệ để mã hóa!', false);
            return;
        }
    } else {
        result = decode(input);
        if (!result) {
            showToast('⚠️ Không thể giải mã - kiểm tra dữ liệu!', false);
            return;
        }
    }

    outputText.textContent = result;

    // Hiệu ứng xuất hiện kết quả
    outputText.style.opacity = '0';
    outputText.style.transform = 'translateY(10px)';
    setTimeout(() => {
        outputText.style.transition = 'all 0.3s ease';
        outputText.style.opacity = '1';
        outputText.style.transform = 'translateY(0)';
    }, 50);
});

// Sao chép kết quả
copyBtn.addEventListener('click', async () => {
    const text = outputText.textContent;

    if (!text) {
        showToast('⚠️ Không có gì để sao chép!', false);
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast('✅ Đã sao chép vào clipboard!', true);
    } catch (err) {
        // Fallback cho trình duyệt cũ
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Đã sao chép vào clipboard!', true);
    }
});

// Hiển thị thông báo toast
function showToast(message, isSuccess = true) {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastText = toast.querySelector('.toast-text');

    toastIcon.textContent = isSuccess ? '✅' : '⚠️';
    toastText.textContent = message.replace(/^[⚠️✅]\s*/, '');

    if (isSuccess) {
        toast.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Phím tắt Enter để chuyển đổi
inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        convertBtn.click();
    }
});

// Focus vào input khi load trang
window.addEventListener('load', () => {
    inputText.focus();
});
