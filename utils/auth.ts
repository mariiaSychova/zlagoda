import CryptoJS from "crypto-js";

const SECRET_KEY = CryptoJS.enc.Utf8.parse(
  process.env.CRYPTO_SECRET_KEY || "letskeepitsecret"
);
const IV = CryptoJS.enc.Utf8.parse("1234567890123456");

export const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: IV,
  }).toString();
};

export const decrypt = (encryptedData: string) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: IV,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
