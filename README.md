# Reports Center - React Frontend

A modern, premium React application for viewing and managing reports from your FastAPI backend. This application provides a beautiful, intuitive interface inspired by modern accounting software like QuickBooks and Zoho Books.

## Features

✨ **Premium UI Design**
- Clean, modern interface with smooth animations
- Responsive design that works on all devices
- Professional color scheme and typography
- Intuitive navigation and search functionality

📊 **Comprehensive Reports**
- Staff Reports (Active Staff, Credentials, Time Off, etc.)
- Patient Reports (Authorizations, Documents, etc.)
- Appointment Reports (Scheduling, Attendance, Notes)
- Financial & KPI Reports
- ABA Hours Tracking
- Billing & Ledger Reports
- Payroll Reports
- And more...

🔍 **Smart Search & Filtering**
- Real-time search across all reports
- Category-based filtering
- Quick access to frequently used reports

🎨 **Custom Report Creation**
- Create custom reports based on existing templates
- Flexible configuration options
- Save and share custom reports

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- **Lucide React** for beautiful icons
- **CSS3** with custom design system

## Prerequisites

- Node.js 18+ and npm
- FastAPI backend running (default: http://localhost:8000)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint:**
   
   Open `src/services/api.ts` and update the `API_BASE_URL` if your FastAPI server is running on a different address:
   ```typescript
   const API_BASE_URL = 'http://localhost:8000'; // Update this if needed
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to `http://localhost:5173`

## Project Structure

```
reports-react-app/
├── src/
│   ├── data/
│   │   └── reports.ts          # Report definitions and categories
│   ├── services/
│   │   └── api.ts              # API service with all FastAPI endpoints
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Application-specific styles
│   ├── index.css               # Global styles and design system
│   └── main.tsx                # Application entry point
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Integration with FastAPI

This React application is designed to work seamlessly with your FastAPI backend. All API endpoints are configured in `src/services/api.ts`.

### Authentication

The app uses cookie-based authentication. Make sure your FastAPI backend is configured to:
1. Accept credentials from `http://localhost:5173` (CORS)
2. Set HTTP-only cookies for session management
3. Return proper authentication responses

### CORS Configuration

Add this to your FastAPI backend (`main.py`):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Report Categories

The application organizes reports into the following categories:

1. **Business Overview** - High-level business metrics
2. **Staff** - Employee and provider management
3. **Patients** - Patient records and authorizations
4. **Appointments** - Scheduling and session tracking
5. **Receivables** - Accounts receivable and aging
6. **Financial & KPI** - Financial metrics and KPIs
7. **ABA Hours** - ABA therapy hour tracking
8. **Billing & Ledger** - Billing and ledger reports
9. **Payroll** - Payroll processing and summaries
10. **Expected PR** - Payment received tracking

## Customization

### Adding New Reports

To add a new report, edit `src/data/reports.ts`:

```typescript
{
  id: 'my-new-report',
  name: 'My New Report',
  category: 'Category Name',
  createdBy: 'System Generated',
  description: 'Description of the report',
  requiresDateFilter: true,
  apiEndpoint: '/api/path/to/endpoint',
}
```

### Styling

The design system is defined in `src/index.css` using CSS custom properties (variables). You can customize:
- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Transitions

### API Endpoints

All API integrations are in `src/services/api.ts`. Each category has its own API object for better organization.

## Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **The build output will be in the `dist/` folder**

3. **Serve the static files:**
   
   You can serve the built files using any static file server, or integrate them with your FastAPI backend:

   ```python
   from fastapi.staticfiles import StaticFiles
   
   # Serve React build
   app.mount("/", StaticFiles(directory="path/to/dist", html=True), name="static")
   ```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Feel free to customize this application to match your specific needs. The codebase is well-organized and documented for easy modifications.

## License

This project is part of the FastAPI Reports Dashboard system.

## Support

For issues or questions, please refer to the main FastAPI backend documentation or contact your system administrator.
