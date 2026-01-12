import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Building, 
  Megaphone, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Empresas', href: '/empresas', icon: Building },
  { name: 'Campanhas', href: '/campanhas', icon: Megaphone },
];

const Sidebar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-white"
            >
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">iHelp NPS</h1>
            <p className="text-xs text-gray-500">Gestão de feedback</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 transition-colors ${
                      active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {item.name}
                </div>
                {active && <ChevronRight className="h-4 w-4 text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-150 group"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            Sair do sistema
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
