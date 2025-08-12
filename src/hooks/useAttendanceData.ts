import { useState, useEffect, useRef } from 'react';
import { AttendanceRecord } from '@/types/attendance';
import { subscribeToAttendanceUpdates } from '@/lib/firebase';

export function useAttendanceData() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const setAttendanceDataWithReported = (data: AttendanceRecord[]) => {
    const filteredData = data.filter(r => r.extras.length > 0 && r.extras[0].value);
    setAttendanceData(filteredData);
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load initial data from API (which handles Firebase/JSON fallback)
        const response = await fetch('/api/attendance');
        if (!response.ok) throw new Error('Failed to fetch attendance data');
        
        const data = await response.json();
        
        if (isMounted) {
          setAttendanceDataWithReported(data);
          
          // Try to establish real-time connection
          try {
            console.log('Setting up real-time listener...');
            const unsubscribe = subscribeToAttendanceUpdates(
              (realtimeData) => {
                if (isMounted) {
                  console.log('Real-time data received');
                  setAttendanceDataWithReported(realtimeData);
                  setIsRealTime(true);
                }
              },
              (realtimeError) => {
                console.warn('Real-time updates failed:', realtimeError);
                setIsRealTime(false);
              }
            );
            unsubscribeRef.current = unsubscribe;
          } catch (realtimeError) {
            console.warn('Could not establish real-time connection:', realtimeError);
            setIsRealTime(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return {
    attendanceData,
    loading,
    error,
    isRealTime
  };
}
