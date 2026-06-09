import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuth();
  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  // View & Filter state
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // List search/filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Patient profile (for self-booking)
  const [patientProfile, setPatientProfile] = useState(null);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    patientSearch: '',
    doctorId: '',
    date: '',
    startTime: '09:00',
    endTime: '09:30',
    type: 'scheduled',
    notes: ''
  });
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedDoctorHours, setSelectedDoctorHours] = useState([]);

  // Edit / Action Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load baseline doctors list
  const fetchDoctors = async () => {
    try {
      const res = await client.get('/doctors', { params: { limit: 100 } });
      const doctorData = res.data.data || [];
      setDoctors(doctorData);

      // Default the selectedDoctorId
      if (currentRole === 'doctor') {
        const matchingDoc = doctorData.find(d => d.userId === user.id);
        if (matchingDoc) {
          setSelectedDoctorId(matchingDoc.id);
        }
      } else if (doctorData.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(doctorData[0].id);
      }
    } catch (error) {
      console.error('Failed to load doctors list', error);
    }
  };

  // Load patient profile if role is 'patient'
  const fetchPatientProfile = async () => {
    if (currentRole === 'patient') {
      try {
        const res = await client.get('/patients');
        const patientData = res.data.data || [];
        if (patientData.length > 0) {
          setPatientProfile(patientData[0]);
          setBookingForm(prev => ({
            ...prev,
            patientId: patientData[0].id
          }));
        }
      } catch (error) {
        console.error('Failed to load patient profile', error);
      }
    }
  };

  // Fetch appointments list
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let params = {};
      if (viewMode === 'calendar') {
        const days = getWeekDays(selectedDate);
        params = {
          doctorId: selectedDoctorId || undefined,
          startDate: days[0].date,
          endDate: days[6].date,
          limit: 100
        };
      } else {
        // List mode filters
        params = {
          page,
          limit,
          search: searchTerm || undefined,
          doctorId: selectedDoctorId || undefined,
          status: statusFilter || undefined,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
          sortBy: 'date',
          sortOrder: 'ASC'
        };
      }

      const res = await client.get('/appointments', { params });
      setAppointments(res.data.data || []);
      if (viewMode === 'list') {
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    if (selectedDoctorId || currentRole === 'patient') {
      fetchAppointments();
    }
  }, [viewMode, selectedDoctorId, selectedDate, page, searchTerm, statusFilter, startDateFilter, endDateFilter]);

  // Load doctor working hours when doctor or date changes in booking
  useEffect(() => {
    const docId = bookingForm.doctorId;
    if (docId) {
      const doc = doctors.find(d => d.id === parseInt(docId));
      if (doc && doc.workingHours) {
        setSelectedDoctorHours(doc.workingHours);
      } else {
        client.get(`/doctors/${docId}/availability`)
          .then(res => {
            setSelectedDoctorHours(res.data || []);
          })
          .catch(() => setSelectedDoctorHours([]));
      }
    } else {
      setSelectedDoctorHours([]);
    }
  }, [bookingForm.doctorId]);

  // Patient live search
  useEffect(() => {
    const query = bookingForm.patientSearch;
    if (query && query.length >= 2 && currentRole !== 'patient') {
      client.get('/patients', { params: { search: query, limit: 10 } })
        .then(res => {
          setPatientSearchResults(res.data.data || []);
        })
        .catch(() => setPatientSearchResults([]));
    } else {
      setPatientSearchResults([]);
    }
  }, [bookingForm.patientSearch]);

  // Helper: Get Sunday to Saturday range of a week
  const getWeekDays = (refDate) => {
    const current = new Date(refDate);
    const day = current.getDay(); // 0 = Sunday
    const diff = current.getDate() - day;
    const sunday = new Date(current.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(sunday);
      nextDate.setDate(sunday.getDate() + i);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      days.push({
        date: dateStr,
        dayOfWeek: i,
        dayLabel: nextDate.toLocaleDateString(currentLang, { weekday: 'short' }),
        dateLabel: nextDate.toLocaleDateString(currentLang, { day: 'numeric', month: 'short' })
      });
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Helper: Display names
  const getDoctorName = (doc) => {
    if (!doc) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && doc.firstNameAr ? doc.firstNameAr : doc.firstName;
    const last = isAr && doc.lastNameAr ? doc.lastNameAr : doc.lastName;
    return `${first} ${last}`;
  };

  const getPatientName = (pat) => {
    if (!pat) return '';
    const isAr = currentLang === 'ar';
    const first = isAr && pat.firstNameAr ? pat.firstNameAr : pat.firstName;
    const last = isAr && pat.lastNameAr ? pat.lastNameAr : pat.lastName;
    return `${first} ${last}`;
  };

  // Helper: Status badge color classes
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'confirmed': return 'badge-info';
      case 'in_progress': return 'badge-warning';
      case 'checked_in': return 'badge-info';
      case 'cancelled': return 'badge-error';
      case 'no_show': return 'badge-outline';
      case 'scheduled':
      default:
        return 'badge-outline';
    }
  };

  const getStatusLabel = (status) => {
    return t(`appointments.status_${status}`);
  };

  // Open booking prefilled from calendar cell click
  const handleCellClick = (date, hour) => {
    if (currentRole === 'doctor') return; // Doctors cannot schedule
    setBookingForm({
      patientId: patientProfile?.id || '',
      patientSearch: '',
      doctorId: selectedDoctorId || '',
      date: date,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour).padStart(2, '0')}:30`,
      type: 'scheduled',
      notes: ''
    });
    setSelectedPatientName(patientProfile ? getPatientName(patientProfile) : '');
    setIsBookModalOpen(true);
  };

  // Submit new booking
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.patientId) {
      toastError(t('appointments.select_patient'));
      return;
    }
    if (!bookingForm.doctorId) {
      toastError(t('appointments.select_doctor'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientId: parseInt(bookingForm.patientId),
        doctorId: parseInt(bookingForm.doctorId),
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        type: bookingForm.type,
        notes: bookingForm.notes || undefined
      };
      await client.post('/appointments', payload);
      toastSuccess(t('common.success'));
      setIsBookModalOpen(false);
      fetchAppointments();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    } finally {
      setSubmitting(false);
    }
  };

  // Open Manage appointment modal
  const handleAppointmentClick = (app) => {
    setSelectedAppointment(app);
    setRescheduleForm({
      date: app.date,
      startTime: app.startTime.substring(0, 5),
      endTime: app.endTime.substring(0, 5),
      reason: ''
    });
    setCancellationReason('');
    setIsRescheduling(false);
    setIsCancelling(false);
    setIsManageModalOpen(true);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        date: rescheduleForm.date,
        startTime: rescheduleForm.startTime,
        endTime: rescheduleForm.endTime,
        rescheduleReason: rescheduleForm.reason || 'Requested reschedule'
      };
      await client.patch(`/appointments/${selectedAppointment.id}`, payload);
      toastSuccess(t('common.success'));
      setIsManageModalOpen(false);
      fetchAppointments();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Cancellation
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        status: 'cancelled',
        reason: cancellationReason || 'Patient request'
      };
      await client.patch(`/appointments/${selectedAppointment.id}/status`, payload);
      toastSuccess(t('common.success'));
      setIsManageModalOpen(false);
      fetchAppointments();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(detail || error.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Quick Status Transition (e.g. checked_in, completed)
  const handleStatusTransition = async (nextStatus) => {
    setSubmitting(true);
    try {
      const payload = {
        status: nextStatus,
        reason: `Status transition to ${nextStatus}`
      };
      await client.patch(`/appointments/${selectedAppointment.id}/status`, payload);
      toastSuccess(t('common.success'));
      setIsManageModalOpen(false);
      fetchAppointments();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(detail || error.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async () => {
    if (!window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذا الموعد نهائياً؟' : 'Are you sure you want to delete this appointment?')) return;
    setSubmitting(true);
    try {
      await client.delete(`/appointments/${selectedAppointment.id}`);
      toastSuccess(t('common.success'));
      setIsManageModalOpen(false);
      fetchAppointments();
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Render Doctor Availability Text for selected date
  const getAvailabilityText = () => {
    const formDate = bookingForm.date;
    if (!formDate || selectedDoctorHours.length === 0) return null;

    const [year, month, day] = formDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const workingDay = selectedDoctorHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!workingDay || !workingDay.slots || workingDay.slots.length === 0) {
      return (
        <div className="badge badge-error w-full text-center p-sm" style={{ borderRadius: 'var(--radius-md)' }}>
          <span className="material-symbols-outlined text-xs">warning</span>
          {currentLang === 'ar' ? 'الطبيب غير متوفر للعمل في هذا اليوم من الأسبوع.' : 'Doctor has no working hours configured for this day of the week.'}
        </div>
      );
    }

    return (
      <div className="card p-sm flex flex-col gap-xs" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
        <p className="text-xs font-bold text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
          {t('appointments.working_hours')}
        </p>
        <div className="flex gap-xs flex-wrap">
          {workingDay.slots.map((s, idx) => (
            <span key={idx} className="badge badge-success text-xs">
              {s.start} - {s.end}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Custom Weekly Calendar Hour Grid Row Renderer
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Title & View Toggles bar */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="h1">{t('appointments.title')}</h1>
          <p className="text-muted text-sm">{t('appointments.subtitle')}</p>
        </div>
        <div className="flex gap-sm items-center flex-wrap">
          {/* Toggles */}
          <div className="flex btn-group" style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('calendar')}
              className="btn btn-sm flex items-center gap-xs"
              style={{
                borderRadius: 0,
                backgroundColor: viewMode === 'calendar' ? 'var(--primary)' : 'var(--surface)',
                color: viewMode === 'calendar' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: 'none'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
              {t('appointments.calendar_view')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="btn btn-sm flex items-center gap-xs"
              style={{
                borderRadius: 0,
                backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'var(--surface)',
                color: viewMode === 'list' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: 'none'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>list</span>
              {t('appointments.list_view')}
            </button>
          </div>

          {/* Book Button (hidden for doctors) */}
          {currentRole !== 'doctor' && (
            <button
              onClick={() => {
                setBookingForm({
                  patientId: patientProfile?.id || '',
                  patientSearch: '',
                  doctorId: selectedDoctorId || '',
                  date: new Date().toISOString().split('T')[0],
                  startTime: '09:00',
                  endTime: '09:30',
                  type: 'scheduled',
                  notes: ''
                });
                setSelectedPatientName(patientProfile ? getPatientName(patientProfile) : '');
                setIsBookModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-xs"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
              {t('appointments.book_appointment')}
            </button>
          )}
        </div>
      </div>

      {/* Filter controls panel */}
      <div className="card" style={{ padding: '16px' }}>
        {viewMode === 'calendar' ? (
          <div className="flex justify-between items-center flex-wrap gap-md">
            {/* Doctor Select */}
            {currentRole !== 'doctor' ? (
              <div className="form-group" style={{ marginBottom: 0, minWidth: '220px' }}>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="form-control"
                >
                  <option value="">{t('appointments.select_doctor')}...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{getDoctorName(d)} - {currentLang === 'ar' ? d.specializationAr : d.specialization}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-sm">
                <span className="badge badge-success" style={{ padding: '8px 12px' }}>
                  {currentLang === 'ar' ? 'طبيبي الخاص' : 'My Schedule'}
                </span>
              </div>
            )}

            {/* Calendar Week Nav */}
            <div className="flex items-center gap-sm">
              <button onClick={handlePrevWeek} className="btn btn-outline btn-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {currentLang === 'ar' ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
              <button onClick={handleToday} className="btn btn-outline btn-sm">
                {currentLang === 'ar' ? 'اليوم' : 'Today'}
              </button>
              <span className="font-semibold text-sm" style={{ minWidth: '150px', textAlign: 'center' }}>
                {weekDays[0].dateLabel} - {weekDays[6].dateLabel}
              </span>
              <button onClick={handleNextWeek} className="btn btn-outline btn-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {currentLang === 'ar' ? 'chevron_left' : 'chevron_right'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* List Mode Filters */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="text-xs font-semibold text-muted">{t('common.search')}</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                placeholder={currentLang === 'ar' ? 'بحث باسم الطبيب أو المريض أو الملاحظات...' : 'Search by doctor, patient name, notes...'}
              />
            </div>

            {currentRole !== 'doctor' && (
              <div className="form-group">
                <label className="text-xs font-semibold text-muted">{t('appointments.doctor')}</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="form-control"
                >
                  <option value="">{currentLang === 'ar' ? 'كل الأطباء' : 'All Doctors'}</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{getDoctorName(d)}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="text-xs font-semibold text-muted">{t('appointments.status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
              >
                <option value="">{currentLang === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
                {['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'].map(st => (
                  <option key={st} value={st}>{t(`appointments.status_${st}`)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="text-xs font-semibold text-muted">{currentLang === 'ar' ? 'من تاريخ' : 'Start Date'}</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-semibold text-muted">{currentLang === 'ar' ? 'إلى تاريخ' : 'End Date'}</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid View / List view content */}
      {loading ? (
        <div className="card flex items-center justify-center p-xl" style={{ minHeight: '400px' }}>
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
            progress_activity
          </span>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View rendering */
        <div className="card" style={{ padding: '12px', overflowX: 'auto' }}>
          <div style={{ minWidth: '900px' }}>
            {/* Week days columns header */}
            <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '2px solid var(--outline-variant)', paddingBottom: '12px', textAlign: 'center' }}>
              <div className="font-semibold text-muted text-xs flex items-center justify-center">
                {currentLang === 'ar' ? 'الوقت' : 'Time'}
              </div>
              {weekDays.map(day => {
                // Check if today matches this date
                const isToday = day.date === new Date().toISOString().split('T')[0];
                return (
                  <div key={day.date} className="flex flex-col items-center" style={{ padding: '4px' }}>
                    <span className="text-xs font-semibold text-muted">{day.dayLabel}</span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '4px',
                        backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday ? '#white' : 'var(--on-surface)',
                        color: isToday ? '#ffffff' : 'inherit'
                      }}
                    >
                      {day.date.split('-')[2]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Slots grid matrix */}
            <div className="flex flex-col">
              {hours.map(hour => {
                const hourString = `${String(hour).padStart(2, '0')}:00`;
                return (
                  <div key={hour} className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid var(--outline-variant)', minHeight: '80px' }}>
                    {/* Hour cell */}
                    <div className="text-xs font-semibold text-muted flex items-center justify-center" style={{ backgroundColor: 'var(--surface-container-low)', borderInlineEnd: '1px solid var(--outline-variant)' }}>
                      {hourString}
                    </div>

                    {/* Week Day columns cells */}
                    {weekDays.map(day => {
                      // Filter appointments falling in this hour slot on this date
                      const cellApps = appointments.filter(app => {
                        if (app.date !== day.date) return false;
                        const appHour = parseInt(app.startTime.split(':')[0], 10);
                        return appHour === hour;
                      });

                      return (
                        <div
                          key={day.date}
                          className="relative p-xs flex flex-col gap-xs hoverable-cell"
                          style={{
                            borderInlineEnd: '1px solid var(--outline-variant)',
                            backgroundColor: cellApps.length === 0 ? 'rgba(0,0,0,0)' : 'transparent',
                            cursor: currentRole === 'doctor' ? 'default' : 'pointer',
                            padding: '6px'
                          }}
                          onClick={() => {
                            if (cellApps.length === 0) {
                              handleCellClick(day.date, hour);
                            }
                          }}
                        >
                          {cellApps.map(app => (
                            <div
                              key={app.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentClick(app);
                              }}
                              className={`card flex flex-col justify-between`}
                              style={{
                                padding: '6px 8px',
                                fontSize: '11px',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                height: '100%',
                                minHeight: '60px',
                                borderInlineStart: `4px solid ${app.status === 'completed' ? 'var(--success)' : app.status === 'cancelled' ? 'var(--error)' : app.status === 'in_progress' ? 'var(--warning)' : 'var(--primary)'}`,
                                boxShadow: 'var(--shadow-sm)',
                                backgroundColor: 'var(--surface)'
                              }}
                            >
                              <span className="font-bold block text-primary truncate" style={{ fontSize: '11px' }}>
                                {getPatientName(app.patient)}
                              </span>
                              <div className="flex justify-between items-center" style={{ marginTop: '2px' }}>
                                <span className="text-muted font-medium" style={{ fontSize: '9px' }}>
                                  {app.startTime.substring(0, 5)} - {app.endTime.substring(0, 5)}
                                </span>
                                <span className={`badge ${getStatusBadgeClass(app.status)}`} style={{ padding: '2px 6px', fontSize: '9px' }}>
                                  {getStatusLabel(app.status)}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Empty visual helper hover plus */}
                          {cellApps.length === 0 && currentRole !== 'doctor' && (
                            <div className="cell-plus flex items-center justify-center absolute inset-0 text-muted opacity-0 hover:opacity-100" style={{ fontSize: '20px', transition: 'opacity var(--transition-fast)' }}>
                              <span className="material-symbols-outlined text-primary">add</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List View rendering */
        <div className="card">
          {appointments.length === 0 ? (
            <div className="text-center p-xl flex flex-col items-center gap-xs">
              <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>calendar_today</span>
              <p className="text-muted font-semibold">{t('appointments.no_appointments')}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('appointments.patient')}</th>
                    {currentRole !== 'doctor' && <th>{t('appointments.doctor')}</th>}
                    <th>{t('appointments.date')}</th>
                    <th>{currentLang === 'ar' ? 'الوقت' : 'Time'}</th>
                    <th>{t('appointments.type')}</th>
                    <th>{t('appointments.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id} className="hoverable">
                      <td className="font-semibold text-primary">
                        {getPatientName(app.patient)}
                        <span className="text-muted text-xs block font-normal">#{app.patient?.patientCode || app.patientId}</span>
                      </td>
                      {currentRole !== 'doctor' && <td>{getDoctorName(app.doctor)}</td>}
                      <td className="font-medium">{app.date}</td>
                      <td>
                        <span className="font-medium text-xs">
                          {app.startTime.substring(0, 5)} - {app.endTime.substring(0, 5)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${app.type === 'walk_in' ? 'badge-warning' : 'badge-info'}`}>
                          {t(`appointments.type_${app.type}`)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleAppointmentClick(app)}
                          className="btn btn-secondary btn-sm flex items-center gap-xs"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          <span>{t('common.view')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* List Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-md flex-wrap gap-sm" style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '16px' }}>
              <span className="text-muted text-xs">
                {currentLang === 'ar'
                  ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} من إجمالي ${totalCount} موعد`
                  : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} of ${totalCount} appointments`}
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

      {/* BOOK APPOINTMENT MODAL */}
      {isBookModalOpen && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div className="card modal-content w-full" style={{ maxWidth: '600px', padding: '24px', boxShadow: 'var(--elevation-3)' }}>
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t('appointments.book_appointment')}</h2>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="flex flex-col gap-md">
              {/* Patient Selector */}
              {currentRole === 'patient' ? (
                <div className="form-group">
                  <label className="form-label">{t('appointments.patient')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={getPatientName(patientProfile)}
                    disabled
                  />
                </div>
              ) : (
                <div className="form-group relative">
                  <label className="form-label">{t('appointments.patient')} *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={currentLang === 'ar' ? 'اكتب للبحث عن مريض...' : 'Type to search patient...'}
                    value={selectedPatientName || bookingForm.patientSearch}
                    onChange={(e) => {
                      setSelectedPatientName('');
                      setBookingForm(prev => ({
                        ...prev,
                        patientSearch: e.target.value,
                        patientId: ''
                      }));
                    }}
                    required
                  />
                  {patientSearchResults.length > 0 && !selectedPatientName && (
                    <div className="card absolute z-50 w-full flex flex-col" style={{ padding: '8px', top: '100%', border: '1px solid var(--outline-variant)', maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                      {patientSearchResults.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatientName(getPatientName(p));
                            setBookingForm(prev => ({
                              ...prev,
                              patientId: p.id,
                              patientSearch: ''
                            }));
                            setPatientSearchResults([]);
                          }}
                          className="p-sm hoverable font-semibold"
                          style={{ cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                        >
                          {getPatientName(p)} <span className="text-muted text-xs font-normal">(#{p.id} - {p.phone})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Selector */}
              <div className="form-group">
                <label className="form-label">{t('appointments.doctor')} *</label>
                <select
                  value={bookingForm.doctorId}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="form-control"
                  required
                >
                  <option value="">{t('appointments.select_doctor')}...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{getDoctorName(d)}</option>
                  ))}
                </select>
              </div>

              {/* Date & Walk-in */}
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label">{t('appointments.date')} *</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                {currentRole !== 'patient' && (
                  <div className="form-group" style={{ justifyContent: 'center' }}>
                    <div className="flex items-center gap-sm" style={{ marginTop: '22px' }}>
                      <input
                        id="walk_in_toggle"
                        type="checkbox"
                        checked={bookingForm.type === 'walk_in'}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, type: e.target.checked ? 'walk_in' : 'scheduled' }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="walk_in_toggle" style={{ fontWeight: 600, cursor: 'pointer' }}>
                        {t('appointments.walk_in')}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Availability Widget */}
              {getAvailabilityText()}

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label">{t('appointments.start_time')} *</label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('appointments.end_time')} *</label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">{t('appointments.notes')}</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-control"
                  rows="2"
                  placeholder={currentLang === 'ar' ? 'الشكوى الرئيسية أو سبب الزيارة...' : 'Chief complaint or reason for visit...'}
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-sm mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsBookModalOpen(false)} className="btn btn-outline" disabled={submitting}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE APPOINTMENT DETAILS & ACTIONS MODAL */}
      {isManageModalOpen && selectedAppointment && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div className="card modal-content w-full" style={{ maxWidth: '600px', padding: '24px', boxShadow: 'var(--elevation-3)' }}>
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {t('appointments.edit_appointment')} #{selectedAppointment.id}
              </h2>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Core Details Display */}
            {!isRescheduling && !isCancelling ? (
              <div className="flex flex-col gap-md">
                <div className="grid grid-cols-2 gap-md" style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.patient')}</span>
                    <span className="font-bold text-sm text-primary">{getPatientName(selectedAppointment.patient)}</span>
                    <span className="text-muted text-xs block">#{selectedAppointment.patient?.patientCode || selectedAppointment.patientId}</span>
                  </div>
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.doctor')}</span>
                    <span className="font-bold text-sm">{getDoctorName(selectedAppointment.doctor)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-sm">
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.date')}</span>
                    <span className="font-semibold">{selectedAppointment.date}</span>
                  </div>
                  <div>
                    <span className="text-muted text-xs block font-semibold">{currentLang === 'ar' ? 'الوقت' : 'Time'}</span>
                    <span className="font-semibold">{selectedAppointment.startTime.substring(0, 5)} - {selectedAppointment.endTime.substring(0, 5)}</span>
                  </div>
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.status')}</span>
                    <span className={`badge ${getStatusBadgeClass(selectedAppointment.status)}`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.notes')}</span>
                    <p className="p-sm text-xs card" style={{ backgroundColor: 'var(--surface-container-low)', border: 'none', marginTop: '4px' }}>
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                {selectedAppointment.rescheduleReason && (
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.reschedule_reason')}</span>
                    <p className="p-sm text-xs card" style={{ backgroundColor: 'var(--warning-container)', color: 'var(--on-warning)', border: 'none', marginTop: '4px' }}>
                      {selectedAppointment.rescheduleReason}
                    </p>
                  </div>
                )}

                {selectedAppointment.cancellationReason && (
                  <div>
                    <span className="text-muted text-xs block font-semibold">{t('appointments.cancellation_reason')}</span>
                    <p className="p-sm text-xs card" style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', border: 'none', marginTop: '4px' }}>
                      {selectedAppointment.cancellationReason}
                    </p>
                  </div>
                )}

                {/* Operations Buttons Grid */}
                <div className="flex flex-wrap gap-sm mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                  {/* Status updates for doctors/receptionists/admins */}
                  {currentRole !== 'patient' && selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                    <div className="flex gap-xs flex-wrap w-full" style={{ marginBottom: '8px' }}>
                      <label className="text-xs font-bold w-full text-muted mb-xs">{t('appointments.update_status')}</label>
                      {selectedAppointment.status === 'scheduled' && (
                        <button onClick={() => handleStatusTransition('confirmed')} className="btn btn-outline btn-sm">
                          {t('appointments.status_confirmed')}
                        </button>
                      )}
                      {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                        <button onClick={() => handleStatusTransition('checked_in')} className="btn btn-outline btn-sm">
                          {t('appointments.status_checked_in')}
                        </button>
                      )}
                      {selectedAppointment.status === 'checked_in' && (
                        <button onClick={() => handleStatusTransition('in_progress')} className="btn btn-outline btn-sm">
                          {t('appointments.status_in_progress')}
                        </button>
                      )}
                      {selectedAppointment.status === 'in_progress' && (
                        <button onClick={() => handleStatusTransition('completed')} className="btn btn-primary btn-sm">
                          {t('appointments.status_completed')}
                        </button>
                      )}
                      {selectedAppointment.status !== 'no_show' && (
                        <button onClick={() => handleStatusTransition('no_show')} className="btn btn-outline btn-sm">
                          {t('appointments.status_no_show')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reschedule Button */}
                  {currentRole !== 'doctor' && selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                    <button onClick={() => setIsRescheduling(true)} className="btn btn-outline">
                      <span className="material-symbols-outlined">schedule</span>
                      {t('appointments.reschedule')}
                    </button>
                  )}

                  {/* Cancel Button */}
                  {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                    <button onClick={() => setIsCancelling(true)} className="btn btn-outline btn-danger">
                      <span className="material-symbols-outlined">cancel</span>
                      {t('appointments.cancel_appointment')}
                    </button>
                  )}

                  {/* Delete Button (receptionist/admin only) */}
                  {currentRole !== 'doctor' && currentRole !== 'patient' && (
                    <button onClick={handleDeleteAppointment} className="btn btn-danger" style={{ marginInlineStart: 'auto' }}>
                      <span className="material-symbols-outlined">delete</span>
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>
            ) : isRescheduling ? (
              /* Reschedule form view */
              <form onSubmit={handleRescheduleSubmit} className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">{t('appointments.date')} *</label>
                  <input
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div className="form-group">
                    <label className="form-label">{t('appointments.start_time')} *</label>
                    <input
                      type="time"
                      value={rescheduleForm.startTime}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('appointments.end_time')} *</label>
                    <input
                      type="time"
                      value={rescheduleForm.endTime}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('appointments.reschedule_reason')} *</label>
                  <input
                    type="text"
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="form-control"
                    placeholder={t('appointments.reason_placeholder')}
                    required
                  />
                </div>

                <div className="flex justify-end gap-sm mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                  <button type="button" onClick={() => setIsRescheduling(false)} className="btn btn-outline" disabled={submitting}>
                    {t('common.back')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </form>
            ) : (
              /* Cancellation form view */
              <form onSubmit={handleCancelSubmit} className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">{t('appointments.cancellation_reason')} *</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="form-control"
                    rows="3"
                    placeholder={t('appointments.reason_placeholder')}
                    required
                  />
                </div>

                <div className="flex justify-end gap-sm mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                  <button type="button" onClick={() => setIsCancelling(false)} className="btn btn-outline" disabled={submitting}>
                    {t('common.back')}
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={submitting}>
                    {submitting ? t('common.loading') : t('appointments.cancel_appointment')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
