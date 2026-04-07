import { ReactNode } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface AuthButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

export function AuthButton({ children, type = 'button', onClick, loading, variant = 'primary', icon: Icon }: AuthButtonProps) {
  const baseCls = `
    w-full h-10 flex items-center justify-center gap-2
    rounded-lg text-[13px] font-medium
    transition-colors duration-150 shadow-sm
    disabled:opacity-60
  `;

  const variants = {
    primary: `
      bg-[#4F9CF9] hover:bg-[#3D8EE8]
      text-white
    `,
    secondary: `
      bg-[#F7F7F5] dark:bg-[#1A1A18]
      border border-[#E8E8E4] dark:border-[#2A2A26]
      text-[#5C5C56] dark:text-[#8B8B85]
      hover:border-[#D0D0CC] dark:hover:border-[#3A3A36]
      hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${baseCls} ${variants[variant]}`}
    >
      {loading
        ? <Loader2 size={13} strokeWidth={2} className="animate-spin" />
        : (
          <>
            {Icon && <Icon size={14} strokeWidth={1.8} />}
            {children}
          </>
        )
      }
    </button>
  );
}