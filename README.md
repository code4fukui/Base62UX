# Base62UX (a UX-oriented Base62 variant)

![Base62UX_logo.png](Base62UX_logo.png)

- Base62UX.encode(b32) → P5lt_GtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV

- **Base62UX** is a human-centered Base62 encoding designed to optimize copy, paste, and visual handling of binary identifiers.

- **Base62UX** は、バイナリデータ（公開鍵・ID など）を Base64と同程度の短さで、記号を含まず、コピーしやすい形で表現するための Base62 の一種です。

## Usage

```js
import { Base62UX } from "https://code4fukui.github.io/Base62UX/Base62UX.js";

const a = crypto.getRandomValues(new Uint8Array(32));

const s = Base62UX.encode(a);
const b = Base62UX.decode(s);
console.log(s, a.length, b.length, a.every((v, i) => v === b[i]));

const s2 = Base62UX.encode(a, 4);
console.log(s2);
```

## Motivation

既存のエンコード方式には、以下の課題があります。

- **Base64URL**
  - `-` や `_` により、ダブルクリック選択が分断されやすい
- **RFC4648 Base32**
  - 安定しているが文字数がやや長い
- **Base16**
  - 明確だが文字数が長い

Base62UX は、

- 適度に短い
- 記号を含まない
- コンパクトでコピーしやすい

という要件を満たすために設計されています。

## Specification

### Name

※ `V` は **Variant** を意味します。  
単なる「Base62」ではなく、特定仕様であることを明示します。

### Alphabet

```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

- 文字数: 62
- ASCII 順に近い自然な並び
- 記号（`- _ + /` など）を含まない

### Encoding Rules

- 入力: 任意のバイト列
- 出力: 上記 Alphabet と '_' のみからなる文字列
- Padding: **なし**
- Case-sensitive: **true**
- Leading zero bytes:
  - 先頭の `0x00` バイトは `0` 文字として保持される
- 可読性のための記号 '-' は無視される

### Canonical Form

- 出力は常に canonical（正規形）
- 同一バイト列は常に同一文字列表現になる
- 入力文字列は alphabet に完全一致する必要がある
- 可読性向上のため '_' を含めても良い

## Design Scope

Base62UX は以下を **目的としません**。

- 口頭での読み上げ
- 曖昧文字（O/0, I/l/1 など）の吸収
- チェックサムによる誤り訂正

これらが必要な用途では、**Base32（Crockford 系など）**の併用を推奨します。

## Typical Use Cases

- 公開鍵（例: Ed25519, 32 bytes）の文字列表現
- コンパクトな識別子（ID）
- UI / CLI / ログ / コピー＆ペースト用途
- URL パス・クエリ（エスケープ不要）

## Length Example

| Data Size | Encoding | Length |
|----------:|----------|-------:|
| 32 bytes  | Hex      | 64     |
| 32 bytes  | Base32   | ~52    |
| 32 bytes  | Base62UX  | ~44    |
| 32 bytes  | Base64   | 44     |

※ Base62UX は Base64 と同程度の短さで、記号を含まない点が特徴です。

## Relationship to Other Encodings

| 方式 | 標準 | 人間の読みやすさ | コピペのしやすさ (UX) |
|---|---|---|---|
| HEX (Base16) | ◎ RFC/慣習で事実上標準（表現が一意） | ○ 文字種が少なく見慣れているが長い（32B→64桁） | ◎ 記号なし・分断されにくい |
| Base32 (RFC4648) | ◎ RFC 4648 | △ 長め（32B→約52文字）・見慣れない人もいる | ◎ 記号なし・分断されにくい（`=` padding運用次第） |
| Base64 | ◎ RFC 4648 | △ `+` `/` `=` が混ざり視認性は低め | ○ 多くの環境で一括選択しやすいが、文脈によってエスケープが必要（URL/パス等） |
| Base62UX | △ 公式RFCなし（仕様を自前固定化） | ○ 記号なしで短い（32B→約44文字）。ただし大小文字あり | ◎ 記号なしで分断されにくい。`_`許容なら可読性も調整可 |

## Test

```sh
deno test
```

## License

- This specification is released into the public domain or under CC0, at your option.
- 本仕様は、パブリックドメイン、または、利用者の選択により CC0（Creative Commons Zero）ライセンスの下で公開されます。
