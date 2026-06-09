import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const DoctorDetails = ({ doctorId, onBack }) => {
  const { t, i18n } = useTranslation();
  const { toastError } = useToast();
  const currentLang = i18n.language;

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('availability'); // availability, appointments
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        const docRes = await client.get(`/doctors/${doctorId}`);
        setDoctor(docRes.data);

        const apptsRes = await client.get(`/appointments?doctorId=${doctorId}&limit=50`);
        setAppointments(apptsRes.data.data || apptsRes.data || []);
      } catch (error) {
        toastError(error.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId, toastError, t]);

  const getDisplayName = (d) => {
    if (!d) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && d.firstNameAr ? d.firstNameAr : d.firstName;
    const last = isAr && d.lastNameAr ? d.lastNameAr : d.lastName;
    return `${currentLang === 'ar' ? 'د. ' : 'Dr. '}${first} ${last}`;
  };

  const getSpecialization = (d) => {
    if (!d) return '';
    return currentLang === 'ar' && d.specializationAr ? d.specializationAr : d.specialization;
  };

  const getBio = (d) => {
    if (!d) return '';
    return currentLang === 'ar' && d.bioAr ? d.bioAr : d.bio;
  };

  const getPatientDisplayName = (p) => {
    if (!p) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && p.firstNameAr ? p.firstNameAr : p.firstName;
    const last = isAr && p.lastNameAr ? p.lastNameAr : p.lastName;
    return `${first} ${last}`;
  };

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

  if (!doctor) {
    return (
      <div className="card text-center p-xl">
        <h3 className="text-error">{t('common.error')}</h3>
        <button onClick={onBack} className="btn btn-secondary mt-md">
          {t('common.back')}
        </button>
      </div>
    );
  }

  // Group working hours by day
  const daysOfWeek = ['0', '1', '2', '3', '4', '5', '6'];
  const workingHoursMap = {};
  if (doctor.workingHours && Array.isArray(doctor.workingHours)) {
    doctor.workingHours.forEach((wh) => {
      workingHoursMap[wh.dayOfWeek.toString()] = wh.slots || [];
    });
  }

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Header Card */}
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
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{getDisplayName(doctor)}</h2>
              <span className="badge badge-info">{getSpecialization(doctor)}</span>
              {doctor.licenseNumber && (
                <span className="badge badge-outline">
                  {t('doctors.license_number')}: {doctor.licenseNumber}
                </span>
              )}
            </div>
            <p className="text-muted text-xs" style={{ marginTop: '4px' }}>
              {doctor.phone} • {doctor.email || t('common.no_email', 'No Email')}
            </p>
          </div>
        </div>

        <div className="flex gap-sm">
          <span className={`badge ${doctor.isActive ? 'badge-success' : 'badge-error'}`} style={{ padding: '6px 12px' }}>
            {doctor.isActive ? t('doctors.active') : t('doctors.inactive')}
          </span>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-3 gap-lg">
        {/* Left column: Doctor Bio & Profile info */}
        <div className="flex flex-col gap-lg" style={{ gridColumn: 'span 1' }}>
          {/* Info Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
              {t('doctors.details.profile')}
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li>
                <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('doctors.specialization')}</strong>
                <span>{doctor.specialization}</span>
              </li>
              {doctor.specializationAr && (
                <li>
                  <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('doctors.specialization_ar')}</strong>
                  <span>{doctor.specializationAr}</span>
                </li>
              )}
              {doctor.userId && (
                <li>
                  <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('common.user_id', 'Linked User ID')}</strong>
                  <span>#{doctor.userId}</span>
                </li>
              )}
              <li>
                <strong className="text-muted" style={{ display: 'block', marginBottom: '2px' }}>{t('common.created_at', 'Created At')}</strong>
                <span>{new Date(doctor.createdAt).toLocaleDateString(currentLang)}</span>
              </li>
            </ul>
          </div>

          {/* Professional Bio */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
              {currentLang === 'ar' ? 'نبذة تعريفية' : 'Biography'}
            </h3>
            <div className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {getBio(doctor) || <span className="text-muted">{currentLang === 'ar' ? 'لا توجد نبذة تعريفية مضافة.' : 'No bio notes available.'}</span>}
            </div>
          </div>
        </div>

        {/* Right column: Availability & Upcoming Appointments */}
        <div className="flex flex-col gap-md" style={{ gridColumn: 'span 2' }}>
          {/* Tab Navigation */}
          <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('availability')}
              className={`btn ${activeTab === 'availability' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                schedule
              </span>
              {t('doctors.details.availability')}
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ flexGrow: 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
                calendar_month
              </span>
              {t('doctors.details.appointments')} ({appointments.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="card" style={{ padding: '24px', minHeight: '350px' }}>
            {activeTab === 'availability' && (
              <div className="flex flex-col gap-md">
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{t('doctors.working_hours')}</h3>
                  <p className="text-muted text-xs">{t('doctors.working_hours_subtitle')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {daysOfWeek.map((day) => {
                    const slots = workingHoursMap[day] || [];
                    return (
                      <div
                        key={day}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          backgroundColor: slots.length > 0 ? 'var(--surface-container-low)' : 'var(--surface)',
                          borderRadius: '8px',
                          border: '1px solid var(--outline-variant)',
                          opacity: slots.length > 0 ? 1 : 0.65,
                        }}
                      >
                        <span className="font-bold text-sm" style={{ minWidth: '100px' }}>
                          {t(`doctors.days.${day}`)}
                        </span>
                        
                        <div className="flex flex-wrap gap-sm justify-end" style={{ flexGrow: 1 }}>
                          {slots.length === 0 ? (
                            <span className="text-muted text-xs font-semibold">{t('doctors.no_schedule')}</span>
                          ) : (
                            slots.map((slot, index) => (
                              <span
                                key={index}
                                className="badge badge-info flex items-center gap-xs font-semibold"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  schedule
                                </span>
                                <span>{slot.start} - {slot.end}</span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="flex flex-col gap-md">
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('doctors.details.appointments')}</h3>
                {appointments.length === 0 ? (
                  <div className="text-center text-muted p-xl">{t('doctors.details.no_records')}</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{currentLang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
                          <th>{currentLang === 'ar' ? 'المريض' : 'Patient'}</th>
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
                            <td>
                              <div>
                                <span className="font-semibold block">{getPatientDisplayName(a.patient)}</span>
                                {a.patient?.phone && <span className="text-xs text-muted block">{a.patient.phone}</span>}
                              </div>
                            </td>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
