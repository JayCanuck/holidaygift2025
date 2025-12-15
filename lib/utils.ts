export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function messageToHtml(message: string): { __html: string } {
  const escaped = escapeHtml(message);
  return { __html: escaped.replace(/\n/g, "<br />") };
}
