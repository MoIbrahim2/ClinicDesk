import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Visits = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuth();
  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  // Workspace View states
  // 'list' = showing active queue & recent archives
  // 'editor' = active documentation workspace
  const [viewState, setViewState] = useState('list');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Queue & Archive lists
  const [activeQueue, setActiveQueue] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'archive'

  // Active Documenting Visit State
  const [activeVisit, setActiveVisit] = useState(null);
  const [patientTimeline, setPatientTimeline] = useState([]);

  // Active Form Fields
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [examinationNotes, setExaminationNotes] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    bp: '',
    temp: '',
    pulse: '',
    weight: '',
    height: ''
  });
  const [diagnoses, setDiagnoses] = useState([]);

  // New Diagnosis Input
  const [newDiagnosis, setNewDiagnosis] = useState({
    icdCode: '',
    diagnosisName: '',
    diagnosisNameAr: '',
    notes: '',
    isPrimary: false
  });
  const [showAddDiagForm, setShowAddDiagForm] = useState(false);

  // Prescription States
  const [activePrescription, setActivePrescription] = useState(null);
  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [prescriptionNotesAr, setPrescriptionNotesAr] = useState('');
  const [newMedication, setNewMedication] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    route: 'Oral',
    duration: '',
    instructions: '',
    instructionsAr: ''
  });

  // Selected visit details for read-only viewing modal
  const [viewingVisit, setViewingVisit] = useState(null);

  // Fetch Queue & Archive list
  const fetchQueueAndArchive = async () => {
    setLoading(true);
    try {
      // 1. Fetch appointments checked-in or in_progress (Active Queue)
      const appointmentsRes = await client.get('/appointments', {
        params: { limit: 50, page: 1 }
      });
      const allAppts = appointmentsRes.data.data || [];
      const queueAppts = allAppts.filter(
        (a) => a.status === 'checked_in' || a.status === 'in_progress'
      );
      setActiveQueue(queueAppts);

      // 2. Fetch recent visits
      const visitsRes = await client.get('/visits', {
        params: { limit: 50, page: 1 }
      });
      setRecentVisits(visitsRes.data.data || []);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewState === 'list') {
      fetchQueueAndArchive();
    }
  }, [viewState]);

  // Start Consultation
  const handleStartConsultation = async (apptId) => {
    setLoading(true);
    try {
      // Create visit
      const res = await client.post('/visits', { appointmentId: apptId });
      const visit = res.data;
      toastSuccess(currentLang === 'ar' ? 'تم بدء الكشف الطبي' : 'Clinical consultation started');
      loadWorkspace(visit);
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(detail || error.message || t('common.error'));
      fetchQueueAndArchive();
    } finally {
      setLoading(false);
    }
  };

  // Resume Draft
  const handleResumeConsultation = async (visitId) => {
    setLoading(true);
    try {
      const res = await client.get(`/visits/${visitId}`);
      loadWorkspace(res.data);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Setup Consultation workspace states
  const loadWorkspace = async (visit) => {
    setActiveVisit(visit);
    setChiefComplaint(visit.chiefComplaint || '');
    setExaminationNotes(visit.examinationNotes || '');
    setVitalSigns({
      bp: visit.vitalSigns?.bp || '',
      temp: visit.vitalSigns?.temp || '',
      pulse: visit.vitalSigns?.pulse || '',
      weight: visit.vitalSigns?.weight || '',
      height: visit.vitalSigns?.height || ''
    });
    setDiagnoses(
      (visit.diagnoses || []).map((d) => ({
        icdCode: d.icdCode || '',
        diagnosisName: d.diagnosisName,
        diagnosisNameAr: d.diagnosisNameAr || '',
        notes: d.notes || '',
        isPrimary: d.isPrimary
      }))
    );
    setNewDiagnosis({
      icdCode: '',
      diagnosisName: '',
      diagnosisNameAr: '',
      notes: '',
      isPrimary: false
    });
    setShowAddDiagForm(false);

    // Reset prescription states
    setActivePrescription(null);
    setPastPrescriptions([]);
    setPrescriptionItems([]);
    setPrescriptionNotes('');
    setPrescriptionNotesAr('');
    setNewMedication({
      medicationName: '',
      dosage: '',
      frequency: '',
      route: 'Oral',
      duration: '',
      instructions: '',
      instructionsAr: ''
    });

    setViewState('editor');

    // Fetch active prescription for this visit
    try {
      const rxRes = await client.get('/prescriptions', { params: { visitId: visit.id } });
      const rxList = rxRes.data.data || [];
      if (rxList.length > 0) {
        setActivePrescription(rxList[0]);
      }
    } catch (err) {
      console.error('Failed to load active prescription', err);
    }

    // Fetch prior clinical history for this patient
    try {
      const timelineRes = await client.get(`/visits/patient/${visit.patientId}`);
      // Filter out the current active visit to display only history
      const history = (timelineRes.data || []).filter((h) => h.id !== visit.id);
      setPatientTimeline(history);
    } catch (err) {
      console.error('Failed to load patient timeline history', err);
    }

    // Fetch patient's past prescriptions for cloning
    try {
      const pastRxRes = await client.get('/prescriptions', {
        params: { patientId: visit.patientId, limit: 50 }
      });
      const pastRxs = (pastRxRes.data.data || []).filter((rx) => rx.visitId !== visit.id);
      setPastPrescriptions(pastRxs);
    } catch (err) {
      console.error('Failed to load patient past prescriptions', err);
    }
  };

  // Helper Name Formatters
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

  // Calculate age from date of birth
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

  // Vital Signs changes
  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitalSigns((prev) => ({ ...prev, [name]: value }));
  };

  // Add Diagnosis to local list
  const handleAddDiagnosis = (e) => {
    e.preventDefault();
    if (!newDiagnosis.diagnosisName) {
      toastError(currentLang === 'ar' ? 'اسم التشخيص مطلوب' : 'Diagnosis name is required');
      return;
    }

    // Enforce single primary locally: if new is primary, uncheck others
    let updatedDiagnoses = [...diagnoses];
    if (newDiagnosis.isPrimary) {
      updatedDiagnoses = updatedDiagnoses.map((d) => ({ ...d, isPrimary: false }));
    }

    updatedDiagnoses.push(newDiagnosis);
    setDiagnoses(updatedDiagnoses);

    // Reset fields
    setNewDiagnosis({
      icdCode: '',
      diagnosisName: '',
      diagnosisNameAr: '',
      notes: '',
      isPrimary: false
    });
    setShowAddDiagForm(false);
  };

  // Remove Diagnosis
  const handleRemoveDiagnosis = (index) => {
    setDiagnoses((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle Primary status in list
  const handleTogglePrimary = (index) => {
    setDiagnoses((prev) =>
      prev.map((d, i) => ({
        ...d,
        isPrimary: i === index
      }))
    );
  };

  // Delete Prescription
  const handleDeletePrescription = async () => {
    if (!activePrescription) return;
    if (!window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذه الوصفة الطبية؟' : 'Are you sure you want to delete this prescription?')) {
      return;
    }
    try {
      await client.delete(`/prescriptions/${activePrescription.id}`);
      setActivePrescription(null);
      toastSuccess(t('prescriptions.deleted_success'));
      
      // Reload past prescriptions list for patient
      const pastRxRes = await client.get('/prescriptions', {
        params: { patientId: activeVisit.patientId, limit: 50 }
      });
      const pastRxs = (pastRxRes.data.data || []).filter((rx) => rx.visitId !== activeVisit.id);
      setPastPrescriptions(pastRxs);
    } catch (err) {
      toastError(err.message || t('common.error'));
    }
  };

  // Clone past prescription into draft visit
  const handleClonePrescription = async (pastRxId) => {
    try {
      const res = await client.post(`/prescriptions/${pastRxId}/duplicate`, {
        visitId: activeVisit.id
      });
      setActivePrescription(res.data);
      toastSuccess(t('prescriptions.cloned_success'));
    } catch (err) {
      const detail = err.response?.data?.message;
      toastError(detail || err.message || t('common.error'));
    }
  };

  // Validate BP format
  const validateBP = (bp) => {
    if (!bp) return true;
    return /^\d{2,3}\/\d{2,3}$/.test(bp);
  };

  // Save draft details
  const handleSaveDraft = async () => {
    if (vitalSigns.bp && !validateBP(vitalSigns.bp)) {
      toastError(t('visits.bp_invalid'));
      return;
    }

    setSubmitting(true);
    try {
      // Map vitals: empty strings to undefined, numeric parsed
      const payload = {
        chiefComplaint: chiefComplaint || undefined,
        examinationNotes: examinationNotes || undefined,
        vitalSigns: {
          bp: vitalSigns.bp || undefined,
          temp: vitalSigns.temp ? parseFloat(vitalSigns.temp) : undefined,
          pulse: vitalSigns.pulse ? parseInt(vitalSigns.pulse) : undefined,
          weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : undefined,
          height: vitalSigns.height ? parseFloat(vitalSigns.height) : undefined
        },
        diagnoses: diagnoses.length > 0 ? diagnoses : []
      };

      await client.patch(`/visits/${activeVisit.id}`, payload);
      toastSuccess(t('visits.draft_saved'));
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    } finally {
      setSubmitting(false);
    }
  };

  // Finalize consultation
  const handleFinalize = async () => {
    // 1. Verify blood pressure format
    if (vitalSigns.bp && !validateBP(vitalSigns.bp)) {
      toastError(t('visits.bp_invalid'));
      return;
    }

    // 2. Enforce exactly one primary diagnosis (BR-08)
    if (diagnoses.length === 0) {
      toastError(t('visits.primary_required'));
      return;
    }
    const primaryCount = diagnoses.filter((d) => d.isPrimary).length;
    if (primaryCount !== 1) {
      toastError(t('visits.primary_required'));
      return;
    }

    setSubmitting(true);
    try {
      // A. Save final details as draft first
      const payload = {
        chiefComplaint: chiefComplaint || undefined,
        examinationNotes: examinationNotes || undefined,
        vitalSigns: {
          bp: vitalSigns.bp || undefined,
          temp: vitalSigns.temp ? parseFloat(vitalSigns.temp) : undefined,
          pulse: vitalSigns.pulse ? parseInt(vitalSigns.pulse) : undefined,
          weight: vitalSigns.weight ? parseFloat(vitalSigns.weight) : undefined,
          height: vitalSigns.height ? parseFloat(vitalSigns.height) : undefined
        },
        diagnoses: diagnoses
      };
      await client.patch(`/visits/${activeVisit.id}`, payload);

      // B. Call Finalize API
      await client.post(`/visits/${activeVisit.id}/finalize`);
      toastSuccess(t('visits.finalized_success'));
      setViewState('list');
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    } finally {
      setSubmitting(false);
    }
  };

  // Check if draft was created today (enforce same-day editing)
  const isCreatedToday = (visit) => {
    if (!visit) return false;
    const today = new Date().toISOString().split('T')[0];
    const visitDate = new Date(visit.createdAt).toISOString().split('T')[0];
    return visitDate === today;
  };

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* ---------------- VIEW 1: QUEUE & ARCHIVE LIST ---------------- */}
      {viewState === 'list' && (
        <>
          <div className="flex justify-between items-center flex-wrap gap-md">
            <div>
              <h1 className="h1">{t('visits.title')}</h1>
              <p className="text-muted text-sm">{t('visits.subtitle')}</p>
            </div>
            
            {/* Tab navigation */}
            <div className="flex btn-group" style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setActiveTab('queue')}
                className="btn btn-sm flex items-center gap-xs"
                style={{
                  borderRadius: 0,
                  backgroundColor: activeTab === 'queue' ? 'var(--primary)' : 'var(--surface)',
                  color: activeTab === 'queue' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  border: 'none'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span>
                {t('visits.active_queue')} ({activeQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className="btn btn-sm flex items-center gap-xs"
                style={{
                  borderRadius: 0,
                  backgroundColor: activeTab === 'archive' ? 'var(--primary)' : 'var(--surface)',
                  color: activeTab === 'archive' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  border: 'none'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>inventory_2</span>
                {t('visits.recent_visits')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="card flex items-center justify-center p-xl" style={{ minHeight: '400px' }}>
              <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
                progress_activity
              </span>
            </div>
          ) : activeTab === 'queue' ? (
            /* Consultation Queue Card */
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>{t('visits.active_queue')}</h3>
              {activeQueue.length === 0 ? (
                <div className="text-center p-xl flex flex-col items-center gap-xs">
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>clinical_notes</span>
                  <p className="text-muted font-semibold">{t('visits.no_queue')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{currentLang === 'ar' ? 'المريض' : 'Patient'}</th>
                        <th>{currentLang === 'ar' ? 'الطبيب المعالج' : 'Attending Doctor'}</th>
                        <th>{currentLang === 'ar' ? 'التاريخ والوقت' : 'Appointment Time'}</th>
                        <th>{currentLang === 'ar' ? 'الحالة' : 'Queue Status'}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeQueue.map((appt) => (
                        <tr key={appt.id} className="hoverable">
                          <td className="font-semibold text-primary">
                            {getPatientName(appt.patient)}
                            <span className="text-muted text-xs block font-normal">#{appt.patient?.patientCode || appt.patientId}</span>
                          </td>
                          <td>{getDoctorName(appt.doctor)}</td>
                          <td>
                            <span className="font-medium">{appt.date} • {appt.startTime.substring(0, 5)}</span>
                          </td>
                          <td>
                            <span className={`badge ${appt.status === 'in_progress' ? 'badge-warning' : 'badge-info'}`}>
                              {t(`appointments.status_${appt.status}`)}
                            </span>
                          </td>
                          <td>
                            {appt.status === 'in_progress' ? (
                              <button
                                onClick={() => handleResumeConsultation(appt.visitId || appt.id)}
                                className="btn btn-primary btn-sm flex items-center gap-xs"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_document</span>
                                <span>{t('visits.resume_exam')}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartConsultation(appt.id)}
                                className="btn btn-primary btn-sm flex items-center gap-xs"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>play_circle</span>
                                <span>{t('visits.start_exam')}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Archive Card */
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>{t('visits.recent_visits')}</h3>
              {recentVisits.length === 0 ? (
                <div className="text-center p-xl flex flex-col items-center gap-xs">
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>history</span>
                  <p className="text-muted font-semibold">{t('visits.no_visits')}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{currentLang === 'ar' ? 'كود الفحص' : 'Visit ID'}</th>
                        <th>{currentLang === 'ar' ? 'المريض' : 'Patient'}</th>
                        <th>{currentLang === 'ar' ? 'الطبيب' : 'Attending Doctor'}</th>
                        <th>{currentLang === 'ar' ? 'تاريخ الدخول' : 'Check In Date'}</th>
                        <th>{currentLang === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentVisits.map((v) => {
                        const canEdit = v.status === 'in_progress' && isCreatedToday(v);
                        return (
                          <tr key={v.id} className="hoverable">
                            <td className="font-semibold text-primary">#{v.id}</td>
                            <td className="font-semibold">{getPatientName(v.patient)}</td>
                            <td>{getDoctorName(v.doctor)}</td>
                            <td>{new Date(v.checkInTime).toLocaleString(currentLang)}</td>
                            <td>
                              <span className={`badge ${v.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                {v.status === 'completed' ? (currentLang === 'ar' ? 'مكتملة' : 'Finalized') : (currentLang === 'ar' ? 'مسودة' : 'Draft')}
                              </span>
                            </td>
                            <td>
                              {canEdit ? (
                                <button
                                  onClick={() => handleResumeConsultation(v.id)}
                                  className="btn btn-primary btn-sm flex items-center gap-xs"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_document</span>
                                  <span>{t('visits.resume_exam')}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setViewingVisit(v)}
                                  className="btn btn-secondary btn-sm flex items-center gap-xs"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                                  <span>{t('visits.view_visit')}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ---------------- VIEW 2: ACTIVE CONSULTATION EDITOR WORKSPACE ---------------- */}
      {viewState === 'editor' && activeVisit && (
        <div className="flex flex-col gap-md">
          {/* Workspace Title & Actions Header */}
          <div className="flex justify-between items-center flex-wrap gap-md">
            <div>
              <h1 className="h1">{t('visits.documenting_title')} #{activeVisit.id}</h1>
              <p className="text-muted text-sm">
                {currentLang === 'ar' ? 'بدء الفحص في: ' : 'Checked In at: '} 
                {new Date(activeVisit.checkInTime).toLocaleTimeString(currentLang)}
              </p>
            </div>
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من العودة؟ أي تغييرات غير محفوظة ستفقد.' : 'Are you sure you want to go back? Unsaved progress will be lost.')) {
                    setViewState('list');
                  }
                }}
                className="btn btn-outline"
                disabled={submitting}
              >
                {currentLang === 'ar' ? 'العودة للقائمة' : 'Close Workspace'}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn btn-secondary"
                disabled={submitting}
              >
                {submitting ? t('common.loading') : t('visits.save_draft')}
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? t('common.loading') : t('visits.finalize_exam')}
              </button>
            </div>
          </div>

          {/* Patient Header Banner */}
          <div className="card flex justify-between items-center flex-wrap gap-md" style={{ padding: '16px', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', border: 'none' }}>
            <div className="flex items-center gap-md">
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>person</span>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#white', color: '#ffffff' }}>
                  {getPatientName(activeVisit.patient)}
                </h2>
                <p className="text-xs" style={{ opacity: 0.9, marginTop: '2px' }}>
                  {activeVisit.patient?.gender === 'male' ? t('patients.male') : t('patients.female')} • {calculateAge(activeVisit.patient?.dateOfBirth)} {currentLang === 'ar' ? 'عام' : 'years old'} • ID: #{activeVisit.patientId}
                </p>
              </div>
            </div>

            <div className="flex gap-sm flex-wrap">
              {activeVisit.patient?.allergies && (
                <span className="badge badge-error text-xs" style={{ padding: '6px 12px' }}>
                  {t('patients.allergies')}: {activeVisit.patient.allergies}
                </span>
              )}
              {activeVisit.patient?.bloodType && (
                <span className="badge badge-success text-xs" style={{ padding: '6px 12px' }}>
                  {t('patients.blood_type')}: {activeVisit.patient.bloodType}
                </span>
              )}
            </div>
          </div>

          {/* Split Screen Workspace Grid */}
          <div className="grid grid-cols-3 gap-lg">
            
            {/* LEFT 2 COLS: Examination Form Inputs */}
            <div className="flex flex-col gap-lg" style={{ gridColumn: 'span 2' }}>
              
              {/* Vitals Form Card */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                  {t('visits.vitals')}
                </h3>
                <div className="grid grid-cols-5 gap-md">
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('visits.bp')}</label>
                    <input
                      type="text"
                      name="bp"
                      placeholder="120/80"
                      value={vitalSigns.bp}
                      onChange={handleVitalChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('visits.temp')}</label>
                    <input
                      type="number"
                      step="0.1"
                      name="temp"
                      placeholder="37.0"
                      value={vitalSigns.temp}
                      onChange={handleVitalChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('visits.pulse')}</label>
                    <input
                      type="number"
                      name="pulse"
                      placeholder="72"
                      value={vitalSigns.pulse}
                      onChange={handleVitalChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('visits.weight')}</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      placeholder="70"
                      value={vitalSigns.weight}
                      onChange={handleVitalChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('visits.height')}</label>
                    <input
                      type="number"
                      name="height"
                      placeholder="170"
                      value={vitalSigns.height}
                      onChange={handleVitalChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Complaints & Notes Form Card */}
              <div className="card" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '13px' }}>{t('visits.chief_complaint')} *</label>
                  <textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="form-control"
                    rows="3"
                    placeholder={currentLang === 'ar' ? 'وصف شكوى المريض والأعراض الأساسية...' : 'Describe patient symptoms and history of chief complaints...'}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, marginTop: '16px' }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>{t('visits.exam_notes')}</label>
                  <textarea
                    value={examinationNotes}
                    onChange={(e) => setExaminationNotes(e.target.value)}
                    className="form-control"
                    rows="4"
                    placeholder={currentLang === 'ar' ? 'ملاحظات الفحص البدني ونتائج الفحص الإكلينيكي...' : 'Write notes on physical examination findings and clinical assessments...'}
                  />
                </div>
              </div>

              {/* Diagnoses Card Workspace */}
              <div className="card" style={{ padding: '20px' }}>
                <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{t('visits.diagnoses')}</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddDiagForm(!showAddDiagForm)}
                    className="btn btn-outline btn-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    {t('visits.add_diagnosis')}
                  </button>
                </div>

                {/* Local Add Diagnosis Inline Form */}
                {showAddDiagForm && (
                  <div className="card mb-md p-md flex flex-col gap-sm" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline)' }}>
                    <div className="grid grid-cols-3 gap-sm">
                      <div className="form-group">
                        <label className="text-xs font-semibold">{t('visits.icd_code')}</label>
                        <input
                          type="text"
                          placeholder="e.g. J06.9"
                          value={newDiagnosis.icdCode}
                          onChange={(e) => setNewDiagnosis(prev => ({ ...prev, icdCode: e.target.value }))}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="text-xs font-semibold">{t('visits.diagnosis_name')} *</label>
                        <input
                          type="text"
                          placeholder="e.g. Common cold"
                          value={newDiagnosis.diagnosisName}
                          onChange={(e) => setNewDiagnosis(prev => ({ ...prev, diagnosisName: e.target.value }))}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-sm">
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="text-xs font-semibold">{t('visits.diagnosis_name_ar')}</label>
                        <input
                          type="text"
                          placeholder="مثال: نزلات البرد"
                          value={newDiagnosis.diagnosisNameAr}
                          onChange={(e) => setNewDiagnosis(prev => ({ ...prev, diagnosisNameAr: e.target.value }))}
                          className="form-control"
                          style={{ textAlign: 'right' }}
                        />
                      </div>

                      <div className="form-group" style={{ justifyContent: 'center' }}>
                        <div className="flex items-center gap-xs" style={{ marginTop: '22px' }}>
                          <input
                            type="checkbox"
                            id="is_primary_diag"
                            checked={newDiagnosis.isPrimary}
                            onChange={(e) => setNewDiagnosis(prev => ({ ...prev, isPrimary: e.target.checked }))}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <label htmlFor="is_primary_diag" className="font-semibold text-xs" style={{ cursor: 'pointer' }}>
                            {t('visits.primary')}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="text-xs font-semibold">{t('visits.diagnosis_notes')}</label>
                      <input
                        type="text"
                        placeholder="..."
                        value={newDiagnosis.notes}
                        onChange={(e) => setNewDiagnosis(prev => ({ ...prev, notes: e.target.value }))}
                        className="form-control"
                      />
                    </div>

                    <div className="flex justify-end gap-sm" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '10px' }}>
                      <button type="button" onClick={() => setShowAddDiagForm(false)} className="btn btn-outline btn-sm">
                        {t('common.cancel')}
                      </button>
                      <button type="button" onClick={handleAddDiagnosis} className="btn btn-primary btn-sm">
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Diagnoses List */}
                {diagnoses.length === 0 ? (
                  <p className="text-muted text-xs text-center p-md">{currentLang === 'ar' ? 'لا يوجد تشخيصات مسجلة بعد لهذا الفحص.' : 'No diagnoses added yet.'}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>{t('visits.primary')}</th>
                          <th>{t('visits.icd_code')}</th>
                          <th>{t('visits.diagnosis_name')}</th>
                          <th>{t('visits.diagnosis_notes')}</th>
                          <th>{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnoses.map((diag, index) => (
                          <tr key={index} className="hoverable">
                            <td>
                              <input
                                type="checkbox"
                                checked={diag.isPrimary}
                                onChange={() => handleTogglePrimary(index)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td>
                              {diag.icdCode ? (
                                <span className="badge badge-info text-xs">{diag.icdCode}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div>
                                <strong className="block">{diag.diagnosisName}</strong>
                                {diag.diagnosisNameAr && <span className="text-muted text-xs block">{diag.diagnosisNameAr}</span>}
                              </div>
                            </td>
                            <td>
                              <span className="text-xs font-normal text-muted">{diag.notes || '-'}</span>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleRemoveDiagnosis(index)}
                                className="btn btn-outline btn-sm text-error"
                                style={{ padding: '4px 8px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Prescription Card Workspace */}
              <div className="card" style={{ padding: '20px', marginTop: '16px' }}>
                <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{t('prescriptions.rx_items')}</h3>
                  {activePrescription ? (
                    <div className="flex gap-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setPrescriptionItems(activePrescription.items || []);
                          setPrescriptionNotes(activePrescription.notes || '');
                          setPrescriptionNotesAr(activePrescription.notesAr || '');
                          setShowPrescriptionModal(true);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                        {t('prescriptions.edit_prescription')}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeletePrescription}
                        className="btn btn-outline btn-sm text-error"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        {t('prescriptions.delete_prescription')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-sm items-center">
                      {pastPrescriptions.length > 0 && (
                        <div className="flex items-center gap-xs">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleClonePrescription(e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="form-control form-control-sm"
                            style={{ width: '220px', padding: '4px 8px', fontSize: '12px' }}
                            defaultValue=""
                          >
                            <option value="" disabled>{t('prescriptions.clone_prescription')}</option>
                            {pastPrescriptions.map((rx) => (
                              <option key={rx.id} value={rx.id}>
                                {currentLang === 'ar'
                                  ? `وصفة #${rx.id} (${rx.items?.length || 0} أدوية) - ${new Date(rx.createdAt).toLocaleDateString(currentLang)}`
                                  : `Rx #${rx.id} (${rx.items?.length || 0} meds) - ${new Date(rx.createdAt).toLocaleDateString(currentLang)}`
                                }
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPrescriptionItems([]);
                          setPrescriptionNotes('');
                          setPrescriptionNotesAr('');
                          setShowPrescriptionModal(true);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        {t('prescriptions.add_prescription')}
                      </button>
                    </div>
                  )}
                </div>

                {activePrescription ? (
                  <div className="table-responsive">
                    <table className="table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>{t('prescriptions.medication_name')}</th>
                          <th>{t('prescriptions.route')} / {t('prescriptions.dosage')}</th>
                          <th>{t('prescriptions.frequency')}</th>
                          <th>{t('prescriptions.duration')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activePrescription.items || []).map((med, idx) => (
                          <tr key={idx} className="hoverable">
                            <td>
                              <div>
                                <strong className="block text-primary">{med.medicationName}</strong>
                                {med.instructions && <span className="text-muted text-xs block">{med.instructions}</span>}
                                {med.instructionsAr && <span className="text-muted text-xs block" style={{ direction: 'rtl', textAlign: 'right' }}>{med.instructionsAr}</span>}
                              </div>
                            </td>
                            <td>{med.route || 'Oral'} • {med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(activePrescription.notes || activePrescription.notesAr) && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid var(--outline-variant)', paddingTop: '8px', fontSize: '12px' }}>
                        <strong>{t('prescriptions.notes')}:</strong>
                        {activePrescription.notes && <p className="text-muted" style={{ margin: '4px 0 0 0' }}>{activePrescription.notes}</p>}
                        {activePrescription.notesAr && <p className="text-muted" style={{ margin: '4px 0 0 0', direction: 'rtl', textAlign: 'right' }}>{activePrescription.notesAr}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted text-xs text-center p-md">
                    {currentLang === 'ar'
                      ? 'لا يوجد وصفة طبية مسجلة بعد لهذا الفحص.'
                      : 'No prescription added yet.'}
                  </p>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN 1: Clinical History Sidebar */}
            <div className="flex flex-col gap-lg" style={{ gridColumn: 'span 1' }}>
              <div className="card" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px' }}>
                  {t('visits.history_panel')}
                </h3>
                
                {patientTimeline.length === 0 ? (
                  <p className="text-muted text-xs text-center p-md">{currentLang === 'ar' ? 'لا يوجد تاريخ كشف طبي سابق.' : 'No prior clinical history available.'}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderInlineStart: '2px solid var(--outline-variant)', paddingInlineStart: '12px', marginInlineStart: '6px' }}>
                    {patientTimeline.map((h) => (
                      <div key={h.id} className="relative" style={{ fontSize: '12px' }}>
                        
                        {/* Bullet point on line */}
                        <div
                          style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            insetInlineStart: '-18px',
                            top: '4px'
                          }}
                        />

                        {/* Date & Doctor */}
                        <div className="font-bold text-xs flex justify-between" style={{ marginBottom: '4px' }}>
                          <span>{new Date(h.checkInTime).toLocaleDateString(currentLang)}</span>
                          <span className="text-muted">{getDoctorName(h.doctor)}</span>
                        </div>

                        {/* Vitals summary */}
                        {h.vitalSigns && (
                          <div style={{ color: 'var(--on-surface-variant)', fontSize: '11px', marginBottom: '4px' }}>
                            <span>BP: {h.vitalSigns.bp || 'N/A'} • Temp: {h.vitalSigns.temp ? `${h.vitalSigns.temp}°C` : 'N/A'}</span>
                          </div>
                        )}

                        {/* Diagnoses */}
                        {h.diagnoses && h.diagnoses.length > 0 && (
                          <div className="flex flex-wrap gap-xs" style={{ marginBottom: '4px' }}>
                            {h.diagnoses.map((d, dIdx) => (
                              <span key={dIdx} className="badge badge-info" style={{ fontSize: '9px', padding: '2px 4px' }}>
                                {currentLang === 'ar' && d.diagnosisNameAr ? d.diagnosisNameAr : d.diagnosisName}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes snippet */}
                        {h.chiefComplaint && (
                          <p className="text-muted text-xs italic truncate" style={{ margin: 0 }}>
                            "{h.chiefComplaint}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* READ ONLY VIEW MODAL FOR COMPLETED VISITS */}
      {viewingVisit && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div className="card modal-content w-full" style={{ maxWidth: '650px', padding: '24px', boxShadow: 'var(--elevation-3)' }}>
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {currentLang === 'ar' ? 'تقرير الفحص الطبي' : 'Clinical Consultation Record'} #{viewingVisit.id}
              </h2>
              <button
                onClick={() => setViewingVisit(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-md">
              {/* Patient Banner */}
              <div className="grid grid-cols-2 gap-md" style={{ backgroundColor: 'var(--surface-container-low)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <span className="text-muted text-xs block font-semibold">{t('appointments.patient')}</span>
                  <span className="font-bold text-sm text-primary">{getPatientName(viewingVisit.patient)}</span>
                  <span className="text-muted text-xs block">#{viewingVisit.patient?.patientCode || viewingVisit.patientId}</span>
                </div>
                <div>
                  <span className="text-muted text-xs block font-semibold">{t('appointments.doctor')}</span>
                  <span className="font-bold text-sm">{getDoctorName(viewingVisit.doctor)}</span>
                </div>
              </div>

              {/* Vitals Summary */}
              {viewingVisit.vitalSigns && (
                <div>
                  <span className="text-muted text-xs block font-semibold mb-xs">{t('visits.vitals')}</span>
                  <div className="grid grid-cols-5 gap-sm text-center p-sm" style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', fontSize: '12px' }}>
                    <div>
                      <strong className="text-muted block">{currentLang === 'ar' ? 'الضغط' : 'BP'}</strong>
                      <span>{viewingVisit.vitalSigns.bp || 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-muted block">{currentLang === 'ar' ? 'الحرارة' : 'Temp'}</strong>
                      <span>{viewingVisit.vitalSigns.temp ? `${viewingVisit.vitalSigns.temp} °C` : 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-muted block">{currentLang === 'ar' ? 'النبض' : 'Pulse'}</strong>
                      <span>{viewingVisit.vitalSigns.pulse ? `${viewingVisit.vitalSigns.pulse} bpm` : 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-muted block">{currentLang === 'ar' ? 'الوزن' : 'Weight'}</strong>
                      <span>{viewingVisit.vitalSigns.weight ? `${viewingVisit.vitalSigns.weight} kg` : 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-muted block">{currentLang === 'ar' ? 'الطول' : 'Height'}</strong>
                      <span>{viewingVisit.vitalSigns.height ? `${viewingVisit.vitalSigns.height} cm` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chief Complaint */}
              {viewingVisit.chiefComplaint && (
                <div>
                  <span className="text-muted text-xs block font-semibold">{t('visits.chief_complaint')}</span>
                  <p className="p-sm text-xs card" style={{ backgroundColor: 'var(--surface-container-low)', border: 'none', marginTop: '4px' }}>
                    {viewingVisit.chiefComplaint}
                  </p>
                </div>
              )}

              {/* Exam Notes */}
              {viewingVisit.examinationNotes && (
                <div>
                  <span className="text-muted text-xs block font-semibold">{t('visits.exam_notes')}</span>
                  <p className="p-sm text-xs card" style={{ backgroundColor: 'var(--surface-container-low)', border: 'none', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                    {viewingVisit.examinationNotes}
                  </p>
                </div>
              )}

              {/* Diagnoses List */}
              {viewingVisit.diagnoses && viewingVisit.diagnoses.length > 0 && (
                <div>
                  <span className="text-muted text-xs block font-semibold mb-xs">{t('visits.diagnoses')}</span>
                  <div className="flex flex-col gap-xs">
                    {viewingVisit.diagnoses.map((diag, index) => (
                      <div key={index} className="flex justify-between items-center p-sm" style={{ border: '1px solid var(--outline-variant)', borderRadius: '6px', backgroundColor: 'var(--surface-container-low)' }}>
                        <div style={{ fontSize: '13px' }}>
                          <span className="font-semibold">{diag.icdCode ? `[${diag.icdCode}] ` : ''}</span>
                          <span className="font-semibold">{currentLang === 'ar' && diag.diagnosisNameAr ? diag.diagnosisNameAr : diag.diagnosisName}</span>
                          {diag.notes && <span className="text-muted text-xs block font-normal">{diag.notes}</span>}
                        </div>
                        {diag.isPrimary && (
                          <span className="badge badge-success text-xs">
                            {t('visits.primary')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION BUILDER MODAL */}
      {showPrescriptionModal && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div className="card modal-content w-full flex flex-col gap-md" style={{ maxWidth: '800px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--elevation-3)' }}>
            
            {/* Header */}
            <div className="flex justify-between items-center pb-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {activePrescription ? t('prescriptions.edit_prescription') : t('prescriptions.add_prescription')}
              </h2>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-md">
              
              {/* Form inputs for Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="text-xs font-semibold">{t('prescriptions.notes')}</label>
                  <textarea
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    className="form-control"
                    rows="2"
                    placeholder="General instructions or notes..."
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold">{t('prescriptions.notes_ar')}</label>
                  <textarea
                    value={prescriptionNotesAr}
                    onChange={(e) => setPrescriptionNotesAr(e.target.value)}
                    className="form-control"
                    rows="2"
                    placeholder="ملاحظات أو تعليمات عامة باللغة العربية..."
                    style={{ textAlign: 'right', direction: 'rtl' }}
                  />
                </div>
              </div>

              {/* Add Medication Item Sub-form */}
              <div className="card p-md flex flex-col gap-sm" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{t('prescriptions.add_medication')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.medication_name')} *</label>
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin 500mg"
                      value={newMedication.medicationName}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, medicationName: e.target.value }))}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.dosage')} *</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 capsule"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.frequency')} *</label>
                    <input
                      type="text"
                      placeholder="e.g. Three times daily"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.route')}</label>
                    <select
                      value={newMedication.route}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, route: e.target.value }))}
                      className="form-control"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Intravenous">Intravenous</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Topical">Topical</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Ophthalmic">Ophthalmic</option>
                      <option value="Otic">Otic</option>
                      <option value="Subcutaneous">Subcutaneous</option>
                      <option value="Sublingual">Sublingual</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.duration')} *</label>
                    <input
                      type="text"
                      placeholder="e.g. 7 days"
                      value={newMedication.duration}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.instructions')}</label>
                    <input
                      type="text"
                      placeholder="e.g. Take after meals"
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('prescriptions.instructions_ar')}</label>
                    <input
                      type="text"
                      placeholder="مثال: يؤخذ بعد الطعام"
                      value={newMedication.instructionsAr}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, instructionsAr: e.target.value }))}
                      className="form-control"
                      style={{ textAlign: 'right', direction: 'rtl' }}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMedication.medicationName || !newMedication.dosage || !newMedication.frequency || !newMedication.duration) {
                        toastError(currentLang === 'ar' ? 'يرجى ملء الحقول المطلوبة للدواء (الاسم، الجرعة، التكرار، والمدة)' : 'Please fill in required medication fields (Name, Dosage, Frequency, Duration)');
                        return;
                      }
                      setPrescriptionItems(prev => [...prev, newMedication]);
                      setNewMedication({
                        medicationName: '',
                        dosage: '',
                        frequency: '',
                        route: 'Oral',
                        duration: '',
                        instructions: '',
                        instructionsAr: ''
                      });
                    }}
                    className="btn btn-secondary btn-sm flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    {t('prescriptions.add_medication')}
                  </button>
                </div>
              </div>

              {/* Added Medications Table */}
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  {t('prescriptions.rx_items')} ({prescriptionItems.length})
                </h4>
                {prescriptionItems.length === 0 ? (
                  <p className="text-muted text-xs text-center p-md" style={{ border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                    {currentLang === 'ar' ? 'لا يوجد أدوية مضافة بعد.' : 'No medication items added yet.'}
                  </p>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>{t('prescriptions.medication_name')}</th>
                          <th>{t('prescriptions.route')} / {t('prescriptions.dosage')}</th>
                          <th>{t('prescriptions.frequency')}</th>
                          <th>{t('prescriptions.duration')}</th>
                          <th>{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptionItems.map((med, index) => (
                          <tr key={index} className="hoverable">
                            <td>
                              <div>
                                <strong className="block text-primary">{med.medicationName}</strong>
                                {med.instructions && <span className="text-muted text-xs block">{med.instructions}</span>}
                                {med.instructionsAr && <span className="text-muted text-xs block" style={{ direction: 'rtl', textAlign: 'right' }}>{med.instructionsAr}</span>}
                              </div>
                            </td>
                            <td>{med.route || 'Oral'} • {med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="btn btn-outline btn-sm text-error"
                                style={{ padding: '4px 8px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-sm pt-md" style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="btn btn-outline"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (prescriptionItems.length === 0) {
                    toastError(t('prescriptions.no_items'));
                    return;
                  }
                  try {
                    const payload = {
                      notes: prescriptionNotes || undefined,
                      notesAr: prescriptionNotesAr || undefined,
                      items: prescriptionItems
                    };
                    if (activePrescription) {
                      const res = await client.patch(`/prescriptions/${activePrescription.id}`, payload);
                      setActivePrescription(res.data);
                    } else {
                      const res = await client.post('/prescriptions', {
                        ...payload,
                        visitId: activeVisit.id
                      });
                      setActivePrescription(res.data);
                    }
                    toastSuccess(t('prescriptions.saved_success'));
                    setShowPrescriptionModal(false);
                  } catch (err) {
                    const detail = err.response?.data?.message;
                    toastError(Array.isArray(detail) ? detail.join(', ') : (detail || err.message || t('common.error')));
                  }
                }}
                className="btn btn-primary"
              >
                {t('common.save')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Visits;
