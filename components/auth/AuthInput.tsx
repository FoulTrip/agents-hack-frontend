import { LucideIcon } from 'lucide-react';

interface AuthInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  required?: boolean;
}

const inputCls = `
  w-full h-10 rounded-lg text-[13px] font-medium
  bg-[#F7F7F5] dark:bg-[#1A1A18]
  border border-[#E8E8E4] dark:border-[#2A2A26]
  text-[#1A1A18] dark:text-[#F0EFE9]
  placeholder:text-[#B0B0A8] dark:placeholder:text-[#4A4A44]
  focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
  transition-all duration-150
  pl-9 pr-4
`;

export function AuthInput({ label, type, placeholder, value, onChange, icon: Icon, required }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={13} strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={inputCls}
        />
      </div>
    </div>
  );
}