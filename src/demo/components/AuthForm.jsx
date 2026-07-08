import { useEffect, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { IS_LOCAL_DEV_SITE } from '@/lib/api/config';
import { loginWithEmailCode, sendEmailCode, startGoogleLogin } from '../lib/auth';

const RESEND_SECONDS = 60;

export default function AuthForm({
  title,
  subtitle,
  submitLabel = 'Verify and continue',
  onSuccess,
  compact = false,
}) {
  const [step, setStep] = useState('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCodeHint, setDevCodeHint] = useState('');

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const resetEmailFlow = () => {
    setStep('choose');
    setEmail('');
    setCode('');
    setCountdown(0);
    setError('');
    setDevCodeHint('');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await startGoogleLogin();
    } catch (err) {
      setError(err?.message || 'Unable to start Google login.');
      setIsGoogleLoading(false);
    }
  };

  const handleSendCode = async (event) => {
    event?.preventDefault?.();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setDevCodeHint('');
    try {
      const result = await sendEmailCode({ email: email.trim() });
      if (IS_LOCAL_DEV_SITE && result?.devCode) {
        setCode(result.devCode);
        setDevCodeHint(`Dev code: ${result.devCode}`);
      } else {
        setDevCodeHint('');
      }
      setStep('code');
      setCountdown(RESEND_SECONDS);
    } catch (err) {
      setError(err?.message || 'Unable to send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    if (!email.trim() || !code.trim()) {
      setError('Please enter your email and verification code.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const auth = await loginWithEmailCode({ email: email.trim(), code: code.trim() });
      onSuccess?.({ ...auth, email: email.trim() });
      resetEmailFlow();
    } catch (err) {
      setError(err?.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {title && (
        <div className={compact ? 'mb-6' : 'mb-8 text-center'}>
          {!compact && (
            <div className="mb-5 flex items-center justify-center gap-2.5">
              <img src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/kiwi-logo.svg" alt="LazyKiwi Logo" width={36} height={36} />
              <span className="text-xl font-extrabold tracking-tight text-gray-900">LazyKiwi</span>
            </div>
          )}
          <h1 className={compact ? 'text-[28px] font-extrabold leading-[1.08] tracking-tight text-gray-950 sm:text-[30px]' : 'text-2xl font-extrabold text-gray-900'}>
            {title}
          </h1>
          {subtitle && <p className={`mt-2 text-sm ${compact ? 'font-medium text-gray-500' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
      )}

      {step !== 'choose' && (
        <button
          type="button"
          onClick={() => {
            if (step === 'code') {
              setStep('email');
              setCode('');
              setError('');
              setDevCodeHint('');
              return;
            }
            resetEmailFlow();
          }}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {step === 'choose' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-xs font-extrabold text-blue-600">G</span>
            {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <button
            type="button"
            onClick={() => {
              setError('');
              setStep('email');
            }}
            disabled={isGoogleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail size={18} className="text-gray-500" />
            Continue with email
          </button>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <p className="rounded-xl border border-kiwi-green/20 bg-kiwi-green/5 px-4 py-3 text-sm leading-relaxed text-gray-600">
            One flow for sign-in and sign-up. Enter your email and we&apos;ll send a verification code.
            If you&apos;re new, your account will be created automatically.
          </p>

          <label className="block">
            <span className="sr-only">Email</span>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 focus-within:border-kiwi-green-dark focus-within:ring-4 focus-within:ring-kiwi-green/10">
              <Mail size={17} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                autoComplete="email"
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-300"
              />
            </div>
          </label>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send verification code'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <>
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-gray-800">{email}</span>.
              New users are signed up automatically after verification.
            </p>

            <label className="block">
              <span className="sr-only">Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                autoComplete="one-time-code"
                placeholder="6-digit code"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold tracking-[0.3em] text-gray-800 outline-none placeholder:tracking-normal placeholder:text-gray-300 focus:border-kiwi-green-dark focus:ring-4 focus:ring-kiwi-green/10"
              />
            </label>

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            {devCodeHint && !error && (
              <p className="text-sm font-semibold text-kiwi-green-dark">{devCodeHint}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Please wait...' : submitLabel}
            </button>
          </form>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={countdown > 0 || isSubmitting}
            className="mt-4 w-full text-center text-sm font-bold text-kiwi-green-dark transition hover:text-lime-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
          </button>
        </>
      )}
    </div>
  );
}
