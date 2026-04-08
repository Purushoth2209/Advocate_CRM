/** Local dev always shows; production shows only when VITE_SHOW_CLIENT_PREVIEW=true (e.g. Vercel env). */
export const showClientPreviewUi =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_CLIENT_PREVIEW === 'true';
