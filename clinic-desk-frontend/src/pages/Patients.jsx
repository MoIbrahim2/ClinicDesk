import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import PatientDetails from './PatientDetails';

const Patients = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const currentLang = i18n.language;

  // View state
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // List state
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');

  // Modal / Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    dateOfBirth: '',
    gender: 'male',
    bloodType: '',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalNotes: '',
    allergies: '',
  });

  const resetForm = () => {
    setFormData({
      nationalId: '',
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      dateOfBirth: '',
      gender: 'male',
      bloodType: '',
      phone: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalNotes: '',
      allergies: '',
    });
  };

  // Fetch Patients List
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        gender: genderFilter || undefined,
        bloodType: bloodTypeFilter || undefined,
      };
      const res = await client.get('/patients', { params });
      setPatients(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPatientId) {
      fetchPatients();
    }
  }, [page, searchTerm, genderFilter, bloodTypeFilter, selectedPatientId]);

  // Open Edit Modal
  const handleStartEdit = (p) => {
    setEditingPatient(p);
    setFormData({
      nationalId: p.nationalId || '',
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      firstNameAr: p.firstNameAr || '',
      lastNameAr: p.lastNameAr || '',
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
      gender: p.gender || 'male',
      bloodType: p.bloodType || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      emergencyContactName: p.emergencyContactName || '',
      emergencyContactPhone: p.emergencyContactPhone || '',
      medicalNotes: p.medicalNotes || '',
      allergies: p.allergies || '',
    });
  };

  // Handle Form Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Patient (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.phone) {
      toastError(t('auth.login.validation.required'));
      return;
    }

    setSubmitting(true);
    try {
      // Map empty optional values to null or omit them to satisfy backend DTO
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        nationalId: formData.nationalId || undefined,
        firstNameAr: formData.firstNameAr || undefined,
        lastNameAr: formData.lastNameAr || undefined,
        bloodType: formData.bloodType || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        medicalNotes: formData.medicalNotes || undefined,
        allergies: formData.allergies || undefined,
      };

      if (editingPatient) {
        await client.patch(`/patients/${editingPatient.id}`, payload);
        toastSuccess(t('common.success'));
        setEditingPatient(null);
      } else {
        await client.post('/patients', payload);
        toastSuccess(t('common.success'));
        setIsAddModalOpen(false);
      }
      resetForm();
      fetchPatients();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayName = (p) => {
    const isAr = currentLang === 'ar';
    const first = isAr && p.firstNameAr ? p.firstNameAr : p.firstName;
    const last = isAr && p.lastNameAr ? p.lastNameAr : p.lastName;
    return `${first} ${last}`;
  };

  // If viewing patient profile
  if (selectedPatientId) {
    return <PatientDetails patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
  }

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Title & Add Actions */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="h1">{t('patients.title')}</h1>
          <p className="text-muted text-sm">{t('patients.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-xs"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            person_add
          </span>
          {t('patients.add_patient')}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
          {/* Global text search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
            <label className="text-xs font-semibold text-muted">{currentLang === 'ar' ? 'البحث العام' : 'Global Search'}</label>
            <div className="input-group" style={{ position: 'relative' }}>
              <span className="material-symbols-outlined text-muted" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', marginInlineStart: '12px' }}>
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="form-control"
                placeholder={t('patients.search_placeholder')}
                style={{ paddingInlineStart: '38px', width: '100%' }}
              />
            </div>
          </div>

          {/* Gender Filter */}
          <div className="form-group">
            <label htmlFor="genderFilter" className="label text-xs">{t('patients.gender')}</label>
            <select
              id="genderFilter"
              className="form-control"
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{currentLang === 'ar' ? 'كل الأجناس' : 'All Genders'}</option>
              <option value="male">{t('patients.male')}</option>
              <option value="female">{t('patients.female')}</option>
              <option value="other">{t('patients.other')}</option>
            </select>
          </div>

          {/* Blood Type Filter */}
          <div className="form-group">
            <label htmlFor="bloodTypeFilter" className="label text-xs">{t('patients.blood_type')}</label>
            <select
              id="bloodTypeFilter"
              className="form-control"
              value={bloodTypeFilter}
              onChange={(e) => {
                setBloodTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{currentLang === 'ar' ? 'كل الفصائل' : 'All Blood Types'}</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center p-xl" style={{ minHeight: '300px' }}>
            <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '36px' }}>
              progress_activity
            </span>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center p-xl flex flex-col items-center gap-xs">
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>
              group
            </span>
            <p className="text-muted font-semibold">{currentLang === 'ar' ? 'لم يتم العثور على مرضى مطابقة.' : 'No matching patients found.'}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{currentLang === 'ar' ? 'كود المريض' : 'Patient ID'}</th>
                  <th>{currentLang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th>{t('patients.phone')}</th>
                  <th>{t('patients.gender')}</th>
                  <th>{t('patients.date_of_birth')}</th>
                  <th>{t('patients.blood_type')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="hoverable">
                    <td className="font-semibold text-primary">#{p.id}</td>
                    <td>
                      <div>
                        <span className="font-semibold block">{getDisplayName(p)}</span>
                        {p.nationalId && <span className="text-xs text-muted block">{p.nationalId}</span>}
                      </div>
                    </td>
                    <td>{p.phone}</td>
                    <td>
                      <span className="badge badge-outline">
                        {p.gender === 'male' ? t('patients.male') : p.gender === 'female' ? t('patients.female') : t('patients.other')}
                      </span>
                    </td>
                    <td>{p.dateOfBirth}</td>
                    <td>
                      {p.bloodType ? (
                        <span className="badge badge-error">{p.bloodType}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-xs">
                        <button
                          onClick={() => setSelectedPatientId(p.id)}
                          className="btn btn-secondary btn-sm flex items-center gap-xs"
                          title={t('common.view')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            visibility
                          </span>
                          <span>{t('common.view')}</span>
                        </button>
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="btn btn-outline btn-sm flex items-center gap-xs"
                          title={t('common.edit')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            edit
                          </span>
                          <span>{t('common.edit')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-md flex-wrap gap-sm" style={{ borderTop: '1px solid var(--outline-variant)' }}>
            <span className="text-muted text-xs">
              {currentLang === 'ar'
                ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} من إجمالي ${total} مريض`
                : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} patients`}
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

      {/* CREATE & EDIT FORM MODAL */}
      {(isAddModalOpen || editingPatient) && (
        <div
          className="modal-backdrop flex items-center justify-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <div
            className="card modal-content"
            style={{
              width: '100%',
              maxWidth: '800px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--elevation-3)',
            }}
          >
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                {editingPatient ? t('patients.edit_patient') : t('patients.add_patient')}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPatient(null);
                  resetForm();
                }}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {/* Demographics Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="firstName" className="label">{t('patients.first_name')} *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="label">{t('patients.last_name')} *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Demographics Row 2 (Arabic Names) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="firstNameAr" className="label">{t('patients.first_name_ar')}</label>
                  <input
                    type="text"
                    id="firstNameAr"
                    name="firstNameAr"
                    className="form-control"
                    value={formData.firstNameAr}
                    onChange={handleInputChange}
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastNameAr" className="label">{t('patients.last_name_ar')}</label>
                  <input
                    type="text"
                    id="lastNameAr"
                    name="lastNameAr"
                    className="form-control"
                    value={formData.lastNameAr}
                    onChange={handleInputChange}
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              {/* Row 3: Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="phone" className="label">{t('patients.phone')} *</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="label">{t('patients.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Row 4: Birth date, gender, blood type, national ID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="nationalId" className="label">{t('patients.national_id')}</label>
                  <input
                    type="text"
                    id="nationalId"
                    name="nationalId"
                    className="form-control"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="label">{t('patients.date_of_birth')} *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender" className="label">{t('patients.gender')} *</label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="male">{t('patients.male')}</option>
                    <option value="female">{t('patients.female')}</option>
                    <option value="other">{t('patients.other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="form-group">
                  <label htmlFor="bloodType" className="label">{t('patients.blood_type')}</label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    className="form-control"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                  >
                    <option value="">{currentLang === 'ar' ? 'غير محدد' : 'Not Specified'}</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="address" className="label">{t('patients.address')}</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <div className="form-group">
                  <label htmlFor="emergencyContactName" className="label">{t('patients.emergency_contact_name')}</label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    className="form-control"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContactPhone" className="label">{t('patients.emergency_contact_phone')}</label>
                  <input
                    type="text"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    className="form-control"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Medical notes & allergies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="allergies" className="label">{t('patients.allergies')}</label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    className="form-control"
                    rows="2"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder={currentLang === 'ar' ? 'مثال: بنسلين، مكسرات...' : 'e.g. Penicillin, Pollen...'}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="medicalNotes" className="label">{t('patients.medical_notes')}</label>
                  <textarea
                    id="medicalNotes"
                    name="medicalNotes"
                    className="form-control"
                    rows="2"
                    value={formData.medicalNotes}
                    onChange={handleInputChange}
                    placeholder={currentLang === 'ar' ? 'الأمراض المزمنة، العمليات السابقة...' : 'Chronic illnesses, history of surgeries...'}
                  ></textarea>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-sm mt-lg" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? t('auth.login.signing_in') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
