import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { AttendanceRecord } from '@/types/attendance';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cache to minimize reads
let cachedData: AttendanceRecord[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Collection name from environment or default
const COLLECTION_NAME = process.env.NEXT_PUBLIC_FIREBASE_COLLECTION || 'attendance';

export async function getAttendanceData(): Promise<AttendanceRecord[]> {
  try {
    // Use cache if fresh
    const now = Date.now();
    if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
      console.log('Using cached data');
      return cachedData;
    }

    console.log('Fetching from Firebase...');
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const data: AttendanceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      // Transform your Firestore data to match AttendanceRecord format
      data.push({
        code: docData.code || doc.id,
        title: docData.title || '',
        subtitle: docData.subtitle || '',
        extras: docData.extras || [],
        scanned: docData.scanned || {},
        timestamp: docData.timestamp || new Date().toISOString()
      });
    });

    // Update cache
    cachedData = data;
    lastFetchTime = now;
    
    console.log(`Fetched ${data.length} records from Firebase`);
    return data;
  } catch (error) {
    console.error('Firebase fetch error:', error);
    throw error;
  }
}

// Real-time listener with efficient updates
export function subscribeToAttendanceUpdates(
  callback: (data: AttendanceRecord[]) => void,
  onError?: (error: Error) => void
) {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        // Only process if there are actual changes
        if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache) {
          const data: AttendanceRecord[] = [];
          
          snapshot.forEach((doc) => {
            const docData = doc.data();
            data.push({
              code: docData.code || doc.id,
              title: docData.title || '',
              subtitle: docData.subtitle || '',
              extras: docData.extras || [],
              scanned: docData.scanned || {},
              timestamp: docData.timestamp || new Date().toISOString()
            });
          });

          // Update cache
          cachedData = data;
          lastFetchTime = Date.now();
          
          console.log(`Real-time update: ${data.length} records`);
          callback(data);
        }
      } catch (error) {
        console.error('Real-time update error:', error);
        onError?.(error as Error);
      }
    },
    (error) => {
      console.error('Firebase subscription error:', error);
      onError?.(error as Error);
    }
  );

  return unsubscribe;
}

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testQuery = await getDocs(collection(db, COLLECTION_NAME));
    console.log('Firebase connection successful');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
}
