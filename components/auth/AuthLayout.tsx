import { ReactNode } from 'react';
import { Workflow } from 'lucide-react';
import Image from 'next/image';
import { useDarkMode } from '@/context/DarkModeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { darkmode } = useDarkMode();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F7F5] dark:bg-[#0E0E0C]">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="
            w-10 h-10 rounded-xl flex items-center justify-center
          ">
            {darkmode ? (
              <Image src={"https://res.cloudinary.com/dqluumk10/image/upload/v1775217056/TripCode/Logos/image_f8hm5f.png"} alt="logo" width={500} height={500} />
            ) : (
              <Image src={"https://res.cloudinary.com/dqluumk10/image/upload/v1768316985/TripCode/Logos/luc79qy6rewoqovhxwrz.png"} alt="logo" width={500} height={500} />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
              {title}
            </h1>
            <p className="text-[12px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}