import { Outlet } from 'react-router-dom';
import { APP_CONFIG } from '@/constants/app';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Split-screen auth layout (design: adminpro-design-docs/login.md).
 * Left = brand atmosphere panel (mint gradient, logo, tagline, quote).
 * Right = form column. The brand panel hides below 900px.
 */
export default function AuthLayout() {
  const { settings } = useSettings();
  return (
    <div className="layout-auth">
      <aside className="auth-brand">
        <img src={settings.logo || APP_CONFIG.logo} alt="" className="auth-brand__logo" />
        <div className="auth-brand__text">
          <h2>{settings.name}</h2>
          <p>Wholesale catalog, inquiries and fulfillment — one precise console.</p>
          <blockquote>
            "Data over decoration."
            <br />
            Swiss precision for pet commerce operations.
          </blockquote>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-form-container">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
