interface AuthDividerProps {
  text: string;
}

export function AuthDivider({ text }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#E8E8E4] dark:bg-[#252522]" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
        {text}
      </span>
      <div className="h-px flex-1 bg-[#E8E8E4] dark:bg-[#252522]" />
    </div>
  );
}