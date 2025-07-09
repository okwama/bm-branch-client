import React from 'react';
import { BellIcon, UserIcon, LockIcon, GlobeIcon, PaletteIcon } from 'lucide-react';
const SettingsPage: React.FC = () => {
  return <div className="px-4 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Settings
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Manage your account and application preferences
        </p>
      </div>
      <div className="mt-8">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile Settings
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="you@example.com" />
                </div>
              </div>
            </div>
          </div>
          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <LockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Security
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
                  Change Password
                </button>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-900">
                      Enable two-factor authentication
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* Notifications */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Notifications
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {['Email notifications', 'Push notifications', 'SMS notifications'].map(item => <div key={item} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input type="checkbox" className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700">
                        {item}
                      </label>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
          {/* Display Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <PaletteIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Display
                </h3>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default SettingsPage;