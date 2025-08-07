import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  PencilIcon,
  Cog6ToothIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCampaign(data.campaign);
      } else {
        setError(data.error || 'Failed to fetch campaign details');
      }
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isGM = campaign?.dmId === user?.id;
  const userMember = campaign?.members?.find(member => member.id === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading campaign...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">⚠️</span>
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Campaign</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/campaigns')}
          className="btn-primary"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🏰</span>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Campaign Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The campaign you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          onClick={() => navigate('/campaigns')}
          className="btn-primary"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
              {campaign.name}
            </h1>
            {isGM && (
              <div className="flex items-center gap-2 ml-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Game Master
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            GM: <span className="font-medium">{campaign.dmUsername}</span> • Created {formatDate(campaign.createdAt)}
          </p>
        </div>
      </div>

      {/* Campaign Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Campaign Description
              </h2>
            </div>
            <div className="card-body">
              {campaign.description ? (
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {campaign.description}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No description provided yet.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to={`/campaigns/${campaign.id}/chat`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="card-body text-center">
                <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Chat Room</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Join the conversation</p>
              </div>
            </Link>

            <Link
              to={`/campaigns/${campaign.id}/characters`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="card-body text-center">
                <UsersIcon className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Characters</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.characters?.length || 0} characters</p>
              </div>
            </Link>

            <Link
              to={`/campaigns/${campaign.id}/dice`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="card-body text-center">
                <span className="text-2xl mb-2 block">🎲</span>
                <h3 className="font-medium text-gray-900 dark:text-white">Dice Roller</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Roll with the group</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Info</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {campaign.memberCount} Members
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Including GM
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Active Campaign
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Since {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Members
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {campaign.members?.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {member.username[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.username}
                        {member.id === user?.id && (
                          <span className="text-xs text-gray-500 ml-1">(You)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        {member.role === 'dm' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                            <ShieldCheckIcon className="w-3 h-3" />
                            GM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                            <UserIcon className="w-3 h-3" />
                            Player
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* GM Actions */}
          {isGM && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Cog6ToothIcon className="w-5 h-5" />
                  GM Tools
                </h2>
              </div>
              <div className="card-body space-y-3">
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Edit Campaign
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <UserGroupIcon className="w-4 h-4" />
                  Manage Members
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
