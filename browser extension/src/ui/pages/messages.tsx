import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  ExternalLink,
  Loader2,
  Eye,
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { isAuthenticated, getToken } from '../../utils/auth';

interface Message {
  id: string;
  userName: string;
  profileUrl?: string;
  profilePicUrl?: string;
  time?:String;
  timeOfMessage: string;
  messageContent: string;
  platform: string;
}

interface Filters {
  userName: string;
  platform: string;
  startDate: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedMessages, setRevealedMessages] = useState<{ [key: string]: boolean }>({});

  // Filters 
  const [filters, setFilters] = useState<Filters>({
    userName: '',
    platform: '',
    startDate: ''
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [initialFilters] = useState<Filters>({
    userName: '',
    platform: '',
    startDate: ''
  });

  const fetchMessages = async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        setLoading(true);
        const token = await getToken();
        const queryParams = new URLSearchParams({
          userName: filters.userName,
          platform: filters.platform,
          startDate: filters.startDate,
          sortBy: 'timeOfMessage',
          sortOrder: 'desc'
        }).toString();

        const response = await fetch(`https://harassment-saver-extension.onrender.com/api/v1/user/hidden-messages?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.status === 'success') {
          setMessages(data.data.messages);
        } else {
          setError('Failed to fetch hidden messages');
        }
      } catch (error) {
        setError('An error occurred while fetching messages');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please log in to view hidden messages');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSearch = () => {
    fetchMessages();
  };

  const clearFilters = () => {
    setFilters({ ...initialFilters });
    fetchMessages();
  };

  const toggleMessageReveal = (messageId: string) => {
    setRevealedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleViewDashboard = () => {
    chrome.tabs.create({
      url: 'https://safe-dm-dashboard.vercel.app/dashboard/profile'
    });
  };

  const renderFilterSection = () => (
    <div className="plasmo-bg-gray-800 plasmo-rounded-lg plasmo-p-4 plasmo-mb-4 plasmo-flex plasmo-flex-col plasmo-gap-4 plasmo-w-full">
      <button
        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-w-full plasmo-text-sm plasmo-text-gray-300"
      >
        <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
          <Filter className="plasmo-w-4 plasmo-h-4" />
          <span>Filters</span>
        </div>
        {isFiltersExpanded ? <ChevronUp className="plasmo-w-4 plasmo-h-4" /> : <ChevronDown className="plasmo-w-4 plasmo-h-4" />}
      </button>

      {isFiltersExpanded && (
        <div>
          <div className="plasmo-grid plasmo-grid-cols-1 md:plasmo-grid-cols-3 plasmo-gap-3 plasmo-mb-3">
            <input
              type="text"
              placeholder="Search by Name"
              value={filters.userName}
              onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
              className="plasmo-w-full plasmo-px-3 plasmo-py-2 plasmo-bg-gray-700 plasmo-rounded-md plasmo-text-sm plasmo-border plasmo-border-gray-600 focus:plasmo-outline-none focus:plasmo-border-blue-500"
            />

            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
              className="plasmo-w-full plasmo-px-3 plasmo-py-2 plasmo-bg-gray-700 plasmo-rounded-md plasmo-text-sm plasmo-border plasmo-border-gray-600 focus:plasmo-outline-none focus:plasmo-border-blue-500"
            >
              <option value="">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="plasmo-w-full plasmo-px-3 plasmo-py-2 plasmo-bg-gray-700 plasmo-rounded-md plasmo-text-sm plasmo-border plasmo-border-gray-600 focus:plasmo-outline-none focus:plasmo-border-blue-500"
            />
          </div>

          <div className="plasmo-flex plasmo-justify-end plasmo-space-x-2">
            {(filters.userName || filters.platform || filters.startDate) && (
              <button
                onClick={clearFilters}
                className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-px-3 plasmo-py-2 plasmo-bg-gray-700 plasmo-text-gray-300 plasmo-rounded-md plasmo-text-sm hover:plasmo-bg-gray-600 plasmo-transition-colors"
              >
                <X className="plasmo-w-4 plasmo-h-4" />
                Clear Filters
              </button>
            )}
            <button
              onClick={handleSearch}
              className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-px-4 plasmo-py-2 plasmo-bg-blue-600 plasmo-text-white plasmo-rounded-md plasmo-text-sm hover:plasmo-bg-blue-700 plasmo-transition-colors"
            >
              <Search className="plasmo-w-4 plasmo-h-4" />
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-64">
        <Loader2 className="plasmo-w-6 plasmo-h-6 plasmo-animate-spin plasmo-text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="plasmo-p-4 plasmo-text-center">
        <div className="plasmo-text-red-400 plasmo-mb-4">{error}</div>
        {error === 'Please log in to view hidden messages' && (
          <button
            onClick={() => chrome.runtime.sendMessage({ action: "initiateLogin" })}
            className="plasmo-bg-blue-600 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded-md plasmo-hover:bg-blue-700 plasmo-transition-colors"
          >
            Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="plasmo-p-4 plasmo-bg-gray-900 plasmo-min-h-screen">
      <div className="plasmo-flex plasmo-justify-between plasmo-items-center plasmo-mb-6">
        <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
          <MessageSquare className="plasmo-w-5 plasmo-h-5 plasmo-text-blue-500" />
          <h2 className="plasmo-text-lg plasmo-font-medium plasmo-text-white">
            Hidden Messages
          </h2>
        </div>
        <button
          onClick={handleViewDashboard}
          className="plasmo-flex plasmo-items-center plasmo-gap-1 plasmo-text-sm plasmo-text-blue-400 plasmo-hover:text-blue-300 plasmo-transition-colors"
        >
          <span>View All</span>
          <ExternalLink className="plasmo-w-4 plasmo-h-4" />
        </button>
      </div>

      {renderFilterSection()}

      {messages.length === 0 ? (
        <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-64 plasmo-text-gray-400">
          <MessageSquare className="plasmo-w-12 plasmo-h-12 plasmo-mb-4 plasmo-opacity-50" />
          <p>No hidden messages match your filters</p>
        </div>
      ) : (
        <div className="plasmo-space-y-3">
          <div className="plasmo-space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="plasmo-bg-gray-800 plasmo-rounded-lg plasmo-p-4 plasmo-transition-colors hover:plasmo-bg-gray-750"
              >
                <div className="plasmo-flex plasmo-justify-between plasmo-items-start plasmo-mb-3">
                  <div className="plasmo-flex plasmo-items-center plasmo-gap-3">
                    {/* Profile Picture */}
                    <div
                      className="plasmo-w-10 plasmo-h-10 plasmo-rounded-full plasmo-overflow-hidden plasmo-flex-shrink-0"
                      onClick={() => message.profileUrl && chrome.tabs.create({ url: message.profileUrl })}
                      title="View User Profile"
                    >
                      <img
                        src={message.profilePicUrl || 'https://via.placeholder.com/40'}
                        alt={`${message.userName}'s profile`}
                        className="plasmo-w-full plasmo-h-full plasmo-object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                    </div>

                    <div className="plasmo-flex plasmo-flex-col plasmo-gap-1">
                      <div
                        className="plasmo-font-medium plasmo-text-blue-400 plasmo-text-base hover:plasmo-underline plasmo-cursor-pointer"
                        onClick={() => message.profileUrl && chrome.tabs.create({ url: message.profileUrl })}
                        title="View User Profile"
                      >
                        {message.userName}
                      </div>
                      <div className="plasmo-text-xs plasmo-text-gray-400">
                        {message.time}
                      </div>
                    </div>
                  </div>

                  <span className="plasmo-text-xs plasmo-bg-red-500/10 plasmo-text-red-400 plasmo-px-2 plasmo-py-1 plasmo-rounded-full plasmo-font-medium">
                    {message.platform}
                  </span>
                </div>

                <div
                  className={`plasmo-mt-3 plasmo-p-3 plasmo-bg-gray-900/50 plasmo-rounded-md plasmo-text-sm plasmo-text-gray-300 ${!revealedMessages[message.id] ? 'plasmo-blur-sm plasmo-select-none' : ''
                    }`}
                >
                  {message.messageContent}
                </div>

                <button
                  onClick={() => toggleMessageReveal(message.id)}
                  className="plasmo-mt-2 plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-text-xs plasmo-text-blue-400 plasmo-hover:text-blue-300 plasmo-transition-colors"
                >
                  <Eye className="plasmo-w-3.5 plasmo-h-3.5" />
                  <span>{revealedMessages[message.id] ? 'Hide Message' : 'Show Message'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;