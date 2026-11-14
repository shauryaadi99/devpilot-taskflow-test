import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Task<span className="text-indigo-600">Flow</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                MERN
              </span>
            </div>
          </div>

          {/* User profile & Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <button
                onClick={logout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

