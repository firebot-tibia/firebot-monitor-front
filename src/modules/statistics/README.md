# Statistics Module

## Overview

Advanced statistics tracking and visualization for guild members, including experience gains/losses, activity patterns, and player analytics.

## Structure

```
statistics/
├── components/
│   ├── analytics/               # Analytics components
│   │   ├── ExperienceChart     # Experience over time visualization
│   │   ├── ActivityHeatmap     # Activity patterns heatmap
│   │   └── StatsSummary        # Summary statistics display
│   ├── dashboard/              # Dashboard components
│   │   ├── PlayerDashboard     # Individual player statistics
│   │   └── GuildDashboard      # Overall guild statistics
│   ├── tables/                 # Table components
│   │   ├── ExperienceTable     # Experience gain/loss table
│   │   └── ActivityTable       # Player activity table
│   ├── filters/                # Filter components
│   │   ├── DateRangeFilter     # Date range selection
│   │   ├── VocationFilter      # Vocation filtering
│   │   └── SearchFilter        # Name/character search
│   └── shared/                 # Shared components
│       ├── CharacterTooltip    # Character info tooltip
│       └── StatsCard           # Stats display card
├── hooks/                      # Custom hooks
│   ├── useExperienceStats     # Experience calculations
│   ├── useActivityStats       # Activity tracking
│   └── useStatsFilters        # Filter management
├── services/                   # API services
│   └── statistics.service.ts   # Statistics API calls
├── stores/                     # State management
│   └── statistics.store.ts     # Statistics Zustand store
├── types/                      # TypeScript types
│   └── statistics.types.ts     # Type definitions
└── utils/                      # Utility functions
    ├── calculations.ts         # Statistical calculations
    └── formatters.ts          # Data formatting
```

## Features

- Advanced filtering and search
- Real-time data updates
- Interactive charts and visualizations
- Responsive design
- Performance optimized
- Dark mode support
