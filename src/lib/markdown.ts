export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Escape HTML tags to prevent XSS in user submissions
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** or __text__)
  html = html.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

  // Italic (*text* or _text_)
  html = html.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, "<code class='code-inline'>$1</code>");

  // Headings
  html = html.replace(/^### (.*?)$/gm, "<h3 class='post-h3'>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2 class='post-h2'>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1 class='post-h1'>$1</h1>");

  // Blockquotes (> text)
  html = html.replace(/^&gt; (.*?)$/gm, "<blockquote class='post-blockquote'>$1</blockquote>");

  // Bullet Lists (- item or * item)
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, "<li class='post-li'>$1</li>");
  // Wrap consecutive list items in <ul>
  html = html.replace(/(<li class='post-li'>[\s\S]*?<\/li>)+/g, (match) => {
    return `<ul class='post-ul'>${match}</ul>`;
  });

  // Ordered Lists (1. item)
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, "<li class='post-ol-li'>$1</li>");
  // Wrap consecutive ordered list items in <ol>
  html = html.replace(/(<li class='post-ol-li'>[\s\S]*?<\/li>)+/g, (match) => {
    return `<ol class='post-ol'>${match}</ol>`;
  });

  // Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='post-link'>$1</a>");

  // Paragraphs - split by double newlines and wrap in <p>, avoiding wrapping headers/quotes/lists
  const lines = html.split(/\n\n+/);
  html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol")
      ) {
        return trimmed;
      }
      return `<p class='post-p'>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .filter(Boolean)
    .join("");

  return html;
}
