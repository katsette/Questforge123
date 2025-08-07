import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
        </div>
        <div className="card-body text-center py-12">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-medium text-primary-700 dark:text-primary-300">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {user?.profile?.displayName || user?.username}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {user?.email}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Profile editing coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
