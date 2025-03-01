# Project Structure

This project follows a modular architecture separating free and premium features.

## Directory Structure

```
src/
├── modules/           # Main feature modules
│   ├── free/         # Free tier features
│   │   ├── basic-monitoring/  # Basic guild monitoring
│   │   ├── basic-alerts/      # Basic alert system
│   │   └── public-stats/      # Public statistics
│   └── premium/      # Premium tier features
│       ├── advanced-monitoring/  # Advanced monitoring
│       ├── advanced-alerts/      # Advanced alerts
│       └── analytics/            # Advanced analytics
├── shared/           # Shared components and utilities
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Shared custom hooks
│   └── utils/        # Shared utility functions
├── core/             # Core application logic
│   ├── auth/         # Authentication
│   ├── store/        # State management
│   └── api/          # API integration
├── config/           # Configuration files
├── utils/            # Global utility functions
├── hooks/            # Global hooks
├── types/            # TypeScript type definitions
├── services/         # Global services
└── assets/          # Static assets
```

## Module Organization

### Free Features

- **Basic Monitoring**: Simple member list, online/offline status, basic sorting
- **Basic Alerts**: Login/logout notifications, basic sound alerts
- **Public Stats**: Basic guild statistics, public member information

### Premium Features

- **Advanced Monitoring**: Real-time tracking, advanced filtering, custom groups
- **Advanced Alerts**: Custom conditions, multiple sounds, Discord/email integration
- **Analytics**: Historical data, activity patterns, custom reports

### Shared Resources

Components, hooks, and utilities that are used across both free and premium features.

### Core

Core application functionality including authentication, state management, and API integration.

## Development Guidelines

1. Keep features strictly separated between free and premium modules
2. Use shared components for common functionality
3. Implement feature flags for premium features
4. Follow the module-specific README for detailed implementation guidelines
