import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                🎲
              </div>
              <span className="font-fantasy text-xl font-bold text-white">
                QuestForge
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-primary-200 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Forge Epic
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400 block">
                Tabletop Adventures
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              The ultimate companion for tabletop gaming players and Game Masters.
              Manage campaigns, create characters, chat in real-time, and get AI-powered
              assistance for your adventures.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Your Quest
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-3 rounded-xl"
              >
                Continue Adventure
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-16">
              Everything You Need for Tabletop Gaming
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  👥
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Campaign Management</h3>
                <p className="text-gray-300">
                  Create and manage campaigns with ease. Invite players, set schedules,
                  and keep track of your story progress.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  📜
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Character Sheets</h3>
                <p className="text-gray-300">
                  Complete character sheets with automatic calculations.
                  Create, edit, and share your characters with your party.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  💬
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Real-time Chat</h3>
                <p className="text-gray-300">
                  Chat with your party in multiple channels. In-character, out-of-character,
                  and private GM channels all in one place.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  🎲
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Dice Roller</h3>
                <p className="text-gray-300">
                  Advanced dice rolling with full standard notation support.
                  Roll with advantage, disadvantage, and complex modifiers.
                </p>
              </motion.div>

              {/* Feature 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  🤖
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">AI Assistant</h3>
                <p className="text-gray-300">
                  Get AI-powered help with plot ideas, character development,
                  and story suggestions to enhance your campaigns.
                </p>
              </motion.div>

              {/* Feature 6 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  ⚡
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Real-time Updates</h3>
                <p className="text-gray-300">
                  Everything syncs in real-time. Character updates, dice rolls,
                  and campaign changes are instantly shared with your party.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative z-10 px-6 py-24 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Begin Your Adventure?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of adventurers already using QuestForge
          </p>
          <Link
            to="/register"
            className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Your Account
          </Link>
        </div>

        {/* Footer */}
        <footer className="relative z-10 px-6 py-8 border-t border-white/20">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-400">
              © 2024 QuestForge. Built for the tabletop gaming community with ❤️ This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
