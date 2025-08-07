import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCampaigns, createCampaign, joinCampaign, leaveCampaign } from '../services/campaignService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarIcon,
  EyeIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import CreateCampaignModal from '../components/campaigns/CreateCampaignModal';
import CampaignCard from '../components/campaigns/CampaignCard';

const CampaignsPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'my'
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = fetchCampaigns(user?.uid, filterTab, (fetchedCampaigns) => {
      setCampaigns(fetchedCampaigns);
      setFilteredCampaigns(fetchedCampaigns);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterTab, user]);

  useEffect(() => {
    const filtered = campaigns.filter(campaign => 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.dmUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCampaigns(filtered);
  }, [searchTerm, campaigns]);

  const handleCreateCampaign = async (campaignData) => {
    try {
      const newCampaign = await createCampaign({ ...campaignData, dmId: user.uid, dmUsername: user.email });
      setShowCreateModal(false);
      // Campaigns will be re-fetched by the useEffect due to Firebase listener
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err; // Re-throw to let modal handle error display
    }
  };

  const handleJoinCampaign = async (campaignId) => {
    try {
      await joinCampaign(campaignId, user.uid);
      // Campaigns will be re-fetched by the useEffect due to Firebase listener
    } catch (err) {
      console.error('Error joining campaign:', err);
      alert('Failed to join campaign');
    }
  };

  const handleLeaveCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to leave this campaign?')) {
      return;
    }
    
    try {
      await leaveCampaign(campaignId, user.uid);
      // Campaigns will be re-fetched by the useEffect due to Firebase listener
    } catch (err) {
      console.error('Error leaving campaign:', err);
      alert('Failed to leave campaign');
    }
  };

  const tabs = [
    { id: 'all', name: 'Browse All', icon: MagnifyingGlassIcon },
    { id: 'my', name: 'My Campaigns', icon: UserIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading campaigns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">⚠️</span>
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Campaigns</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => fetchCampaigns(filterTab)}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Campaigns 🏰
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and join epic adventures with other players
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <PlusIcon className="w-5 h-5" />
          Create Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  filterTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns by name, description, or GM..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => {
            console.log('Search input clicked:', e.target);
            e.target.focus();
          }}
          onFocus={() => console.log('Search input focused')}
          className="input-primary pl-10 pr-4"
          style={{ pointerEvents: 'auto', zIndex: 10 }}
          autoComplete="off"
        />
      </div>

      {/* Campaigns Grid */}
      <AnimatePresence>
        {filteredCampaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <span className="text-6xl mb-4 block">🏰</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filterTab === 'my' ? 'No campaigns yet' : 'No campaigns found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterTab === 'my' 
                ? 'Create your first campaign or join an existing one'
                : searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Be the first to create a campaign!'}
            </p>
            {(filterTab === 'my' || !searchTerm) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Your First Campaign
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CampaignCard
                  campaign={campaign}
                  currentUser={user}
                  onJoin={() => handleJoinCampaign(campaign.id)}
                  onLeave={() => handleLeaveCampaign(campaign.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCampaign}
      />
    </div>
  );
};

export default CampaignsPage;
