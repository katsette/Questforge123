import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarIcon,
  EyeIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

const CampaignCard = ({ campaign, currentUser, onJoin, onLeave }) => {
  const isGM = campaign.dmId === currentUser?.id;
  const isMember = campaign.isMember > 0 || isGM;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMembershipBadge = () => {
    if (isGM) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
          <ShieldCheckIcon className="w-3 h-3" />
          Game Master
        </div>
      );
    } else if (isMember) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
          <UserIcon className="w-3 h-3" />
          Member
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="card-body">
        {/* Header with title and badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {campaign.name}
          </h3>
          {getMembershipBadge()}
        </div>

        {/* Description */}
        {campaign.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {campaign.description}
          </p>
        )}

        {/* Campaign Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" />
            <span>GM: {campaign.dmUsername}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <UserGroupIcon className="w-4 h-4 flex-shrink-0" />
            <span>{campaign.memberCount || 1} members</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
            <span>Created {formatDate(campaign.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isMember ? (
            <>
              <Link
                to={`/campaigns/${campaign.id}`}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2"
              >
                <EyeIcon className="w-4 h-4" />
                View Campaign
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              
              {!isGM && (
                <button
                  onClick={onLeave}
                  className="btn-secondary flex items-center gap-1 text-sm py-2 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Leave Campaign"
                >
                  <UserMinusIcon className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onJoin}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2"
            >
              <UserPlusIcon className="w-4 h-4" />
              Join Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
