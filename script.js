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
const VERSION_PREFIX = 'v2_';
const CHUNK_SIZE = 10;

// Hàm xoay chuỗi để tăng cường bảo mật
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
    let result = [VERSION_PREFIX];
    const cleanText = text.toLowerCase();

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        if (ENCODING_TABLE[char]) {
            let code = ENCODING_TABLE[char];
            // Xoay ký tự dựa trên vị trí của nó (Lớp 2)
            let rotatedCode = rotateString(code, i + 1);
            result.push(rotatedCode);
        }
    }

    if (result.length === 1) return ''; // Chỉ có prefix
    return result.join('');
}

// Hàm giải mã
function decode(text) {
    let result = [];
    let cleanText = text.trim();

    // Kiểm tra xem có phải định dạng v2 không
    if (cleanText.startsWith(VERSION_PREFIX)) {
        const data = cleanText.substring(VERSION_PREFIX.length);
        let charIndex = 0;

        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.substring(i, i + CHUNK_SIZE);
            if (chunk.length === CHUNK_SIZE) {
                // Xoay ngược lại dựa trên vị trí (Lớp 2)
                const unrotatedChunk = unrotateString(chunk, charIndex + 1);

                if (DECODING_TABLE[unrotatedChunk]) {
                    result.push(DECODING_TABLE[unrotatedChunk]);
                } else {
                    // Nếu không tìm thấy trong bảng, có thể do dữ liệu lỗi
                    result.push('?');
                }
                charIndex++;
            }
        }
    } else {
        // Hỗ trợ giải mã phiên bản cũ (v1 - không có prefix)
        for (let i = 0; i < cleanText.length; i += CHUNK_SIZE) {
            const chunk = cleanText.substring(i, i + CHUNK_SIZE);
            if (chunk.length === CHUNK_SIZE && DECODING_TABLE[chunk]) {
                result.push(DECODING_TABLE[chunk]);
            }
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
