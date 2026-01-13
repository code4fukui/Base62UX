import { Base62UX } from "./Base62UX.js";

const a = crypto.getRandomValues(new Uint8Array(32));

const s = Base62UX.encode(a);
const b = Base62UX.decode(s);
console.log(s, a.length, b.length, a.every((v, i) => v === b[i]));

const s2 = Base62UX.encode(a, 4);
console.log(s2);
