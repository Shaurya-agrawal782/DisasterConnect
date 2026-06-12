import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-lg">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-margin-desktop h-16 bg-surface border-b border-outline-variant transition-colors">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            DisasterConnect
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="font-label-lg text-label-lg text-primary bg-primary-container/10 px-4 py-2 rounded font-semibold hover:bg-primary-container/20 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="font-label-lg text-label-lg bg-primary text-on-primary px-4 py-2 rounded font-semibold hover:bg-primary/90 transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-16 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 flex flex-col gap-6 md:pr-8">
            <div className="inline-flex items-center gap-2 bg-error-container text-on-error-container px-3 py-1 rounded-full w-fit">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span className="font-label-md text-label-md">Active Alert System</span>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">
              Coordinating Safety,<br />When Seconds Count.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              DisasterConnect is the unified platform for emergency response. Real-time intelligence, seamless coordination between agencies, and rapid public alerts. Built for resilience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                to="/register"
                className="font-label-lg text-label-lg bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">campaign</span>
                Get Started (Register)
              </Link>
              <Link
                to="/login"
                className="font-label-lg text-label-lg bg-surface border border-outline-variant text-on-surface px-6 py-3 rounded-lg font-semibold hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
              >
                Sign In Portal
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2 border-b border-surface-variant pb-2 font-semibold">
              <span className="material-symbols-outlined text-error">campaign</span>
              Real-Time Alerts Preview
            </h3>
            <div className="space-y-4">
              {/* Alert Item 1 */}
              <div className="bg-error/5 border-l-4 border-error p-3 rounded-r-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-label-md font-bold text-error">Evacuation Notice</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">2 mins ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">Sector 4 Flooding. Immediate evacuation ordered for lowland residents.</p>
              </div>
              {/* Alert Item 2 */}
              <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-label-md font-bold text-primary">Resource Update</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">15 mins ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">Water distribution center opened at Central High School.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="w-full bg-surface-container-low py-16 md:py-24">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-12">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Integrated Response Framework</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-xl mx-auto">
                A comprehensive suite designed for both rapid civilian reporting and complex multi-agency coordination.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bento Box 1: Civic */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="h-12 w-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-semibold">For Citizens</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  Quickly report incidents, view localized safety alerts, and access emergency resources without creating an account.
                </p>
                <Link to="/register" className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-1">
                  Create Citizen Account <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>

              {/* Bento Box 2: Responders */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow md:col-span-2">
                <div className="h-12 w-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">security</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-semibold">For Responders & Command</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                  Secure operational dashboard with real-time mapping, resource allocation, and multi-agency comms channels.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Live Incident Mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Resource Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Secure Comms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="font-body-sm text-body-sm text-on-surface">Public Alert Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Credentials Note Section */}
        <section className="w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-12">
          <div className="p-6 bg-surface-container-low border border-dashed border-outline rounded-2xl text-center space-y-3">
            <h4 className="text-base font-semibold text-on-surface">Looking for Evaluation Credentials?</h4>
            <p className="text-on-surface-variant text-sm max-w-2xl mx-auto">
              Seeded user profiles (Admin, Responder, Citizen) are configured for immediate testing. 
              Use credentials: 
              <br />
              <code className="text-primary font-mono text-xs px-2 py-0.5 bg-surface-container-lowest border rounded">admin@disasterconnect.dev</code> / <code className="text-primary font-mono text-xs px-2 py-0.5 bg-surface-container-lowest border rounded">Admin@12345</code>
              <br />
              <code className="text-primary font-mono text-xs px-2 py-0.5 bg-surface-container-lowest border rounded">responder@disasterconnect.dev</code> / <code className="text-primary font-mono text-xs px-2 py-0.5 bg-surface-container-lowest border rounded">Responder@12345</code>
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-16">
          <div className="bg-primary text-on-primary rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <h2 className="font-headline-md text-headline-md font-bold mb-4 relative z-10">System Status: Operational</h2>
            <p className="font-body-lg text-body-lg text-primary-fixed mb-8 max-w-xl relative z-10">
              Authorized personnel can access the Command Center to manage ongoing operations or configure pre-event alerts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <Link to="/login" className="font-label-lg text-label-lg bg-surface text-primary px-6 py-3 rounded-lg font-semibold hover:bg-surface-variant transition-colors shadow-sm">
                Admin Login Portal
              </Link>
              <Link to="/register" className="font-label-lg text-label-lg bg-transparent border border-primary-fixed text-primary-fixed px-6 py-3 rounded-lg font-semibold hover:bg-primary-fixed/10 transition-colors">
                Request Access
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-highest border-t border-outline-variant py-8 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">emergency</span>
            <span className="font-label-lg text-label-lg font-bold text-on-surface-variant">DisasterConnect Protocol</span>
          </div>
          <div className="flex gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

