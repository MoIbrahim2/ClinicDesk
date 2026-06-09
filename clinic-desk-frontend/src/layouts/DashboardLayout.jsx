import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import client from '../api/client';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await client.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const handleNotificationClick = async (notification) => {
    setDropdownOpen(false);
    if (!notification.isRead) {
      try {
        await client.patch(`/notifications/${notification.id}/read`);
        fetchNotifications();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await client.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      await client.post('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await client.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t('notifications.just_now');
    if (diffMin < 60) return t('notifications.minutes_ago', { count: diffMin });
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return t('notifications.hours_ago', { count: diffHrs });
    const diffDays = Math.floor(diffHrs / 24);
    return t('notifications.days_ago', { count: diffDays });
  };

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
    {
      path: '/reports',
      label: t('nav.reports'),
      icon: 'bar_chart',
      allowedRoles: ['admin', 'doctor'],
    },
    {
      path: '/admin-settings',
      label: t('nav.admin_settings'),
      icon: 'settings',
      allowedRoles: ['admin'],
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
            {/* Notifications Bell */}
            {user && (
              <div className="notifications-container" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="btn btn-outline btn-sm relative"
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: dropdownOpen ? 'var(--surface-container-high)' : 'transparent',
                    borderColor: dropdownOpen ? 'var(--outline)' : 'var(--outline-variant)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--on-surface-variant)' }}>
                    {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="notifications-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="notifications-dropdown" style={{ right: currentLang === 'ar' ? 'auto' : '0', left: currentLang === 'ar' ? '0' : 'auto' }}>
                    <div className="notifications-dropdown-header">
                      <span className="font-semibold text-sm" style={{ color: 'var(--on-surface)' }}>{t('notifications.title')}</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="btn btn-link text-xs" style={{ padding: 0, border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600 }}>
                          {t('notifications.mark_all_read')}
                        </button>
                      )}
                    </div>
                    <div className="notifications-dropdown-body">
                      {notifications.length === 0 ? (
                        <div className="notifications-empty">
                          <span className="material-symbols-outlined text-muted" style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--outline-variant)' }}>
                            notifications_off
                          </span>
                          <p className="text-muted text-xs" style={{ margin: 0 }}>{t('notifications.empty')}</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                          >
                            <div className="notification-content">
                              <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                                <span className={`notification-tag ${n.type}`} style={{ fontSize: '10px', fontWeight: '600' }}>
                                  {t(`notifications.${n.type}`, { defaultValue: n.type })}
                                </span>
                                <span className="notification-time text-muted" style={{ fontSize: '10px' }}>
                                  {formatTimeAgo(n.createdAt)}
                                </span>
                              </div>
                              <p className="notification-title font-semibold text-xs" style={{ margin: '0 0 2px 0', color: 'var(--on-surface)' }}>
                                {currentLang === 'ar' && n.titleAr ? n.titleAr : n.title}
                              </p>
                              <p className="notification-msg text-muted text-xs" style={{ margin: 0, lineHeight: 1.3 }}>
                                {currentLang === 'ar' && n.messageAr ? n.messageAr : n.message}
                              </p>
                            </div>
                            <div className="notification-actions flex items-center gap-xs">
                              {!n.isRead && (
                                <button
                                  onClick={(e) => markAsRead(e, n.id)}
                                  className="btn-icon-sm"
                                  title={t('notifications.mark_read')}
                                  style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>done</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => deleteNotification(e, n.id)}
                                className="btn-icon-sm"
                                title={t('common.delete')}
                                style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--error)' }}>delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
