import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || "some secret key";

export const encrypt = (data: string) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY, {
    mode: CryptoJS.mode.ECB,
  }).toString();
};

export const decrypt = (data: string) => {
  return CryptoJS.AES.decrypt(data, SECRET_KEY).toString(CryptoJS.enc.Utf8);
};
