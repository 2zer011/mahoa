const text = 'v6_🍎Abc';
console.log('Original string:', text);
console.log('Length:', text.length);

const saltChar = text.substring(3, 4);
console.log('Salt char (substring(3,4)):', saltChar);
console.log('Salt char code:', saltChar.charCodeAt(0).toString(16));

const data = text.substring(4);
console.log('Data (substring(4)):', data);

const arrayFrom = Array.from(text.substring(3));
console.log('Array.from(substring(3)):', arrayFrom);
const saltCharFromArr = arrayFrom[0];
console.log('Salt char from array:', saltCharFromArr);
const dataFromArr = arrayFrom.slice(1).join('');
console.log('Data from array:', dataFromArr);
