import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import AdminDashboard from './components/AdminDashboard.tsx'; // Import i ri
import './index.css';

// Konfigurimi i routerit
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Faqja e Klientit
  },
  {
    path: "/admin",
    element: <AdminDashboard />, // Faqja e Administratorit
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} /> 
  </StrictMode>
);