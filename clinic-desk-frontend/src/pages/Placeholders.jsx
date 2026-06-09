import React from 'react';
import { useTranslation } from 'react-i18next';

const FeaturePlaceholder = ({ titleKey, icon }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="card flex flex-col items-center justify-center p-xl text-center" style={{ minHeight: '300px', gap: '16px', direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--surface-container-low)',
        }}
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '36px' }}>
          {icon}
        </span>
      </div>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          {t(titleKey)}
        </h2>
        <p className="text-muted text-sm" style={{ maxWidth: '400px' }}>
          {currentLang === 'ar'
            ? 'هذه الشاشة قيد التطوير حالياً كجزء من الميزات المتبقية للوحة التحكم السريرية.'
            : 'This module is currently under active development as part of the clinical management pipeline.'}
        </p>
      </div>
      <div style={{ marginTop: '8px' }}>
        <span className="badge badge-warning" style={{ padding: '6px 12px' }}>
          {currentLang === 'ar' ? 'قريباً' : 'Under Construction'}
        </span>
      </div>
    </div>
  );
};

export const PatientsPlaceholder = () => <FeaturePlaceholder titleKey="nav.patients" icon="patient_list" />;
export const DoctorsPlaceholder = () => <FeaturePlaceholder titleKey="nav.doctors" icon="medical_services" />;
export const AppointmentsPlaceholder = () => <FeaturePlaceholder titleKey="nav.appointments" icon="calendar_month" />;
export const VisitsPlaceholder = () => <FeaturePlaceholder titleKey="nav.visits" icon="rate_review" />;
export const PrescriptionsPlaceholder = () => <FeaturePlaceholder titleKey="nav.prescriptions" icon="prescriptions" />;
export const BillingPlaceholder = () => <FeaturePlaceholder titleKey="nav.billing" icon="receipt_long" />;
