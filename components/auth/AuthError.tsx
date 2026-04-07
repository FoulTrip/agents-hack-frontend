interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  return (
    <div className="
      flex items-center gap-2 px-3 py-2 rounded-lg
      bg-rose-50 dark:bg-rose-500/10
      border border-rose-200 dark:border-rose-500/20
      text-rose-600 dark:text-rose-400
      text-[11px] font-medium
    ">
      {message}
    </div>
  );
}