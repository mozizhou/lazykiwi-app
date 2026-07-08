import { useEffect } from 'react';
import { X } from 'lucide-react';
import AuthForm from './AuthForm';

export default function AuthModal({ mode, onClose, onComplete }) {
  useEffect(() => {
    if (!mode) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, onClose]);

  if (!mode) return null;

  const isSignup = mode === 'signup';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative grid w-full max-w-[800px] overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-2xl md:grid-cols-[0.82fr_1.18fr]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-gray-400 transition hover:bg-white hover:text-gray-900"
          aria-label="Close authentication dialog"
        >
          <X size={16} />
        </button>

        <div className="relative hidden min-h-[560px] overflow-hidden bg-gray-900 md:block">
          <video
            src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/login.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: isSignup ? '52% center' : '50% center' }}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="flex min-h-[560px] flex-col justify-center px-7 py-10 sm:px-10 lg:px-11">
          <div className="mb-6 flex items-center gap-2">
            <img src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/kiwi-logo.svg" alt="LazyKiwi Logo" width={26} height={26} />
            <span className="text-base font-extrabold tracking-tight text-gray-900">LazyKiwi</span>
          </div>

          <AuthForm
            title="Welcome to LazyKiwi"
            subtitle="Sign in or create an account to continue"
            submitLabel="Verify and continue"
            compact
            onSuccess={onComplete}
          />

          <p className="mt-6 text-xs leading-relaxed text-gray-400">
            By continuing, you agree to our{' '}
            <button type="button" className="font-semibold text-gray-600 underline decoration-gray-300 underline-offset-2">Privacy Policy</button>
            {' '}&amp;{' '}
            <button type="button" className="font-semibold text-gray-600 underline decoration-gray-300 underline-offset-2">Terms and Conditions</button>
            , and confirm that you are at least 18 years of age.
          </p>
        </div>
      </div>
    </div>
  );
}
