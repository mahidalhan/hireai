'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'retro';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Default modern style
          variant === 'default' && 
            'border border-gray-300 bg-white text-gray-900 focus-visible:ring-blue-600',
          // Retro Windows style
          variant === 'retro' && 
            'bg-white border-2 border-t-gray-800 border-l-gray-800 border-r-white border-b-white text-black',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
