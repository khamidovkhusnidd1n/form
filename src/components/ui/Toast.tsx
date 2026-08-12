import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { borderRadius: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px' },
        success: { style: { background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' } },
        error: { style: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#7f1d1d' } },
      }}
    />
  );
}
