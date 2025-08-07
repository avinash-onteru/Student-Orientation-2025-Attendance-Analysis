import { NextResponse } from 'next/server';
import attendanceData from '@/data/attendance-data.json';

export async function GET() {
  try {
    return NextResponse.json(attendanceData);
  } catch (error) {
    console.error('Error reading attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to load attendance data' },
      { status: 500 }
    );
  }
}
