import crypto from "crypto";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const toBase62 = (num: number): string => {
  let str = "";
  while (num > 0) {
    str = BASE62[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str || "0";
};

export const urlShortner = (originalUrl: string): string => {
  const hash = crypto.createHash("sha256").update(originalUrl).digest("hex");
  const numericHash = parseInt(hash.substring(0, 10), 16);
  return toBase62(numericHash);
};
