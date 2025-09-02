import crypto from "crypto";

export const generateApiKey = () => {
  return "sk_" + crypto.randomBytes(24).toString("hex"); // e.g. sk_abcd1234...
};
