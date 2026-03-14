const CryptoJS = require("crypto-js");

const SECRET = process.env.AES_SECRET_KEY;

const encrypt = (data) => {
  const text = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(text, SECRET).toString();
};

const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};

const encryptPayload = (data) => ({ encrypted: encrypt(data) });

const decryptPayload = (payload) => {
  if (!payload?.encrypted) return null;
  return decrypt(payload.encrypted);
};

module.exports = { encrypt, decrypt, encryptPayload, decryptPayload };
