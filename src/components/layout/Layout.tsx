import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="pl-64">
        <div className="px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
