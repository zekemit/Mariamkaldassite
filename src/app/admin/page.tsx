import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AdminEditor } from '@/components/admin/admin-editor';
import { hasAdminSession } from '@/lib/admin-auth';
import { StorageError, loadContent, storageStatus, type LoadedContent } from '@/lib/cms-storage';

export default function AdminPage() {
  // Reading the session cookie is request-time work, so it lives behind a Suspense boundary (Cache Components).
  return (
    <Suspense fallback={<p className="a-loading">Loading the editor…</p>}>
      <Editor />
    </Suspense>
  );
}

async function Editor() {
  if (!(await hasAdminSession())) redirect('/admin/login');

  // Strict: if the database can't be read, show an error instead of the defaults, so nothing can be saved over
  // Mariam's real content by mistake.
  let loaded: LoadedContent | null = null;
  try {
    loaded = await loadContent({ strict: true });
  } catch (error) {
    if (!(error instanceof StorageError)) throw error;
  }

  if (!loaded) {
    return (
      <main className="a-login">
        <div className="a-login__card">
          <h1 className="a-login__title">The editor can’t load your content</h1>
          <p>
            Your saved content couldn’t be read from the database just now, so editing is paused to keep it safe. Nothing
            has been lost or changed. Please reload in a minute.
          </p>
          <p>
            <a className="a-btn a-btn--save" href="/admin">
              Reload
            </a>
          </p>
        </div>
      </main>
    );
  }

  return <AdminEditor initialContent={loaded.content} updatedAt={loaded.updatedAt} storage={storageStatus()} />;
}
