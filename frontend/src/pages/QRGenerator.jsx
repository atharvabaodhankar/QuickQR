import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  QrCode,
  Link as LinkIcon,
  Type,
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Palette,
  Settings,
  Eye,
} from "lucide-react";

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    url: "",
    name: "",
  });
  const [customization, setCustomization] = useState({
    size: 200,
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    errorCorrectionLevel: "M",
    margin: 4,
  });
  const [qrResult, setQrResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomizationChange = (e) => {
    const { name, value } = e.target;
    setCustomization({
      ...customization,
      [name]: name === "size" || name === "margin" ? parseInt(value) : value,
    });
  };

  // Generate preview when URL or customization changes
  useEffect(() => {
    if (formData.url && previewMode) {
      generatePreview();
    }
  }, [customization, formData.url, previewMode]);

  const generatePreview = async () => {
    if (!formData.url.trim()) return;

    try {
      new URL(formData.url);
    } catch {
      return;
    }

    try {
      const response = await axios.post("/qrcode/preview", {
        url: formData.url,
        customization,
      });

      setQrResult({ 
        ...response.data.qrCode, 
        name: formData.name || "Preview",
        isPreview: true 
      });
    } catch (error) {
      // Silently fail for preview
      console.error("Preview failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/qrcode/generate", {
        url: formData.url,
        name: formData.name,
        customization,
      });

      setQrResult({ ...response.data.qrCode, isPreview: false });
      setUsage(response.data.usage);
      setPreviewMode(false);

      toast.success("QR Code generated and saved successfully!");
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to generate QR code";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrResult?.qrData) return;

    const link = document.createElement("a");
    link.href = qrResult.qrData;
    link.download = `${qrResult.name || "qr-code"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("QR Code downloaded!");
  };

  const handleCopyImage = async () => {
    if (!qrResult?.qrData) return;

    try {
      // Convert base64 to blob
      const response = await fetch(qrResult.qrData);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      toast.success("QR Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy QR code");
    }
  };

  const handleCopyUrl = async () => {
    if (!qrResult?.url) return;

    try {
      await navigator.clipboard.writeText(qrResult.url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleReset = () => {
    setFormData({ url: "", name: "" });
    setCustomization({
      size: 200,
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      errorCorrectionLevel: "M",
      margin: 4,
    });
    setQrResult(null);
    setUsage(null);
    setPreviewMode(false);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode && formData.url) {
      generatePreview();
    }
  };

  const getUsageColor = (used, limit) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <QrCode className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Generator
          </h1>
          <p className="mt-2 text-gray-600">
            Create QR codes instantly for any URL
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Generate QR Code
              </h2>
              <button
                type="button"
                onClick={() => setShowCustomization(!showCustomization)}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the URL you want to convert to a QR code
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="My QR Code"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Give your QR code a memorable name
                </p>
              </div>

              {/* Customization Panel */}
              {showCustomization && (
                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
                    <Palette className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Customization Options
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Size */}
                    <div>
                      <label
                        htmlFor="size"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Size: {customization.size}px
                      </label>
                      <input
                        type="range"
                        id="size"
                        name="size"
                        min="100"
                        max="500"
                        step="10"
                        value={customization.size}
                        onChange={handleCustomizationChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>100px</span>
                        <span>500px</span>
                      </div>
                    </div>

                    {/* Margin */}
                    <div>
                      <label
                        htmlFor="margin"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Margin: {customization.margin}
                      </label>
                      <input
                        type="range"
                        id="margin"
                        name="margin"
                        min="0"
                        max="10"
                        step="1"
                        value={customization.margin}
                        onChange={handleCustomizationChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>10</span>
                      </div>
                    </div>

                    {/* Foreground Color */}
                    <div>
                      <label
                        htmlFor="foregroundColor"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Foreground Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="foregroundColor"
                          name="foregroundColor"
                          value={customization.foregroundColor}
                          onChange={handleCustomizationChange}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.foregroundColor}
                          onChange={handleCustomizationChange}
                          name="foregroundColor"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label
                        htmlFor="backgroundColor"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Background Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id="backgroundColor"
                          name="backgroundColor"
                          value={customization.backgroundColor}
                          onChange={handleCustomizationChange}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.backgroundColor}
                          onChange={handleCustomizationChange}
                          name="backgroundColor"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Error Correction Level */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="errorCorrectionLevel"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Error Correction Level
                      </label>
                      <select
                        id="errorCorrectionLevel"
                        name="errorCorrectionLevel"
                        value={customization.errorCorrectionLevel}
                        onChange={handleCustomizationChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="L">Low (~7% recovery)</option>
                        <option value="M">Medium (~15% recovery)</option>
                        <option value="Q">Quartile (~25% recovery)</option>
                        <option value="H">High (~30% recovery)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Higher levels allow more damage recovery but create
                        denser QR codes
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={togglePreview}
                  disabled={!formData.url}
                  className="flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? "Stop Preview" : "Preview"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate & Save
                    </>
                  )}
                </button>

                {qrResult && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Usage Statistics */}
            {usage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Usage Statistics
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hourly:</span>
                    <span
                      className={getUsageColor(
                        usage.hourly.used,
                        usage.hourly.limit
                      )}
                    >
                      {usage.hourly.used}/{usage.hourly.limit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily:</span>
                    <span
                      className={getUsageColor(
                        usage.daily.used,
                        usage.daily.limit
                      )}
                    >
                      {usage.daily.used}/{usage.daily.limit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly:</span>
                    <span
                      className={getUsageColor(
                        usage.monthly.used,
                        usage.monthly.limit
                      )}
                    >
                      {usage.monthly.used}/{usage.monthly.limit}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              QR Code Result
            </h2>

            {qrResult ? (
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="text-center">
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img
                      src={qrResult.qrData}
                      alt="Generated QR Code"
                      style={{
                        width: `${Math.min(
                          qrResult.customization?.size || 200,
                          300
                        )}px`,
                        height: `${Math.min(
                          qrResult.customization?.size || 200,
                          300
                        )}px`,
                      }}
                      className="mx-auto"
                    />
                  </div>
                  {qrResult.isPreview && (
                    <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800 font-medium flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Mode - Not Saved to Database
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Click "Generate & Save" to store this QR code
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code Info */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {qrResult.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-sm text-gray-900 flex-1 truncate">
                        {qrResult.url}
                      </p>
                      <button
                        onClick={handleCopyUrl}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customization Details */}
                  {qrResult.customization && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customization
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Size: {qrResult.customization.size}px</div>
                        <div>Margin: {qrResult.customization.margin}</div>
                        <div className="flex items-center">
                          <span className="mr-2">Foreground:</span>
                          <div
                            className="w-4 h-4 border border-gray-300 rounded"
                            style={{
                              backgroundColor:
                                qrResult.customization.foregroundColor,
                            }}
                          ></div>
                          <span className="ml-1">
                            {qrResult.customization.foregroundColor}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">Background:</span>
                          <div
                            className="w-4 h-4 border border-gray-300 rounded"
                            style={{
                              backgroundColor:
                                qrResult.customization.backgroundColor,
                            }}
                          ></div>
                          <span className="ml-1">
                            {qrResult.customization.backgroundColor}
                          </span>
                        </div>
                        <div className="col-span-2">
                          Error Correction:{" "}
                          {qrResult.customization.errorCorrectionLevel}
                        </div>
                      </div>
                    </div>
                  )}

                  {!qrResult.isPreview && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        {qrResult.cached ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            Cached
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
                            New
                          </>
                        )}
                      </div>
                      <div>Access Count: {qrResult.accessCount}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {qrResult.isPreview && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Save This QR Code
                        </>
                      )}
                    </button>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>

                    <button
                      onClick={handleCopyImage}
                      className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Your generated QR code will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
