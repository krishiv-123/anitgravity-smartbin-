'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ISSUE_TYPES, generateRefNumber } from '@/lib/utils';

export default function ReportPage() {
  const [bins, setBins] = useState([]);
  const [form, setForm] = useState({
    issueType: '',
    binId: '',
    location: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    fetch('/api/bins').then((r) => r.json()).then((d) => setBins(d.bins || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.issueType) errs.issueType = 'Please select an issue type';
    if (!form.location && !form.binId) errs.location = 'Please provide a location or select a bin';
    if (!form.description || form.description.trim().length < 10) errs.description = 'Please describe the issue (at least 10 characters)';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errs.contactEmail = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(data.complaint);
      } else {
        setErrors({ submit: data.error || 'Failed to submit report' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    }
    setSubmitting(false);
  };

  const handleBinSelect = (binId) => {
    const bin = bins.find((b) => b.id === binId);
    setForm((prev) => ({
      ...prev,
      binId,
      location: bin ? `${bin.location.address}, ${bin.location.neighborhood}` : prev.location,
    }));
  };

  // Confirmation view
  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="page-container max-w-2xl mx-auto">
            <div className="card p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Report Submitted</h1>
              <p className="text-gray-400 mb-6">Thank you for helping keep Greenfield clean and safe.</p>

              <div className="bg-sp-bg rounded-xl p-6 mb-6 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Reference Number</div>
                    <div className="text-lg font-mono font-semibold text-sp-lime">{submitted.refNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="badge bg-amber-500/20 text-amber-400">Submitted</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Issue Type</div>
                    <div className="text-sm text-gray-300">
                      {ISSUE_TYPES.find((t) => t.value === submitted.issueType)?.label || submitted.issueType}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm text-gray-300">{submitted.location}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">Description</div>
                    <div className="text-sm text-gray-300">{submitted.description}</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Save your reference number to track this report. Our team will review it shortly.
              </p>

              <button
                onClick={() => { setSubmitted(null); setForm({ issueType: '', binId: '', location: '', description: '', contactName: '', contactEmail: '', contactPhone: '' }); }}
                className="btn-secondary"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="page-container max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              Report a Problem
            </h1>
            <p className="text-gray-500 mt-1">Help us maintain public bins by reporting damage, overflow, or other issues.</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            {/* Issue type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Issue Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.issueType}
                onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                className="select-field"
              >
                <option value="">Select issue type...</option>
                {ISSUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.issueType && <p className="text-xs text-red-400 mt-1">{errors.issueType}</p>}
            </div>

            {/* Bin selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Bin (if known)
              </label>
              <select
                value={form.binId}
                onChange={(e) => handleBinSelect(e.target.value)}
                className="select-field"
              >
                <option value="">Select a bin or enter location below...</option>
                {bins.map((b) => (
                  <option key={b.id} value={b.id}>{b.id} — {b.name} ({b.location.neighborhood})</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Street address, intersection, or landmark..."
                className="input-field"
              />
              {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the problem in detail..."
                className="textarea-field"
                rows={4}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
            </div>

            {/* Photo placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Photo (optional)
              </label>
              <div className="border-2 border-dashed border-sp-border rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer">
                <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <p className="text-xs text-gray-500">Photo upload requires backend storage integration</p>
                <p className="text-xs text-gray-600 mt-1">Not available in demo mode</p>
              </div>
            </div>

            {/* Contact (optional) */}
            <div className="border-t border-sp-border pt-5">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Contact Details (optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Your name"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="Email address"
                    className="input-field text-sm"
                  />
                  {errors.contactEmail && <p className="text-xs text-red-400 mt-1">{errors.contactEmail}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="Phone number"
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {errors.submit}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-600">
                Your report will be reviewed by our maintenance team.
              </p>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
