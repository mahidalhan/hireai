'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'retro' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Retro Windows style
          variant === 'retro' && 
            'bg-gray-200 border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 text-black',
          // Default style
          variant === 'default' && 
            'bg-blue-600 text-white hover:bg-blue-700',
          // Outline style
          variant === 'outline' && 
            'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900',
          // Ghost style
          variant === 'ghost' && 
            'bg-transparent hover:bg-gray-100 text-gray-900',
          // Sizes
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'lg' && 'h-12 px-6 text-lg',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
