import AuthForm from '../components/AuthForm';

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md rounded-3xl border border-gray-200/80 bg-white/90 p-8 shadow-xl shadow-gray-200/50 backdrop-blur">
        <AuthForm
          title="Welcome to LazyKiwi"
          subtitle="Sign in or create an account to continue"
          submitLabel="Verify and continue"
          onSuccess={onLogin}
        />
      </div>
    </div>
  );
}
