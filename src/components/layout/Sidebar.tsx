import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Building, 
  Code, 
  Users,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    title: 'Feedbacks',
    href: '/feedbacks',
    icon: <MessageSquare className="w-5 h-5" />
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <Users className="w-5 h-5" />
  },
  {
    title: 'Empresas',
    href: '/empresas',
    icon: <Building className="w-5 h-5" />
  },
  {
    title: 'Widget',
    href: '/widget',
    icon: <Code className="w-5 h-5" />
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  companyName?: string;
  userLogo?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  companyName = 'iHelp NPS',
  userLogo 
}) => {

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50",
        isOpen ? "w-64" : "w-0 lg:w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {userLogo ? (
                <img src={userLogo} alt="Logo" className="w-8 h-8 rounded" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">iH</span>
                </div>
              )}
              <span className="font-semibold text-gray-900">{companyName}</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
