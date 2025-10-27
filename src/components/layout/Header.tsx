import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '../ui';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
  userName?: string;
  userAvatar?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  title = 'Dashboard',
  subtitle,
  userName = 'Usuário',
  userAvatar,
  showNotifications = true,
  showSearch = true
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side - Menu toggle and Title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          )}

          <div className="flex items-center space-x-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
