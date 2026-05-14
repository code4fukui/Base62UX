# Base62UX

> 英語版のREADMEはこちらです: [README.md](README.md)


![Base62UX_logo.png](Base62UX_logo.png)


**Base62UX** は、人間が読みやすいバイナリ識別子のための、UX指向のBase62エンコーディングです。無視可能な視覚的セパレータをオプションで使用することで、可読性とコピー＆ペーストの操作性を向上させます。

- **デフォルト:** `Base62UX.encode(bytes) → P5lt_GtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV`
- **正規形式:** `Base62UX.encode(bytes, 0) → P5ltGtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV`

## 機能

- **人間にとって使いやすい（Human-Friendly）:** 視覚的なグループ化のためにオプションの `_` セパレータを使用し、長い文字列を読みやすく、選択・コピーしやすくします。セパレータはデコード時に無視されます。
- **あらゆるコンテキストで安全:** アルファベット（`0-9A-Za-z`）はURLエンコードが不要であり、行の折り返しや自動リンクによって破損することはありません。
- **コンパクト:** `+`、`/`、`=` などの記号を使用せずに、Base64と同等のコンパクトさ（32バイトで約44文字）を実現します。
- **正規形式（Canonical）:** （セパレータを使用しない場合）同じバイナリデータが常に同じ正規文字列にエンコードされることを保証します。
- **依存関係ゼロ:** ブラウザ、Deno、Node.js向けのPure JavaScriptモジュールです。

## 使い方とAPI

```js
import { Base62UX } from "https://code4fukui.github.io/Base62UX/Base62UX.js";

// 1. バイナリデータを作成（例: 32バイトのキー）
const bytes = crypto.getRandomValues(new Uint8Array(32));

// 2. 異なるセパレータオプションでエンコード
// デフォルト: 読みやすさのために4文字目の後に '_' を追加
const encodedDefault = Base62UX.encode(bytes);
console.log(encodedDefault); // 例: "P5lt_GtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV"

// カスタムのセパレータ位置
const encodedCustom = Base62UX.encode(bytes, 8);
console.log(encodedCustom); // 例: "P5ltGtNc_x5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV"

// セパレータなし（正規形式）
const encodedCanonical = Base62UX.encode(bytes, 0);
console.log(encodedCanonical); // 例: "P5ltGtNcx5qxe5K8OXD8leF276Ixs9UtX3t78NORUrV"

// 3. 文字列をデコード（アンダースコアは自動的に無視されます）
const decodedBytes = Base62UX.decode(encodedDefault);

// 往復変換（ラウンドトリップ）の検証
console.log(bytes.length === decodedBytes.length); // true
console.log(bytes.every((v, i) => v === decodedBytes[i])); // true

// 4. 任意のBase62UX文字列を正規形式に正規化
const normalized = Base62UX.normalize(encodedDefault);
console.log(normalized === encodedCanonical); // true
```

## 仕様

#### アルファベット

自然なASCII順の62文字セット。
```
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

#### エンコードルール

- **入力:** `Uint8Array`
- **出力:** 文字列
- **大文字・小文字の区別:** `a` と `A` は区別されます。
- **パディング:** なし。
- **先行ゼロ:** 先頭の `0x00` バイトは、出力文字列の先頭の `'0'` 文字として保持されます。

#### `_` セパレータ

- アンダースコア文字 `_` は**視覚的なセパレータ**として予約されており、数学的な意味は持ちません。
- 可読性を向上させるために、エンコード時に挿入することができます（`encode(bytes, separatorIndex)` を参照）。
- デコード時には**完全に無視される**ため、どこに存在していても、あるいは全く存在していなくても構いません。

#### 正規形式

- エンコードされた文字列の正規表現（Canonical Form）には、**`_` セパレータは含まれません**。
- `Base62UX.encode(bytes, 0)` は常に正規形式を返します。
- `Base62UX.normalize(string)` を使用すると、すべての `_` 文字を取り除くことで、任意のバリエーションを正規形式に変換できます。

## 主なユースケース

- **公開鍵:** Ed25519やsecp256k1などのコンパクトな表現。
- **データベースID:** 短く、URLセーフで、コピー＆ペーストしやすい識別子。
- **UI / CLI / ログ:** ハッシュやその他のバイナリデータを、視覚的な煩雑さや曖昧さなしに表示。
- **URLパス / クエリ:** エスケープ処理なしでURLに直接使用可能。

## 長さの比較（32バイトのデータ）

| エンコーディング | 長さ | 文字 | URLセーフ |
|:---|---:|:---|:---:|
| Hex | 64 | `0-9a-f` | はい |
| Base32 | ~52 | `A-Z2-7` | はい |
| **Base62UX** | **~44** | `0-9A-Za-z` | **はい** |
| Base64 | 44 | `0-9A-Za-z+/` | いいえ |
| Base64URL | 44 | `0-9A-Za-z-_` | はい |

Base62UXは、シンプルで普遍的に安全な文字セットを使用しながら、Base64系エンコーディングと同等のコンパクトさを提供します。

## ライセンス

MIT License — [LICENSE](LICENSE) を参照。
