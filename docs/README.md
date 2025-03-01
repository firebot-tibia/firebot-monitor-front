# Project Structure

This project follows a modular architecture to improve maintainability and scalability.

## Directory Structure

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication features
│   ├── monitoring/   # Monitoring system
│   ├── guilds/       # Guild management
│   ├── statistics/   # Statistics and analytics
│   ├── dashboard/    # Dashboard features
│   ├── editor/       # Editor functionality
│   ├── reservations/ # Reservation system
│   └── tibia-map/    # Map features
├── shared/           # Shared resources
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Shared custom hooks
│   └── utils/        # Shared utility functions
├── core/             # Core application logic
│   ├── store/        # State management
│   └── api/          # API integration
├── types/            # TypeScript type definitions
└── services/         # Global services

## Module Structure

Each module follows this structure:
```
module/
├── components/    # Module-specific components
├── hooks/         # Module-specific hooks
├── utils/         # Module-specific utilities
├── types/         # Module-specific types
└── index.ts       # Module entry point
```

## Development Guidelines

1. Keep modules focused and independent
2. Use shared components for common functionality
3. Keep module-specific code within its module
4. Use core services for cross-module functionality
5. Follow consistent naming conventions
