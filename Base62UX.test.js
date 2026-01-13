// Base62UX.test.js
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { Base62UX } from "./Base62UX.js";

// helper: compare Uint8Array
function assertBytesEq(a, b, msg) {
  assertEquals(a.length, b.length, msg ?? "length mismatch");
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      throw new Error(
        `${msg ?? "bytes mismatch"} at i=${i}: ${a[i]} !== ${b[i]}`,
      );
    }
  }
}

Deno.test("encode/decode: empty", () => {
  const b = new Uint8Array();
  const s = Base62UX.encode(b);
  assertEquals(s, "");
  const bb = Base62UX.decode(s);
  assertBytesEq(bb, b);
});

Deno.test("decode: underscores are ignored", () => {
  // any valid string remains valid with underscores inserted
  const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const s = Base62UX.encode(bytes);

  // insert underscores every 3 chars
  const su = s.replace(/(.{3})/g, "$1_");
  const decoded = Base62UX.decode(su);

  assertBytesEq(decoded, bytes);
});

Deno.test("encode: canonical form contains no underscores", () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const s = Base62UX.encode(bytes);
  assert(!s.includes("_"), "canonical output must not include '_'");
});

Deno.test("normalize: removes underscores", () => {
  const s = "0A_bC__dE_";
  assertEquals(Base62UX.normalize(s), "0AbCdE");
});

Deno.test("roundtrip: random 32 bytes (100 cases)", () => {
  for (let i = 0; i < 100; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const s = Base62UX.encode(bytes);

    // also test decode with random underscore insertion
    const withUnderscore = s.replace(/(.{4})/g, "$1_");

    const dec1 = Base62UX.decode(s);
    const dec2 = Base62UX.decode(withUnderscore);

    assertBytesEq(dec1, bytes, `roundtrip failed (case ${i})`);
    assertBytesEq(dec2, bytes, `roundtrip with '_' failed (case ${i})`);
  }
});

Deno.test("leading zero bytes: preserved as leading '0' chars", () => {
  // 3 leading zero bytes
  const bytes = new Uint8Array([0, 0, 0, 1, 2, 3]);
  const s = Base62UX.encode(bytes);

  assert(s.startsWith("000"), "must start with three '0' chars");
  const decoded = Base62UX.decode(s);
  assertBytesEq(decoded, bytes);
});

Deno.test("all-zero bytes: encodes to as many '0' as bytes length", () => {
  const bytes = new Uint8Array(10); // all zeros
  const s = Base62UX.encode(bytes);
  assertEquals(s, "0".repeat(10));

  const decoded = Base62UX.decode(s);
  assertBytesEq(decoded, bytes);
});

Deno.test("decode: rejects invalid characters", () => {
  assertThrows(
    () => Base62UX.decode("abc-def"), // '-' invalid in Base62UX
    Error,
  );
  assertThrows(
    () => Base62UX.decode("こんにちは"),
    Error,
  );
  assertThrows(
    () => Base62UX.decode("A+B"), // '+' invalid
    Error,
  );
});

Deno.test("type checks: encode requires Uint8Array, decode requires string", () => {
  assertThrows(() => Base62UX.encode("not-bytes"), TypeError);
  assertThrows(() => Base62UX.decode(123), TypeError);
});

Deno.test("decode: underscores may appear anywhere (including leading)", () => {
  const bytes = new Uint8Array([0, 0, 9, 9, 9]);
  const s = Base62UX.encode(bytes); // starts with "00..."
  const funky = "__0_0__" + s.slice(2).replace(/./g, (ch, idx) => idx % 2 ? "_" + ch : ch);
  const decoded = Base62UX.decode(funky);
  assertBytesEq(decoded, bytes);
});

Deno.test("idempotence: encode(decode(s)) produces canonical (no underscores)", () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const s = Base62UX.encode(bytes);
  const su = s.replace(/(.{5})/g, "$1_");

  const round = Base62UX.encode(Base62UX.decode(su));
  assertEquals(round, s);
  assert(!round.includes("_"));
});


Deno.test("encode(bin, idxseparator): inserts '_' every N chars and decodes back", () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  for (const n of [1, 2, 3, 4, 5, 8, 16]) {
    const s = Base62UX.encode(bytes, n);

    // should contain underscores when n is small enough (unless output shorter than n)
    if (s.length > n) {
      assert(s.includes("_"), `expected '_' when idxseparator=${n}`);
    }

    // underscores must not appear at the beginning or end if you implement it that way;
    // relax this if your encode allows edge underscores.
    assert(!s.startsWith("_"), "should not start with '_'");
    assert(!s.endsWith("_"), "should not end with '_'");

    const decoded = Base62UX.decode(s);
    assertBytesEq(decoded, bytes, `roundtrip failed for idxseparator=${n}`);

    // canonicalization check: removing underscores equals canonical encoding
    const canon = Base62UX.encode(bytes);
    assertEquals(Base62UX.normalize(s), canon, `normalize mismatch for idxseparator=${n}`);
  }
});

Deno.test("encode(bin, idxseparator): 0/undefined produces canonical (no '_')", () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  const s0 = Base62UX.encode(bytes, 0);
  const su = Base62UX.encode(bytes, undefined);

  const canon = Base62UX.encode(bytes);

  assertEquals(s0, canon);
  assertEquals(su, canon);
  assert(!s0.includes("_"));
  assert(!su.includes("_"));
});

Deno.test("encode(bin, idxseparator): preserves leading zero bytes and keeps grouping", () => {
  const bytes = new Uint8Array([0, 0, 0, 1, 2, 3, 4, 5]);
  const canon = Base62UX.encode(bytes);
  assert(canon.startsWith("000"), "canonical must preserve leading zeros as '0'");

  const grouped = Base62UX.encode(bytes, 4);
  assert(grouped.startsWith("000"), "grouped must preserve leading zeros as '0'");
  assertBytesEq(Base62UX.decode(grouped), bytes);

  // normalize(grouped) should equal canonical
  assertEquals(Base62UX.normalize(grouped), canon);
});

Deno.test("encode(bin, idxseparator): invalid separator values", () => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));

  // Adjust these expectations to match your implementation policy.
  // Here we assume non-positive => canonical; non-integer/NaN => throw.
  assertEquals(Base62UX.encode(bytes, -1), Base62UX.encode(bytes));
  assertEquals(Base62UX.encode(bytes, 0), Base62UX.encode(bytes));

  assertThrows(() => Base62UX.encode(bytes, NaN), TypeError);
  assertThrows(() => Base62UX.encode(bytes, 1.5), TypeError);
  assertThrows(() => Base62UX.encode(bytes, "4"), TypeError);
});
