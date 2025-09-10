
// plugins/bootstrap.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // @ts-ignore
    import('bootstrap/dist/js/bootstrap.bundle.min.js')
  }
})
