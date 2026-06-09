import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const AdminSettings = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const currentLang = i18n.language;

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState('services'); // services, staff, settings

  // ==========================================
  // 1. SERVICES CATALOG STATES & METHODS
  // ==========================================
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    code: '',
    name: '',
    nameAr: '',
    price: '',
    description: '',
    descriptionAr: '',
    durationMinutes: 30,
    isActive: true,
  });

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const res = await client.get('/services?limit=100');
      setServices(res.data.data || res.data || []);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoadingServices(false);
    }
  };

  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        code: service.code || '',
        name: service.name || '',
        nameAr: service.nameAr || '',
        price: service.price || '',
        description: service.description || '',
        descriptionAr: service.descriptionAr || '',
        durationMinutes: service.durationMinutes || 30,
        isActive: service.isActive !== false,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        code: '',
        name: '',
        nameAr: '',
        price: '',
        description: '',
        descriptionAr: '',
        durationMinutes: 30,
        isActive: true,
      });
    }
    setServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceForm.code || !serviceForm.name || !serviceForm.price) {
      toastError(t('auth.login.validation.required'));
      return;
    }
    try {
      const payload = {
        ...serviceForm,
        price: parseFloat(serviceForm.price),
        durationMinutes: parseInt(serviceForm.durationMinutes, 10),
      };

      if (editingService) {
        await client.patch(`/services/${editingService.id}`, payload);
      } else {
        await client.post('/services', payload);
      }
      toastSuccess(t('common.success'));
      setServiceModalOpen(false);
      fetchServices();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    }
  };

  const handleDeactivateService = async (id) => {
    if (window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من إلغاء تنشيط هذه الخدمة؟' : 'Are you sure you want to deactivate this service?')) {
      try {
        await client.delete(`/services/${id}`);
        toastSuccess(t('common.success'));
        fetchServices();
      } catch (error) {
        toastError(error.message || t('common.error'));
      }
    }
  };

  // ==========================================
  // 2. STAFF ACCOUNTS STATES & METHODS
  // ==========================================
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    phone: '',
    roleId: '',
    isActive: true,
  });

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await client.get(`/users?search=${userSearch}`);
      setUsers(res.data || []);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await client.get('/users/roles');
      setRoles(res.data || []);
    } catch (error) {
      console.error('Failed to load roles', error);
    }
  };

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        email: user.email || '',
        password: '', // Kept empty for editing
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        firstNameAr: user.firstNameAr || '',
        lastNameAr: user.lastNameAr || '',
        phone: user.phone || '',
        roleId: user.roleId || '',
        isActive: user.isActive !== false,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        firstNameAr: '',
        lastNameAr: '',
        phone: '',
        roleId: roles[0]?.id || '',
        isActive: true,
      });
    }
    setUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.email || !userForm.firstName || !userForm.lastName || !userForm.roleId) {
      toastError(t('auth.login.validation.required'));
      return;
    }
    if (!editingUser && !userForm.password) {
      toastError(t('auth.login.validation.required'));
      return;
    }
    try {
      const payload = {
        ...userForm,
        roleId: parseInt(userForm.roleId, 10),
      };
      if (editingUser) {
        if (!payload.password) delete payload.password; // Don't send empty passwords
        await client.patch(`/users/${editingUser.id}`, payload);
      } else {
        await client.post('/users', payload);
      }
      toastSuccess(t('common.success'));
      setUserModalOpen(false);
      fetchUsers();
    } catch (error) {
      const detail = error.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || error.message || t('common.error')));
    }
  };

  const handleDeactivateUser = async (id) => {
    if (window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من إيقاف حساب هذا الموظف؟' : 'Are you sure you want to deactivate this account?')) {
      try {
        await client.delete(`/users/${id}`);
        toastSuccess(t('common.success'));
        fetchUsers();
      } catch (error) {
        toastError(error.message || t('common.error'));
      }
    }
  };

  // ==========================================
  // 3. CLINIC CONFIG STATES & METHODS
  // ==========================================
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    clinicName: '',
    clinicNameAr: '',
    address: '',
    addressAr: '',
    phone: '',
    email: '',
    taxRate: 15.00,
    currency: 'SAR',
    defaultLanguage: 'en',
  });
  const [workingHours, setWorkingHours] = useState([]);

  // ==========================================
  // 4. AUDIT LOGS STATES & METHODS
  // ==========================================
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit] = useState(15);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditAction, setAuditAction] = useState('');
  const [auditEntityType, setAuditEntityType] = useState('');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');
  
  // Available filters from backend
  const [availableActions, setAvailableActions] = useState([]);
  const [availableEntityTypes, setAvailableEntityTypes] = useState([]);

  // Diff Modal states
  const [selectedLog, setSelectedLog] = useState(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const params = new URLSearchParams({
        page: auditPage.toString(),
        limit: auditLimit.toString(),
        search: auditSearch,
        action: auditAction,
        entityType: auditEntityType,
        dateFrom: auditDateFrom,
        dateTo: auditDateTo,
      });
      const res = await client.get(`/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.data || []);
      setAuditTotal(res.data.total || 0);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchAuditFilters = async () => {
    try {
      const res = await client.get('/audit-logs/filters');
      setAvailableActions(res.data.actions || []);
      setAvailableEntityTypes(res.data.entityTypes || []);
    } catch (error) {
      console.error('Failed to load audit filters', error);
    }
  };

  const openDiffModal = (log) => {
    setSelectedLog(log);
    setDiffModalOpen(true);
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await client.get('/clinic-settings');
      if (res.data) {
        setSettingsForm({
          clinicName: res.data.clinicName || '',
          clinicNameAr: res.data.clinicNameAr || '',
          address: res.data.address || '',
          addressAr: res.data.addressAr || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          taxRate: parseFloat(res.data.taxRate) || 15.00,
          currency: res.data.currency || 'SAR',
          defaultLanguage: res.data.defaultLanguage || 'en',
        });
        setWorkingHours(res.data.workingHours || []);
      }
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      const payload = {
        ...settingsForm,
        taxRate: parseFloat(settingsForm.taxRate),
        workingHours,
      };
      await client.patch('/clinic-settings', payload);
      toastSuccess(t('admin.settings.save_success'));
      fetchSettings();
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setSubmittingSettings(false);
    }
  };

  // Working Hours Helper Methods
  const addDaySchedule = () => {
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

  // Load resources based on tab
  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'staff') {
      fetchUsers();
      fetchRoles();
    } else if (activeTab === 'settings') {
      fetchSettings();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
      fetchAuditFilters();
    }
  }, [activeTab, userSearch, auditPage, auditAction, auditEntityType, auditDateFrom, auditDateTo, auditSearch]);

  const getRoleLabel = (roleName) => {
    return t(`admin.staff.roles.${roleName}`, { defaultValue: roleName });
  };

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Title Header */}
      <div>
        <h1 className="h1">{t('admin.title')}</h1>
        <p className="text-muted text-sm">{t('admin.subtitle')}</p>
      </div>

      {/* Tab Select Header */}
      <div className="card" style={{ padding: '8px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('services')}
          className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ flexGrow: 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
            medical_services
          </span>
          {t('admin.tabs.services')}
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ flexGrow: 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
            badge
          </span>
          {t('admin.tabs.staff')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ flexGrow: 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
            settings
          </span>
          {t('admin.tabs.settings')}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ flexGrow: 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginInlineEnd: '6px' }}>
            receipt_long
          </span>
          {t('admin.tabs.audit')}
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="flex flex-col gap-md">
        
        {/* ==========================================
            TAB: SERVICES CATALOG
            ========================================== */}
        {activeTab === 'services' && (
          <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center flex-wrap gap-sm">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('admin.services.title')}</h3>
              <button onClick={() => handleOpenServiceModal()} className="btn btn-primary btn-sm flex items-center gap-xs">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                {t('admin.services.add_service')}
              </button>
            </div>

            <div className="card">
              {loadingServices ? (
                <div className="flex items-center justify-center p-xl" style={{ minHeight: '200px' }}>
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '36px' }}>
                    progress_activity
                  </span>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center p-xl text-muted">{t('patients.details.no_records')}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t('admin.services.code')}</th>
                        <th>{currentLang === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th>{t('admin.services.price')}</th>
                        <th>{t('admin.services.duration')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((srv) => (
                        <tr key={srv.id}>
                          <td className="font-semibold text-primary">{srv.code}</td>
                          <td>{currentLang === 'ar' && srv.nameAr ? srv.nameAr : srv.name}</td>
                          <td className="font-semibold">${Number(srv.price).toFixed(2)}</td>
                          <td>{srv.durationMinutes} mins</td>
                          <td>
                            <span className={`badge ${srv.isActive ? 'badge-success' : 'badge-error'}`}>
                              {srv.isActive ? t('doctors.active') : t('doctors.inactive')}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-xs">
                              <button onClick={() => handleOpenServiceModal(srv)} className="btn btn-outline btn-sm">
                                {t('common.edit')}
                              </button>
                              {srv.isActive && (
                                <button onClick={() => handleDeactivateService(srv.id)} className="btn btn-error btn-sm">
                                  {t('doctors.remove')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: STAFF ACCOUNTS
            ========================================== */}
        {activeTab === 'staff' && (
          <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center flex-wrap gap-sm">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('admin.staff.title')}</h3>
              <button onClick={() => handleOpenUserModal()} className="btn btn-primary btn-sm flex items-center gap-xs">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                {t('admin.staff.add_staff')}
              </button>
            </div>

            {/* Filter Search */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="input-group" style={{ position: 'relative' }}>
                <span className="material-symbols-outlined text-muted" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', marginInlineStart: '12px' }}>
                  search
                </span>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="form-control"
                  placeholder={t('patients.search_placeholder')}
                  style={{ paddingInlineStart: '38px', width: '100%' }}
                />
              </div>
            </div>

            <div className="card">
              {loadingUsers ? (
                <div className="flex items-center justify-center p-xl" style={{ minHeight: '200px' }}>
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '36px' }}>
                    progress_activity
                  </span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center p-xl text-muted">{t('patients.details.no_records')}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{currentLang === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th>{t('admin.staff.email')}</th>
                        <th>{t('admin.staff.phone')}</th>
                        <th>{t('admin.staff.role')}</th>
                        <th>{t('common.status')}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((usr) => {
                        const name = currentLang === 'ar' && usr.firstNameAr ? `${usr.firstNameAr} ${usr.lastNameAr}` : `${usr.firstName} ${usr.lastName}`;
                        return (
                          <tr key={usr.id}>
                            <td className="font-semibold text-primary">#{usr.id}</td>
                            <td className="font-semibold">{name}</td>
                            <td>{usr.email}</td>
                            <td>{usr.phone || '-'}</td>
                            <td>
                              <span className="badge badge-info">{getRoleLabel(usr.role?.name)}</span>
                            </td>
                            <td>
                              <span className={`badge ${usr.isActive ? 'badge-success' : 'badge-error'}`}>
                                {usr.isActive ? t('doctors.active') : t('doctors.inactive')}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-xs">
                                <button onClick={() => handleOpenUserModal(usr)} className="btn btn-outline btn-sm">
                                  {t('common.edit')}
                                </button>
                                {usr.isActive && (
                                  <button onClick={() => handleDeactivateUser(usr.id)} className="btn btn-error btn-sm">
                                    {t('doctors.remove')}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: CLINIC CONFIG
            ========================================== */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-md">
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('admin.settings.title')}</h3>

            <div className="card" style={{ padding: '24px' }}>
              {loadingSettings ? (
                <div className="flex items-center justify-center p-xl" style={{ minHeight: '200px' }}>
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '36px' }}>
                    progress_activity
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-md">
                  {/* Clinic Names */}
                  <div className="grid grid-cols-2 gap-md">
                    <div className="form-group">
                      <label className="label">{t('admin.settings.clinic_name_en')} *</label>
                      <input
                        type="text"
                        value={settingsForm.clinicName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, clinicName: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">{t('admin.settings.clinic_name_ar')}</label>
                      <input
                        type="text"
                        value={settingsForm.clinicNameAr}
                        onChange={(e) => setSettingsForm({ ...settingsForm, clinicNameAr: e.target.value })}
                        className="form-control"
                        style={{ textAlign: 'right' }}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-2 gap-md">
                    <div className="form-group">
                      <label className="label">{t('admin.settings.address_en')}</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">{t('admin.settings.address_ar')}</label>
                      <input
                        type="text"
                        value={settingsForm.addressAr}
                        onChange={(e) => setSettingsForm({ ...settingsForm, addressAr: e.target.value })}
                        className="form-control"
                        style={{ textAlign: 'right' }}
                      />
                    </div>
                  </div>

                  {/* Public contact info */}
                  <div className="grid grid-cols-2 gap-md">
                    <div className="form-group">
                      <label className="label">{t('admin.settings.phone')}</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">{t('admin.settings.email')}</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Financial & lang default configs */}
                  <div className="grid grid-cols-3 gap-md">
                    <div className="form-group">
                      <label className="label">{t('admin.settings.tax_rate')} *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settingsForm.taxRate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">{t('admin.settings.currency')} *</label>
                      <input
                        type="text"
                        value={settingsForm.currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">{t('admin.settings.default_lang')} *</label>
                      <select
                        value={settingsForm.defaultLanguage}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultLanguage: e.target.value })}
                        className="form-control"
                        required
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>

                  {/* Clinic global working hours */}
                  <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                    <div className="flex justify-between items-center mb-md">
                      <div>
                        <h4 className="font-bold text-sm" style={{ margin: 0 }}>{t('doctors.working_hours')}</h4>
                        <p className="text-muted text-xs">{t('doctors.working_hours_subtitle')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={addDaySchedule}
                        className="btn btn-outline btn-sm flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
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
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                                  <span>{t('doctors.add_slot')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeDaySchedule(dayIdx)}
                                  className="btn btn-error btn-sm flex items-center gap-xs"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                  <span>{t('doctors.remove')}</span>
                                </button>
                              </div>
                            </div>

                            {/* Time Slots */}
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
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                    <button type="submit" disabled={submittingSettings} className="btn btn-primary">
                      {submittingSettings ? t('common.loading') : t('common.save')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: AUDIT LOGS
            ========================================== */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center flex-wrap gap-sm">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('admin.audit.title')}</h3>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '20px' }}>
              <div className="grid grid-cols-4 gap-md flex-wrap">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label text-xs">{t('admin.audit.search')}</label>
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}
                    className="form-control"
                    placeholder={t('admin.audit.search_placeholder')}
                    style={{ height: '36px', padding: '0 12px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label text-xs">{t('admin.audit.action_type')}</label>
                  <select
                    value={auditAction}
                    onChange={(e) => { setAuditAction(e.target.value); setAuditPage(1); }}
                    className="form-control"
                    style={{ height: '36px', padding: '0 8px' }}
                  >
                    <option value="">{t('admin.audit.all_actions')}</option>
                    {availableActions.map((act) => (
                      <option key={act} value={act}>
                        {t(`admin.audit.actions.${act}`, { defaultValue: act })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label text-xs">{t('admin.audit.entity_type')}</label>
                  <select
                    value={auditEntityType}
                    onChange={(e) => { setAuditEntityType(e.target.value); setAuditPage(1); }}
                    className="form-control"
                    style={{ height: '36px', padding: '0 8px' }}
                  >
                    <option value="">{t('admin.audit.all_entities')}</option>
                    {availableEntityTypes.map((ent) => (
                      <option key={ent} value={ent}>
                        {t(`admin.audit.entities.${ent}`, { defaultValue: ent })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label text-xs">{t('admin.audit.date_from')}</label>
                    <input
                      type="date"
                      value={auditDateFrom}
                      onChange={(e) => { setAuditDateFrom(e.target.value); setAuditPage(1); }}
                      className="form-control"
                      style={{ height: '36px', padding: '0 8px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label text-xs">{t('admin.audit.date_to')}</label>
                    <input
                      type="date"
                      value={auditDateTo}
                      onChange={(e) => { setAuditDateTo(e.target.value); setAuditPage(1); }}
                      className="form-control"
                      style={{ height: '36px', padding: '0 8px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-sm">
                <button
                  type="button"
                  onClick={() => {
                    setAuditSearch('');
                    setAuditAction('');
                    setAuditEntityType('');
                    setAuditDateFrom('');
                    setAuditDateTo('');
                    setAuditPage(1);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  {t('admin.audit.clear_filters')}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="card">
              {loadingAudit ? (
                <div className="flex items-center justify-center p-xl" style={{ minHeight: '200px' }}>
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '36px' }}>
                    progress_activity
                  </span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center p-xl text-muted">{t('patients.details.no_records')}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t('admin.audit.timestamp')}</th>
                        <th>{t('admin.audit.actor')}</th>
                        <th>{t('admin.audit.action')}</th>
                        <th>{t('admin.audit.target')}</th>
                        <th>{t('admin.audit.ip_address')}</th>
                        <th>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => {
                        const actorName = log.user
                          ? `${currentLang === 'ar' && log.user.firstNameAr ? log.user.firstNameAr : log.user.firstName} ${currentLang === 'ar' && log.user.lastNameAr ? log.user.lastNameAr : log.user.lastName}`
                          : t('admin.audit.system');
                        const actorEmail = log.user ? `(${log.user.email})` : '';
                        
                        return (
                          <tr key={log.id}>
                            <td className="text-xs" style={{ whiteSpace: 'nowrap' }}>
                              {new Date(log.createdAt).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}
                            </td>
                            <td>
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs">{actorName}</span>
                                <span className="text-muted" style={{ fontSize: '10px' }}>{actorEmail}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                log.action === 'CREATE' ? 'badge-success' :
                                log.action === 'DELETE' ? 'badge-error' :
                                log.action === 'LOGIN' ? 'badge-info' :
                                log.action === 'LOGOUT' ? 'badge-secondary' : 'badge-warning'
                              }`} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                                {t(`admin.audit.actions.${log.action}`, { defaultValue: log.action })}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-xs items-center">
                                <span className="badge badge-info" style={{ fontSize: '10px' }}>
                                  {t(`admin.audit.entities.${log.entityType}`, { defaultValue: log.entityType })}
                                </span>
                                {log.entityId && (
                                  <span className="font-semibold text-xs text-muted">#{log.entityId}</span>
                                )}
                              </div>
                            </td>
                            <td className="text-xs font-mono">{log.ipAddress || '-'}</td>
                            <td>
                              {(log.oldValues || log.newValues) ? (
                                <button
                                  onClick={() => openDiffModal(log)}
                                  className="btn btn-outline btn-sm flex items-center gap-xs"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                                  <span>{t('admin.audit.view_diff')}</span>
                                </button>
                              ) : (
                                <span className="text-muted text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {auditTotal > auditLimit && (
                    <div className="flex justify-between items-center p-md" style={{ borderTop: '1px solid var(--outline-variant)' }}>
                      <button
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                        className="btn btn-outline btn-sm"
                      >
                        {t('common.previous')}
                      </button>
                      <span className="text-xs text-muted">
                        {t('common.page_info', {
                          current: auditPage,
                          total: Math.ceil(auditTotal / auditLimit),
                        })}
                      </span>
                      <button
                        onClick={() => setAuditPage((p) => Math.min(Math.ceil(auditTotal / auditLimit), p + 1))}
                        disabled={auditPage >= Math.ceil(auditTotal / auditLimit)}
                        className="btn btn-outline btn-sm"
                      >
                        {t('common.next')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL: VIEW JSON DIFF (AUDIT DETAIL)
          ========================================== */}
      {diffModalOpen && selectedLog && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="card modal-content" style={{ width: '100%', maxWidth: '800px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {t('admin.audit.diff_title', { id: selectedLog.id })}
              </h2>
              <button onClick={() => setDiffModalOpen(false)} className="btn btn-outline btn-sm" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-md">
              <div className="grid grid-cols-2 gap-sm text-xs border-bottom pb-sm">
                <div>
                  <span className="font-bold">{t('admin.audit.action')}:</span> {selectedLog.action}
                </div>
                <div>
                  <span className="font-bold">{t('admin.audit.target')}:</span> {selectedLog.entityType} #{selectedLog.entityId}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md mt-sm" style={{ direction: 'ltr' }}>
                {/* Old Values */}
                <div className="flex flex-col gap-xs">
                  <h4 className="font-bold text-xs" style={{ color: 'var(--error)' }}>
                    {t('admin.audit.old_values')}
                  </h4>
                  <pre
                    className="p-md font-mono text-xs rounded"
                    style={{
                      backgroundColor: 'var(--surface-container-low)',
                      border: '1px solid var(--outline-variant)',
                      maxHeight: '350px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {selectedLog.oldValues
                      ? JSON.stringify(selectedLog.oldValues, null, 2)
                      : t('admin.audit.no_old_values')}
                  </pre>
                </div>

                {/* New Values */}
                <div className="flex flex-col gap-xs">
                  <h4 className="font-bold text-xs" style={{ color: 'var(--primary)' }}>
                    {t('admin.audit.new_values')}
                  </h4>
                  <pre
                    className="p-md font-mono text-xs rounded"
                    style={{
                      backgroundColor: 'var(--surface-container-low)',
                      border: '1px solid var(--outline-variant)',
                      maxHeight: '350px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {selectedLog.newValues
                      ? JSON.stringify(selectedLog.newValues, null, 2)
                      : t('admin.audit.no_new_values')}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setDiffModalOpen(false)} className="btn btn-primary">
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD/EDIT SERVICE
          ========================================== */}
      {serviceModalOpen && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="card modal-content" style={{ width: '100%', maxWidth: '600px', padding: '24px' }}>
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {editingService ? t('admin.services.edit_service') : t('admin.services.add_service')}
              </h2>
              <button onClick={() => setServiceModalOpen(false)} className="btn btn-outline btn-sm" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="flex flex-col gap-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.services.code')} *</label>
                  <input
                    type="text"
                    value={serviceForm.code}
                    onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value.toUpperCase() })}
                    placeholder={t('admin.services.code_placeholder')}
                    disabled={!!editingService}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">{t('admin.services.price')} ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder={t('admin.services.price_placeholder')}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.services.name_en')} *</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">{t('admin.services.name_ar')}</label>
                  <input
                    type="text"
                    value={serviceForm.nameAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, nameAr: e.target.value })}
                    className="form-control"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">{t('admin.services.duration')}</label>
                <input
                  type="number"
                  value={serviceForm.durationMinutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.services.desc_en')}</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="label">{t('admin.services.desc_ar')}</label>
                  <textarea
                    value={serviceForm.descriptionAr}
                    onChange={(e) => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                    className="form-control"
                    rows="2"
                    style={{ textAlign: 'right' }}
                  ></textarea>
                </div>
              </div>

              <div className="form-group flex items-center gap-xs">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={serviceForm.isActive}
                    onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>{t('admin.services.is_active')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-sm mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setServiceModalOpen(false)} className="btn btn-secondary">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: REGISTER / EDIT STAFF ACCOUNT
          ========================================== */}
      {userModalOpen && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="card modal-content" style={{ width: '100%', maxWidth: '700px', padding: '24px' }}>
            <div className="flex justify-between items-center mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {editingUser ? t('admin.staff.edit_staff') : t('admin.staff.add_staff')}
              </h2>
              <button onClick={() => setUserModalOpen(false)} className="btn btn-outline btn-sm" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="flex flex-col gap-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.staff.first_name_en')} *</label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">{t('admin.staff.last_name_en')} *</label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.staff.first_name_ar')}</label>
                  <input
                    type="text"
                    value={userForm.firstNameAr}
                    onChange={(e) => setUserForm({ ...userForm, firstNameAr: e.target.value })}
                    className="form-control"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div className="form-group">
                  <label className="label">{t('admin.staff.last_name_ar')}</label>
                  <input
                    type="text"
                    value={userForm.lastNameAr}
                    onChange={(e) => setUserForm({ ...userForm, lastNameAr: e.target.value })}
                    className="form-control"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.staff.email')} *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">{t('admin.staff.phone')}</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="label">{t('admin.staff.role')} *</label>
                  <select
                    value={userForm.roleId}
                    onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                    className="form-control"
                    required
                  >
                    <option value="">{t('admin.staff.select_role')}</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {getRoleLabel(r.name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">
                    {t('admin.staff.password')} {editingUser ? `(${t('admin.staff.password_hint')})` : '*'}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={t('admin.staff.password_placeholder')}
                    className="form-control"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="form-group flex items-center gap-xs">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={userForm.isActive}
                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>{t('admin.staff.status')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-sm mt-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setUserModalOpen(false)} className="btn btn-secondary">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
