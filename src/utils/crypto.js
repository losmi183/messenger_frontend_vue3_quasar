import CryptoJS from "crypto-js";

/**
 * Enkriptuje tekst pomoću passphrase i salt-a.
 * @param {string} plainText - Tekst koji se enkriptuje.
 * @param {string} passphrase - Lozinka/ključ.
 * @param {string} salt - Dodatna vrednost radi jače zaštite.
 * @returns {string} - Enkriptovani tekst (Base64 string).
 */
export function encrypt(plainText, passphrase, salt) {
  if (!plainText || !passphrase) return "";

  const key = passphrase + (salt || "");
  const encrypted = CryptoJS.AES.encrypt(plainText, key);
  return encrypted.toString(); // Base64 string
}

/**
 * Dekriptuje tekst pomoću istog passphrase i salt-a.
 * @param {string} encryptedText - Enkriptovani tekst (Base64).
 * @param {string} passphrase - Lozinka/ključ.
 * @param {string} salt - Isti salt koji je korišćen pri enkripciji.
 * @returns {string} - Originalni dekriptovani tekst.
 */
export function decrypt(encryptedText, passphrase, salt) {
  if (!encryptedText || !passphrase) return "";

  const key = passphrase + (salt || "");

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || "[Nevažeća šifra]";
  } catch (error) {
    return "[Greška pri dekripciji]";
  }
}
