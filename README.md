# Student Orientation 2025 7th Attendance Report

A comprehensive attendance tracking and analytics dashboard for Student Orientation 2025, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Real-time Dashboard**: Interactive dashboard with attendance statistics and analytics
- **Data Visualization**: Charts and graphs showing attendance patterns by branch, sub-branch, hour, and date
- **Advanced Filtering**: Filter attendance data by branch, sub-branch, year, section, and date range
- **Export Functionality**: Export filtered reports as JSON files
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Professional UI**: Clean, modern interface with Tailwind CSS styling

## Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for modern iconography
- **Date Handling**: date-fns for date manipulation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 7th
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Structure

The system processes JSON attendance data with the following structure:

```json
[
  {
    "timestamp": "2025-08-07T11:00:36.275",
    "studentId": "ST0001",
    "name": "Student Name",
    "branch": "Computer Science",
    "subBranch": "AI/ML",
    "year": "3rd Year",
    "section": "A"
  }
]
```

## Features Overview

### Dashboard Components

1. **Statistics Summary**: Overview cards showing total attendance, active days, branches, and peak hours
2. **Interactive Charts**: 
   - Pie chart for branch distribution
   - Bar chart for sub-branch attendance
   - Line chart for hourly patterns
   - Bar chart for daily attendance
3. **Advanced Filters**: Multi-level filtering system
4. **Export Functionality**: Generate downloadable reports

### Data Processing

- Automatic data enrichment with sample branch and sub-branch information
- Real-time statistics calculation
- Flexible filtering system
- Date and time analysis

## Project Structure

```
src/
├── app/
│   ├── api/attendance/     # API route for attendance data
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Main dashboard page
├── components/
│   ├── AttendanceFilters.tsx    # Filter component
│   ├── DashboardCharts.tsx      # Charts component
│   └── StatsSummary.tsx         # Statistics cards
├── data/
│   └── attendance-data.json     # Attendance data
├── types/
│   └── attendance.ts            # TypeScript types
└── utils/
    └── attendance.ts            # Data processing utilities
```

## Usage

1. **View Dashboard**: Access the main dashboard at the root URL
2. **Apply Filters**: Use the filter panel to narrow down data by branch, sub-branch, year, or section
3. **Analyze Charts**: Review various visualizations to understand attendance patterns
4. **Export Reports**: Click the export button to download filtered data as JSON

## Customization

### Adding New Filters

1. Update the `FilterOptions` type in `src/types/attendance.ts`
2. Modify the `filterAttendanceData` function in `src/utils/attendance.ts`
3. Add new filter controls in `src/components/AttendanceFilters.tsx`

### Adding New Charts

1. Create new chart components in `src/components/`
2. Add data processing logic in `src/utils/attendance.ts`
3. Include charts in the main dashboard (`src/app/page.tsx`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
