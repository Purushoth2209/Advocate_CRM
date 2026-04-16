export function downloadDocumentPlaceholder(doc) {
  const blob = new Blob(
    [`LexDesk demo export\n${doc.name}\n${doc.description || ''}`],
    { type: 'text/plain;charset=utf-8' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.name.replace(/[^a-z0-9._-]+/gi, '_') || 'document.txt';
  a.click();
  URL.revokeObjectURL(url);
}
