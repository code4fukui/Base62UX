// Base62UX.js
// Base62UX: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
// - No padding
// - Case-sensitive
// - Preserves leading 0x00 bytes as leading '0' characters
// - Uses BigInt for correctness on arbitrary length inputs

export class Base62UX {
  static ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  static BASE = 62n;

  static _alphaIndex = (() => {
    const m = new Map();
    for (let i = 0; i < Base62UX.ALPHABET.length; i++) {
      m.set(Base62UX.ALPHABET[i], i);
    }
    return m;
  })();

  /**
   * Encode bytes into Base62UX string.
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  static encode(bytes, separator = 4) {
    if (isNaN(separator) || typeof separator != "number" || Math.floor(separator) != separator) {
      throw new TypeError("Base62UX.encode: invalid separator");
    }
    if (!(bytes instanceof Uint8Array)) {
      throw new TypeError("Base62UX.encode: bytes must be Uint8Array");
    }
    if (bytes.length === 0) return "";

    // Count leading zeros
    let z = 0;
    while (z < bytes.length && bytes[z] === 0) z++;

    // Convert bytes (big-endian) to BigInt
    let x = 0n;
    for (let i = z; i < bytes.length; i++) {
      x = (x << 8n) + BigInt(bytes[i]);
    }

    // Convert BigInt to base62
    let out = "";
    while (x > 0n) {
      const r = x % Base62UX.BASE;
      out = Base62UX.ALPHABET[Number(r)] + out;
      x /= Base62UX.BASE;
    }

    // Preserve leading zeros as '0'
    if (z > 0) out = "0".repeat(z) + out;

    // If all bytes were zero, out would be "" but we need z zeros.
    // The repeat above handles that.

    if (separator > 0) {
      out = out.substring(0, separator) + "_" + out.substring(separator);
    }
    return out;
  }

  /**
   * Decode Base62UX string into bytes.
   * @param {string} s
   * @returns {Uint8Array}
   */
  static decode(s) {
    if (typeof s !== "string") {
      throw new TypeError("Base62UX.decode: input must be a string");
    }
    if (s.length === 0) return new Uint8Array();
    s = Base62UX.normalize(s);

    // Count leading '0' (these represent leading 0x00 bytes)
    let z = 0;
    while (z < s.length && s[z] === "0") z++;

    // Parse base62 into BigInt
    let x = 0n;
    for (let i = z; i < s.length; i++) {
      const ch = s[i];
      const v = Base62UX._alphaIndex.get(ch);
      if (v === undefined) {
        throw new Error(`Base62UX.decode: invalid character '${ch}' at index ${i}`);
      }
      x = x * Base62UX.BASE + BigInt(v);
    }

    // Convert BigInt to bytes (big-endian)
    let bytes = [];
    while (x > 0n) {
      bytes.push(Number(x & 0xffn));
      x >>= 8n;
    }
    bytes.reverse();

    // Prepend leading zeros
    if (z > 0) {
      const prefix = new Uint8Array(z);
      const body = Uint8Array.from(bytes);
      const out = new Uint8Array(prefix.length + body.length);
      out.set(prefix, 0);
      out.set(body, prefix.length);
      return out;
    }

    return Uint8Array.from(bytes);
  }
  /**
   * Normalize a Base62UX string into canonical form (remove "_").
   * @param {string} s
   * @returns {string}
   */
  static normalize(s) {
    if (typeof s !== "string") {
      throw new TypeError("Base62UX.normalize: input must be a string");
    }
    return s.replace(/_/g, "");
  }
}

// --- quick self-test (optional) ---
// const a = crypto.getRandomValues(new Uint8Array(32));
// const s = Base62UX.encode(a);
// const b = Base62UX.decode(s);
// console.log(s, a.length, b.length, a.every((v,i)=>v===b[i]));
