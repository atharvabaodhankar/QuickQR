import React from 'react';
import { 
  Book, 
  Code, 
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const ApiDocs = () => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Book className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-4 text-xl text-gray-600">
            Complete guide to integrating QR code generation into your applications
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#authentication" className="block text-blue-600 hover:text-blue-800">1. Authentication</a>
              <a href="#endpoints" className="block text-blue-600 hover:text-blue-800">2. API Endpoints</a>
              <a href="#customization" className="block text-blue-600 hover:text-blue-800">3. Customization Options</a>
              <a href="#rate-limits" className="block text-blue-600 hover:text-blue-800">4. Rate Limits</a>
            </div>
            <div className="space-y-2">
              <a href="#examples" className="block text-blue-600 hover:text-blue-800">5. Code Examples</a>
              <a href="#errors" className="block text-blue-600 hover:text-blue-800">6. Error Handling</a>
              <a href="#best-practices" className="block text-blue-600 hover:text-blue-800">7. Best Practices</a>
              <a href="#sdks" className="block text-blue-600 hover:text-blue-800">8. SDKs & Libraries</a>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <section id="authentication" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Authentication</h2>
          <p className="text-gray-600 mb-4">
            All API requests require authentication using an API key. Include your API key in the request header:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-sm">
{`x-api-key: your_api_key_here`}
            </pre>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="text-blue-800 text-sm">
                  <strong>Security Note:</strong> Keep your API keys secure and never expose them in client-side code. 
                  Use environment variables or secure configuration management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section id="endpoints" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. API Endpoints</h2>
          
          {/* Basic Generation */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-4">
                GET
              </span>
              <code className="text-xl font-mono text-gray-900">/qrcode</code>
            </div>
            <p className="text-gray-600 mb-4">Generate a basic QR code with default styling.</p>
            
            <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">url</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">string</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">Yes</td>
                    <td className="px-6 py-4 text-sm text-gray-900">The URL to encode (max 2048 characters)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">name</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">string</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Custom name for the QR code</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Example Request</h4>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm">
{`curl -X GET "http://localhost:5000/qrcode?url=https://example.com&name=My Website" \\
  -H "x-api-key: your_api_key_here"`}
              </pre>
            </div>
          </div>

          {/* Advanced Generation */}
          <div className="mb-8 border-t pt-8">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-4">
                POST
              </span>
              <code className="text-xl font-mono text-gray-900">/qrcode/generate</code>
            </div>
            <p className="text-gray-600 mb-4">Generate a QR code with advanced customization options.</p>
            
            <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
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

          {/* Preview Endpoint */}
          <div className="border-t pt-8">
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mr-4">
                POST
              </span>
              <code className="text-xl font-mono text-gray-900">/qrcode/preview</code>
            </div>
            <p className="text-gray-600 mb-4">Generate a QR code preview without saving to database.</p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-orange-800 text-sm">
                    <strong>Preview Mode:</strong> This endpoint generates QR codes for testing purposes only. 
                    The QR codes are not saved to your account and don't count against storage limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customization Options */}
        <section id="customization" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Customization Options</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Option</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range/Values</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">size</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">integer</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">200</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100-1000</td>
                  <td className="px-6 py-4 text-sm text-gray-900">QR code size in pixels</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">foregroundColor</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">string</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#000000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Hex color</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Color of QR code pattern</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">backgroundColor</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">string</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#FFFFFF</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Hex color</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Background color</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">errorCorrectionLevel</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">string</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">M</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">L, M, Q, H</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Error correction level</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">margin</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">integer</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0-20</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Border margin size</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Error Correction Levels</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div><strong>L (Low):</strong> ~7% recovery - Good for clean environments</div>
              <div><strong>M (Medium):</strong> ~15% recovery - Standard level (recommended)</div>
              <div><strong>Q (Quartile):</strong> ~25% recovery - Good for industrial use</div>
              <div><strong>H (High):</strong> ~30% recovery - Best for harsh environments</div>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Rate Limits</h2>
          <p className="text-gray-600 mb-4">
            API keys have the following rate limits to ensure fair usage:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">100</div>
              <div className="text-sm text-blue-800">Requests per hour</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">1,000</div>
              <div className="text-sm text-green-800">Requests per day</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">10,000</div>
              <div className="text-sm text-purple-800">Requests per month</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <p className="text-yellow-800 text-sm">
                  <strong>Rate Limit Headers:</strong> Each response includes headers showing your current usage:
                </p>
                <div className="mt-2 bg-white rounded p-2 text-xs font-mono">
                  X-RateLimit-Hourly-Used: 15<br/>
                  X-RateLimit-Hourly-Limit: 100<br/>
                  X-RateLimit-Daily-Used: 45<br/>
                  X-RateLimit-Daily-Limit: 1000
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Response Format */}
        <section id="response-format" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Response Format</h2>
          <p className="text-gray-600 mb-4">
            All successful API responses follow this structure:
          </p>
          
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-sm">
{`{
  "message": "QR Code generated and saved",
  "qrCode": {
    "id": "unique_qr_code_id",
    "name": "QR Code Name",
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "customization": {
      "size": 200,
      "foregroundColor": "#000000",
      "backgroundColor": "#FFFFFF",
      "errorCorrectionLevel": "M",
      "margin": 4
    },
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

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">Key Fields:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li><code className="text-blue-600">qrData</code> - Base64 encoded PNG image</li>
                <li><code className="text-blue-600">cached</code> - Whether this QR code was retrieved from cache</li>
                <li><code className="text-blue-600">accessCount</code> - Number of times this QR code has been accessed</li>
                <li><code className="text-blue-600">usage</code> - Current rate limit usage statistics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section id="errors" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Error Handling</h2>
          <p className="text-gray-600 mb-4">
            The API uses standard HTTP status codes and returns detailed error messages:
          </p>
          
          <div className="space-y-4">
            <div className="border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                  400
                </span>
                <span className="font-semibold text-gray-900">Bad Request</span>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded p-3 text-sm">
                <pre>{`{ "error": "URL is required" }`}</pre>
              </div>
            </div>

            <div className="border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                  401
                </span>
                <span className="font-semibold text-gray-900">Unauthorized</span>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded p-3 text-sm">
                <pre>{`{ "error": "Invalid or missing API key" }`}</pre>
              </div>
            </div>

            <div className="border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                  429
                </span>
                <span className="font-semibold text-gray-900">Rate Limit Exceeded</span>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded p-3 text-sm">
                <pre>{`{
  "error": "Rate limit exceeded",
  "details": {
    "limit": "hourly",
    "used": 100,
    "resetTime": "2025-09-01T05:00:00.000Z"
  }
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Best Practices</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🔒 Security</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Never expose API keys in client-side code</li>
                <li>Use environment variables for API key storage</li>
                <li>Rotate API keys regularly</li>
                <li>Monitor API key usage for suspicious activity</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⚡ Performance</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Cache QR codes on your end when possible</li>
                <li>Use appropriate error correction levels</li>
                <li>Batch requests when generating multiple QR codes</li>
                <li>Monitor rate limits to avoid 429 errors</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Design</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Ensure sufficient contrast between foreground and background</li>
                <li>Test QR codes with different scanners and devices</li>
                <li>Use appropriate sizes for your use case</li>
                <li>Consider the scanning environment when choosing error correction</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">
            Need help? Contact our support team or check out our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">community forum</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;