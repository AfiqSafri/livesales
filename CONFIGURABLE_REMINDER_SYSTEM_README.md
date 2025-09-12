# Configurable Email Reminder System

This system allows sellers to choose their preferred email reminder frequency for pending receipts: **30 seconds**, **30 minutes**, or **1 hour**.

## 🎯 Features

- **Configurable Frequency**: Sellers can choose between 30s, 30m, or 1h
- **Smart Throttling**: Respects individual seller preferences
- **Professional UI**: Clean interface for frequency selection
- **Database Integration**: Preferences stored in user profile
- **Email Templates**: Dynamic content based on frequency setting

## 📊 Frequency Options

| Frequency | Description | Use Case |
|-----------|-------------|----------|
| **30 seconds** | Immediate notifications | Urgent receipts, high-volume sellers |
| **30 minutes** | Regular check-ins | Balanced approach, most sellers |
| **1 hour** | Periodic reminders | Less urgent, low-volume sellers |

## 🗄️ Database Schema

Added `reminderFrequency` field to User model:

```sql
ALTER TABLE "User" ADD COLUMN "reminderFrequency" TEXT DEFAULT '30s';
```

**Valid values**: `30s`, `30m`, `1h`

## 🔧 API Endpoints

### Update Reminder Frequency
```http
PUT /api/user/reminder-frequency
Content-Type: application/json

{
  "userId": 6,
  "reminderFrequency": "30m"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reminder frequency updated successfully",
  "user": {
    "id": 6,
    "name": "Seller Name",
    "email": "seller@example.com",
    "reminderFrequency": "30m"
  }
}
```

### Get Reminder Frequency
```http
GET /api/user/reminder-frequency?userId=6
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 6,
    "name": "Seller Name",
    "email": "seller@example.com",
    "reminderFrequency": "30m"
  }
}
```

### Reminder Check (Updated)
```http
POST /api/receipt/reminder-30s
```

**Enhanced Response**:
```json
{
  "success": true,
  "summary": {
    "totalSellers": 1,
    "remindersSent": 1,
    "remindersSkipped": 0
  },
  "results": [
    {
      "sellerId": 6,
      "sellerName": "Seller Name",
      "reminderFrequency": "30m",
      "reminderSent": true,
      "pendingCount": 3
    }
  ]
}
```

## 🎨 User Interface

### ReminderFrequencySettings Component

**Location**: `src/components/ReminderFrequencySettings.js`

**Features**:
- Radio button selection for frequency
- Visual indicators (Urgent/Balanced/Relaxed)
- Real-time updates
- Success/error messaging
- Mobile responsive design

**Usage**:
```jsx
import ReminderFrequencySettings from '@/components/ReminderFrequencySettings';

<ReminderFrequencySettings seller={user} />
```

## 📧 Email Templates

### Dynamic Frequency Display

The email template now shows the seller's current frequency setting:

```html
<!-- Reminder Frequency -->
<div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 20px 0;">
  <h4 style="margin-top: 0; color: #495057;">Reminder Frequency</h4>
  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
    You will receive this reminder every 30 minutes until all pending receipts are reviewed.
  </p>
  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
    <strong>Current setting:</strong> every 30 minutes
  </p>
</div>
```

## ⚙️ Technical Implementation

### Frequency Conversion

```javascript
const getReminderInterval = (frequency) => {
  switch (frequency) {
    case '30s': return 30 * 1000; // 30 seconds
    case '30m': return 30 * 60 * 1000; // 30 minutes
    case '1h': return 60 * 60 * 1000; // 1 hour
    default: return 30 * 1000; // default to 30 seconds
  }
};
```

### Smart Throttling

```javascript
// Get seller's preferred reminder frequency
const sellerFrequency = seller.reminderFrequency || '30s';
const reminderInterval = getReminderInterval(sellerFrequency);

// Only send reminder if enough time has passed based on seller's preference
if (timeSinceLastReminder >= reminderInterval) {
  // Send reminder email
}
```

## 🚀 Usage Examples

### 1. Seller Dashboard Integration

The component is automatically included in the seller dashboard:

```jsx
// src/app/seller/dashboard/page.js
<ReminderFrequencySettings seller={user} />
```

### 2. Programmatic Updates

```javascript
// Update seller's reminder frequency
const response = await fetch('/api/user/reminder-frequency', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: sellerId,
    reminderFrequency: '1h'
  })
});
```

### 3. Standalone Service

The reminder service automatically respects individual preferences:

```bash
node reminder-service.js
```

## 🧪 Testing

### Test Script

```bash
node test-frequency-system.js
```

**Test Coverage**:
- ✅ Get current frequency
- ✅ Update frequency to 30m
- ✅ Test reminder system
- ✅ Reset to 30s

### Manual Testing

1. **Login as seller**
2. **Go to dashboard**
3. **Find "Email Reminder Settings" section**
4. **Select different frequency**
5. **Click "Save Settings"**
6. **Verify success message**
7. **Test reminder emails**

## 📱 Mobile Responsive

The frequency selection UI is fully responsive:

- **Mobile**: Single column layout
- **Tablet**: Optimized spacing
- **Desktop**: Full feature display

## 🌐 Internationalization

Supports multiple languages:

- **English**: Default
- **Malay**: Full translation support

## 🔒 Security

- **Input Validation**: Only valid frequencies accepted
- **User Authentication**: Requires valid user ID
- **Error Handling**: Graceful failure handling

## 📈 Performance

- **Database Indexing**: Optimized queries
- **Caching**: Local storage for UI state
- **Efficient Updates**: Minimal database writes

## 🎯 Benefits

### For Sellers
- **Control**: Choose their preferred notification frequency
- **Flexibility**: Adjust based on business needs
- **Reduced Spam**: No more overwhelming 30-second emails
- **Professional**: Clean, intuitive interface

### For System
- **Scalability**: Reduces email server load
- **User Satisfaction**: Personalized experience
- **Maintainability**: Clean, modular code
- **Analytics**: Track frequency preferences

## 🚀 Deployment

### Production Considerations

1. **Database Migration**: Run Prisma migration
2. **Email Limits**: Consider service rate limits
3. **Monitoring**: Track frequency distribution
4. **User Education**: Inform sellers about new feature

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Optional
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 📊 Analytics

Track frequency preferences:

```sql
SELECT 
  reminderFrequency,
  COUNT(*) as user_count
FROM "User" 
WHERE userType = 'seller'
GROUP BY reminderFrequency;
```

## 🔄 Migration Guide

### From Fixed 30-Second System

1. **Database**: Run migration to add `reminderFrequency` field
2. **Default**: All existing sellers default to `30s`
3. **UI**: Add frequency selection component
4. **API**: Update reminder logic to respect preferences
5. **Testing**: Verify all frequencies work correctly

## 🎉 Success Metrics

- **User Adoption**: % of sellers who change from default
- **Email Reduction**: Decrease in total emails sent
- **User Satisfaction**: Feedback on frequency options
- **System Performance**: Improved server response times

The configurable reminder system provides sellers with the flexibility they need while maintaining system efficiency and user satisfaction!
