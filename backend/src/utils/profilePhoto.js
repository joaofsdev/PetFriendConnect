const MAX_PROFILE_PHOTO_BYTES = 512 * 1024;
const MAX_PROFILE_PHOTO_LENGTH = 700000;
const MAX_PROFILE_PHOTO_URL_LENGTH = 2048;
const DATA_IMAGE_REGEX =
  /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/]+={0,2})$/i;

const getBase64ByteSize = (base64) => {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
};

const isHttpUrl = (value) => {
  if (value.length > MAX_PROFILE_PHOTO_URL_LENGTH) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidProfilePhoto = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > MAX_PROFILE_PHOTO_LENGTH) return false;

  const dataImageMatch = trimmed.match(DATA_IMAGE_REGEX);
  if (dataImageMatch) {
    return getBase64ByteSize(dataImageMatch[2]) <= MAX_PROFILE_PHOTO_BYTES;
  }

  return isHttpUrl(trimmed);
};

const normalizeProfilePhoto = (value) => {
  if (value === null || value === undefined) return null;
  return value.trim() || null;
};

module.exports = {
  MAX_PROFILE_PHOTO_BYTES,
  isValidProfilePhoto,
  normalizeProfilePhoto,
};
