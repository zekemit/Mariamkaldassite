import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';
import { hasAdminSession, isAdminConfigured } from '@/lib/admin-auth';

export default function LoginPage() {
  return (
    <main className="a-login">
      <div className="a-login__card">
        <p className="a-brand__name a-login__brand">Mariam Kaldas</p>
        <h1 className="a-login__title">Site editor</h1>
        <Suspense fallback={<p className="a-loading">One moment…</p>}>
          <LoginGate />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginGate() {
  if (await hasAdminSession()) redirect('/admin');
  const configured = isAdminConfigured();
  return (
    <>
      {configured ? (
        <p className="a-login__lede">Sign in to update the website.</p>
      ) : (
        <div className="a-callout" role="note">
          <p className="a-callout__title">The editor isn’t switched on yet</p>
          <p>
            Add a secret named <code>ADMIN_PASSWORD</code> in the site’s hosting settings (Vercel → Settings → Environment
            Variables), then redeploy. The README has the exact steps.
          </p>
        </div>
      )}
      <LoginForm configured={configured} />
    </>
  );
}
