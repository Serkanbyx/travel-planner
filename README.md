# Travel Planner

A modern travel planning application built with React, TypeScript, and Tailwind CSS. Create detailed travel itineraries, organize daily activities with drag-and-drop, and export your plans.

## Features

- **City Plans**: Create travel plans for any destination with automatic city images from Unsplash and Wikipedia summaries
- **Daily Itinerary**: Organize activities by day with an intuitive timeline view
- **Drag & Drop**: Easily reorganize activities between days using drag-and-drop
- **Activity Categories**: Categorize activities (sightseeing, food, transport, etc.)
- **Export Options**: Export your plans as JSON, Text, or printable HTML/PDF
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Local Storage**: Your plans are automatically saved to your browser

## Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persist middleware
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: dnd-kit
- **Routing**: React Router v6
- **APIs**: Unsplash (city images), Wikipedia (city summaries)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up environment variables:
```bash
cp .env.example .env
# Add your Unsplash API key for better image quality
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── activities/     # Activity-related components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── plans/          # Plan-related components
│   └── ui/             # shadcn/ui components
├── constants/          # App constants
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # API services
├── store/              # Zustand stores
└── types/              # TypeScript types
```

## Usage

### Creating a Plan

1. Click "New Plan" or "Create Your First Plan"
2. Enter the city, country, and travel dates
3. Add an optional description
4. Click "Create Plan"

### Adding Activities

1. Open a plan to view the daily itinerary
2. Click "Add Activity" on any day
3. Fill in the activity details (title, time, category, etc.)
4. Click "Add Activity"

### Reorganizing Activities

- **Drag & Drop**: Click and drag any activity card to move it
- **Between Days**: Drop an activity on a different day column
- **Within Day**: Reorder activities within the same day

### Exporting Plans

1. Click the "Export" button on any plan
2. Choose your format:
   - **HTML**: Printable format (can save as PDF from browser)
   - **Text**: Plain text format
   - **JSON**: Data format for backup/import

## API Configuration

### Unsplash API (Optional)

The app works without an Unsplash API key using Unsplash Source. For better image quality:

1. Get a free API key at [unsplash.com/developers](https://unsplash.com/developers)
2. Add it to your `.env` file:
```
VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
```

### Wikipedia API

The Wikipedia API is used without authentication for city summaries.

## Deployment

### Netlify

1. Push your code to a Git repository
2. Connect the repository to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. (Optional) Add environment variables in Netlify dashboard

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
