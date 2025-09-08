import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  QrCode, 
  Plus, 
  BarChart3, 
  Library, 
  Key,
  TrendingUp,
  Eye,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentQrCodes, setRecentQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, qrCodesRes] = await Promise.all([
        axios.get('/analytics/qrcodes'),
        axios.get('/qrcodes?limit=5&sortBy=createdAt&sortOrder=desc')
      ]);
      
      setAnalytics(analyticsRes.data.analytics);
      setRecentQrCodes(qrCodesRes.data.qrCodes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      change: `+${analytics?.recentQrCodes || 0} this month`
    },
    {
      name: 'Total Scans',
      value: analytics?.totalAccesses || 0,
      icon: Eye,
      color: 'bg-green-500',
      change: 'All time'
    },
    {
      name: 'This Month',
      value: analytics?.recentQrCodes || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: 'New QR codes'
    },
    {
      name: 'Top Performer',
      value: analytics?.topQrCodes?.[0]?.accessCount || 0,
      icon: Activity,
      color: 'bg-orange-500',
      change: 'Most scanned'
    }
  ];

  const quickActions = [
    {
      name: 'Generate QR Code',
      description: 'Create a new QR code',
      href: '/generate',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'View Library',
      description: 'Browse your QR codes',
      href: '/library',
      icon: Library,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'Analytics',
      description: 'View detailed analytics',
      href: '/analytics',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'API Keys',
      description: 'Manage API access',
      href: '/api-keys',
      icon: Key,
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Here's what's happening with your QR codes today.
              </p>
            </div>
            <Link
              to="/generate"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate QR Code
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                >
                  <div>
                    <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent QR Codes */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent QR Codes</h2>
            <Link
              to="/library"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          {recentQrCodes.length > 0 ? (
            <div className="bg-white shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {recentQrCodes.map((qr) => (
                  <li key={qr._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <QrCode className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {qr.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {qr.data.length > 50 ? `${qr.data.substring(0, 50)}...` : qr.data}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {qr.accessCount}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(qr.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <QrCode className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No QR codes yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first QR code.
              </p>
              <div className="mt-6">
                <Link
                  to="/generate"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;