const KW = "import|from|export|const|let|default|async|function|return|await|create|table|primary|key|text|uuid|def|class|with|as|for|in|if|else|None|True|False|new|type";
const KW_RE = new RegExp(`^(${KW})$`);
const SPLIT = new RegExp(`(\\/\\/.*$|#.*$|"[^"]*"|'[^']*'|\`[^\`]*\`|\\b(?:${KW})\\b|\\b\\d+(?:\\.\\d+)?\\b)`, "g");

export function highlight(line: string) {
  return line.split(SPLIT).map((p, i) => {
    if (!p) return null;
    if (/^(\/\/|#)/.test(p)) return <span key={i} className="text-text-3">{p}</span>;
    if (/^["'`]/.test(p)) return <span key={i} className="text-accent/90">{p}</span>;
    if (KW_RE.test(p)) return <span key={i} className="text-code">{p}</span>;
    if (/^\d/.test(p)) return <span key={i} className="text-[#f0a3ff]">{p}</span>;
    return <span key={i}>{p}</span>;
  });
}
