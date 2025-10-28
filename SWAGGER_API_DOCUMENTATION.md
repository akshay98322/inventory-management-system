# Swagger API Documentation - Inventory Management System

## Overview

This document describes the Swagger/OpenAPI documentation integration for the Inventory Management System. The API documentation provides interactive, comprehensive documentation for all available endpoints with authentication support.

## 🚀 Accessing API Documentation

Once the Django server is running, you can access the API documentation through the following URLs:

### Swagger UI (Interactive Documentation)
```
http://localhost:8000/swagger/
```
- **Interactive API testing interface**
- **Try out endpoints directly from the browser**
- **Authentication support with JWT tokens**
- **Request/response examples**
- **Schema validation**

### ReDoc (Clean Documentation)
```
http://localhost:8000/redoc/
```
- **Clean, readable documentation**
- **Better for documentation review**
- **Detailed schema descriptions**
- **No interactive testing**

### OpenAPI Schema (JSON/YAML)
```
http://localhost:8000/swagger.json
http://localhost:8000/swagger.yaml
```
- **Machine-readable API specification**
- **For integration with API clients**
- **Import into Postman, Insomnia, etc.**

## 📚 API Documentation Structure

### Authentication
- **JWT Bearer Token Authentication**
- **Login endpoint for token generation**
- **Secure endpoints require authentication**
- **Token refresh functionality**

### API Categories

#### 1. Authentication & Users
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/users/me/` - Current user profile

#### 2. Dashboard Analytics
- `GET /api/dashboard/` - System dashboard metrics
- `GET /api/low-stock-items/` - Low stock alerts

#### 3. Inventory Management

##### Companies
- `GET /api/companies/` - List companies
- `POST /api/companies/` - Create company
- `GET /api/companies/{id}/` - Get company details
- `PUT /api/companies/{id}/` - Update company
- `PATCH /api/companies/{id}/` - Partial update company
- `DELETE /api/companies/{id}/` - Delete company

##### Products
- `GET /api/products/` - List products
- `POST /api/products/` - Create product
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product
- `PATCH /api/products/{id}/` - Partial update product
- `DELETE /api/products/{id}/` - Delete product

##### Stock Management
- `GET /api/stock/` - List stock items
- `POST /api/stock/` - Create stock item
- `GET /api/stock/{id}/` - Get stock details
- `PUT /api/stock/{id}/` - Update stock
- `PATCH /api/stock/{id}/` - Partial update stock
- `DELETE /api/stock/{id}/` - Delete stock

#### 4. Purchase Management

##### Suppliers
- `GET /api/suppliers/` - List suppliers
- `POST /api/suppliers/` - Create supplier
- `GET /api/suppliers/{id}/` - Get supplier details
- `PUT /api/suppliers/{id}/` - Update supplier
- `PATCH /api/suppliers/{id}/` - Partial update supplier
- `DELETE /api/suppliers/{id}/` - Delete supplier

##### Purchase Orders
- `GET /api/purchase-orders/` - List purchase orders
- `POST /api/purchase-orders/` - Create purchase order
- `GET /api/purchase-orders/{id}/` - Get order details
- `PUT /api/purchase-orders/{id}/` - Update order
- `PATCH /api/purchase-orders/{id}/` - Partial update order
- `DELETE /api/purchase-orders/{id}/` - Delete order

#### 5. Sales Management
- `GET /api/sales/` - List sales
- `POST /api/sales/` - Create sale
- `GET /api/sales/{id}/` - Get sale details
- `PUT /api/sales/{id}/` - Update sale
- `DELETE /api/sales/{id}/` - Delete sale

## 🔧 Features

### Interactive Testing
- **Try endpoints directly from Swagger UI**
- **Automatic request/response validation**
- **Real-time API testing**
- **Authentication integration**

### Comprehensive Documentation
- **Detailed parameter descriptions**
- **Request/response schemas**
- **Error code documentation**
- **Example payloads**

### Search & Filtering
- **All list endpoints support search**
- **Flexible ordering options**
- **Pagination support**
- **Query parameter validation**

### Authentication
- **JWT token authentication**
- **Secure API access**
- **User session management**
- **Permission-based access**

## 📋 Request/Response Examples

### Authentication Example
```bash
# Login
curl -X POST "http://localhost:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Create Company Example
```bash
curl -X POST "http://localhost:8000/api/companies/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MediCorp Pharmaceuticals"
  }'
```

