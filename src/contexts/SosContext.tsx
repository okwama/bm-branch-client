import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SosData, sosService } from '../services/sosService';

interface SosContextType {
  hasActiveSos: boolean;
  activeSosCount: number;
  sosList: SosData[];
  isLoading: boolean;
  error: string | null;
  refreshSosList: () => Promise<void>;
}

const SosContext = createContext<SosContextType | undefined>(undefined);

export const SosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sosList, setSosList] = useState<SosData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSos, setHasActiveSos] = useState(false);
  const [activeSosCount, setActiveSosCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSosList = async () => {
    try {
      console.log('Fetching SOS list in context...');
      const data = await sosService.getSosList();
      console.log('Raw SOS data:', data);
      
      setSosList(data);
      
      // Check for active SOS alerts
      const activeSos = data.filter(sos => sos.status === 'pending');
      const activeCount = activeSos.length;
      console.log('Active SOS details:', {
        count: activeCount,
        alerts: activeSos.map(sos => ({
          id: sos.id,
          type: sos.sos_type,
          guard: sos.guard_name,
          status: sos.status
        }))
      });
      
      const previousActiveCount = activeSosCount;
      setActiveSosCount(activeCount);
      setHasActiveSos(activeCount > 0);
      setError(null);

      // If there are active SOS alerts, show notification and redirect
      if (activeCount > 0) {
        // Show notification
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
        }

        if (Notification.permission === 'granted') {
          new Notification('Active SOS Alert', {
            body: `There ${activeCount === 1 ? 'is' : 'are'} ${activeCount} active SOS alert${activeCount === 1 ? '' : 's'} requiring attention.`,
            requireInteraction: true
          });
        }

        // Redirect to SOS list if we just detected active SOS or if we're not already on the SOS list page
        // TEMPORARILY DISABLED TO STOP RELOAD LOOP
        // if (previousActiveCount === 0 || !window.location.pathname.includes('sos-list')) {
        //   console.log('Redirecting to SOS list page...');
        //   navigate('/dashboard/sos-list', { replace: true });
        // }
      }
    } catch (error) {
      console.error('Error in SOS context:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch SOS list');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up periodic refresh for active SOS alerts
  useEffect(() => {
    console.log('Setting up SOS context...');
    // TEMPORARILY DISABLED TO STOP RELOAD LOOP
    // fetchSosList();

    // Refresh every second
    // const intervalId = setInterval(fetchSosList, 1000);

    return () => {
      console.log('Cleaning up SOS context...');
      // clearInterval(intervalId);
    };
  }, []);

  return (
    <SosContext.Provider value={{
      hasActiveSos,
      activeSosCount,
      sosList,
      isLoading,
      error,
      refreshSosList: fetchSosList
    }}>
      {children}
    </SosContext.Provider>
  );
};

export const useSos = () => {
  const context = useContext(SosContext);
  if (context === undefined) {
    throw new Error('useSos must be used within a SosProvider');
  }
  return context;
}; 