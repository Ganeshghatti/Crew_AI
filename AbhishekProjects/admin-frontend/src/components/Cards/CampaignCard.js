import React from 'react';
import { Link } from 'react-router-dom';

function CampaignCard({ title, url, link, amount, amountDonated }) {
  // Calculate percentage for progress bar
  const progress = amount ? Math.min((amountDonated / amount) * 100, 100) : 0;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Link to={`/app/campaigns/${link}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Container */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Progress Bar Container */}
          <div className="mt-3 border">
            <div className="flex justify-end text-sm text-gray-600 mb-1">
              <span>{formatCurrency(amountDonated)}</span> &nbsp;
              <span>of {formatCurrency(amount)}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Percentage */}
            <div className="text-right text-sm text-gray-600 mt-1">
              {progress.toFixed(1)}% funded
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CampaignCard;