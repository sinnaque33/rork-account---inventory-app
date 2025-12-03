# API Integration Guide

This app is ready to connect to your backend API. Follow these steps to integrate with your existing API.

## Configuration

1. **Update the API Base URL**

Edit `services/api.ts` and change the `API_BASE_URL`:

```typescript
const API_BASE_URL = 'https://your-api-url.com/api';
```

## API Endpoints

The app expects the following endpoints:

### Authentication

**POST** `/auth/login`
- Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response (200 OK):
  ```json
  {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```

### Current Accounts

**GET** `/accounts`
- Headers: `Authorization: Bearer <token>`
- Response (200 OK):
  ```json
  [
    {
      "id": "account-id",
      "accountNumber": "ACC-12345",
      "accountName": "Main Account",
      "balance": 10000.00,
      "status": "active",
      "lastActivity": "2025-11-01T12:00:00Z"
    }
  ]
  ```

Status values: `"active"`, `"inactive"`, or `"suspended"`

### Inventory

**GET** `/inventory`
- Headers: `Authorization: Bearer <token>`
- Response (200 OK):
  ```json
  [
    {
      "id": "item-id",
      "sku": "SKU-001",
      "name": "Product Name",
      "description": "Product description",
      "quantity": 100,
      "price": 29.99,
      "category": "Electronics",
      "lastUpdated": "2025-11-01T12:00:00Z"
    }
  ]
  ```

## Authentication Flow

1. User enters credentials on login screen
2. App calls `POST /auth/login`
3. Server responds with token and user data
4. Token is stored securely (SecureStore on mobile, localStorage on web)
5. Subsequent API calls include the token in Authorization header
6. On 401 response, user is logged out automatically

## Error Handling

The app handles these error cases:

- **Network errors**: Shows user-friendly error message
- **401 Unauthorized**: Automatically logs out user and redirects to login
- **Other errors**: Displays error message from API response

## Testing Without a Backend

The app will fail to connect if you don't have a backend set up. To test the app without a backend, you can:

1. Use a mock API service like JSON Server or Mockoon
2. Modify `services/api.ts` to return mock data
3. Use a tool like ngrok to expose your local backend

## Security Notes

- Tokens are stored securely using expo-secure-store on mobile
- On web, tokens are stored in localStorage
- All API calls use HTTPS (enforced by fetch)
- Token is automatically removed on logout or 401 response
