
import { LoginForm } from '../components/LoginForm';

export default function LoginPage({
  searchParams
}: {
  searchParams: { redirect?: string }
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-slate-400 mt-2">VizBiz.ai Operations Dashboard</p>
        </div>
        <LoginForm redirect={searchParams.redirect} />
      </div>
    </div>
  );
}
