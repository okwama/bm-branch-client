import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, HomeIcon, UsersIcon, CogIcon, ShieldIcon, BoxIcon, ImageIcon, InfoIcon, GroupIcon, Tally4Icon, BellIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DangerousRounded } from '@mui/icons-material';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon
  },
  {
    name: 'Photo List',
    href: '/dashboard/photo-list',
    icon: ImageIcon
  },
  // {
  //   name: 'Client List',
  //   href: '/dashboard/clients-list',
  //   icon: UsersIcon
  // },
  {
    name: 'Runs Reports',
    href: '/dashboard/daily',
    icon: Tally4Icon
  },
  {
    name: 'Notice Board',
    href: '/dashboard/notices',
    icon: BellIcon
  },
  // {
  //   name: 'Reports',
  //   href: '/dashboard/reports',
  //   icon: BoxIcon
  // },
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: CogIcon
  // }
];

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const location = useLocation();
  const { user } = useAuth();

  const logoSection = (
    <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white">
      {/* <img src="/bm.jpeg" alt="Logo" className="h-8 w-auto" /> */}
      <h1 className="text-2xl font-bold text-red-800">BM SECURITY</h1>
    </div>
  );

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              {logoSection}
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      >
                        <Icon
                          className={`${
                            isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'
                          } mr-4 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <span className="text-sm font-medium text-red-600">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            {logoSection}
            <div className="flex-1 flex flex-col overflow-y-auto bg-white border-r border-gray-200">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <Icon
                        className={`${
                          isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;