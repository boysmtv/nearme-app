import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';
