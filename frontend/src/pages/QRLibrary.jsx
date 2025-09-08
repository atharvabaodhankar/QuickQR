import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Trash2, 
  Eye, 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const QRLibrary = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedQr, setSelectedQr] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchQrCodes();
  }, [currentPage, sortBy, sortOrder]);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/qrcodes', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          sortOrder
        }
      });
      
      setQrCodes(response.data.qrCodes);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) {
      return;
    }

    try {
      await axios.delete(`/qrcodes/${id}`);
      toast.success('QR code deleted successfully');
      fetchQrCodes();
    } catch (error) {
      toast.error('Failed to delete QR code');
    }
  };

  const handleDownload = (qrCode) => {
    const link = document.createElement('a');
    link.href = qrCode.qrData;
    link.download = `${qrCode.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded!');
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(`/qrcodes/${id}`);
      setSelectedQr(response.data.qrCode);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch QR code details');
    }
  };

  const filteredQrCodes = qrCodes.filter(qr =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.data.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  if (loading && qrCodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">QR Code Library</h1>
            <p className="mt-2 text-gray-600">
              Manage and organize your QR codes
            </p>
          </div>
          <Link
            to="/generate"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate New
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search QR codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="accessCount-desc">Most Accessed</option>
                  <option value="accessCount-asc">Least Accessed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* QR Codes Grid */}
        {filteredQrCodes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
              {filteredQrCodes.map((qr) => (
                <div key={qr._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-4">
                    {/* QR Code Preview */}
                    <div className="text-center mb-4">
                      <div className="inline-block p-2 bg-gray-50 rounded-lg">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>

                    {/* QR Code Info */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 truncate" title={qr.name}>
                        {qr.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate" title={qr.data}>
                        {qr.data}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {qr.accessCount}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(qr.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewDetails(qr._id)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCopyUrl(qr.data)}
                        className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(qr._id)}
                        className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <QrCode className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No QR codes found' : 'No QR codes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first QR code'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate QR Code
              </Link>
            )}
          </div>
        )}

        {/* QR Code Detail Modal */}
        {showModal && selectedQr && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
            <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">QR Code Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* QR Code Image */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img
                        src={selectedQr.qrData}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  </div>
                  
                  {/* QR Code Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQr.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-sm text-gray-900 flex-1 break-all">{selectedQr.url}</p>
                        <button
                          onClick={() => window.open(selectedQr.url, '_blank')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Open URL"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Access Count</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQr.accessCount}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedQr.createdAt)}</p>
                    </div>
                    
                    {selectedQr.lastAccessed && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Accessed</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedQr.lastAccessed)}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Generated Via</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedQr.generatedVia}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => handleDownload(selectedQr)}
                    className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => handleCopyUrl(selectedQr.url)}
                    className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRLibrary;