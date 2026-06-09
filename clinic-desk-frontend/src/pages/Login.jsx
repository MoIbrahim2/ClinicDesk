import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { login } = useAuth();
  const { toastError, toastSuccess } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentLang = i18n.language;

  // Validation schema
  const loginSchema = z.object({
    usernameOrEmail: z.string().min(1, t('auth.login.validation.username_or_email_required')),
    password: z.string().min(6, t('auth.login.validation.password_min')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.usernameOrEmail, data.password);
      toastSuccess(currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!');
      navigate('/');
    } catch (error) {
      toastError(error.message || t('auth.login.error'));
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
        <div className="w-full z-10" style={{ maxWidth: '440px' }}>
          {/* Logo & Headline */}
          <div className="flex flex-col items-center" style={{ marginBottom: '32px' }}>
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
              {t('auth.login.title')}
            </h1>
            <p className="text-muted text-center" style={{ fontSize: '14px', padding: '0 16px' }}>
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Login Form Card */}
          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
              {/* Email / Username */}
              <div className="form-group">
                <label className="form-label" htmlFor="usernameOrEmail">
                  {t('auth.login.username_or_email')}
                </label>
                <div className="input-icon-wrapper">
                  <span className="material-symbols-outlined">mail</span>
                  <input
                    id="usernameOrEmail"
                    type="text"
                    className="form-control"
                    placeholder="admin@clinicdesk.com"
                    {...register('usernameOrEmail')}
                  />
                </div>
                {errors.usernameOrEmail && (
                  <span className="form-error">{errors.usernameOrEmail.message}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  {t('auth.login.password')}
                </label>
                <div className="input-icon-wrapper">
                  <span className="material-symbols-outlined">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    {...register('password')}
                    style={{ paddingInlineEnd: '44px' }}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
                style={{ height: '46px', marginTop: '8px' }}
              >
                {submitting ? t('auth.login.signing_in') : t('auth.login.submit')}
              </button>
            </form>
          </div>

          {/* Registration Redirect Footer */}
          <div className="text-center" style={{ marginTop: '24px' }}>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              {t('auth.login.no_account')}{' '}
              <Link to="/register" className="font-bold" style={{ color: 'var(--primary)' }}>
                {t('auth.login.register_here')}
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

export default Login;
