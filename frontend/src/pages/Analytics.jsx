import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  QrCode, 
  Calendar,
  Activity,
  Zap,
  Users
} from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/analytics/qrcodes?days=${timeRange}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total QR Codes',
      value: analytics?.totalQrCodes || 0,
      icon: QrCode,
      color: 'bg-blue-500',
      change: `+${analytics?.recentQrCodes || 0} in ${timeRange} days`
    },
    {
      name: 'Total Scans',
      value: analytics?.totalAccesses || 0,
      icon: Eye,
      color: 'bg-green-500',
      change: 'All time'
    },
    {
      name: 'Recent Activity',
      value: analytics?.recentQrCodes || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: `Last ${timeRange} days`
    },
    {
      name: 'Top Performer',
      value: analytics?.topQrCodes?.[0]?.accessCount || 0,
      icon: Activity,
      color: 'bg-orange-500',
      change: 'Most scanned'
    }
  ];

  const generationMethods = analytics?.generationMethods || [];
  const topQrCodes = analytics?.topQrCodes || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Track your QR code performance and usage patterns
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className={`absolute ${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                    {stat.change}
                  </p>
                </dd>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Generation Methods Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Zap className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Generation Methods</h2>
            </div>
            
            {generationMethods.length > 0 ? (
              <div className="space-y-4">
                {generationMethods.map((method) => {
                  const total = generationMethods.reduce((sum, m) => sum + m.count, 0);
                  const percentage = total > 0 ? (method.count / total) * 100 : 0;
                  
                  return (
                    <div key={method._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          method._id === 'jwt' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {method._id === 'jwt' ? 'Web Dashboard' : 'API Key'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              method._id === 'jwt' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {method.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>

          {/* Top Performing QR Codes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Top Performing QR Codes</h2>
            </div>
            
            {topQrCodes.length > 0 ? (
              <div className="space-y-4">
                {topQrCodes.map((qr, index) => (
                  <div key={qr._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {qr.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {qr.data}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {qr.accessCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No QR codes yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Insights */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Usage Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {analytics?.totalQrCodes > 0 ? 
                  Math.round((analytics?.totalAccesses || 0) / analytics?.totalQrCodes) : 0
                }
              </div>
              <div className="text-sm text-gray-600">Average scans per QR code</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {analytics?.recentQrCodes || 0}
              </div>
              <div className="text-sm text-gray-600">QR codes created recently</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {topQrCodes.length > 0 ? topQrCodes[0].accessCount : 0}
              </div>
              <div className="text-sm text-gray-600">Highest scan count</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        {analytics && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-blue-100 mb-2">Total Performance</p>
                <p className="text-2xl font-bold">
                  {analytics.totalQrCodes} QR codes generated
                </p>
                <p className="text-blue-100">
                  with {analytics.totalAccesses} total scans
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-2">Recent Activity</p>
                <p className="text-2xl font-bold">
                  {analytics.recentQrCodes} new QR codes
                </p>
                <p className="text-blue-100">
                  in the last {timeRange} days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;