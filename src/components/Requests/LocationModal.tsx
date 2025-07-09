import React from 'react';
import { X } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
  requestId: string;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  requestId
}) => {
  if (!isOpen) return null;

  // Default coordinates (Manila)
  const defaultLat = -1.3013042;
  const defaultLng = 36.7777745;

  // Use provided coordinates if they exist, otherwise use defaults
  const mapLat = latitude || defaultLat;
  const mapLng = longitude || defaultLng;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Current Location - Request #{requestId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="h-[700px] w-full rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapLat},${mapLng}&zoom=15`}
            allowFullScreen
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Latitude: {mapLat}</p>
          <p>Longitude: {mapLng}</p>
          {(!latitude || !longitude) && (
            <p className="text-yellow-600 mt-2">
              Note: Using default location as coordinates are not available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal; 