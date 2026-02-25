import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle]     = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '32px',
          background: 'var(--bg-primary)',
        }}>
          <Outlet context={{ setPageTitle }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;