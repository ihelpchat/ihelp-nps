import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface PageHeaderBreadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: PageHeaderBreadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <header className={cn('mb-8 space-y-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && <span className="text-gray-400">/</span>}
              {item.href ? (
                <Link to={item.href} className="hover:text-gray-900 transition-colors flex items-center gap-1">
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium flex items-center gap-1">
                  {item.icon}
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