### Create Stock Item Example
```bash
curl -X POST "http://localhost:8000/api/stock/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": 1,
    "batch_number": "MC001",
    "expiry_date": "2025-12-31",
    "quantity": 100,
    "purchase_price": 10.00,
    "sale_price": 15.00,
    "mrp": 20.00,
    "tax": 5.00,
    "hsn_code": "30041000"
  }'
```

### Search & Filter Examples
```bash
# Search companies
GET /api/companies/?search=medico&ordering=-created_at

# Filter stock by low quantity
GET /api/low-stock-items/?threshold=20

# Paginated results
GET /api/products/?page=2&page_size=25
```

## 🛠️ Development Notes

### Configuration
- **drf-yasg 1.21.9** for Swagger generation
- **OpenAPI 3.0 specification**
- **JWT authentication integration**
- **Comprehensive error handling**

### Schema Customization
- **Custom response examples**
- **Detailed parameter descriptions**
- **Error code documentation**
- **Request validation schemas**

### Security
- **JWT Bearer token authentication**
- **Endpoint-level permissions**
- **Secure API access**
- **CORS configuration**

## 🚨 Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (Delete)
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Authentication Required)
- `403` - Forbidden (Permission Denied)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Detailed error message",
  "errors": {
    "field_name": ["Field-specific error messages"]
  }
}
```

## 🔍 Pagination

All list endpoints support pagination:

```json
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=3",
  "previous": "http://localhost:8000/api/products/?page=1",
  "results": [...]
}
```

### Pagination Parameters
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 50, max: 1000)

## 🔎 Search & Filtering

### Search Parameters
- Most endpoints support `search` parameter
- Searches across relevant fields (name, description, etc.)
- Case-insensitive matching

### Ordering Parameters
- `ordering` parameter for sorting results
- Use `-` prefix for descending order
- Multiple valid options per endpoint

### Example Search Queries
```bash
# Search products by name or company
GET /api/products/?search=aspirin

# Order by creation date (newest first)
GET /api/companies/?ordering=-created_at

# Combined search and ordering
GET /api/stock/?search=paracetamol&ordering=expiry_date
```

## 📖 API Client Integration

### Postman Collection
1. Import OpenAPI spec from `http://localhost:8000/swagger.json`
2. Configure environment with base URL and auth token
3. Test endpoints with pre-configured requests

### Python Client Example
```python
import requests

# Authenticate
auth_response = requests.post('http://localhost:8000/api/auth/login/', {
    'username': 'admin',
    'password': 'password'
})
token = auth_response.json()['access']

# Make authenticated request
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/companies/', headers=headers)
companies = response.json()
```

## 🎯 Best Practices

### API Usage
1. **Always include authentication headers** for protected endpoints
2. **Use appropriate HTTP methods** (GET, POST, PUT, PATCH, DELETE)
3. **Handle pagination** for large datasets
4. **Implement error handling** for robust applications
5. **Use search and filtering** to optimize data retrieval

### Testing
1. **Use Swagger UI** for interactive testing during development
2. **Test all CRUD operations** for each endpoint
3. **Validate request/response schemas** against documentation
4. **Test authentication flows** and token management
5. **Verify error handling** with invalid requests

## 📞 Support

For API documentation issues or questions:
1. Check the interactive Swagger UI for detailed examples
2. Review request/response schemas in ReDoc
3. Validate API calls against the OpenAPI specification
4. Test endpoints in Swagger UI before implementing in applications

---

**Note**: This API documentation is automatically generated from the Django REST Framework serializers and viewsets. It stays in sync with the actual API implementation, ensuring accuracy and completeness.