# Base62UX

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)


![Base62UX_logo.png](Base62UX_logo.png)


**Base62UX** is a UX-oriented Base62 encoding for human-readable binary identifiers. It enhances readability and copy-paste handling by using an optional, ignored visual separator.

- **Default:** `Base62UX.encode(bytes) → P5lt_GtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV`
- **Canonical:** `Base62UX.encode(bytes, 0) → P5ltGtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV`

## Features

- **Human-Friendly:** Uses an optional `_` separator for visual grouping, making long strings easier to read, select, and copy. The separator is ignored during decoding.
- **Safe for All Contexts:** The alphabet (`0-9A-Za-z`) requires no URL-encoding and won't be mangled by line wrapping or auto-linking.
- **Compact:** Achieves similar compactness to Base64 (~44 chars for 32 bytes) without using symbols like `+`, `/`, or `=`.
- **Canonical:** Guarantees that the same binary data always encodes to the same canonical string (when no separator is used).
- **Zero-Dependencies:** Pure JavaScript module for browsers, Deno, and Node.js.

## Usage & API

```js
import { Base62UX } from "https://code4fukui.github.io/Base62UX/Base62UX.js";

// 1. Create some binary data (e.g., a 32-byte key)
const bytes = crypto.getRandomValues(new Uint8Array(32));

// 2. Encode with different separator options
// Default: adds a '_' after the 4th character for readability
const encodedDefault = Base62UX.encode(bytes);
console.log(encodedDefault); // e.g., "P5lt_GtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV"

// Custom separator position
const encodedCustom = Base62UX.encode(bytes, 8);
console.log(encodedCustom); // e.g., "P5ltGtNc_x5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV"

// No separator (canonical form)
const encodedCanonical = Base62UX.encode(bytes, 0);
console.log(encodedCanonical); // e.g., "P5ltGtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV"

// 3. Decode a string (underscores are automatically ignored)
const decodedBytes = Base62UX.decode(encodedDefault);

// Verify the roundtrip
console.log(bytes.length === decodedBytes.length); // true
console.log(bytes.every((v, i) => v === decodedBytes[i])); // true

// 4. Normalize any Base62UX string to its canonical form
const normalized = Base62UX.normalize(encodedDefault);
console.log(normalized === encodedCanonical); // true
```

## Specification

#### Alphabet

A 62-character set in a natural, ASCII-like order.
```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

#### Encoding Rules

- **Input:** `Uint8Array`
- **Output:** String
- **Case-Sensitive:** `a` is different from `A`.
- **Padding:** None.
- **Leading Zeros:** Preserves leading `0x00` bytes as leading `'0'` characters in the output string.

#### The `_` Separator

- The underscore character `_` is reserved as a **visual separator** and has no mathematical value.
- It can be inserted during encoding to improve readability (see `encode(bytes, separatorIndex)`).
- It is **completely ignored** during decoding, meaning it can be present anywhere or not at all.

#### Canonical Form

- The canonical representation of an encoded string contains **no `_` separators**.
- `Base62UX.encode(bytes, 0)` always returns the canonical form.
- `Base62UX.normalize(string)` can be used to convert any variant into its canonical form by stripping all `_` characters.

## Typical Use Cases

- **Public Keys:** Compact representation for Ed25519, secp256k1, etc.
- **Database IDs:** Short, URL-safe, and copy-paste-friendly identifiers.
- **UI / CLI / Logs:** Displaying hashes and other binary data without visual clutter or ambiguity.
- **URL Paths/Queries:** Can be used directly in URLs without any escaping.

## Length Comparison (32-byte data)

| Encoding | Length | Characters | URL Safe? |
|:---|---:|:---|:---:|
| Hex | 64 | `0-9a-f` | Yes |
| Base32 | ~52 | `A-Z2-7` | Yes |
| **Base62UX** | **~44** | `0-9A-Za-z` | **Yes** |
| Base64 | 44 | `0-9A-Za-z+/` | No |
| Base64URL | 44 | `0-9A-Za-z-_` | Yes |

Base62UX provides the compactness of Base64-family encodings while using a simple, universally safe character set.

## License

MIT License — see [LICENSE](LICENSE).