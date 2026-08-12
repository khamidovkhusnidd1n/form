import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastProvider from '../ui/Toast';

export default function PublicLayout() {
  return (
    <>
      <ToastProvider />
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}
