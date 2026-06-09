import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { register: authRegister } = useAuth();
  const { toastError, toastSuccess } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentLang = i18n.language;

  // Validation Schema matching backend RegisterDto
  const registerSchema = z
    .object({
      firstName: z.string().min(1, t('auth.login.validation.required')),
      lastName: z.string().min(1, t('auth.login.validation.required')),
      firstNameAr: z.string().optional(),
      lastNameAr: z.string().optional(),
      email: z.string().email(t('auth.register.validation.email_invalid')),
      phone: z.string().min(6, t('auth.register.validation.phone_invalid')),
      password: z.string().min(6, t('auth.login.validation.password_min')),
      confirmPassword: z.string().min(6, t('auth.login.validation.required')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.register.validation.mismatch'),
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Exclude confirmPassword and map preferredLanguage
      const { confirmPassword, ...payload } = data;
      payload.preferredLanguage = currentLang;
      
      await authRegister(payload);
      toastSuccess(t('auth.register.success'));
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      toastError(error.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--on-background)',
        direction: currentLang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <header
        className="w-full sticky top-0 bg-surface flex justify-between items-center z-50"
        style={{
          height: '64px',
          padding: '0 24px',
          borderBottom: '1px solid var(--outline-variant)',
        }}
      >
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>
            medical_services
          </span>
          <span className="font-bold text-sm text-primary">ClinicDesk</span>
        </div>
        <div>
          <button
            onClick={toggleLanguage}
            className="btn btn-outline btn-sm font-semibold"
            style={{ border: 'none', color: 'var(--on-surface-variant)' }}
          >
            {t('common.language')}
          </button>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="grow flex flex-col items-center justify-center p-lg relative overflow-hidden">
        {/* Subtle Ambient Background Gradient Blurs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            right: currentLang === 'en' ? 0 : 'auto',
            left: currentLang === 'ar' ? 0 : 'auto',
            transform: 'translateY(-50%)',
            width: '500px',
            height: '500px',
            background: 'rgba(0, 104, 95, 0.08)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            left: currentLang === 'en' ? 0 : 'auto',
            right: currentLang === 'ar' ? 0 : 'auto',
            transform: 'translateY(50%)',
            width: '400px',
            height: '400px',
            background: 'rgba(81, 95, 116, 0.12)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />

        {/* Card Container */}
        <div className="w-full z-10" style={{ maxWidth: '600px', margin: '40px 0' }}>
          {/* Logo & Headline */}
          <div className="flex flex-col items-center" style={{ marginBottom: '24px' }}>
            <div
              className="flex items-center justify-center bloom-shadow"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--primary-container)',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            >
              <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '32px' }}>
                medical_services
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
              {t('auth.register.title')}
            </h1>
            <p className="text-muted text-center" style={{ fontSize: '14px', padding: '0 16px' }}>
              {t('auth.register.subtitle')}
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
              {/* Names row */}
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    {t('auth.register.first_name')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. John"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <span className="form-error">{errors.firstName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    {t('auth.register.last_name')}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Doe"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <span className="form-error">{errors.lastName.message}</span>
                  )}
                </div>
              </div>

              {/* Bilingual Names row */}
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstNameAr">
                    {t('auth.register.first_name_ar')}
                  </label>
                  <input
                    id="firstNameAr"
                    type="text"
                    className="form-control"
                    placeholder="مثال: جون"
                    {...register('firstNameAr')}
                  />
                  {errors.firstNameAr && (
                    <span className="form-error">{errors.firstNameAr.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lastNameAr">
                    {t('auth.register.last_name_ar')}
                  </label>
                  <input
                    id="lastNameAr"
                    type="text"
                    className="form-control"
                    placeholder="مثال: دو"
                    {...register('lastNameAr')}
                  />
                  {errors.lastNameAr && (
                    <span className="form-error">{errors.lastNameAr.message}</span>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    {t('auth.register.email')}
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined">mail</span>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder="john@example.com"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    {t('auth.register.phone')}
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined">phone</span>
                    <input
                      id="phone"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 0123456789"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <span className="form-error">{errors.phone.message}</span>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    {t('auth.register.password')}
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined">lock</span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <span className="form-error">{errors.password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    {t('auth.register.confirm_password')}
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="material-symbols-outlined">lock</span>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="form-error">{errors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              {/* Show password toggle */}
              <div className="flex items-center gap-sm" style={{ marginInlineStart: '4px' }}>
                <input
                  id="showPasswordToggle"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="showPasswordToggle" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                  {currentLang === 'ar' ? 'إظهار كلمة المرور' : 'Show passwords'}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
                style={{ height: '46px', marginTop: '12px' }}
              >
                {submitting ? t('auth.register.registering') : t('auth.register.submit')}
              </button>
            </form>
          </div>

          {/* Login Redirect Footer */}
          <div className="text-center" style={{ marginTop: '24px' }}>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              {t('auth.register.has_account')}{' '}
              <Link to="/login" className="font-bold" style={{ color: 'var(--primary)' }}>
                {t('auth.register.login_here')}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full flex flex-col md:flex-row justify-between items-center p-xl gap-md"
        style={{ fontSize: '12px', color: 'var(--secondary)' }}
      >
        <div className="font-semibold uppercase tracking-wider">
          © 2026 ClinicDesk. {currentLang === 'ar' ? 'إدارة سريرية دقيقة.' : 'Clinical Precision Management.'}
        </div>
        <div className="flex gap-lg">
          <a href="#" className="hover:text-primary transition-all">
            {currentLang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </a>
          <a href="#" className="hover:text-primary transition-all">
            {currentLang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </a>
          <a href="#" className="hover:text-primary transition-all">
            {currentLang === 'ar' ? 'الدعم الفني' : 'Support'}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Register;
