import { Building2, Bell, Lock, Palette, Globe, Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your organisation and account preferences</p>
      </div>

      {/* Organisation */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={16} className="text-navy-700" />
          <h3 className="text-sm font-semibold text-gray-900">Organisation Profile</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Organisation Name</label>
            <input type="text" defaultValue="Sharma & Associates" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Primary Email</label>
              <input type="email" defaultValue="contact@sharmaassociates.in" className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" defaultValue="+91 44 1234 5678" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Office Address</label>
            <textarea defaultValue="4th Floor, Eldorado Building, Nungambakkam, Chennai – 600034" className="input resize-none" rows={2} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={16} className="text-navy-700" />
          <h3 className="text-sm font-semibold text-gray-900">Notification Preferences</h3>
        </div>
        <div className="space-y-3">
          {[
            ['Hearing reminders', 'Get notified 24 hours before a hearing', true],
            ['New client messages', 'Alert when a client sends a message', true],
            ['Appointment confirmations', 'Notify when appointments are confirmed', true],
            ['Document uploads', 'Alert when a client uploads a document', false],
            ['Case status changes', 'Notify on case status updates', true],
          ].map(([title, desc, defaultChecked]) => (
            <div key={title} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-navy-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-navy-700" />
          <h3 className="text-sm font-semibold text-gray-900">Security</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
          </div>
          <button className="btn-secondary text-xs">Update Password</button>
        </div>
      </div>

      <button className="btn-primary">
        <Save size={15} /> Save All Changes
      </button>
    </div>
  );
}
