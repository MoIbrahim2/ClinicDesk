import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const Reports = () => {
  const { t, i18n } = useTranslation();
  const { toastError } = useToast();
  const currentLang = i18n.language;

  // Active Tab: 'financials' | 'demographics' | 'outcomes'
  const [activeTab, setActiveTab] = useState('financials');

  // Filters State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [doctors, setDoctors] = useState([]);

  // Data States
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState({
    payments: [],
    aggregates: { totalRevenue: 0, cashTotal: 0, cardTotal: 0, insuranceTotal: 0, otherTotal: 0, count: 0 },
    trend: []
  });

  const [appointmentReport, setAppointmentReport] = useState({
    statusBreakdown: { scheduled: 0, confirmed: 0, checked_in: 0, in_progress: 0, completed: 0, cancelled: 0, no_show: 0 },
    genderBreakdown: { male: 0, female: 0, other: 0 },
    ageBreakdown: { under18: 0, age18_35: 0, age36_50: 0, age51_65: 0, over65: 0 },
    totalCount: 0
  });

  // Table pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Load doctors list
  const fetchDoctors = async () => {
    try {
      const res = await client.get('/doctors', { params: { limit: 100 } });
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to load doctors list', err);
    }
  };

  // Fetch report data
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        doctorId: selectedDoctorId || undefined,
        paymentMethod: selectedMethod || undefined
      };

      const [revenueRes, apptsRes] = await Promise.all([
        client.get('/dashboard/reports/revenue', { params }),
        client.get('/dashboard/reports/appointments', {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            doctorId: selectedDoctorId || undefined
          }
        })
      ]);

      setFinancialData(revenueRes.data);
      setAppointmentReport(apptsRes.data);
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchReportData();
    setPage(1); // Reset page on filter changes
  }, [startDate, endDate, selectedDoctorId, selectedMethod]);

  const getDoctorName = (doc) => {
    if (!doc) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && doc.firstNameAr ? doc.firstNameAr : doc.firstName;
    const last = isAr && doc.lastNameAr ? doc.lastNameAr : doc.lastName;
    return `${first} ${last}`;
  };

  // Recharts colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#9ca3af'];

  // Prepare Pie Chart data for payment methods
  const paymentPieData = [
    { name: currentLang === 'ar' ? 'كاش' : 'Cash', value: financialData.aggregates.cashTotal },
    { name: currentLang === 'ar' ? 'شبكة' : 'Card', value: financialData.aggregates.cardTotal },
    { name: currentLang === 'ar' ? 'تأمين' : 'Insurance', value: financialData.aggregates.insuranceTotal },
    { name: currentLang === 'ar' ? 'آخر' : 'Other', value: financialData.aggregates.otherTotal }
  ].filter(item => item.value > 0);

  // Prepare Demographic charts data
  const genderPieData = [
    { name: currentLang === 'ar' ? 'ذكر' : 'Male', value: appointmentReport.genderBreakdown.male },
    { name: currentLang === 'ar' ? 'أنثى' : 'Female', value: appointmentReport.genderBreakdown.female },
    { name: currentLang === 'ar' ? 'آخر' : 'Other', value: appointmentReport.genderBreakdown.other }
  ].filter(item => item.value > 0);

  const ageBarData = [
    { name: '< 18', count: appointmentReport.ageBreakdown.under18 },
    { name: '18 - 35', count: appointmentReport.ageBreakdown.age18_35 },
    { name: '36 - 50', count: appointmentReport.ageBreakdown.age36_50 },
    { name: '51 - 65', count: appointmentReport.ageBreakdown.age51_65 },
    { name: '65 +', count: appointmentReport.ageBreakdown.over65 }
  ];

  // Prepare Outcomes bar data
  const outcomesBarData = [
    { name: currentLang === 'ar' ? 'مجدول' : 'Scheduled', count: appointmentReport.statusBreakdown.scheduled },
    { name: currentLang === 'ar' ? 'مؤكد' : 'Confirmed', count: appointmentReport.statusBreakdown.confirmed },
    { name: currentLang === 'ar' ? 'وصول' : 'Checked In', count: appointmentReport.statusBreakdown.checked_in },
    { name: currentLang === 'ar' ? 'قيد الفحص' : 'In Progress', count: appointmentReport.statusBreakdown.in_progress },
    { name: currentLang === 'ar' ? 'مكتمل' : 'Completed', count: appointmentReport.statusBreakdown.completed },
    { name: currentLang === 'ar' ? 'ملغي' : 'Cancelled', count: appointmentReport.statusBreakdown.cancelled },
    { name: currentLang === 'ar' ? 'عدم حضور' : 'No Show', count: appointmentReport.statusBreakdown.no_show }
  ];

  // Pagination slice
  const paginatedPayments = financialData.payments.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(financialData.payments.length / limit) || 1;

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Title Header */}
      <div>
        <h1 className="h1">{t('reports.title')}</h1>
        <p className="text-muted text-sm">{t('reports.subtitle')}</p>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {/* Start Date */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs font-semibold text-muted">{t('reports.filters.start_date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control"
            />
          </div>

          {/* End Date */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs font-semibold text-muted">{t('reports.filters.end_date')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Doctor Dropdown */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs font-semibold text-muted">{t('reports.filters.doctor')}</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="form-control"
            >
              <option value="">{currentLang === 'ar' ? 'جميع الأطباء' : 'All Doctors'}</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{getDoctorName(d)}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs font-semibold text-muted">{t('reports.filters.payment_method')}</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="form-control"
            >
              <option value="">{currentLang === 'ar' ? 'جميع الطرق' : 'All Methods'}</option>
              <option value="cash">{currentLang === 'ar' ? 'نقدًا' : 'Cash'}</option>
              <option value="card">{currentLang === 'ar' ? 'شبكة' : 'Card'}</option>
              <option value="insurance">{currentLang === 'ar' ? 'تأمين' : 'Insurance'}</option>
              <option value="other">{currentLang === 'ar' ? 'أخرى' : 'Other'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b" style={{ borderBottom: '1px solid var(--outline-variant)', gap: '16px' }}>
        <button
          onClick={() => setActiveTab('financials')}
          className="pb-sm font-bold text-sm"
          style={{
            borderBottom: activeTab === 'financials' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'financials' ? 'var(--primary)' : 'var(--on-surface-variant)',
            background: 'none',
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >
          {t('reports.tabs.financials')}
        </button>
        <button
          onClick={() => setActiveTab('demographics')}
          className="pb-sm font-bold text-sm"
          style={{
            borderBottom: activeTab === 'demographics' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'demographics' ? 'var(--primary)' : 'var(--on-surface-variant)',
            background: 'none',
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >
          {t('reports.tabs.demographics')}
        </button>
        <button
          onClick={() => setActiveTab('outcomes')}
          className="pb-sm font-bold text-sm"
          style={{
            borderBottom: activeTab === 'outcomes' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'outcomes' ? 'var(--primary)' : 'var(--on-surface-variant)',
            background: 'none',
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >
          {t('reports.tabs.outcomes')}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card flex items-center justify-center p-xl" style={{ minHeight: '400px' }}>
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
            progress_activity
          </span>
        </div>
      ) : (
        <>
          {/* TAB 1: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="flex flex-col gap-lg">
              
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <div className="card" style={{ padding: '16px' }}>
                  <p className="text-muted text-xs font-semibold">{t('reports.metrics.total_payments')}</p>
                  <h3 className="h3 mt-xs text-primary">${financialData.aggregates.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                  <p className="text-muted text-xs font-semibold">{t('reports.metrics.cash_payments')}</p>
                  <h3 className="h3 mt-xs" style={{ color: COLORS[1] }}>${financialData.aggregates.cashTotal.toLocaleString()}</h3>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                  <p className="text-muted text-xs font-semibold">{t('reports.metrics.card_payments')}</p>
                  <h3 className="h3 mt-xs" style={{ color: COLORS[0] }}>${financialData.aggregates.cardTotal.toLocaleString()}</h3>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                  <p className="text-muted text-xs font-semibold">{t('reports.metrics.insurance_payments')}</p>
                  <h3 className="h3 mt-xs" style={{ color: COLORS[2] }}>${financialData.aggregates.insuranceTotal.toLocaleString()}</h3>
                </div>
              </div>

              {/* Financial Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                
                {/* Revenue Trend Line Graph */}
                <div className="card lg:col-span-2" style={{ padding: '20px' }}>
                  <h3 className="font-bold text-sm mb-md">{t('reports.charts.revenue_trend')}</h3>
                  <div style={{ width: '100%', height: '300px' }}>
                    {financialData.trend.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted text-xs">
                        {currentLang === 'ar' ? 'لا توجد بيانات متاحة للمخطط' : 'No data available for chart'}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financialData.trend}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                          <XAxis dataKey="date" stroke="var(--on-surface-variant)" fontSize={11} />
                          <YAxis stroke="var(--on-surface-variant)" fontSize={11} />
                          <Tooltip formatter={(value) => [`$${value}`, t('reports.metrics.total_payments')]} />
                          <Area type="monotone" dataKey="amount" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Payment Methods Distribution */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 className="font-bold text-sm mb-md">{t('reports.charts.payment_methods')}</h3>
                  <div style={{ width: '100%', height: '300px' }}>
                    {paymentPieData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted text-xs">
                        {currentLang === 'ar' ? 'لا توجد بيانات مدفوعات' : 'No payments data recorded'}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {paymentPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${value}`} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="card">
                <h3 className="font-bold text-sm p-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  {currentLang === 'ar' ? 'كشف حركة المقبوضات' : 'Received Payments Ledger'}
                </h3>
                
                {financialData.payments.length === 0 ? (
                  <p className="text-muted text-xs text-center p-xl">{currentLang === 'ar' ? 'لا توجد دفعات مطابقة للفلاتر.' : 'No transactions matching active filters.'}</p>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>{t('reports.table.invoice_no')}</th>
                            <th>{t('reports.table.payment_date')}</th>
                            <th>{t('reports.table.patient')}</th>
                            <th>{t('reports.table.doctor')}</th>
                            <th>{t('reports.table.method')}</th>
                            <th>{t('reports.table.amount')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPayments.map((p) => (
                            <tr key={p.id} className="hoverable">
                              <td className="font-semibold text-primary">{p.invoiceNumber}</td>
                              <td>{new Date(p.paymentDate).toLocaleString(currentLang)}</td>
                              <td className="font-semibold">
                                {currentLang === 'ar' && p.patientNameAr ? p.patientNameAr : p.patientName}
                              </td>
                              <td>
                                {currentLang === 'ar' && p.doctorNameAr ? p.doctorNameAr : p.doctorName}
                              </td>
                              <td>
                                <span className="badge badge-info text-xs">
                                  {p.paymentMethod.toUpperCase()}
                                </span>
                              </td>
                              <td className="font-bold text-success">${Number(p.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center p-md flex-wrap gap-sm" style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '16px' }}>
                        <span className="text-muted text-xs">
                          {currentLang === 'ar'
                            ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, financialData.payments.length)} من إجمالي ${financialData.payments.length}`
                            : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, financialData.payments.length)} of ${financialData.payments.length}`}
                        </span>
                        <div className="flex gap-xs">
                          <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="btn btn-outline btn-sm"
                          >
                            {currentLang === 'ar' ? 'السابق' : 'Previous'}
                          </button>
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setPage(i + 1)}
                              className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                              style={{ minWidth: '32px' }}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="btn btn-outline btn-sm"
                          >
                            {currentLang === 'ar' ? 'التالي' : 'Next'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: DEMOGRAPHICS */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              
              {/* Gender demographics */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 className="font-bold text-sm mb-md">{t('reports.charts.gender_breakdown')}</h3>
                <div style={{ width: '100%', height: '350px' }}>
                  {genderPieData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted text-xs">
                      {currentLang === 'ar' ? 'لا توجد بيانات ديموغرافية للمرضى' : 'No demographic patient data found'}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {genderPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} patients`, t('reports.table.patient')]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Age demographics */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 className="font-bold text-sm mb-md">{t('reports.charts.age_groups')}</h3>
                <div style={{ width: '100%', height: '350px' }}>
                  {appointmentReport.totalCount === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted text-xs">
                      {currentLang === 'ar' ? 'لا توجد بيانات أعمار للمرضى' : 'No age distribution data found'}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageBarData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                        <XAxis dataKey="name" stroke="var(--on-surface-variant)" fontSize={11} />
                        <YAxis stroke="var(--on-surface-variant)" fontSize={11} allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} patients`, t('reports.table.patient')]} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: OUTCOMES */}
          {activeTab === 'outcomes' && (
            <div className="flex flex-col gap-lg">
              
              {/* Outcome breakdown chart */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 className="font-bold text-sm mb-md">{t('dashboard.widgets.appointment_outcomes')}</h3>
                <div style={{ width: '100%', height: '380px' }}>
                  {appointmentReport.totalCount === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted text-xs">
                      {currentLang === 'ar' ? 'لا توجد نتائج مواعيد للفترة المحددة' : 'No appointment outcomes for the selected date range'}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={outcomesBarData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                        <XAxis dataKey="name" stroke="var(--on-surface-variant)" fontSize={11} />
                        <YAxis stroke="var(--on-surface-variant)" fontSize={11} allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} appts`, 'Count']} />
                        <Bar dataKey="count" fill="var(--primary-container)" radius={[4, 4, 0, 0]}>
                          {outcomesBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Reports;
