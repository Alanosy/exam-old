
import CryptoJS from 'crypto-js'

/**
 * AES加密
 * @param plainText 明文
 * @param keyInBase64Str base64编码后的key
 * @returns {string} base64编码后的密文
 */
export function encryptByAES(plainText, keyInBase64Str) {
  const key = CryptoJS.enc.Base64.parse(keyInBase64Str)
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  // 这里的encrypted不是字符串，而是一个CipherParams对象
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
}

/**
 * AES解密
 * @param cipherText 密文
 * @param keyInBase64Str base64编码后的key
 * @return 明文
 */
export function decryptByAES(cipherText, keyInBase64Str) {
  const key = CryptoJS.enc.Base64.parse(keyInBase64Str)
  // 返回的是一个Word Array Object，其实就是Java里的字节数组
  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })

  return decrypted.toString(CryptoJS.enc.Utf8)
}

