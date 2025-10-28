# Inventory Management System

A comprehensive inventory management system built with Django REST Framework backend and React frontend, featuring real-time dashboard metrics, stock management, sales tracking, and customer management.

## 🚀 Features

- **Dashboard**: Real-time metrics for manufacturers, products, suppliers, customers, and stock items
- **Inventory Management**: Track stock levels, batch numbers, expiry dates, and pricing
- **Sales Management**: Create and manage sale orders with automated stock reduction
- **Purchase Management**: Handle purchase orders and automatic stock updates
- **Customer & Supplier Management**: Maintain business relationships and contact information
- **Real-time Alerts**: Empty stock notifications and low stock warnings
- **Performance Optimized**: React components with memoization and efficient API calls

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Docker & Docker Compose**

## 🛠 Project Structure

```
Inventory-Management-System/
├── backend/                 # Django REST API
│   ├── core/               # Core Django settings and URLs
│   ├── inventory/          # Inventory management app
│   ├── purchase/           # Purchase orders app
│   ├── sale/               # Sales orders app
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/               # Source code
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── hooks/         # Custom React hooks
│   ├── package.json       # Node.js dependencies
│   └── public/            # Static files
└── docker-compose.yml     # Docker services configuration
```

## 🐳 Getting Started with Docker

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Inventory-Management-System
```

### 2. Start All Services
```bash
# Start all services (database, backend, frontend)
# Ensure docker engine is up and running
docker compose up -d

# View logs (optional)
docker compose logs -f
```

### 3. Run Database Migrations
```bash
# Create and apply database migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

### 4. Create Superuser (Admin)
```bash
docker compose exec backend python manage.py createsuperuser
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

### 6. Stop Services
```bash
docker compose down
```

## 📊 Management Commands

The system includes several custom Django management commands for data management:

### Data Seeding Commands

#### Generate Sample Data
```bash
# Add 25 sample companies/manufacturers
docker compose exec backend python manage.py insert_companies --count 25

# Add 10 sample products
docker compose exec backend python manage.py insert_products --count 10

# Add 10 sample suppliers
docker compose exec backend python manage.py insertSuppliers --count 10

# Add 100 sample stock items
docker compose exec backend python manage.py insertStock --count 100

# Add 25 sample customers
docker compose exec backend python manage.py add_customers --count 25
```

#### Complete Database Setup with Sample Data
```bash
# Run all data seeding commands in sequence
docker compose exec backend python manage.py insert_companies --count 25
docker compose exec backend python manage.py insert_products --count 10
docker compose exec backend python manage.py insertSuppliers --count 10
docker compose exec backend python manage.py add_customers --count 25
docker compose exec backend python manage.py insertStock --count 100
```



### Other Useful Commands

#### Database Operations
```bash
# Create migrations for model changes
docker compose exec backend python manage.py makemigrations

# Apply migrations
docker compose exec backend python manage.py migrate

# Reset database (⚠️ This will delete all data)
docker compose exec backend python manage.py flush

# Create database backup
docker compose exec db pg_dump -U postgres postgres > backup.sql

# Restore database backup
docker compose exec -T db psql -U postgres postgres < backup.sql
```

#### Development Commands
```bash
# Start Python shell with Django context
docker compose exec backend python manage.py shell

# Collect static files (for production)
docker compose exec backend python manage.py collectstatic

# Run tests
docker compose exec backend python manage.py test

# Check for common issues
docker compose exec backend python manage.py check
```


## 🌐 API Endpoints

### Authentication
- `POST /api/token/` - Get JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Dashboard
- `GET /api/dashboard/metrics/` - Get dashboard metrics and empty stock items
- `GET /api/dashboard/low-stock/` - Get low stock items with threshold

### Inventory
- `GET /api/inventory/companies/` - List companies/manufacturers
- `GET /api/inventory/products/` - List products
- `GET /api/inventory/stock/` - List stock items

### Sales & Purchases
- `GET /api/sale/orders/` - List sale orders
- `GET /api/purchase/purchase-orders/` - List purchase orders
- `GET /api/sale/customers/` - List customers
- `GET /api/purchase/suppliers/` - List suppliers

## 🔐 Environment Variables

### Backend (.env)
```bash
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,[::1]

# Database (PostgreSQL)
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=postgres
SQL_USER=postgres
SQL_PASSWORD=postgres
SQL_HOST=db
SQL_PORT=5432
```

### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## 📝 Development Notes

### Code Quality
- Backend uses Django REST Framework with proper serializers and viewsets
- Frontend implements React best practices with hooks and memoization
- TypeScript interfaces for type safety
- Performance optimized components with React.memo

### Database Schema
- **Companies**: Manufacturers/brands
- **Products**: Product catalog linked to companies
- **Stock**: Inventory items with batch numbers and expiry dates
- **Customers/Suppliers**: Business relationships
- **Orders**: Sales and purchase transactions

### Key Features
- **Real-time Dashboard**: Live metrics and stock alerts
- **Batch Tracking**: Track inventory by batch numbers and expiry dates
- **Automated Stock Management**: Auto-update stock levels on completed orders
- **Performance Optimized**: Memoized components and efficient API calls

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Check what's using the port
lsof -i :8000  # Backend port
lsof -i :3000  # Frontend port

# Kill process using port
kill -9 <PID>
```

2. **Database Connection Issues**
```bash
# Reset database container
docker compose down
docker volume rm inventory-management-system_postgres_data
docker compose up -d
```

3. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

4. **Module Not Found Errors**
```bash
# Rebuild containers
docker compose build --no-cache
docker compose up -d
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or need help:

1. Check the troubleshooting section above
2. Review the logs: `docker compose logs -f`
3. Create an issue in the repository
4. Contact the development team

---

**Happy Coding! 🎉**
