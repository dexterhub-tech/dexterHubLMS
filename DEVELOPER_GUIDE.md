# DexterHub LMS - Developer Guide

## Architecture Overview

### Frontend Architecture
```
App (Root Layout)
├── AuthProvider (Context)
├── Login/Register Pages
└── Protected Dashboards
    ├── /dashboard (Learner)
    ├── /admin (Admin)
    └── Sidebar Navigation
```

### Backend Architecture
```
Express Server
├── Middleware (CORS, JSON)
├── Auth Middleware (JWT validation)
├── Role Middleware (Permission checking)
├── Routes
│   ├── /api/auth
│   ├── /api/cohorts
│   ├── /api/learner-progress
│   ├── /api/instructor-notes
│   ├── /api/drop-recommendations
│   ├── /api/appeals
│   └── /api/audit-logs
└── MongoDB (Data persistence)
```

## Adding New Features

### Adding a New Dashboard Page

1. **Create the page file**:
   ```typescript
   // app/dashboard/new-feature/page.tsx
   'use client';
   
   import { useAuth } from '@/lib/auth-context';
   import { api } from '@/lib/api';
   
   export default function NewFeaturePage() {
     const { user } = useAuth();
     
     return (
       <div className="space-y-8">
         {/* Your content */}
       </div>
     );
   }
   ```

2. **Add to sidebar navigation**:
   ```typescript
   // components/dashboard-sidebar.tsx
   const MENU_ITEMS = {
     learner: [
       // ... existing items
       { href: '/dashboard/new-feature', label: 'New Feature', icon: IconName },
     ],
   };
   ```

3. **Add API integration**:
   ```typescript
   // lib/api.ts
   async getNewFeatureData(): Promise<any> {
     return this.request('/api/new-feature');
   }
   ```

### Adding a New API Endpoint

1. **Add the backend route** in `server.js`:
   ```javascript
   app.post('/api/new-feature', authMiddleware, async (req, res) => {
     try {
       // Your logic here
       res.status(201).json({ success: true });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. **Add API method** in `lib/api.ts`:
   ```typescript
   async createNewFeature(data: any): Promise<any> {
     return this.request('/api/new-feature', {
       method: 'POST',
       body: JSON.stringify(data),
     });
   }
   ```

3. **Use in component**:
   ```typescript
   const result = await api.createNewFeature(formData);
   ```

## Common Tasks

### Styling Components

Use Tailwind CSS with design tokens:
```tsx
<Card className="border-border/50">
  <CardHeader>
    <CardTitle className="text-primary">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button className="bg-primary hover:bg-primary/90">
      Action
    </Button>
  </CardContent>
</Card>
```

### Creating Forms

```tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.submitForm(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Showing Loading States

```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await api.getData();
      setData(data);
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, []);

if (isLoading) {
  return <div className="animate-pulse">Loading...</div>;
}
```

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Operation completed');

// Error
toast.error('Something went wrong');

// Loading
toast.loading('Processing...');
```

### Status Badges

```tsx
import { Badge } from '@/components/ui/badge';

<Badge className={getStatusColor(status)}>
  {status.toUpperCase()}
</Badge>

function getStatusColor(status: string) {
  switch (status) {
    case 'on-track':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'at-risk':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}
```

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: 'learner' | 'instructor' | 'admin' | 'super-admin',
  status: 'active' | 'inactive' | 'dropped',
  activeCohortId: ObjectId,
  createdAt: Date
}
```

### Cohort Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: 'upcoming' | 'active' | 'completed' | 'archived',
  instructorIds: [ObjectId],
  learnerIds: [ObjectId],
  courseIds: [ObjectId],
  performanceThreshold: Number (percent),
  weeklyTarget: Number (hours),
  gracePeriodDays: Number,
  reviewCycleFrequency: 'weekly' | 'bi-weekly' | 'monthly',
  createdAt: Date
}
```

### LearnerProgress Model
```javascript
{
  _id: ObjectId,
  learnerId: ObjectId,
  cohortId: ObjectId,
  courseId: ObjectId,
  completedLessons: [ObjectId],
  currentScore: Number,
  learningHoursThisWeek: Number,
  status: 'on-track' | 'at-risk' | 'under-review' | 'dropped',
  lastActivityDate: Date,
  inactivityDays: Number,
  lastAssessmentScore: Number,
  updatedAt: Date
}
```

## Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/dexterhub-lms
JWT_SECRET=dev-secret-key
NODE_ENV=development
PORT=5000
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret-key
NODE_ENV=production
PORT=5000
```

## Testing API Endpoints

### Using cURL
```bash
# Get cohorts
curl -X GET http://localhost:5000/api/cohorts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create cohort
curl -X POST http://localhost:5000/api/cohorts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cohort 1","startDate":"2024-01-01"}'
```

### Using REST Client (VS Code Extension)
```
@baseUrl = http://localhost:5000

### Get Cohorts
GET {{baseUrl}}/api/cohorts
Authorization: Bearer @token

### Create Cohort
POST {{baseUrl}}/api/cohorts
Authorization: Bearer @token
Content-Type: application/json

{
  "name": "Cohort 2024-Q1",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

## Debugging

### Frontend Debugging
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API responses
4. Check Application > Local Storage for tokens
5. Use React DevTools extension for component state

### Backend Debugging
1. Check server console logs
2. Use Postman or curl to test endpoints
3. Check MongoDB for data persistence
4. Look for error messages in response

### Common Issues

**CORS Errors**: Ensure CORS is enabled in server.js
```javascript
app.use(cors());
```

**Token Expired**: Clear localStorage and login again
```javascript
localStorage.removeItem('auth_token');
```

**Database Connection**: Check MongoDB URI and service status
```bash
# Test connection
mongo "mongodb://localhost:27017"
```

## Performance Tips

1. **Use React.memo** for expensive components:
   ```tsx
   export const MyComponent = React.memo(({ data }) => {
     return <div>{data}</div>;
   });
   ```

2. **Implement pagination** for large lists:
   ```typescript
   const [page, setPage] = useState(1);
   const items = await api.getItems({ page, limit: 20 });
   ```

3. **Cache API responses** with SWR:
   ```typescript
   import useSWR from 'swr';
   
   const { data } = useSWR('/api/cohorts', api.getCohorts);
   ```

4. **Optimize images** with Next.js Image:
   ```tsx
   import Image from 'next/image';
   <Image src="/image.jpg" alt="..." width={200} height={200} />
   ```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas set up
- [ ] Backend deployed and tested
- [ ] Frontend deployed and tested
- [ ] API endpoints verified
- [ ] Authentication working
- [ ] All dashboards accessible
- [ ] Mobile responsiveness checked
- [ ] Error handling in place
- [ ] Monitoring configured

## Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Express.js](https://expressjs.com)
- [MongoDB](https://docs.mongodb.com)
- [JWT Guide](https://jwt.io/introduction)

## Code Style Guide

### Naming Conventions
- Components: PascalCase (`MyComponent.tsx`)
- Files: kebab-case (`my-component.tsx`)
- Variables: camelCase (`myVariable`)
- Constants: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- CSS Classes: kebab-case (Tailwind)

### Component Structure
```tsx
'use client'; // If using client features

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';

export default function MyComponent() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <Card>
      {/* JSX */}
    </Card>
  );
}
```

---

**Happy coding!** 🚀
