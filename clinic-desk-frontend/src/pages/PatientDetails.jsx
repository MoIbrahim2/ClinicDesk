import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const PatientDetails = ({ patientId, onBack }) => {
  const { t, i18n } = useTranslation();
  const { toastError } = useToast();
  const currentLang = i18n.language;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, visits, appointments, prescriptions, billing

  // Aggregated details state
  const [visits, setVisits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Fetch all history data
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // Fetch baseline patient demographics
        const patientRes = await client.get(`/patients/${patientId}`);
        setPatient(patientRes.data);

        // Concurrent fetch for history tabs
        const [visitsRes, apptsRes, rxRes, invoicesRes] = await Promise.all([
          client.get(`/visits?patientId=${patientId}&limit=50`),
          client.get(`/appointments?patientId=${patientId}&limit=50`),
          client.get(`/prescriptions?patientId=${patientId}&limit=50`),
          client.get(`/invoices?patientId=${patientId}&limit=50`),
        ]);

        setVisits(visitsRes.data.data || visitsRes.data || []);
        setAppointments(apptsRes.data.data || apptsRes.data || []);
        setPrescriptions(rxRes.data.data || rxRes.data || []);
        setInvoices(invoicesRes.data.data || invoicesRes.data || []);
      } catch (error) {
        toastError(error.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, toastError, t]);

  const getDisplayName = (p) => {
    if (!p) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && p.firstNameAr ? p.firstNameAr : p.firstName;
    const last = isAr && p.lastNameAr ? p.lastNameAr : p.lastName;
    return `${first} ${last}`;
  };

  const getDoctorDisplayName = (doc) => {
    if (!doc) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && doc.firstNameAr ? doc.firstNameAr : doc.firstName;
    const last = isAr && doc.lastNameAr ? doc.lastNameAr : doc.lastName;
    return `${currentLang === 'ar' ? 'د. ' : 'Dr. '}${first} ${last}`;
  };

  const getTimelineEvents = () => {
    const events = [];

    // 1. Add visits
    visits.forEach((v) => {
      events.push({
        id: `visit-${v.id}`,
        type: 'visit',
        date: new Date(v.createdAt),
        title: currentLang === 'ar' ? 'زيارة سريرية' : 'Clinical Visit',
        description: `${currentLang === 'ar' ? 'زيارة مع' : 'Visit with'} ${getDoctorDisplayName(v.doctor)}`,
        details: v.chiefComplaint ? `"${v.chiefComplaint}"` : '',
        status: v.status,
        raw: v,
      });
    });

    // 2. Add appointments
    appointments.forEach((a) => {
      const [year, month, day] = a.date.split('-').map(Number);
      const [hours, minutes] = a.startTime.split(':').map(Number);
      const apptDate = new Date(year, month - 1, day, hours, minutes);

      events.push({
        id: `appt-${a.id}`,
        type: 'appointment',
        date: apptDate,
        title: currentLang === 'ar' ? 'موعد' : 'Appointment',
        description: `${currentLang === 'ar' ? 'موعد مع' : 'Appointment with'} ${getDoctorDisplayName(a.doctor)}`,
        details: a.reason ? `${currentLang === 'ar' ? 'السبب:' : 'Reason:'} ${a.reason}` : '',
        status: a.status,
        raw: a,
      });
    });

    // 3. Add prescriptions
    prescriptions.forEach((rx) => {
      events.push({
        id: `rx-${rx.id}`,
        type: 'prescription',
        date: new Date(rx.createdAt),
        title: currentLang === 'ar' ? 'وصفة طبية' : 'Prescription',
        description: `${currentLang === 'ar' ? 'صادرة عن' : 'Issued by'} ${getDoctorDisplayName(rx.doctor)}`,
        details: rx.items?.map((item) => item.medicationName).join(', ') || '',
        status: 'active',
        raw: rx,
      });
    });

    // 4. Add invoices & payments
    invoices.forEach((inv) => {
      events.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        date: new Date(inv.createdAt),
        title: currentLang === 'ar' ? 'فاتورة مالية' : 'Financial Invoice',
        description: `${currentLang === 'ar' ? 'فاتورة رقم' : 'Invoice'} #${inv.invoiceNumber}`,
        details: `${currentLang === 'ar' ? 'الإجمالي:' : 'Total:'} $${Number(inv.total).toFixed(2)} • ${currentLang === 'ar' ? 'المستحق:' : 'Due:'} $${Number(inv.balanceDue).toFixed(2)}`,
        status: inv.status,
        raw: inv,
      });

      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach((pay) => {
          events.push({
            id: `pay-${pay.id}`,
            type: 'payment',
            date: new Date(pay.createdAt),
            title: currentLang === 'ar' ? 'دفعة مالية' : 'Payment Received',
            description: `${currentLang === 'ar' ? 'دفعة للفاتورة رقم' : 'Payment for Invoice'} #${inv.invoiceNumber}`,
            details: `${currentLang === 'ar' ? 'المبلغ:' : 'Amount:'} $${Number(pay.amount).toFixed(2)} (${currentLang === 'ar' ? pay.method : pay.method})`,
            status: 'completed',
            raw: pay,
          });
        });
      }
    });

    // Sort events DESC by date
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timelineEvents = getTimelineEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-xl" style={{ minHeight: '400px' }}>
        <div className="flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
            progress_activity
          </span>
          <p className="text-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="card text-center p-xl">
        <h3 className="text-error">{t('common.error')}</h3>
        <button onClick={onBack} className="btn btn-secondary mt-md">
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Top Header Card */}
      <div className="card flex justify-between items-center flex-wrap gap-md" style={{ padding: '20px' }}>
        <div className="flex items-center gap-md">
          <button onClick={onBack} className="btn btn-outline btn-sm flex items-center gap-xs">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {currentLang === 'ar' ? 'arrow_forward' : 'arrow_back'}
            </span>
            {t('common.back')}
          </button>
          <div>
            <div className="flex items-center gap-sm flex-wrap">
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{getDisplayName(patient)}</h2>
              <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                ID: #{patient.id}
              </span>
              {patient.bloodType && (
                <span className="badge badge-error">
                  {patient.bloodType}
                </span>
              )}
            </div>
            <p className="text-muted text-xs" style={{ marginTop: '4px' }}>
              {patient.phone} • {patient.email || t('patients.email_placeholder', 'No Email')}
            </p>
          </div>
        </div>

        <div className="flex gap-sm">
          <span className="badge badge-success" style={{ padding: '6px 12px' }}>
            {patient.gender === 'male' ? t('patients.male') : patient.gender === 'female' ? t('patients.female') : t('patients.other')}
          </span>
        </div>
      </div>

      {/* Profile Columns */}
      <div className="grid grid-cols-3 gap-lg">
        {/* Left Side: Demographics Info Drawer */}
        <div className="flex flex-col gap-lg" style={{ gridColumn: 'span 1' }}>
          {/* Personal Info */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
              {t('patients.details.demographics')}
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              {patient.nationalId && (
                <li>
                  <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('patients.national_id')}</strong>
                  <span>{patient.nationalId}</span>
                </li>
              )}
              <li>
                <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('patients.date_of_birth')}</strong>
                <span>{patient.dateOfBirth}</span>
              </li>
              {patient.address && (
                <li>
                  <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('patients.address')}</strong>
                  <span>{patient.address}</span>
                </li>
              )}
              {patient.emergencyContactName && (
                <li>
                  <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('patients.emergency_contact_name')}</strong>
                  <span>{patient.emergencyContactName} {patient.emergencyContactPhone && `(${patient.emergencyContactPhone})`}</span>
                </li>
              )}
              <li>
                <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('patients.created_at')}</strong>
                <span>{new Date(patient.createdAt).toLocaleDateString(currentLang)}</span>
              </li>
            </ul>
          </div>

          {/* Medical Notes & Allergies */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
              {t('patients.details.medical_history')}
            </h3>
            <div className="flex flex-col gap-md">
              <div>
                <strong className="text-muted text-xs" style={{ display: 'block', marginBottom: '4px' }}>
                  {t('patients.allergies')}
                </strong>
                {patient.allergies ? (
                  <div style={{ backgroundColor: 'rgba(186, 26, 26, 0.08)', color: 'var(--error)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--error)', fontSize: '13px' }}>
                    {patient.allergies}
                  </div>
                ) : (
                  <p className="text-muted text-xs">{currentLang === 'ar' ? 'لا توجد حساسية معروفة.' : 'No known allergies.'}</p>
                )}
              </div>

              <div>
                <strong className="text-muted text-xs" style={{ display: 'block', marginBottom: '4px' }}>
                  {t('patients.medical_notes')}
                </strong>
                {patient.medicalNotes ? (
                  <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                    {patient.medicalNotes}
                  </div>
                ) : (
                  <p className="text-muted text-xs">{currentLang === 'ar' ? 'لا توجد ملاحظات طبية.' : 'No medical history notes.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Longitudinal Tabs Workspace */}
        <div className="flex flex-col gap-md" style={{ gridColumn: 'span 2' }}>
          {/* Tab Navigation */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`btn ${activeTab === 'timeline' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                timeline
              </span>
              {t('patients.details.timeline')}
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                rate_review
              </span>
              {t('patients.details.visits')} ({visits.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                calendar_month
              </span>
              {t('patients.details.appointments')} ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                prescriptions
              </span>
              {t('patients.details.prescriptions')} ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                receipt_long
              </span>
              {t('patients.details.billing')} ({invoices.length})
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="card" style={{ padding: '24px', minHeight: '350px' }}>
            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="flex flex-col gap-md">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('patients.details.timeline')}</h3>
                {timelineEvents.length === 0 ? (
                  <div className="text-center text-muted p-xl">{t('patients.details.no_records')}</div>
                ) : (
                  <div className="timeline-wrapper" style={{ position: 'relative', paddingLeft: currentLang === 'ar' ? '0' : '20px', paddingRight: currentLang === 'ar' ? '20px' : '0', marginTop: '10px' }}>
                    {/* Vertical line indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      bottom: '12px',
                      left: currentLang === 'ar' ? 'auto' : '8px',
                      right: currentLang === 'ar' ? '8px' : 'auto',
                      width: '2px',
                      backgroundColor: 'var(--outline-variant)'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {timelineEvents.map((evt) => {
                        const iconMap = {
                          visit: 'rate_review',
                          appointment: 'calendar_month',
                          prescription: 'prescriptions',
                          invoice: 'receipt_long',
                          payment: 'payments'
                        };
                        const colorMap = {
                          visit: 'var(--primary)',
                          appointment: 'var(--secondary)',
                          prescription: '#0ea5e9',
                          invoice: 'var(--error)',
                          payment: 'var(--success)'
                        };
                        const bgMap = {
                          visit: 'var(--primary-container)',
                          appointment: 'var(--secondary-container)',
                          prescription: '#e0f2fe',
                          invoice: 'var(--error-container)',
                          payment: '#d1fae5'
                        };

                        return (
                          <div key={evt.id} style={{ display: 'flex', gap: '16px', position: 'relative', alignItems: 'start' }}>
                            {/* Dot icon */}
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: bgMap[evt.type] || 'var(--surface-container)',
                              color: colorMap[evt.type] || 'var(--on-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2,
                              marginInlineStart: '-28px'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {iconMap[evt.type] || 'info'}
                              </span>
                            </div>

                            {/* Event Card Content */}
                            <div className="card" style={{ flexGrow: 1, padding: '12px 16px', backgroundColor: 'var(--surface-container-low)', boxShadow: 'var(--shadow-sm)', margin: 0 }}>
                              <div className="flex justify-between items-center flex-wrap gap-xs" style={{ marginBottom: '6px' }}>
                                <span className="font-bold text-xs" style={{ color: colorMap[evt.type], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {evt.title}
                                </span>
                                <span className="text-muted" style={{ fontSize: '11px' }}>
                                  {evt.date.toLocaleString(currentLang)}
                                </span>
                              </div>
                              <p className="font-semibold text-sm" style={{ margin: '0 0 4px 0', color: 'var(--on-surface)' }}>
                                {evt.description}
                              </p>
                              {evt.details && (
                                <p className="text-xs text-muted" style={{ margin: 0, fontStyle: evt.type === 'visit' ? 'italic' : 'normal' }}>
                                  {evt.details}
                                </p>
                              )}
                              
                              {/* Inline status badges */}
                              {evt.type === 'appointment' && (
                                <span className={`badge ${
                                  evt.status === 'completed' ? 'badge-success' :
                                  evt.status === 'confirmed' ? 'badge-info' :
                                  evt.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                                }`} style={{ marginTop: '8px', fontSize: '10px', display: 'inline-block' }}>
                                  {evt.status}
                                </span>
                              )}
                              {evt.type === 'invoice' && (
                                <span className={`badge ${
                                  evt.status === 'paid' ? 'badge-success' :
                                  evt.status === 'partially_paid' ? 'badge-warning' : 'badge-error'
                                }`} style={{ marginTop: '8px', fontSize: '10px', display: 'inline-block' }}>
                                  {evt.status}
                                </span>
                              )}
                              {evt.type === 'visit' && (
                                <span className={`badge ${
                                  evt.status === 'finalized' ? 'badge-success' : 'badge-warning'
                                }`} style={{ marginTop: '8px', fontSize: '10px', display: 'inline-block' }}>
                                  {evt.status}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISITS TAB */}
            {activeTab === 'visits' && (
              <div className="flex flex-col gap-md">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('patients.details.visits')}</h3>
                {visits.length === 0 ? (
                  <div className="text-center text-muted p-xl">{t('patients.details.no_records')}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {visits.map((v) => (
                      <div key={v.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--surface-container-low)' }}>
                        <div className="flex justify-between items-center flex-wrap gap-xs" style={{ marginBottom: '12px' }}>
                          <span className="font-bold text-sm">
                            {new Date(v.createdAt).toLocaleDateString(currentLang)} • {getDoctorDisplayName(v.doctor)}
                          </span>
                          <span className={`badge ${v.status === 'finalized' ? 'badge-success' : 'badge-warning'}`}>
                            {v.status === 'finalized' ? (currentLang === 'ar' ? 'مكتملة' : 'Finalized') : (currentLang === 'ar' ? 'مسودة' : 'Draft')}
                          </span>
                        </div>

                        {/* Vitals summary if present */}
                        {v.vitalSigns && (
                          <div className="grid grid-cols-4 gap-sm p-sm text-center" style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', marginBottom: '12px', fontSize: '12px' }}>
                            <div>
                              <strong className="text-muted" style={{ display: 'block' }}>BP</strong>
                              <span>{v.vitalSigns.bloodPressure || 'N/A'}</span>
                            </div>
                            <div>
                              <strong className="text-muted" style={{ display: 'block' }}>HR</strong>
                              <span>{v.vitalSigns.heartRate ? `${v.vitalSigns.heartRate} bpm` : 'N/A'}</span>
                            </div>
                            <div>
                              <strong className="text-muted" style={{ display: 'block' }}>Temp</strong>
                              <span>{v.vitalSigns.temperature ? `${v.vitalSigns.temperature} °C` : 'N/A'}</span>
                            </div>
                            <div>
                              <strong className="text-muted" style={{ display: 'block' }}>Weight</strong>
                              <span>{v.vitalSigns.weight ? `${v.vitalSigns.weight} kg` : 'N/A'}</span>
                            </div>
                          </div>
                        )}

                        {/* Diagnoses list */}
                        {v.diagnoses && v.diagnoses.length > 0 && (
                          <div style={{ marginBottom: '8px' }}>
                            <strong className="text-muted text-xs" style={{ display: 'block', marginBottom: '4px' }}>{t('patients.details.diagnoses')}</strong>
                            <div className="flex flex-wrap gap-xs">
                              {v.diagnoses.map((diag, idx) => (
                                <span key={idx} className="badge badge-info" style={{ fontSize: '11px' }}>
                                  {diag.code} - {currentLang === 'ar' && diag.descriptionAr ? diag.descriptionAr : diag.description}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {v.notes && (
                          <div>
                            <strong className="text-muted text-xs" style={{ display: 'block', marginBottom: '2px' }}>{currentLang === 'ar' ? 'ملاحظات الزيارة' : 'Clinical Notes'}</strong>
                            <p className="text-xs" style={{ margin: 0, fontStyle: 'italic' }}>{v.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="flex flex-col gap-md">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('patients.details.appointments')}</h3>
                {appointments.length === 0 ? (
                  <div className="text-center text-muted p-xl">{t('patients.details.no_records')}</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{currentLang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
                          <th>{currentLang === 'ar' ? 'الطبيب' : 'Doctor'}</th>
                          <th>{currentLang === 'ar' ? 'السبب' : 'Reason'}</th>
                          <th>{t('common.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a.id}>
                            <td className="font-semibold" style={{ fontSize: '13px' }}>
                              {new Date(a.appointmentTime).toLocaleString(currentLang)}
                            </td>
                            <td>{getDoctorDisplayName(a.doctor)}</td>
                            <td>{a.reason || '-'}</td>
                            <td>
                              <span className={`badge ${
                                a.status === 'completed' ? 'badge-success' :
                                a.status === 'confirmed' ? 'badge-info' :
                                a.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                              }`}>
                                {currentLang === 'ar' ? (
                                  a.status === 'pending' ? 'معلق' :
                                  a.status === 'confirmed' ? 'مؤكد' :
                                  a.status === 'checked_in' ? 'تم الحضور' :
                                  a.status === 'completed' ? 'مكتمل' : 'ملغي'
                                ) : a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PRESCRIPTIONS TAB */}
            {activeTab === 'prescriptions' && (
              <div className="flex flex-col gap-md">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('patients.details.prescriptions')}</h3>
                {prescriptions.length === 0 ? (
                  <div className="text-center text-muted p-xl">{t('patients.details.no_records')}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {prescriptions.map((rx) => (
                      <div key={rx.id} style={{ border: '1px solid var(--outline-variant)', borderRadius: '12px', padding: '16px' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '12px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '6px' }}>
                          <span className="font-bold text-sm">
                            {currentLang === 'ar' ? 'وصفة طبية' : 'Prescription'} #{rx.id}
                          </span>
                          <span className="text-muted text-xs">
                            {new Date(rx.createdAt).toLocaleDateString(currentLang)}
                          </span>
                        </div>

                        {/* Prescription Items */}
                        {rx.items && rx.items.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {rx.items.map((item, idx) => (
                              <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'var(--surface-container-low)', borderRadius: '6px', fontSize: '12px' }}>
                                <strong className="text-primary">{item.medicationName}</strong>
                                <div className="text-muted" style={{ marginTop: '2px' }}>
                                  {item.dosage} • {item.frequency} • {item.duration}
                                </div>
                                {item.instructions && <div className="text-xs italic" style={{ marginTop: '2px' }}>{item.instructions}</div>}
                              </div>
                            ))}
                          </div>
                        )}

                        {rx.notes && (
                          <div style={{ marginTop: '8px' }}>
                            <strong className="text-muted text-xs">{currentLang === 'ar' ? 'ملاحظات' : 'Notes'}:</strong>
                            <p style={{ fontSize: '12px', margin: 0 }}>{rx.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
              <div className="flex flex-col gap-md">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('patients.details.billing')}</h3>
                {invoices.length === 0 ? (
                  <div className="text-center text-muted p-xl">{t('patients.details.no_records')}</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{currentLang === 'ar' ? 'رقم الفاتورة' : 'Invoice ID'}</th>
                          <th>{currentLang === 'ar' ? 'تاريخ الفاتورة' : 'Invoice Date'}</th>
                          <th>{currentLang === 'ar' ? 'المبلغ الكلي' : 'Total Amount'}</th>
                          <th>{currentLang === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid'}</th>
                          <th>{t('common.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td className="font-semibold">#{inv.id}</td>
                            <td>{new Date(inv.invoiceDate).toLocaleDateString(currentLang)}</td>
                            <td>${Number(inv.totalAmount).toFixed(2)}</td>
                            <td>${Number(inv.amountPaid).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${
                                inv.status === 'paid' ? 'badge-success' :
                                inv.status === 'partially_paid' ? 'badge-warning' : 'badge-error'
                              }`}>
                                {currentLang === 'ar' ? (
                                  inv.status === 'unpaid' ? 'غير مدفوعة' :
                                  inv.status === 'partially_paid' ? 'مدفوعة جزئياً' : 'مدفوعة'
                                ) : inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
