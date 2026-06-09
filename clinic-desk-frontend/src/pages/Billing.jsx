import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Billing = () => {
  const { t, i18n } = useTranslation();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuth();
  const currentLang = i18n.language;
  const currentRole = user?.role?.name || user?.role || '';

  // Invoice Lists & Loading States
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);

  // Modals state
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [recordingPaymentInvoice, setRecordingPaymentInvoice] = useState(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // New Standalone Invoice Form State
  const [newInvoicePatientId, setNewInvoicePatientId] = useState('');
  const [newInvoicePatientName, setNewInvoicePatientName] = useState('');
  const [newInvoicePatientSearch, setNewInvoicePatientSearch] = useState('');
  const [newInvoicePatientResults, setNewInvoicePatientResults] = useState([]);
  const [newInvoiceDiscount, setNewInvoiceDiscount] = useState('0');
  const [newInvoiceTax, setNewInvoiceTax] = useState('0');
  const [newInvoiceItems, setNewInvoiceItems] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Item builder inside invoice form
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemDescAr, setItemDescAr] = useState('');

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: selectedStatus || undefined,
        patientId: selectedPatientId || undefined,
      };
      const res = await client.get('/invoices', { params });
      setInvoices(res.data.data || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toastError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch services catalog
  const fetchServices = async () => {
    try {
      const res = await client.get('/services', { params: { limit: 100, activeOnly: true } });
      setServicesCatalog(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, selectedStatus, selectedPatientId]);

  useEffect(() => {
    if (showCreateInvoiceModal) {
      fetchServices();
    }
  }, [showCreateInvoiceModal]);

  // Live Patient Search for filter
  useEffect(() => {
    if (patientSearch && patientSearch.length >= 2) {
      client.get('/patients', { params: { search: patientSearch, limit: 10 } })
        .then(res => setPatientSearchResults(res.data.data || []))
        .catch(() => setPatientSearchResults([]));
    } else {
      setPatientSearchResults([]);
    }
  }, [patientSearch]);

  // Live Patient Search for invoice builder
  useEffect(() => {
    if (newInvoicePatientSearch && newInvoicePatientSearch.length >= 2) {
      client.get('/patients', { params: { search: newInvoicePatientSearch, limit: 10 } })
        .then(res => setNewInvoicePatientResults(res.data.data || []))
        .catch(() => setNewInvoicePatientResults([]));
    } else {
      setNewInvoicePatientResults([]);
    }
  }, [newInvoicePatientSearch]);

  // Helper formats
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

  // Client side KPI calculations (from the visible list or calculated sum if we want aggregated metrics)
  // To make it accurate, we calculate metrics from the loaded invoices page, or we fetch /invoices/summary if admin
  const [aggregates, setAggregates] = useState({ totalBilled: 0, totalPaid: 0, totalOutstanding: 0 });

  const loadAggregates = async () => {
    if (currentRole === 'admin') {
      try {
        const res = await client.get('/invoices/summary');
        setAggregates({
          totalBilled: res.data.totalBilled || 0,
          totalPaid: res.data.totalPaid || 0,
          totalOutstanding: res.data.totalOutstanding || 0,
        });
        return;
      } catch (err) {
        console.warn('Invoices summary failed, falling back to local list aggregation', err);
      }
    }
    // Fallback: calculate from all invoices for current patient or loaded page
    let billed = 0;
    let outstanding = 0;
    let paid = 0;
    invoices.forEach(inv => {
      if (inv.status !== 'voided') {
        billed += Number(inv.total);
        outstanding += Number(inv.balanceDue);
        paid += (Number(inv.total) - Number(inv.balanceDue));
      }
    });
    setAggregates({ totalBilled: billed, totalPaid: paid, totalOutstanding: outstanding });
  };

  useEffect(() => {
    loadAggregates();
  }, [invoices]);

  // Record Payment Submit
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toastError(currentLang === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid payment amount');
      return;
    }
    setSubmittingPayment(true);
    try {
      const res = await client.post(`/invoices/${recordingPaymentInvoice.id}/payments`, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        notes: paymentNotes || undefined
      });
      toastSuccess(t('billing.payment_success'));
      setRecordingPaymentInvoice(null);
      setPaymentAmount('');
      setPaymentNotes('');
      fetchInvoices();
    } catch (err) {
      const detail = err.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || err.message || t('common.error')));
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Void Invoice
  const handleVoidInvoice = async (invoiceId) => {
    if (!window.confirm(t('billing.void_confirm'))) return;
    try {
      await client.post(`/invoices/${invoiceId}/void`);
      toastSuccess(t('billing.void_success'));
      fetchInvoices();
    } catch (err) {
      const detail = err.response?.data?.message;
      toastError(detail || err.message || t('common.error'));
    }
  };

  // Standalone Invoice Submit
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoicePatientId) {
      toastError(currentLang === 'ar' ? 'يرجى اختيار مريض' : 'Please select a patient');
      return;
    }
    if (newInvoiceItems.length === 0) {
      toastError(currentLang === 'ar' ? 'يرجى إضافة بند واحد على الأقل' : 'Please add at least one line item');
      return;
    }
    setSubmittingInvoice(true);
    try {
      await client.post('/invoices', {
        patientId: parseInt(newInvoicePatientId),
        discount: parseFloat(newInvoiceDiscount) || 0,
        tax: parseFloat(newInvoiceTax) || 0,
        items: newInvoiceItems.map(item => ({
          serviceId: item.serviceId ? parseInt(item.serviceId) : undefined,
          description: item.description,
          descriptionAr: item.descriptionAr || undefined,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        }))
      });
      toastSuccess(t('billing.invoice_success'));
      setShowCreateInvoiceModal(false);
      setNewInvoicePatientId('');
      setNewInvoicePatientName('');
      setNewInvoiceItems([]);
      setNewInvoiceDiscount('0');
      setNewInvoiceTax('0');
      fetchInvoices();
    } catch (err) {
      const detail = err.response?.data?.message;
      toastError(Array.isArray(detail) ? detail.join(', ') : (detail || err.message || t('common.error')));
    } finally {
      setSubmittingInvoice(false);
    }
  };

  // Standalone Subtotal calculation
  const calculateFormSubtotal = () => {
    return newInvoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };
  const formSubtotal = calculateFormSubtotal();
  const formDiscountVal = parseFloat(newInvoiceDiscount) || 0;
  const formTaxVal = parseFloat(newInvoiceTax) || 0;
  const formTotal = Math.max(0, formSubtotal - formDiscountVal + formTaxVal);

  return (
    <div className="flex flex-col gap-lg" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Title Header */}
      <div className="flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="h1">{t('billing.title')}</h1>
          <p className="text-muted text-sm">{t('billing.subtitle')}</p>
        </div>
        {currentRole !== 'patient' && (
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="btn btn-primary flex items-center gap-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            <span>{t('billing.create_invoice')}</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="card" style={{ padding: '16px' }}>
          <p className="text-muted text-xs font-semibold">{t('billing.total_billed')}</p>
          <h3 className="h3 mt-xs text-primary">${aggregates.totalBilled.toLocaleString()}</h3>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <p className="text-muted text-xs font-semibold">{t('billing.total_paid')}</p>
          <h3 className="h3 mt-xs text-success">${aggregates.totalPaid.toLocaleString()}</h3>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <p className="text-muted text-xs font-semibold">{t('billing.total_outstanding')}</p>
          <h3 className="h3 mt-xs text-error">${aggregates.totalOutstanding.toLocaleString()}</h3>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-end">
          {/* Patient Search (Staff only) */}
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

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="text-xs font-semibold text-muted">{t('billing.status')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="form-control"
            >
              <option value="">{currentLang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="unpaid">{t('billing.statuses.unpaid')}</option>
              <option value="partially_paid">{t('billing.statuses.partially_paid')}</option>
              <option value="paid">{t('billing.statuses.paid')}</option>
              <option value="voided">{t('billing.statuses.voided')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Grid */}
      {loading ? (
        <div className="card flex items-center justify-center p-xl" style={{ minHeight: '300px' }}>
          <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '48px' }}>
            progress_activity
          </span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="card text-center p-xl flex flex-col items-center gap-xs">
          <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>receipt_long</span>
          <p className="text-muted font-semibold">{t('billing.no_invoices')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('billing.invoice_number')}</th>
                  <th>{t('billing.date')}</th>
                  {currentRole !== 'patient' && <th>{t('billing.patient')}</th>}
                  <th>{t('billing.total')}</th>
                  <th>{t('billing.balance_due')}</th>
                  <th>{t('billing.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hoverable">
                    <td className="font-semibold text-primary">{inv.invoiceNumber}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString(currentLang)}</td>
                    {currentRole !== 'patient' && <td className="font-semibold">{getPatientName(inv.patient)}</td>}
                    <td className="font-bold">${Number(inv.total).toLocaleString()}</td>
                    <td className="font-bold text-error">${Number(inv.balanceDue).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        inv.status === 'paid' ? 'badge-success' :
                        inv.status === 'partially_paid' ? 'badge-info' :
                        inv.status === 'voided' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {t(`billing.statuses.${inv.status}`)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-xs flex-wrap">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="btn btn-secondary btn-sm flex items-center gap-xs"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                          <span>{currentLang === 'ar' ? 'عرض الفاتورة' : 'View'}</span>
                        </button>
                        {currentRole !== 'patient' && inv.status !== 'paid' && inv.status !== 'voided' && (
                          <button
                            onClick={() => {
                              setRecordingPaymentInvoice(inv);
                              setPaymentAmount(inv.balanceDue);
                            }}
                            className="btn btn-primary btn-sm flex items-center gap-xs"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
                            <span>{t('billing.record_payment')}</span>
                          </button>
                        )}
                        {currentRole !== 'patient' && inv.status === 'unpaid' && (
                          <button
                            onClick={() => handleVoidInvoice(inv.id)}
                            className="btn btn-outline btn-sm text-error flex items-center gap-xs"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                            <span>{t('billing.void_invoice')}</span>
                          </button>
                        )}
                      </div>
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
                  ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} من إجمالي ${totalCount} فاتورة`
                  : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} of ${totalCount} invoices`}
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

      {/* Modal 1: Printable Receipt Modal */}
      {viewingInvoice && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <div className="card modal-content w-full flex flex-col gap-md" style={{ maxWidth: '800px', padding: '24px', boxShadow: 'var(--elevation-3)' }}>
            
            {/* Header Controls */}
            <div className="flex justify-between items-center pb-md no-print" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t('billing.invoice_details')}</h2>
              <div className="flex gap-sm">
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                  <span>{currentLang === 'ar' ? 'طباعة السند' : 'Print Receipt'}</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="btn btn-outline btn-sm"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div
              className="printable-receipt"
              style={{
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                border: '2px solid #ccc',
                padding: '30px',
                borderRadius: '8px',
                fontFamily: 'sans-serif',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                lineHeight: '1.6'
              }}
            >
              <style>
                {`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    .modal-backdrop, .modal-content {
                      visibility: visible !important;
                      position: static !important;
                      background: transparent !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      box-shadow: none !important;
                      max-width: 100% !important;
                      overflow: visible !important;
                    }
                    .printable-receipt, .printable-receipt * {
                      visibility: visible !important;
                    }
                    .printable-receipt {
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

              {/* Clinic Branding */}
              <div className="flex justify-between items-start" style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '12px' }}>
                <div style={{ textAlign: currentLang === 'ar' ? 'right' : 'left' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>ClinicDesk Medical Clinic</h1>
                  <span style={{ fontSize: '11px', color: '#666' }}>123 Medical Avenue, Cairo • Tel: +20 2 1234567</span>
                </div>
                <div style={{ textAlign: currentLang === 'ar' ? 'left' : 'right' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>مجمع كلينيك ديسك الطبي</h1>
                  <span style={{ fontSize: '11px', color: '#666' }}>١٢٣ الشارع الطبي، القاهرة • هاتف: ٠١٢٣٤٥٦٧٨٩</span>
                </div>
              </div>

              {/* Invoice Metadata Banner */}
              <div className="grid grid-cols-2 gap-md" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '13px' }}>
                <div>
                  <strong>{t('billing.invoice_number')}:</strong> {viewingInvoice.invoiceNumber}
                  <br />
                  <strong>{t('billing.date')}:</strong> {new Date(viewingInvoice.createdAt).toLocaleDateString(currentLang)}
                  {viewingInvoice.visit?.doctor && (
                    <>
                      <br />
                      <strong>{t('appointments.doctor')}:</strong> {getDoctorName(viewingInvoice.visit.doctor)}
                    </>
                  )}
                </div>
                <div style={{ textAlign: currentLang === 'ar' ? 'left' : 'right' }}>
                  <strong>{t('billing.patient')}:</strong> {getPatientName(viewingInvoice.patient)}
                  <br />
                  <strong>Patient ID:</strong> #{viewingInvoice.patientId}
                  <br />
                  <strong>{t('billing.status')}:</strong> <span style={{ fontWeight: 'bold' }}>{t(`billing.statuses.${viewingInvoice.status}`).toUpperCase()}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                  {t('billing.line_items')}
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                      <th style={{ padding: '8px' }}>{t('billing.service')}</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>{t('billing.qty')}</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>{t('billing.unit_price')}</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>{t('billing.line_total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewingInvoice.items || []).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>
                          {currentLang === 'ar' && item.descriptionAr ? item.descriptionAr : item.description}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>${Number(item.totalLinePrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Outstanding Details */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ width: '250px', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0' }}>{t('billing.subtotal')}:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>${Number(viewingInvoice.subtotal).toFixed(2)}</td>
                    </tr>
                    {Number(viewingInvoice.discount) > 0 && (
                      <tr style={{ color: 'red' }}>
                        <td style={{ padding: '4px 0' }}>{t('billing.discount')}:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>-${Number(viewingInvoice.discount).toFixed(2)}</td>
                      </tr>
                    )}
                    {Number(viewingInvoice.tax) > 0 && (
                      <tr>
                        <td style={{ padding: '4px 0' }}>{t('billing.tax')}:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right' }}>+${Number(viewingInvoice.tax).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '1px solid #ccc', fontWeight: 'bold', fontSize: '14px' }}>
                      <td style={{ padding: '6px 0' }}>{t('billing.total')}:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>${Number(viewingInvoice.total).toFixed(2)}</td>
                    </tr>
                    <tr style={{ color: 'green', fontSize: '13px' }}>
                      <td style={{ padding: '4px 0' }}>{t('billing.paid_amount')}:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>${(Number(viewingInvoice.total) - Number(viewingInvoice.balanceDue)).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderTop: '2px double #000', fontWeight: 'bold', color: Number(viewingInvoice.balanceDue) > 0 ? 'red' : 'green', fontSize: '14px' }}>
                      <td style={{ padding: '6px 0' }}>{t('billing.balance_due')}:</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>${Number(viewingInvoice.balanceDue).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payments Ledger Section */}
              {viewingInvoice.payments && viewingInvoice.payments.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 6px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    {t('billing.recorded_payments')}
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left', color: '#666' }}>
                        <th style={{ padding: '4px' }}>{t('billing.date')}</th>
                        <th style={{ padding: '4px' }}>{t('billing.payment_method')}</th>
                        <th style={{ padding: '4px' }}>{t('billing.received_by')}</th>
                        <th style={{ padding: '4px', textAlign: 'right' }}>{t('billing.amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.payments.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '4px' }}>{new Date(p.paymentDate).toLocaleDateString(currentLang)}</td>
                          <td style={{ padding: '4px' }}>{p.paymentMethod.toUpperCase()}</td>
                          <td style={{ padding: '4px' }}>{p.creator?.email || p.creator?.firstName || 'Staff'}</td>
                          <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>${Number(p.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Stamp & Authorized sign */}
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ border: '2px dashed #ddd', width: '100px', height: '80px', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#ccc' }}>
                  Clinic Stamp
                </div>
                <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '6px', marginTop: '60px' }}>
                  {t('billing.dr_signature')}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Payment Recorder Modal */}
      {recordingPaymentInvoice && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <form onSubmit={handleRecordPayment} className="card modal-content w-full flex flex-col gap-md" style={{ maxWidth: '450px', padding: '24px', boxShadow: 'var(--elevation-3)' }}>
            
            <div className="flex justify-between items-center pb-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t('billing.record_payment')}</h2>
              <button
                type="button"
                onClick={() => setRecordingPaymentInvoice(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-md">
              <div className="p-sm text-center" style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: '8px' }}>
                <p className="text-muted text-xs font-semibold">{t('billing.balance_due')}</p>
                <h2 className="h2 text-error">${Number(recordingPaymentInvoice.balanceDue).toLocaleString()}</h2>
              </div>

              {/* Amount input */}
              <div className="form-group">
                <label className="text-xs font-semibold">{t('billing.amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  max={recordingPaymentInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              {/* Method select */}
              <div className="form-group">
                <label className="text-xs font-semibold">{t('billing.payment_method')} *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-control"
                >
                  <option value="cash">{currentLang === 'ar' ? 'نقدًا' : 'Cash'}</option>
                  <option value="card">{currentLang === 'ar' ? 'شبكة / بطاقة' : 'Card'}</option>
                  <option value="insurance">{currentLang === 'ar' ? 'تأمين' : 'Insurance'}</option>
                  <option value="other">{currentLang === 'ar' ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="text-xs font-semibold">{t('billing.notes')}</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="form-control"
                  rows="2"
                  placeholder="..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-sm pt-md" style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <button
                type="button"
                onClick={() => setRecordingPaymentInvoice(null)}
                className="btn btn-outline"
                disabled={submittingPayment}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingPayment}
              >
                {submittingPayment ? t('common.loading') : t('billing.record_payment')}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Modal 3: Standalone Invoice Creator Modal */}
      {showCreateInvoiceModal && (
        <div className="modal-backdrop flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
          <form onSubmit={handleCreateInvoice} className="card modal-content w-full flex flex-col gap-md" style={{ maxWidth: '750px', padding: '24px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--elevation-3)' }}>
            
            <div className="flex justify-between items-center pb-md" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t('billing.create_invoice')}</h2>
              <button
                type="button"
                onClick={() => setShowCreateInvoiceModal(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: 0 }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-md">
              {/* Patient Autocomplete Search */}
              <div className="form-group relative">
                <label className="text-xs font-semibold">{t('billing.select_patient')} *</label>
                <input
                  type="text"
                  placeholder={currentLang === 'ar' ? 'اكتب اسم المريض للبحث...' : 'Type patient name to search...'}
                  value={newInvoicePatientName || newInvoicePatientSearch}
                  onChange={(e) => {
                    setNewInvoicePatientId('');
                    setNewInvoicePatientName('');
                    setNewInvoicePatientSearch(e.target.value);
                  }}
                  className="form-control"
                  required={!newInvoicePatientId}
                />
                {newInvoicePatientResults.length > 0 && !newInvoicePatientName && (
                  <div className="card absolute z-50 w-full flex flex-col" style={{ padding: '8px', top: '100%', border: '1px solid var(--outline-variant)', maxHeight: '150px', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                    {newInvoicePatientResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setNewInvoicePatientName(getPatientName(p));
                          setNewInvoicePatientId(p.id);
                          setNewInvoicePatientSearch('');
                          setNewInvoicePatientResults([]);
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

              {/* Service Line Item Sub-Form */}
              <div className="card p-md flex flex-col gap-sm" style={{ backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{t('billing.add_item')}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-sm">
                  <div className="form-group md:col-span-2">
                    <label className="text-xs font-semibold">{t('billing.service')} *</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setSelectedServiceId(sId);
                        const service = servicesCatalog.find(s => s.id === parseInt(sId));
                        if (service) {
                          setItemPrice(service.price.toString());
                          setItemDesc(service.name);
                          setItemDescAr(service.nameAr || '');
                        } else {
                          setItemPrice('');
                          setItemDesc('');
                          setItemDescAr('');
                        }
                      }}
                      className="form-control"
                    >
                      <option value="">{currentLang === 'ar' ? 'اختر خدمة...' : 'Select service...'}</option>
                      {servicesCatalog.map(s => (
                        <option key={s.id} value={s.id}>
                          {currentLang === 'ar' && s.nameAr ? s.nameAr : s.name} (${Number(s.price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('billing.qty')} *</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-xs font-semibold">{t('billing.unit_price')} *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (!itemDesc || !itemQty || !itemPrice) {
                        toastError(currentLang === 'ar' ? 'يرجى اختيار الخدمة وتحديد السعر' : 'Please select a service and fill in price');
                        return;
                      }
                      const newItem = {
                        serviceId: selectedServiceId || null,
                        description: itemDesc,
                        descriptionAr: itemDescAr || null,
                        quantity: parseInt(itemQty),
                        unitPrice: parseFloat(itemPrice)
                      };
                      setNewInvoiceItems(prev => [...prev, newItem]);
                      setSelectedServiceId('');
                      setItemQty('1');
                      setItemPrice('');
                      setItemDesc('');
                      setItemDescAr('');
                    }}
                    className="btn btn-secondary btn-sm flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    <span>{t('billing.add_item')}</span>
                  </button>
                </div>
              </div>

              {/* Added Line Items Listing */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  {t('billing.line_items')} ({newInvoiceItems.length})
                </h4>
                {newInvoiceItems.length === 0 ? (
                  <p className="text-muted text-xs text-center p-md" style={{ border: '1px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                    {currentLang === 'ar' ? 'لا توجد بنود مضافة.' : 'No line items added yet.'}
                  </p>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    <table className="table" style={{ fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>{t('billing.service')}</th>
                          <th style={{ textAlign: 'center' }}>{t('billing.qty')}</th>
                          <th style={{ textAlign: 'right' }}>{t('billing.unit_price')}</th>
                          <th style={{ textAlign: 'right' }}>{t('billing.line_total')}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newInvoiceItems.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {currentLang === 'ar' && item.descriptionAr ? item.descriptionAr : item.description}
                            </td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                onClick={() => setNewInvoiceItems(prev => prev.filter((_, i) => i !== index))}
                                className="btn btn-outline btn-sm text-error"
                                style={{ padding: '2px 6px' }}
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

              {/* Discount / Tax & Total aggregates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md" style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '12px' }}>
                <div className="flex flex-col gap-sm">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="text-xs font-semibold">{t('billing.discount')} ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={formSubtotal}
                      value={newInvoiceDiscount}
                      onChange={(e) => setNewInvoiceDiscount(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="text-xs font-semibold">{t('billing.tax')} ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newInvoiceTax}
                      onChange={(e) => setNewInvoiceTax(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end items-end">
                  <table style={{ width: '200px', fontSize: '13px' }}>
                    <tbody>
                      <tr>
                        <td>{t('billing.subtotal')}:</td>
                        <td style={{ textAlign: 'right' }}>${formSubtotal.toFixed(2)}</td>
                      </tr>
                      {formDiscountVal > 0 && (
                        <tr style={{ color: 'red' }}>
                          <td>{t('billing.discount')}:</td>
                          <td style={{ textAlign: 'right' }}>-${formDiscountVal.toFixed(2)}</td>
                        </tr>
                      )}
                      {formTaxVal > 0 && (
                        <tr>
                          <td>{t('billing.tax')}:</td>
                          <td style={{ textAlign: 'right' }}>+${formTaxVal.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr style={{ fontWeight: 'bold', fontSize: '15px', borderTop: '1px solid #ccc' }}>
                        <td style={{ paddingTop: '6px' }}>{t('billing.total')}:</td>
                        <td style={{ paddingTop: '6px', textAlign: 'right' }}>${formTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-sm pt-md" style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <button
                type="button"
                onClick={() => setShowCreateInvoiceModal(false)}
                className="btn btn-outline"
                disabled={submittingInvoice}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingInvoice}
              >
                {submittingInvoice ? t('common.loading') : t('billing.save_invoice')}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Billing;
