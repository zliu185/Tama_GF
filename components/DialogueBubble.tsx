interface DialogueBubbleProps {
  text: string;
}

export function DialogueBubble({ text }: DialogueBubbleProps) {
  return (
    <div className="rounded-2xl border border-rosemilk bg-white/90 px-4 py-3 text-sm leading-6 shadow-soft">
      {text}
    </div>
  );
}
