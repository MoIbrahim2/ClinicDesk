import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define sidebar navigation rules based on role permissions
  const menuItems = [
    {
      path: '/',
      label: t('nav.dashboard'),
      icon: 'dashboard',
      allowedRoles: ['admin', 'doctor', 'receptionist'],
    },
    {
      path: '/patients',
      label: t('nav.patients'),
      icon: 'patient_list',
      allowedRoles: ['admin', 'doctor', 'receptionist'],
    },
    {
      path: '/doctors',
      label: t('nav.doctors'),
      icon: 'medical_services',
      allowedRoles: ['admin'],
    },
    {
      path: '/appointments',
      label: t('nav.appointments'),
      icon: 'calendar_month',
      allowedRoles: ['admin', 'doctor', 'receptionist', 'patient'],
    },
    {
      path: '/visits',
      label: t('nav.visits'),
      icon: 'rate_review',
      allowedRoles: ['admin', 'doctor'],
    },
    {
      path: '/prescriptions',
      label: t('nav.prescriptions'),
      icon: 'prescriptions',
      allowedRoles: ['admin', 'doctor', 'patient'],
    },
    {
      path: '/billing',
      label: t('nav.billing'),
      icon: 'receipt_long',
      allowedRoles: ['admin', 'receptionist', 'patient'],
    },
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(currentRole)
  );

  const getDisplayName = () => {
    if (!user) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && user.firstNameAr ? user.firstNameAr : user.firstName;
    const last = isAr && user.lastNameAr ? user.lastNameAr : user.lastName;
    return `${first} ${last}`;
  };

  const getRoleLabel = () => {
    if (!user) return '';
    const name = user.role?.name || user.role;
    if (currentLang === 'ar') {
      return user.role?.nameAr || (name === 'admin' ? 'مدير' : name === 'doctor' ? 'طبيب' : name === 'receptionist' ? 'موظف استقبال' : 'مريض');
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="app-shell" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: sidebarOpen ? '260px' : '0px', overflow: 'hidden' }}>
        <div className="sidebar-header" style={{ paddingInlineStart: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary)' }}>
            local_hospital
          </span>
          <h2 className="font-bold text-sm" style={{ color: 'var(--primary)', whiteSpace: 'nowrap' }}>
            ClinicDesk
          </h2>
        </div>

        <nav className="sidebar-menu">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--outline-variant)' }}>
          <div className="flex items-center gap-sm" style={{ marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {getDisplayName().charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                className="font-semibold text-xs"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--on-surface)',
                }}
              >
                {getDisplayName()}
              </p>
              <p className="text-muted" style={{ fontSize: '10px' }}>
                {getRoleLabel()}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm w-full"
            style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              logout
            </span>
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <div className="flex items-center gap-md">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline btn-sm"
              style={{ padding: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {sidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {visibleMenuItems.find((item) => item.path === location.pathname)?.label || 'ClinicDesk'}
            </h1>
          </div>

          <div className="flex items-center gap-md">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                language
              </span>
              {t('common.language')}
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
