import { createGLMessageClient } from "./GLMessageClient";

const client = createGLMessageClient((msg) => {
  return new Promise((resolve, reject) => {
    window.addEventListener("message", (e) => {
      if (e.data?.id === msg.id) {
        resolve(e.data);
      }
    });
    window.parent.postMessage(msg, "*");
  });
});

for (const [k, v] of Object.entries(client)) {
  // @ts-expect-error
  window[k] = v;
}
