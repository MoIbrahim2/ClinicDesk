import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import DoctorDetails from './DoctorDetails';

const Doctors = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const currentLang = i18n.language;

  // View state
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // List state
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // active, inactive

  // Modal / Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    specialization: '',
    specializationAr: '',
    licenseNumber: '',
    phone: '',
    email: '',
    bio: '',
    bioAr: '',
    isActive: true,
  });

  // Working Hours sub-state inside form
  // Structure: [{ dayOfWeek: 1, slots: [{ start: '09:00', end: '17:00' }] }]
  const [workingHours, setWorkingHours] = useState([]);

  const resetForm = () => {
    setFormData({
      userId: '',
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      specialization: '',
      specializationAr: '',
      licenseNumber: '',
      phone: '',
      email: '',
      bio: '',
      bioAr: '',
      isActive: true,
    });
    setWorkingHours([]);
  };

  // Fetch Doctors List
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        specialization: specializationFilter || undefined,
        isActive: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined,
      };
      const res = await client.get('/doctors', { params });
      setDoctors(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDoctorId) {
      fetchDoctors();
    }
  }, [page, searchTerm, specializationFilter, statusFilter, selectedDoctorId]);

  // Open Edit Modal
  const handleStartEdit = (d) => {
    setEditingDoctor(d);
    setFormData({
      userId: d.userId || '',
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      firstNameAr: d.firstNameAr || '',
      lastNameAr: d.lastNameAr || '',
      specialization: d.specialization || '',
      specializationAr: d.specializationAr || '',
      licenseNumber: d.licenseNumber || '',
      phone: d.phone || '',
      email: d.email || '',
      bio: d.bio || '',
      bioAr: d.bioAr || '',
      isActive: d.isActive !== false,
    });
    setWorkingHours(d.workingHours ? JSON.parse(JSON.stringify(d.workingHours)) : []);
  };

  // Handle Form Input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Working Hours Helper Methods
  const addDaySchedule = () => {
    // Find first dayOfWeek not yet configured
    const configuredDays = workingHours.map((wh) => wh.dayOfWeek);
    let defaultDay = 0;
    for (let i = 0; i <= 6; i++) {
      if (!configuredDays.includes(i)) {
        defaultDay = i;
        break;
      }
    }
    setWorkingHours((prev) => [
      ...prev,
      { dayOfWeek: defaultDay, slots: [{ start: '09:00', end: '17:00' }] },
    ]);
  };

  const removeDaySchedule = (index) => {
    setWorkingHours((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDayChange = (index, dayVal) => {
    setWorkingHours((prev) => {
      const updated = [...prev];
      updated[index].dayOfWeek = parseInt(dayVal, 10);
      return updated;
    });
  };

  const addTimeSlot = (dayIndex) => {
    setWorkingHours((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots.push({ start: '09:00', end: '17:00' });
      return updated;
    });
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    setWorkingHours((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots = updated[dayIndex].slots.filter((_, i) => i !== slotIndex);
      return updated;
    });
  };

  const handleTimeChange = (dayIndex, slotIndex, field, val) => {
    setWorkingHours((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots[slotIndex][field] = val;
      return updated;
    });
  };

  // Submit Doctor (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.specialization || !formData.phone) {
      toastError(t('auth.login.validation.required'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        phone: formData.phone,
        userId: formData.userId ? parseInt(formData.userId, 10) : undefined,
        firstNameAr: formData.firstNameAr || undefined,
        lastNameAr: formData.lastNameAr || undefined,
        specializationAr: formData.specializationAr || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        email: formData.email || undefined,
        bio: formData.bio || undefined,
        bioAr: formData.bioAr || undefined,
        isActive: formData.isActive,
        workingHours: workingHours.length > 0 ? workingHours : undefined,
      };

      if (editingDoctor) {
        await client.patch(`/doctors/${editingDoctor.id}`, payload);
        toastSuccess(t('common.success'));
        setEditingDoctor(null);
      } else {
        await client.post('/doctors', payload);
        toastSuccess(t('common.success'));
        setIsAddModalOpen(false);
      }
      resetForm();
      fetchDoctors();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayName = (d) => {
    const isAr = currentLang === 'ar';
    const first = isAr && d.firstNameAr ? d.firstNameAr : d.firstName;
    const last = isAr && d.lastNameAr ? d.lastNameAr : d.lastName;
    return `${currentLang === 'ar' ? 'د. ' : 'Dr. '}${first} ${last}`;
  };

  const getSpecialization = (d) => {
    return currentLang === 'ar' && d.specializationAr ? d.specializationAr : d.specialization;
  };

  // View individual profile screen
  if (selectedDoctorId) {
    return <DoctorDetails doctorId={selectedDoctorId} onBack={() => setSelectedDoctorId(null)} />;
  }

  // Get distinct specializations for select filter from doctors list
  const specializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Page Title & Add Button */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="h1">{t('doctors.title')}</h1>
          <p className="text-muted text-sm">{t('doctors.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-xs"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            medical_services
          </span>
          {t('doctors.add_doctor')}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
          {/* Search Box */}
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
                placeholder={t('doctors.search_placeholder')}
                style={{ paddingInlineStart: '38px', width: '100%' }}
              />
            </div>
          </div>

          {/* Specialization Filter */}
          <div className="form-group">
            <label htmlFor="specializationFilter" className="label text-xs">{t('doctors.specialization')}</label>
            <select
              id="specializationFilter"
              className="form-control"
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{currentLang === 'ar' ? 'كل التخصصات' : 'All Specializations'}</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group">
            <label htmlFor="statusFilter" className="label text-xs">{t('doctors.is_active')}</label>
            <select
              id="statusFilter"
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{currentLang === 'ar' ? 'الجميع' : 'All Statuses'}</option>
              <option value="active">{t('doctors.active')}</option>
              <option value="inactive">{t('doctors.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center p-xl" style={{ minHeight: '300px' }}>
            <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '36px' }}>
              progress_activity
            </span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center p-xl flex flex-col items-center gap-xs">
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>
              medical_services
            </span>
            <p className="text-muted font-semibold">{currentLang === 'ar' ? 'لم يتم العثور على أطباء.' : 'No doctors found.'}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{currentLang === 'ar' ? 'رقم الطبيب' : 'Doctor ID'}</th>
                  <th>{currentLang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th>{t('doctors.specialization')}</th>
                  <th>{t('doctors.phone')}</th>
                  <th>{t('doctors.license_number')}</th>
                  <th>{t('doctors.is_active')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id} className="hoverable">
                    <td className="font-semibold text-primary">#{d.id}</td>
                    <td>
                      <div>
                        <span className="font-semibold block">{getDisplayName(d)}</span>
                        {d.email && <span className="text-xs text-muted block">{d.email}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{getSpecialization(d)}</span>
                    </td>
                    <td>{d.phone}</td>
                    <td>{d.licenseNumber || <span className="text-muted">-</span>}</td>
                    <td>
                      <span className={`badge ${d.isActive ? 'badge-success' : 'badge-error'}`}>
                        {d.isActive ? t('doctors.active') : t('doctors.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-xs">
                        <button
                          onClick={() => setSelectedDoctorId(d.id)}
                          className="btn btn-secondary btn-sm flex items-center gap-xs"
                          title={t('common.view')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            visibility
                          </span>
                          <span>{t('common.view')}</span>
                        </button>
                        <button
                          onClick={() => handleStartEdit(d)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-md flex-wrap gap-sm" style={{ borderTop: '1px solid var(--outline-variant)' }}>
            <span className="text-muted text-xs">
              {currentLang === 'ar'
                ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} من إجمالي ${total} طبيب`
                : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} doctors`}
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

      {/* CRUD MODAL FOR ADD / EDIT DOCTOR */}
      {(isAddModalOpen || editingDoctor) && (
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
            className="card modal-content animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '850px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--elevation-3)',
            }}
          >
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                {editingDoctor ? t('doctors.edit_doctor') : t('doctors.add_doctor')}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingDoctor(null);
                  resetForm();
                }}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {/* Row 1: English Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="firstName" className="label">{t('doctors.first_name')} *</label>
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
                  <label htmlFor="lastName" className="label">{t('doctors.last_name')} *</label>
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

              {/* Row 2: Arabic Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="firstNameAr" className="label">{t('doctors.first_name_ar')}</label>
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
                  <label htmlFor="lastNameAr" className="label">{t('doctors.last_name_ar')}</label>
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

              {/* Row 3: Specializations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="specialization" className="label">{t('doctors.specialization')} *</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    className="form-control"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g. Cardiology, Pediatrics"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="specializationAr" className="label">{t('doctors.specialization_ar')}</label>
                  <input
                    type="text"
                    id="specializationAr"
                    name="specializationAr"
                    className="form-control"
                    value={formData.specializationAr}
                    onChange={handleInputChange}
                    placeholder="مثال: طب القلب، طب الأطفال"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              {/* Row 4: Phone, License & User ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="form-group">
                  <label htmlFor="phone" className="label">{t('doctors.phone')} *</label>
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
                  <label htmlFor="licenseNumber" className="label">{t('doctors.license_number')}</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    className="form-control"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="userId" className="label">{currentLang === 'ar' ? 'رقم المستخدم المرتبط (اختياري)' : 'Linked User ID (Optional)'}</label>
                  <input
                    type="number"
                    id="userId"
                    name="userId"
                    className="form-control"
                    value={formData.userId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Row 5: Email & Status Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-center">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="email" className="label">{t('doctors.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '24px' }}>
                  <label htmlFor="isActive" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span>{t('doctors.is_active')}</span>
                  </label>
                </div>
              </div>

              {/* Row 6: Bios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label htmlFor="bio" className="label">{t('doctors.bio')}</label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-control"
                    rows="2"
                    value={formData.bio}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="bioAr" className="label">{t('doctors.bio_ar')}</label>
                  <textarea
                    id="bioAr"
                    name="bioAr"
                    className="form-control"
                    rows="2"
                    value={formData.bioAr}
                    onChange={handleInputChange}
                    style={{ textAlign: 'right' }}
                  ></textarea>
                </div>
              </div>

              {/* SCHEDULE / WORKING HOURS BUILDER */}
              <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <div className="flex justify-between items-center mb-md">
                  <div>
                    <h3 className="font-bold text-sm" style={{ margin: 0 }}>{t('doctors.working_hours')}</h3>
                    <p className="text-muted text-xs">{t('doctors.working_hours_subtitle')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={addDaySchedule}
                    className="btn btn-outline btn-sm flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      add
                    </span>
                    <span>{t('doctors.add_day')}</span>
                  </button>
                </div>

                {workingHours.length === 0 ? (
                  <div className="text-center p-md text-muted text-xs" style={{ border: '1px dashed var(--outline-variant)', borderRadius: '8px' }}>
                    {t('doctors.no_schedule')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {workingHours.map((wh, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="flex flex-col gap-sm p-md"
                        style={{
                          backgroundColor: 'var(--surface-container-low)',
                          border: '1px solid var(--outline-variant)',
                          borderRadius: '8px',
                        }}
                      >
                        {/* Day Selector and Delete Button */}
                        <div className="flex justify-between items-center flex-wrap gap-sm">
                          <div className="flex items-center gap-sm">
                            <label className="text-xs font-semibold">{t('doctors.day')}</label>
                            <select
                              value={wh.dayOfWeek}
                              onChange={(e) => handleDayChange(dayIdx, e.target.value)}
                              className="form-control"
                              style={{ width: '150px', height: '36px', padding: '0 8px' }}
                            >
                              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                                <option key={d} value={d}>
                                  {t(`doctors.days.${d}`)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-xs">
                            <button
                              type="button"
                              onClick={() => addTimeSlot(dayIdx)}
                              className="btn btn-secondary btn-sm flex items-center gap-xs"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                add
                              </span>
                              <span>{t('doctors.add_slot')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDaySchedule(dayIdx)}
                              className="btn btn-error btn-sm flex items-center gap-xs"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                delete
                              </span>
                              <span>{t('doctors.remove')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Slots */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                          {wh.slots.map((slot, slotIdx) => (
                            <div key={slotIdx} className="flex items-center gap-md" style={{ borderTop: slotIdx > 0 ? '1px dashed var(--outline-variant)' : 'none', paddingTop: slotIdx > 0 ? '8px' : 0 }}>
                              <div className="flex items-center gap-xs">
                                <label className="text-xs text-muted">{t('doctors.start_time')}</label>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => handleTimeChange(dayIdx, slotIdx, 'start', e.target.value)}
                                  className="form-control"
                                  style={{ width: '120px', height: '32px', padding: '0 8px' }}
                                  required
                                />
                              </div>
                              <div className="flex items-center gap-xs">
                                <label className="text-xs text-muted">{t('doctors.end_time')}</label>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => handleTimeChange(dayIdx, slotIdx, 'end', e.target.value)}
                                  className="form-control"
                                  style={{ width: '120px', height: '32px', padding: '0 8px' }}
                                  required
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(dayIdx, slotIdx)}
                                className="btn btn-outline btn-sm text-error"
                                style={{ padding: '4px 8px', minWidth: 0 }}
                                disabled={wh.slots.length <= 1}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                  close
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-sm mt-lg" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDoctor(null);
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

export default Doctors;
