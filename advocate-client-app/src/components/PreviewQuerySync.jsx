import { applyClientPreviewQueryParam } from '../config/clientPreview';

/** Reads ?client_preview= on every route (runs before page content in the same render pass). */
export default function PreviewQuerySync() {
  applyClientPreviewQueryParam();
  return null;
}
