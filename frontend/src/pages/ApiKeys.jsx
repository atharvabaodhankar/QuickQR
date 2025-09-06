import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Code
} from 'lucide-react';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/apikey');
      setApiKeys(response.data);
    } catch (error) {
      toast.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    
    try {
      const response = await axios.post('/apikey/generate', {
        name: newKeyName.trim()
      });
      
      toast.success('API key created successfully!');
      setApiKeys([response.data.apiKey, ...apiKeys]);
      setNewKeyName('');
      setShowCreateModal(false);
      
      // Show the new key by default
      setVisibleKeys(new Set([response.data.apiKey.id]));
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create API key';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/apikey/${id}`);
      toast.success('API key deleted successfully');
      setApiKeys(apiKeys.filter(key => key.id !== id));
      setVisibleKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleCopyApiKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('API key copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskApiKey = (key) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}${'*'.repeat(key.length - 16)}${key.substring(key.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
            <p className="mt-2 text-gray-600">
              Manage your API keys for programmatic access to QR code generation
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </button>
        </div>

        {/* API Usage Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Code className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">API Usage</h3>
              <p className="text-blue-700 mb-4">
                Use your API keys to generate QR codes programmatically. Each API key has rate limits:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {[
                  { label: 'Hourly Limit', value: '100 requests' },
                  { label: 'Daily Limit', value: '1,000 requests' },
                  { label: 'Monthly Limit', value: '10,000 requests' }
                ].map((limit, index) => (
                  <div key={index} className="bg-white rounded-lg p-3">
                    <div className="font-medium text-gray-900">{limit.label}</div>
                    <div className="text-gray-600">{limit.value}</div>
                  </div>
                ))}</div>
              <div className="mt-4 p-3 bg-white rounded-lg">
                <code className="text-sm text-gray-800">
                  GET http://localhost:5000/qrcode?url=https://example.com
                  <br />
                  Header: x-api-key: your_api_key_here
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        {apiKeys.length > 0 ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your API Keys</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {apiKey.name}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Created {formatDate(apiKey.createdAt)}
                            </div>
                            <div className="flex items-center">
                              {apiKey.isActive ? (
                                <React.Fragment key="active">
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  Active
                                </React.Fragment>
                              ) : (
                                <React.Fragment key="inactive">
                                  <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                                  Inactive
                                </React.Fragment>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                        </div>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          title={visibleKeys.has(apiKey.id) ? 'Hide API key' : 'Show API key'}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyApiKey(apiKey.key)}
                          className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          title="Copy API key"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <button
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        className="p-2 text-red-400 hover:text-red-600 focus:outline-none"
                        title="Delete API key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Key className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first API key to start using the QR code API
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </button>
          </div>
        )}

        {/* Create API Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New API Key</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleCreateApiKey}>
                  <div className="mb-4">
                    <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                      API Key Name
                    </label>
                    <input
                      type="text"
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API Key"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a descriptive name to help you identify this key
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </div>
                      ) : (
                        'Create API Key'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeys;