import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Prescriptions = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuth();
  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  // List states
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Search/Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);

  // Print Preview
  const [printingPrescription, setPrintingPrescription] = useState(null);

  // Fetch doctors list for filters
  const fetchDoctors = async () => {
    try {
      const res = await client.get('/doctors', { params: { limit: 100 } });
      setDoctors(res.data.data || []);
    } catch (error) {
      console.error('Failed to load doctors list', error);
    }
  };

  // Fetch prescriptions list
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        doctorId: selectedDoctorId || undefined,
        patientId: selectedPatientId || undefined,
      };
      const res = await client.get('/prescriptions', { params });
      setPrescriptions(res.data.data || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [page, selectedDoctorId, selectedPatientId]);

  // Patient live search for filter
  useEffect(() => {
    if (patientSearch && patientSearch.length >= 2) {
      client.get('/patients', { params: { search: patientSearch, limit: 10 } })
        .then(res => {
          setPatientSearchResults(res.data.data || []);
        })
        .catch(() => setPatientSearchResults([]));
    } else {
      setPatientSearchResults([]);
    }
  }, [patientSearch]);

  // Helpers
  const getPatientName = (pat) => {
    if (!pat) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && pat.firstNameAr ? pat.firstNameAr : pat.firstName;
    const last = isAr && pat.lastNameAr ? pat.lastNameAr : pat.lastName;
    return `${first} ${last}`;
  };

  const getDoctorName = (doc) => {
    if (!doc) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && doc.firstNameAr ? doc.firstNameAr : doc.firstName;
    const last = isAr && doc.lastNameAr ? doc.lastNameAr : doc.lastName;
    return `${first} ${last}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Title Header */}
      <div>
        <h1 className="h1">{t('prescriptions.title')}</h1>
        <p className="text-muted text-sm">{t('prescriptions.subtitle')}</p>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-end">
          {/* Patient Search Input */}
          {currentRole !== 'patient' && (
            <div className="form-group relative" style={{ marginBottom: 0 }}>
              <label className="text-xs font-semibold text-muted">{t('appointments.patient')}</label>
              <input
                type="text"
                className="form-control"
                placeholder={currentLang === 'ar' ? 'البحث عن مريض...' : 'Filter by patient...'}
                value={selectedPatientName || patientSearch}
                onChange={(e) => {
                  setSelectedPatientName('');
                  setSelectedPatientId('');
                  setPatientSearch(e.target.value);
                  setPage(1);
                }}
              />
              {patientSearchResults.length > 0 && !selectedPatientName && (
                <div className="card absolute z-50 w-full flex flex-col" style={{ padding: '8px', top: '100%', border: '1px solid var(--outline-variant)', maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                  {patientSearchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientName(getPatientName(p));
                        setSelectedPatientId(p.id);
                        setPatientSearch('');
                        setPatientSearchResults([]);
                      }}
                      className="p-sm hoverable font-semibold text-xs"
                      style={{ cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    >
                      {getPatientName(p)} <span className="text-muted text-xs font-normal">(#{p.id})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Doctor Filter (receptionist/admin/patient only) */}
          {currentRole !== 'doctor' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="text-xs font-semibold text-muted">{t('appointments.doctor')}</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setPage(1);
                }}
                className="form-control"
              >
                <option value="">{currentLang === 'ar' ? 'كل الأطباء' : 'All Doctors'}</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{getDoctorName(d)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions Listing Grid */}
      {loading ? (
        <div className="card flex items-center justify-center p-xl" style={{ minHeight: '400px' }}>
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
            progress_activity
          </span>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card text-center p-xl flex flex-col items-center gap-xs">
          <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>prescriptions</span>
          <p className="text-muted font-semibold">{t('prescriptions.no_prescriptions')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{currentLang === 'ar' ? 'رقم الوصفة' : 'Prescription ID'}</th>
                  <th>{currentLang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  {currentRole !== 'patient' && <th>{t('appointments.patient')}</th>}
                  {currentRole !== 'doctor' && <th>{t('appointments.doctor')}</th>}
                  <th>{currentLang === 'ar' ? 'عدد الأدوية' : 'Medications Count'}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(rx => (
                  <tr key={rx.id} className="hoverable">
                    <td className="font-semibold text-primary">#{rx.id}</td>
                    <td>{new Date(rx.createdAt).toLocaleDateString(currentLang)}</td>
                    {currentRole !== 'patient' && <td className="font-semibold">{getPatientName(rx.patient)}</td>}
                    {currentRole !== 'doctor' && <td>{getDoctorName(rx.doctor)}</td>}
                    <td>
                      <span className="badge badge-info font-bold">
                        {rx.items?.length || 0}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setPrintingPrescription(rx)}
                        className="btn btn-secondary btn-sm flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                        <span>{t('prescriptions.print_prescription')}</span>
                      </button>
                    </td>
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
                  ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} من إجمالي ${totalCount} وصفة`
                  : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} of ${totalCount} prescriptions`}
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
        </div>
      )}

      {/* CLINIC BRANDED PRINT PREVIEW MODAL */}
      {printingPrescription && (
        <div className="modal-backdrop flex items-center justify-center no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div className="card modal-content w-full flex flex-col gap-md" style={{ maxWidth: '800px', padding: '24px', boxShadow: 'var(--elevation-3)' }}>
            
            {/* Modal Actions */}
            <div className="flex justify-between items-center pb-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t('prescriptions.print_preview')}</h2>
              <div className="flex gap-sm">
                <button
                  onClick={handlePrint}
                  className="btn btn-primary btn-sm flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                  <span>{t('prescriptions.print_prescription')}</span>
                </button>
                <button
                  onClick={() => setPrintingPrescription(null)}
                  className="btn btn-outline btn-sm"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>

            {/* Printable Prescription Layout */}
            <div
              className="printable-prescription"
              style={{
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                border: '2px solid #ccc',
                padding: '30px',
                borderRadius: '8px',
                fontFamily: 'serif',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                lineHeight: '1.6'
              }}
            >
              {/* Styling style block for print layouts */}
              <style>
                {`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    .printable-prescription, .printable-prescription * {
                      visibility: visible !important;
                    }
                    .printable-prescription {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      border: none !important;
                      padding: 0 !important;
                      box-shadow: none !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}
              </style>

              {/* Clinic Header */}
              <div className="flex justify-between items-start" style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                <div style={{ textAlign: currentLang === 'ar' ? 'right' : 'left' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>ClinicDesk Medical Clinic</h1>
                  <span style={{ fontSize: '12px', color: '#666' }}>123 Medical Avenue, Cairo, Egypt • Tel: +20 2 1234567</span>
                </div>
                <div style={{ textAlign: currentLang === 'ar' ? 'left' : 'right' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>مجمع كلينيك ديسك الطبي</h1>
                  <span style={{ fontSize: '12px', color: '#666' }}>١٢٣ الشارع الطبي، القاهرة • هاتف: ٠١٢٣٤٥٦٧٨٩</span>
                </div>
              </div>

              {/* Doctor Info Banner */}
              <div className="grid grid-cols-2 gap-md" style={{ borderBottom: '1px solid #ccc', paddingBottom: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Doctor: </strong> {getDoctorName(printingPrescription.doctor)}
                  <br />
                  <strong>Spec: </strong> {printingPrescription.doctor?.specialization}
                  {printingPrescription.doctor?.licenseNumber && (
                    <>
                      <br />
                      <strong>{t('prescriptions.license')}: </strong> {printingPrescription.doctor.licenseNumber}
                    </>
                  )}
                </div>
                <div style={{ textAlign: currentLang === 'ar' ? 'left' : 'right', direction: 'rtl' }}>
                  <strong>الطبيب: </strong> {printingPrescription.doctor?.firstNameAr ? `${printingPrescription.doctor.firstNameAr} ${printingPrescription.doctor.lastNameAr}` : getDoctorName(printingPrescription.doctor)}
                  <br />
                  <strong>التخصص: </strong> {printingPrescription.doctor?.specializationAr || printingPrescription.doctor?.specialization}
                </div>
              </div>

              {/* Patient Info Banner */}
              <div className="grid grid-cols-2 gap-md" style={{ borderBottom: '1px solid #ccc', paddingBottom: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Patient: </strong> {getPatientName(printingPrescription.patient)}
                  <br />
                  <strong>{t('prescriptions.age')}: </strong> {calculateAge(printingPrescription.patient?.dateOfBirth)} yrs • <strong>Gender: </strong> {printingPrescription.patient?.gender}
                </div>
                <div style={{ textAlign: currentLang === 'ar' ? 'left' : 'right' }}>
                  <strong>Date: </strong> {new Date(printingPrescription.createdAt).toLocaleDateString('en-US')}
                  <br />
                  <strong>التاريخ: </strong> {new Date(printingPrescription.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>

              {/* Rx Symbol */}
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', fontStyle: 'italic', margin: '10px 0' }}>
                Rx
              </div>

              {/* Medications List */}
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                      <th style={{ padding: '8px', width: '40%' }}>Medication Name / اسم الدواء</th>
                      <th style={{ padding: '8px' }}>Route / Dosage</th>
                      <th style={{ padding: '8px' }}>Frequency / التكرار</th>
                      <th style={{ padding: '8px' }}>Duration / المدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(printingPrescription.items || []).map((med, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>
                          <strong style={{ color: 'var(--primary)' }}>{med.medicationName}</strong>
                          {med.instructions && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{med.instructions}</div>}
                          {med.instructionsAr && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', textAlign: 'right', direction: 'rtl' }}>{med.instructionsAr}</div>}
                        </td>
                        <td style={{ padding: '8px' }}>{med.route || 'Oral'} • {med.dosage}</td>
                        <td style={{ padding: '8px' }}>{med.frequency}</td>
                        <td style={{ padding: '8px' }}>{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Prescription Notes */}
              {(printingPrescription.notes || printingPrescription.notesAr) && (
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '12px', fontSize: '13px' }}>
                  <strong>Notes / ملاحظات:</strong>
                  {printingPrescription.notes && <p style={{ margin: '4px 0 0 0' }}>{printingPrescription.notes}</p>}
                  {printingPrescription.notesAr && <p style={{ margin: '4px 0 0 0', textAlign: 'right', direction: 'rtl' }}>{printingPrescription.notesAr}</p>}
                </div>
              )}

              {/* Doctor Signature Area */}
              <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', fontSize: '12px', paddingTop: '6px' }}>
                  {t('prescriptions.dr_sig')}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Prescriptions;
