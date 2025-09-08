import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
  Code,
} from "lucide-react";
import { getBackendUrl } from "../utils/config";

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await axios.get("/apikey");
      setApiKeys(response.data);
      if (showToast) {
        toast.success("Usage statistics refreshed!");
      }
    } catch (error) {
      toast.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();

    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post("/apikey/generate", {
        name: newKeyName.trim(),
      });

      toast.success("API key created successfully!");
      setApiKeys([response.data.apiKey, ...apiKeys]);
      setNewKeyName("");
      setShowCreateModal(false);

      // Show the new key by default
      setVisibleKeys(new Set([response.data.apiKey.id]));
    } catch (error) {
      const message = error.response?.data?.error || "Failed to create API key";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/apikey/${id}`);
      toast.success("API key deleted successfully");
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      setVisibleKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const handleCopyApiKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success("API key copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy API key");
    }
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys((prev) => {
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskApiKey = (key) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}${"*".repeat(key.length - 16)}${key.substring(
      key.length - 8
    )}`;
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
          <div className="flex space-x-3">
            <button
              onClick={() => fetchApiKeys(true)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Activity className="h-4 w-4 mr-2" />
              {loading ? "Refreshing..." : "Refresh Usage"}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </button>
          </div>
        </div>

        {/* API Documentation */}
        <div className="space-y-8 mb-8">
          {/* Quick Start */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Code className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Quick Start
                </h3>
                <p className="text-blue-700 mb-4">
                  Generate QR codes programmatically using your API key. Each
                  API key has rate limits:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                  {[
                    { label: "Hourly Limit", value: "100 requests" },
                    { label: "Daily Limit", value: "1,000 requests" },
                    { label: "Monthly Limit", value: "10,000 requests" },
                  ].map((limit, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-gray-900">
                        {limit.label}
                      </div>
                      <div className="text-gray-600">{limit.value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Basic Usage
                  </h4>
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {`GET ${getBackendUrl()}/qrcode?url=https://example.com
Header: x-api-key: your_api_key_here`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          {/* API Keys List */}
          {apiKeys.length > 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Your API Keys
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Usage statistics update in real-time. Click "Refresh
                      Usage" to see latest data.
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
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
                                  <React.Fragment key={`${apiKey.id}-active`}>
                                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                    Active
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment key={`${apiKey.id}-inactive`}>
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
                            {visibleKeys.has(apiKey.id)
                              ? apiKey.key
                              : maskApiKey(apiKey.key)}
                          </div>
                          <button
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            title={
                              visibleKeys.has(apiKey.id)
                                ? "Hide API key"
                                : "Show API key"
                            }
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

                        {/* Usage Statistics */}
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <Activity className="h-4 w-4 text-gray-500 mr-2" />
                            <h4 className="text-sm font-medium text-gray-900">
                              Usage Statistics
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {/* Hourly Usage */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  Hourly
                                </span>
                                <span className="text-xs text-gray-500">
                                  {apiKey.usage?.hourly?.used || 0} /{" "}
                                  {apiKey.usage?.hourly?.limit || 100}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(
                                      ((apiKey.usage?.hourly?.used || 0) /
                                        (apiKey.usage?.hourly?.limit || 100)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Daily Usage */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  Daily
                                </span>
                                <span className="text-xs text-gray-500">
                                  {apiKey.usage?.daily?.used || 0} /{" "}
                                  {apiKey.usage?.daily?.limit || 1000}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(
                                      ((apiKey.usage?.daily?.used || 0) /
                                        (apiKey.usage?.daily?.limit || 1000)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Monthly Usage */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  Monthly
                                </span>
                                <span className="text-xs text-gray-500">
                                  {apiKey.usage?.monthly?.used || 0} /{" "}
                                  {apiKey.usage?.monthly?.limit || 10000}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(
                                      ((apiKey.usage?.monthly?.used || 0) /
                                        (apiKey.usage?.monthly?.limit ||
                                          10000)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Usage Summary */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-semibold text-blue-600">
                                  {apiKey.usage?.hourly?.used || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  This Hour
                                </div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-green-600">
                                  {apiKey.usage?.daily?.used || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Today
                                </div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-purple-600">
                                  {apiKey.usage?.monthly?.used || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  This Month
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Rate Limit Warning */}
                          {(apiKey.usage?.hourly?.used || 0) /
                            (apiKey.usage?.hourly?.limit || 100) >
                            0.8 && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                <span className="text-xs text-yellow-800">
                                  Approaching hourly rate limit
                                </span>
                              </div>
                            </div>
                          )}

                          {(apiKey.usage?.daily?.used || 0) /
                            (apiKey.usage?.daily?.limit || 1000) >
                            0.9 && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                <span className="text-xs text-red-800">
                                  Approaching daily rate limit
                                </span>
                              </div>
                            </div>
                          )}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No API keys yet
              </h3>
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

          {/* API Endpoints */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              API Endpoints
            </h3>

            {/* Basic QR Generation */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                  GET
                </span>
                <code className="text-lg font-mono text-gray-900">/qrcode</code>
              </div>
              <p className="text-gray-600 mb-4">
                Generate a QR code with basic options
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Query Parameters
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="text-blue-600">url</code>{" "}
                        <span className="text-red-500">*required</span> - The
                        URL to encode
                      </div>
                      <div>
                        <code className="text-blue-600">name</code>{" "}
                        <span className="text-gray-500">optional</span> - Custom
                        name for the QR code
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Example Response
                  </h4>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      {`{
  "message": "QR Code generated and saved",
  "qrCode": {
    "id": "68b520710dba987a2b7c537f",
    "name": "QR for https://example.com",
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "accessCount": 1,
    "createdAt": "2025-09-01T04:26:25.372Z",
    "cached": false
  },
  "usage": {
    "hourly": { "used": 1, "limit": 100 },
    "daily": { "used": 1, "limit": 1000 },
    "monthly": { "used": 1, "limit": 10000 }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced QR Generation */}
            <div className="mb-8 border-t pt-8">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                  POST
                </span>
                <code className="text-lg font-mono text-gray-900">
                  /qrcode/generate
                </code>
              </div>
              <p className="text-gray-600 mb-4">
                Generate a QR code with advanced customization options
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Request Body
                  </h4>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      {`{
  "url": "https://example.com",
  "name": "Custom QR Code",
  "customization": {
    "size": 300,
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "errorCorrectionLevel": "M",
    "margin": 4
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Customization Options
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <code className="text-blue-600">size</code> - QR code
                        size in pixels (100-1000)
                      </div>
                      <div>
                        <code className="text-blue-600">foregroundColor</code> -
                        Hex color for QR code pattern
                      </div>
                      <div>
                        <code className="text-blue-600">backgroundColor</code> -
                        Hex color for background
                      </div>
                      <div>
                        <code className="text-blue-600">
                          errorCorrectionLevel
                        </code>{" "}
                        - L, M, Q, or H
                      </div>
                      <div>
                        <code className="text-blue-600">margin</code> - Border
                        margin (0-20)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Examples */}
            <div className="border-t pt-8">
              <h4 className="font-medium text-gray-900 mb-4">Code Examples</h4>

              <div className="space-y-6">
                {/* JavaScript */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">
                    JavaScript (Node.js)
                  </h5>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      {`const axios = require('axios');

const response = await axios.get('${getBackendUrl()}/qrcode', {
  params: { url: 'https://example.com', name: 'My QR' },
  headers: { 'x-api-key': 'your_api_key_here' }
});

console.log('QR Code ID:', response.data.qrCode.id);
console.log('Usage:', response.data.usage);`}
                    </pre>
                  </div>
                </div>

                {/* Python */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">Python</h5>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      {`import requests

response = requests.get(
    '${getBackendUrl()}/qrcode',
    params={'url': 'https://example.com', 'name': 'My QR'},
    headers={'x-api-key': 'your_api_key_here'}
)

data = response.json()
print(f"QR Code ID: {data['qrCode']['id']}")
print(f"Usage: {data['usage']}")`}
                    </pre>
                  </div>
                </div>

                {/* cURL */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">cURL</h5>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      {`curl -X GET "${getBackendUrl()}/qrcode?url=https://example.com&name=My QR" \\
  -H "x-api-key: your_api_key_here"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Responses */}
            <div className="border-t pt-8">
              <h4 className="font-medium text-gray-900 mb-4">
                Common Error Responses
              </h4>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 mb-2">
                    Rate Limit Exceeded (429)
                  </h5>
                  <pre className="text-sm text-red-800">
                    {`{
  "error": "Rate limit exceeded",
  "details": {
    "limit": "hourly",
    "used": 100,
    "resetTime": "2025-09-01T05:00:00.000Z"
  }
}`}
                  </pre>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-medium text-red-900 mb-2">
                    Invalid API Key (401)
                  </h5>
                  <pre className="text-sm text-red-800">
                    {`{ "error": "Invalid or missing API key" }`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create API Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create New API Key
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>×
                  </button>
                </div>

                <form onSubmit={handleCreateApiKey}>
                  <div className="mb-4">
                    <label
                      htmlFor="keyName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                        "Create API Key"
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
