import { NextResponse } from 'next/server';
import { getAttendanceData, testFirebaseConnection } from '@/lib/firebase';
import attendanceData from '@/data/attendance-data.json';

export async function GET() {
  try {
    // Try Firebase first
    const isFirebaseConnected = await testFirebaseConnection();
    
    if (isFirebaseConnected) {
      console.log('Using Firebase data source');
      const firebaseData = await getAttendanceData();
      return NextResponse.json(firebaseData);
    } else {
      console.log('Firebase unavailable, falling back to JSON');
      return NextResponse.json(attendanceData);
    }
  } catch (error) {
    console.error('Error fetching from Firebase, falling back to JSON:', error);
    // Fallback to JSON data
    try {
      return NextResponse.json(attendanceData);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to load attendance data' },
        { status: 500 }
      );
    }
  }
}
