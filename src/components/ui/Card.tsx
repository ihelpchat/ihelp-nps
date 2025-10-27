import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', shadow = 'md', children, ...props }, ref) => {
    const baseClasses = 'bg-white rounded-lg border border-gray-200';
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg'
    };

    const classes = twMerge(
      baseClasses,
      paddings[padding],
      shadows[shadow],
      className
    );

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    const classes = twMerge('flex flex-col space-y-1.5 pb-6', className);
    return <div className={classes} ref={ref} {...props} />;
  }
);

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const classes = twMerge('text-2xl font-semibold leading-none tracking-tight', className);
    return <h3 className={classes} ref={ref} {...props} />;
  }
);

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const classes = twMerge('text-sm text-gray-600', className);
    return <p className={classes} ref={ref} {...props} />;
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    const classes = twMerge('pt-0', className);
    return <div className={classes} ref={ref} {...props} />;
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    const classes = twMerge('flex items-center pt-6', className);
    return <div className={classes} ref={ref} {...props} />;
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
