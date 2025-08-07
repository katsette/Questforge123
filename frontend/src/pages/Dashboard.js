import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.profile?.displayName || user?.username}! 🎲
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Ready to embark on your next adventure?
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="card min-h-[120px]">
          <div className="card-body flex items-center h-full">
            <div className="flex items-center w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  Active Campaigns
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                  {user?.campaigns?.filter(c => c.isActive)?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card min-h-[120px]">
          <div className="card-body flex items-center h-full">
            <div className="flex items-center w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📜</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  Characters
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                  {user?.characters?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card min-h-[120px]">
          <div className="card-body flex items-center h-full">
            <div className="flex items-center w-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">⭐</span>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  Sessions Played
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center sm:text-left">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link
            to="/campaigns"
            className="card hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-200 group min-h-[160px] sm:min-h-[180px]"
          >
            <div className="card-body text-center flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl">🏰</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Browse Campaigns
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Join existing campaigns or create your own
              </p>
            </div>
          </Link>

          <Link
            to="/characters"
            className="card hover:shadow-lg hover:shadow-green-500/10 transition-all duration-200 group min-h-[160px] sm:min-h-[180px]"
          >
            <div className="card-body text-center flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl">⚔️</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Create Character
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Build your next tabletop character
              </p>
            </div>
          </Link>

          <div className="card hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-200 group cursor-pointer min-h-[160px] sm:min-h-[180px]">
            <div className="card-body text-center flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl">🎲</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Roll Dice
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Quick dice rolling tool
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white text-center sm:text-left">
            Recent Activity
          </h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 sm:py-12">
            <span className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 block">📖</span>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4">
              Start playing to see your adventure history here
            </p>
            <Link to="/campaigns" className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              Join a Campaign
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Welcome Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="card bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800"
      >
        <div className="card-body">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center sm:text-left">
            🌟 Getting Started Tips
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs sm:text-sm font-medium">1</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Create your first character</strong> - Head to the Characters section to build your tabletop character sheet
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs sm:text-sm font-medium">2</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Join a campaign</strong> - Browse public campaigns or ask a GM for an invite code
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs sm:text-sm font-medium">3</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Explore the dice roller</strong> - Practice rolling with advantage, disadvantage, and complex modifiers
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
