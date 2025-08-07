import React from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const ChatUserList = ({ users = [], campaignMembers = [], show, onClose }) => {
  // Merge online users with campaign members to show status
  const allMembers = campaignMembers.map(member => ({
    ...member,
    isOnline: users.find(u => u.id === member.id) ? true : false
  }));

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />
          
          {/* User List Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 md:relative md:w-64 md:shadow-none"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Campaign Members
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {allMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-3"
                    >
                      {/* Avatar with online status */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {member.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        {/* Online indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.username}
                          </p>
                          {member.role === 'dm' ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                              <ShieldCheckIcon className="w-3 h-3" />
                              GM
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                              <UserIcon className="w-3 h-3" />
                              Player
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Online count summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {users.length} of {allMembers.length} members online
                  </div>
                </div>
              </div>

              {/* Footer with help text */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Online</span>
                    <div className="w-2 h-2 rounded-full bg-gray-400 ml-3" />
                    <span>Offline</span>
                  </div>
                  Members show as online when they're in the chat room
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatUserList;
