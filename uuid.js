// ============================================================
// uuid.js
// UUID v4 generator using crypto.getRandomValues() when available,
// fallback to Math.random() for older browsers.
// ============================================================

const UUID = (() => {

  // Detect crypto API availability
  const hasCrypto = typeof crypto !== 'undefined' && crypto.getRandomValues;

  /**
   * Generate a UUID v4 string
   * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   * where x is any hex digit and y is one of 8, 9, A, or B.
   * @returns {string} UUID v4 string
   */
  function generate() {
    if (hasCrypto) {
      return _generateCrypto();
    } else {
      return _generateFallback();
    }
  }

  /**
   * Generate UUID using crypto.getRandomValues() (preferred)
   * @private
   */
  function _generateCrypto() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);

    // Set version (4) and variant bits
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;

    return _formatUUID(arr);
  }

  /**
   * Generate UUID using Math.random() (fallback)
   * @private
   */
  function _generateFallback() {
    const chars = '0123456789abcdef';
    let uuid = '';

    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        // Version 4
        uuid += '4';
      } else if (i === 19) {
        // Variant
        uuid += chars[(Math.random() * 4) | 8];
      } else {
        uuid += chars[(Math.random() * 16) | 0];
      }
    }

    return uuid;
  }

  /**
   * Format Uint8Array as UUID string
   * @private
   */
  function _formatUUID(arr) {
    const hex = [];
    for (let i = 0; i < 16; i++) {
      hex.push(String.fromCharCode(arr[i]));
    }

    return (
      _byteToHex(hex[0]) +
      _byteToHex(hex[1]) +
      _byteToHex(hex[2]) +
      _byteToHex(hex[3]) +
      '-' +
      _byteToHex(hex[4]) +
      _byteToHex(hex[5]) +
      '-' +
      _byteToHex(hex[6]) +
      _byteToHex(hex[7]) +
      '-' +
      _byteToHex(hex[8]) +
      _byteToHex(hex[9]) +
      '-' +
      _byteToHex(hex[10]) +
      _byteToHex(hex[11]) +
      _byteToHex(hex[12]) +
      _byteToHex(hex[13]) +
      _byteToHex(hex[14]) +
      _byteToHex(hex[15])
    );
  }

  /**
   * Convert single byte to hex string
   * @private
   */
  function _byteToHex(byte) {
    const code = byte.charCodeAt(0);
    return ('0' + code.toString(16)).slice(-2);
  }

  /**
   * Validate a UUID string
   * @param {string} uuid - UUID to validate
   * @returns {boolean} True if valid UUID v4 format
   */
  function validate(uuid) {
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return pattern.test(uuid);
  }

  /**
   * Generate multiple UUIDs
   * @param {number} count - Number of UUIDs to generate
   * @returns {string[]} Array of UUID strings
   */
  function generateMany(count) {
    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(generate());
    }
    return uuids;
  }

  return { generate, validate, generateMany };

})();

export default UUID;
