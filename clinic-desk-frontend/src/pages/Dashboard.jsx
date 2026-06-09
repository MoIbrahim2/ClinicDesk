import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toastError } = useToast();
  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await client.get('/dashboard/summary');
      setSummary(res.data);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, []);

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

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center p-xl" style={{ minHeight: '400px' }}>
        <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
          progress_activity
        </span>
      </div>
    );
  }

  // Get KPI Metric details
  const getKpis = () => {
    if (!summary?.kpis) return [];
    if (currentRole === 'admin') {
      return [
        { label: t('dashboard.kpis.total_patients'), value: summary.kpis.totalPatients, icon: 'patient_list', color: 'var(--primary)' },
        { label: t('dashboard.kpis.monthly_revenue'), value: `$${Number(summary.kpis.monthlyRevenue).toLocaleString()}`, icon: 'payments', color: 'var(--success)' },
        { label: t('dashboard.kpis.today_appointments'), value: summary.kpis.todayAppointments, icon: 'calendar_month', color: 'var(--secondary)' },
        { label: t('dashboard.kpis.active_staff'), value: summary.kpis.activeStaff, icon: 'medical_services', color: 'var(--info)' },
      ];
    }
    if (currentRole === 'doctor') {
      return [
        { label: t('dashboard.kpis.today_appointments'), value: summary.kpis.todayAppointments, icon: 'calendar_month', color: 'var(--primary)' },
        { label: t('dashboard.kpis.today_visits'), value: summary.kpis.todayVisits, icon: 'rate_review', color: 'var(--success)' },
        { label: t('dashboard.kpis.pending_visits'), value: summary.kpis.pendingVisits, icon: 'pending_actions', color: 'var(--warning)' },
      ];
    }
    if (currentRole === 'receptionist') {
      return [
        { label: t('dashboard.kpis.today_appointments'), value: summary.kpis.todayAppointments, icon: 'calendar_month', color: 'var(--primary)' },
        { label: t('dashboard.kpis.checked_in_today'), value: summary.kpis.checkedInToday, icon: 'login', color: 'var(--success)' },
        { label: t('dashboard.kpis.completed_today'), value: summary.kpis.completedToday, icon: 'check_circle', color: 'var(--info)' },
        { label: t('dashboard.kpis.pending_invoices'), value: summary.kpis.pendingInvoices, icon: 'receipt_long', color: 'var(--error)' },
      ];
    }
    if (currentRole === 'patient') {
      return [
        { label: t('dashboard.kpis.upcoming_appointments'), value: summary.kpis.upcomingAppointments, icon: 'calendar_month', color: 'var(--primary)' },
        { label: t('dashboard.kpis.active_prescriptions'), value: summary.kpis.activePrescriptions, icon: 'prescriptions', color: 'var(--secondary)' },
        { label: t('dashboard.kpis.pending_invoices'), value: summary.kpis.unpaidInvoices, icon: 'receipt_long', color: 'var(--error)' },
      ];
    }
    return [];
  };

  const kpiList = getKpis();

  // Prepare chart data for Admin today's outcomes
  const chartData = summary?.appointmentOutcomes ? [
    { name: currentLang === 'ar' ? 'مجدول' : 'Sched', count: summary.appointmentOutcomes.scheduled },
    { name: currentLang === 'ar' ? 'مؤكد' : 'Confirm', count: summary.appointmentOutcomes.confirmed },
    { name: currentLang === 'ar' ? 'وصول' : 'Arrived', count: summary.appointmentOutcomes.checked_in },
    { name: currentLang === 'ar' ? 'فحص' : 'Draft', count: summary.appointmentOutcomes.in_progress },
    { name: currentLang === 'ar' ? 'مكتمل' : 'Done', count: summary.appointmentOutcomes.completed },
    { name: currentLang === 'ar' ? 'ملغي' : 'Cancel', count: summary.appointmentOutcomes.cancelled },
    { name: currentLang === 'ar' ? 'غائب' : 'NoShow', count: summary.appointmentOutcomes.no_show }
  ] : [];

  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#EF4444', '#6B7280'];

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Welcome Banner */}
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

      {/* KPIs Grid */}
      {kpiList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {kpiList.map((kpi, idx) => (
            <div key={idx} className="card flex items-center justify-between" style={{ padding: '20px' }}>
              <div>
                <p className="text-muted" style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  {kpi.label}
                </p>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {kpi.value}
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
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: kpi.color }}>
                  {kpi.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Role-Specific Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        
        {/* LEFT & CENTER COLS (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          
          {/* Admin: Outcome Charts */}
          {currentRole === 'admin' && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                {t('dashboard.widgets.appointment_outcomes')}
              </h3>
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                    <XAxis dataKey="name" stroke="var(--on-surface-variant)" fontSize={11} />
                    <YAxis stroke="var(--on-surface-variant)" fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Doctor & Receptionist: Queue List */}
          {(currentRole === 'doctor' || currentRole === 'receptionist') && (
            <div className="card">
              <div className="flex justify-between items-center p-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  {currentRole === 'doctor' ? t('dashboard.widgets.active_queue') : t('dashboard.widgets.active_queue')}
                </h3>
                <Link to="/visits" className="btn btn-outline btn-sm">
                  {currentLang === 'ar' ? 'إدارة قائمة الانتظار' : 'Manage Queue'}
                </Link>
              </div>
              
              {/* Doctor queue list */}
              {currentRole === 'doctor' && (
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>{currentLang === 'ar' ? 'الوقت' : 'Time'}</th>
                        <th>{t('appointments.patient')}</th>
                        <th>{currentLang === 'ar' ? 'الجنس' : 'Gender'}</th>
                        <th>{currentLang === 'ar' ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!summary?.todayQueue || summary.todayQueue.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted p-md">
                            {currentLang === 'ar' ? 'لا يوجد مرضى في قائمة الانتظار حالياً.' : 'No patients in queue currently.'}
                          </td>
                        </tr>
                      ) : (
                        summary.todayQueue.map((q) => (
                          <tr key={q.id} className="hoverable">
                            <td className="font-semibold text-primary">{q.startTime}</td>
                            <td className="font-semibold">{currentLang === 'ar' && q.patientNameAr ? q.patientNameAr : q.patientName}</td>
                            <td>{q.gender === 'male' ? t('patients.male') : t('patients.female')}</td>
                            <td>
                              <span className={`badge ${q.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}>
                                {q.status === 'in_progress' ? t('appointments.in_progress') : t('appointments.checked_in')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Receptionist active queue */}
              {currentRole === 'receptionist' && (
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>{currentLang === 'ar' ? 'الوقت' : 'Time'}</th>
                        <th>{t('appointments.patient')}</th>
                        <th>{t('appointments.doctor')}</th>
                        <th>{currentLang === 'ar' ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!summary?.activeQueue || summary.activeQueue.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted p-md">
                            {currentLang === 'ar' ? 'لا يوجد مرضى نشطين اليوم.' : 'No active queue patients today.'}
                          </td>
                        </tr>
                      ) : (
                        summary.activeQueue.map((q) => (
                          <tr key={q.id} className="hoverable">
                            <td className="font-semibold text-primary">{q.startTime}</td>
                            <td className="font-semibold">{currentLang === 'ar' && q.patientNameAr ? q.patientNameAr : q.patientName}</td>
                            <td>{currentLang === 'ar' && q.doctorNameAr ? q.doctorNameAr : q.doctorName}</td>
                            <td>
                              <span className={`badge ${q.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}>
                                {q.status === 'in_progress' ? t('appointments.in_progress') : t('appointments.checked_in')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Patient: Upcoming Appointments */}
          {currentRole === 'patient' && (
            <div className="card">
              <div className="flex justify-between items-center p-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  {t('dashboard.widgets.upcoming_schedule')}
                </h3>
                <Link to="/appointments" className="btn btn-outline btn-sm">
                  {currentLang === 'ar' ? 'حجز موعد جديد' : 'Book Appointment'}
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>{currentLang === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th>{currentLang === 'ar' ? 'الوقت' : 'Time'}</th>
                      <th>{t('appointments.doctor')}</th>
                      <th>{currentLang === 'ar' ? 'التخصص' : 'Specialization'}</th>
                      <th>{currentLang === 'ar' ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!summary?.upcomingList || summary.upcomingList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted p-md">
                          {currentLang === 'ar' ? 'لا يوجد مواعيد قادمة.' : 'No upcoming appointments.'}
                        </td>
                      </tr>
                    ) : (
                      summary.upcomingList.map((a) => (
                        <tr key={a.id} className="hoverable">
                          <td>{new Date(a.date).toLocaleDateString(currentLang)}</td>
                          <td className="font-semibold text-primary">{a.startTime}</td>
                          <td className="font-semibold">{currentLang === 'ar' && a.doctorNameAr ? a.doctorNameAr : a.doctorName}</td>
                          <td className="text-muted">{currentLang === 'ar' && a.specializationAr ? a.specializationAr : a.specialization}</td>
                          <td>
                            <span className="badge badge-success">
                              {a.status === 'confirmed' ? t('appointments.confirmed') : t('appointments.scheduled')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Span 1) */}
        <div className="flex flex-col gap-lg">
          
          {/* Quick Actions Panel */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              {t('dashboard.widgets.quick_actions')}
            </h3>
            <div className="grid grid-cols-2 gap-md">
              {currentRole === 'receptionist' && (
                <>
                  <button onClick={() => navigate('/patients')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>person_add</span>
                    <span style={{ fontSize: '12px' }}>{t('dashboard.actions.new_patient')}</span>
                  </button>
                  <button onClick={() => navigate('/appointments')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add_task</span>
                    <span style={{ fontSize: '12px' }}>{t('dashboard.actions.book_appointment')}</span>
                  </button>
                </>
              )}
              {currentRole === 'doctor' && (
                <>
                  <button onClick={() => navigate('/visits')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>rate_review</span>
                    <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'فحص المرضى' : 'Consultations'}</span>
                  </button>
                  <button onClick={() => navigate('/prescriptions')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>prescriptions</span>
                    <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'الوصفات الطبية' : 'Prescriptions'}</span>
                  </button>
                </>
              )}
              {currentRole === 'admin' && (
                <>
                  <button onClick={() => navigate('/doctors')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>medical_services</span>
                    <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'الأطباء' : 'Manage Doctors'}</span>
                  </button>
                  <button onClick={() => navigate('/reports')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>bar_chart</span>
                    <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'التقارير المالية' : 'Financial Reports'}</span>
                  </button>
                </>
              )}
              {currentRole === 'patient' && (
                <>
                  <button onClick={() => navigate('/appointments')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>calendar_month</span>
                    <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'مواعيدي' : 'My Schedule'}</span>
                  </button>
                  <button onClick={() => navigate('/prescriptions')} className="btn btn-secondary w-full flex flex-col gap-xs py-md h-auto">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>prescriptions</span>
                    <span style={{ fontSize: '12px' }}>{currentLang === 'ar' ? 'وصفاتي' : 'My Prescriptions'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Admin: Recent Activity Feed */}
          {currentRole === 'admin' && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                {t('dashboard.widgets.recent_activity')}
              </h3>
              
              {!summary?.activities || summary.activities.length === 0 ? (
                <p className="text-muted text-xs text-center py-md">{currentLang === 'ar' ? 'لا توجد نشاطات مسجلة اليوم.' : 'No recent activities recorded.'}</p>
              ) : (
                <div className="flex flex-col gap-md">
                  {summary.activities.map((act) => (
                    <div key={act.id} className="flex gap-sm items-start" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                      <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px', marginTop: '2px' }}>
                        {act.type === 'visit_check_in' ? 'login' : act.type === 'payment_recorded' ? 'payments' : 'add_task'}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--on-surface)', lineHeight: '1.4' }}>
                          {act.type === 'visit_check_in' && t('dashboard.activity.visit_check_in', {
                            patientName: currentLang === 'ar' && act.details.patientNameAr ? act.details.patientNameAr : act.details.patientName,
                            doctorName: currentLang === 'ar' && act.details.doctorNameAr ? act.details.doctorNameAr : act.details.doctorName
                          })}
                          {act.type === 'payment_recorded' && t('dashboard.activity.payment_recorded', {
                            amount: act.details.amount,
                            patientName: currentLang === 'ar' && act.details.patientNameAr ? act.details.patientNameAr : act.details.patientName
                          })}
                          {act.type === 'appointment_booked' && t('dashboard.activity.appointment_booked', {
                            patientName: currentLang === 'ar' && act.details.patientNameAr ? act.details.patientNameAr : act.details.patientName,
                            doctorName: currentLang === 'ar' && act.details.doctorNameAr ? act.details.doctorNameAr : act.details.doctorName,
                            date: new Date(act.details.date).toLocaleDateString(currentLang),
                            startTime: act.details.startTime
                          })}
                        </p>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {new Date(act.time).toLocaleTimeString(currentLang)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Patient: Recent Prescriptions list */}
          {currentRole === 'patient' && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                {currentLang === 'ar' ? 'وصفاتي الطبية الأخيرة' : 'Recent Prescriptions'}
              </h3>
              
              {!summary?.recentPrescriptions || summary.recentPrescriptions.length === 0 ? (
                <p className="text-muted text-xs text-center py-md">{currentLang === 'ar' ? 'لا توجد وصفات طبية مسجلة.' : 'No prescriptions recorded.'}</p>
              ) : (
                <div className="flex flex-col gap-sm">
                  {summary.recentPrescriptions.map((rx) => (
                    <div key={rx.id} className="flex justify-between items-center p-sm" style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: '6px' }}>
                      <div>
                        <strong className="block text-xs text-primary">Rx #{rx.id}</strong>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {currentLang === 'ar' && rx.doctorNameAr ? rx.doctorNameAr : rx.doctorName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>
                          {rx.medicationsCount} {currentLang === 'ar' ? 'أدوية' : 'meds'}
                        </span>
                        <span className="block text-muted" style={{ fontSize: '9px', marginTop: '2px' }}>
                          {new Date(rx.createdAt).toLocaleDateString(currentLang)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
