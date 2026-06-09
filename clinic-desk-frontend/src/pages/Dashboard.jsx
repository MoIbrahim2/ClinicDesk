import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

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

  // Mock metrics matching the role view
  const getMetrics = () => {
    const role = user?.role?.name || user?.role || '';
    if (role === 'patient') {
      return [
        { label: currentLang === 'ar' ? 'مواعيدي القادمة' : 'My Upcoming Appointments', value: '2', icon: 'calendar_month', color: 'var(--primary)' },
        { label: currentLang === 'ar' ? 'وصفاتي الطبية النشطة' : 'Active Prescriptions', value: '4', icon: 'prescriptions', color: 'var(--secondary)' },
        { label: currentLang === 'ar' ? 'الفواتير المستحقة' : 'Unpaid Invoices', value: '1', icon: 'receipt_long', color: 'var(--error)' },
      ];
    }
    return [
      { label: currentLang === 'ar' ? 'إجمالي المرضى' : 'Total Patients', value: '1,248', icon: 'patient_list', color: 'var(--primary)' },
      { label: currentLang === 'ar' ? 'مواعيد اليوم' : "Today's Appointments", value: '18', icon: 'calendar_month', color: 'var(--primary-container)' },
      { label: currentLang === 'ar' ? 'فحوصات معلقة' : 'Pending Examinations', value: '5', icon: 'rate_review', color: 'var(--warning)' },
      { label: currentLang === 'ar' ? 'إيرادات الشهر' : 'Monthly Revenue', value: '$12,450', icon: 'payments', color: 'var(--success)' },
    ];
  };

  const metrics = getMetrics();

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Welcome Section */}
      <div className="card" style={{ padding: '24px', backgroundColor: 'var(--primary-container)', border: 'none', color: 'var(--on-primary-container)' }}>
        <div className="flex items-center gap-md flex-wrap">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#ffffff' }}>
              waving_hand
            </span>
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              {currentLang === 'ar' ? `مرحباً، د. ${getDisplayName()}` : `Welcome back, ${getDisplayName()}!`}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>
              {currentLang === 'ar'
                ? `أنت مسجل كـ ${getRoleLabel()}. إليك ملخص لأعمالك اليوم.`
                : `Logged in as ${getRoleLabel()}. Here is your clinical dashboard summary.`}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`, gap: '24px' }}>
        {metrics.map((metric, idx) => (
          <div key={idx} className="card flex items-center justify-between" style={{ padding: '20px' }}>
            <div>
              <p className="text-muted" style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                {metric.label}
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                {metric.value}
              </h3>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-container-low)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: metric.color }}>
                {metric.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Portal */}
      <div className="grid grid-cols-2 gap-lg">
        {/* Recent Schedule */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
              {currentLang === 'ar' ? 'المواعيد القادمة' : 'Upcoming Schedule'}
            </h3>
            <span className="badge badge-info">{currentLang === 'ar' ? 'اليوم' : 'Today'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex items-center justify-between p-sm" style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>schedule</span>
                <div>
                  <p className="font-semibold text-xs">09:30 AM</p>
                  <p className="text-muted" style={{ fontSize: '11px' }}>{currentLang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}</p>
                </div>
              </div>
              <span className="badge badge-success">{currentLang === 'ar' ? 'مؤكد' : 'Confirmed'}</span>
            </div>
            <div className="flex items-center justify-between p-sm" style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>schedule</span>
                <div>
                  <p className="font-semibold text-xs">10:15 AM</p>
                  <p className="text-muted" style={{ fontSize: '11px' }}>{currentLang === 'ar' ? 'سارة علي' : 'Sarah Ali'}</p>
                </div>
              </div>
              <span className="badge badge-warning">{currentLang === 'ar' ? 'انتظار' : 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* Clinical Operations */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            {currentLang === 'ar' ? 'روابط سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-2 gap-md">
            <button className="btn btn-secondary w-full" style={{ padding: '12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>person_add</span>
              <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'إضافة مريض' : 'New Patient'}</span>
            </button>
            <button className="btn btn-secondary w-full" style={{ padding: '12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add_task</span>
              <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'حجز موعد' : 'Book Appointment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
