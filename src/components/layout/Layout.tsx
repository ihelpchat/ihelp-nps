import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '../../lib/utils';

interface LayoutProps {
  companyName?: string;
  companyLogo?: string;
  userName?: string;
  userAvatar?: string;
}

const Layout: React.FC<LayoutProps> = ({
  companyName = 'iHelp NPS',
  companyLogo,
  userName = 'Usuário',
  userAvatar
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        companyName={companyName}
        userLogo={companyLogo}
      />
      
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-0"
      )}>
        <Header
          onMenuToggle={toggleSidebar}
          userName={userName}
          userAvatar={userAvatar}
        />
        
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
