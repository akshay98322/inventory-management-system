# InvoicERP - User Manual

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Interface Overview](#user-interface-overview)
4. [Features & Modules](#features--modules)
5. [Step-by-Step Guides](#step-by-step-guides)
6. [Troubleshooting](#troubleshooting)
7. [Tips & Best Practices](#tips--best-practices)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## 🚀 Introduction

**InvoicERP** is a comprehensive pharmaceutical inventory management system designed to help businesses efficiently manage their inventory, track stock levels, handle purchase orders, manage sales, and maintain supplier relationships. This system is specifically tailored for pharmaceutical businesses but can be adapted for other industries.

### Key Benefits
- **Real-time inventory tracking** with low stock alerts
- **Automated calculations** for pricing, taxes, and totals
- **Comprehensive reporting** and analytics dashboard
- **Multi-user support** with secure authentication
- **Mobile-responsive design** for use on any device
- **Data integrity** with built-in validation and error handling

---

## 🏁 Getting Started

### System Requirements
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Stable internet connection**
- **Screen resolution**: Minimum 1024x768 (optimized for desktop and mobile)

### Accessing the System

1. **Open your web browser**
2. **Navigate to the application URL** (provided by your system administrator)
3. **Login with your credentials**

### First-Time Login

1. Enter your **username** and **password** provided by your administrator
2. Click the **"Login"** button
3. You will be redirected to the main dashboard

> **Note**: Contact your system administrator if you don't have login credentials or if you've forgotten your password.

---

## 🖥️ User Interface Overview

### Main Layout Components

#### 1. **Top Navigation Bar**
- **InvoicERP Logo** - Click to return to dashboard
- **Welcome Message** - Shows your username
- **Logout Button** - Safely exit the system

#### 2. **Side Navigation Menu**
The left sidebar provides quick access to all system modules:

- 🏠 **Dashboard** - Overview and key metrics
- 🏢 **Manufacturers** - Manage pharmaceutical companies
- 📦 **Products** - Manage product catalog
- 📊 **Stock** - Current inventory management
- 👥 **Suppliers** - Supplier information and contacts
- 👤 **Customers** - Customer database management
- 🛒 **Purchases** - Purchase order management
- 💰 **Sales** - Sales transaction management
- ⚙️ **Settings** - System configuration

#### 3. **Main Content Area**
- Displays the currently selected module
- Contains all forms, tables, and interactive elements
- Responsive design adapts to screen size

#### 4. **Mobile Navigation**
- **Hamburger menu (☰)** on mobile devices
- **Collapsible sidebar** for space optimization
- **Touch-friendly** interface elements

---

## 📋 Features & Modules

### 🏠 Dashboard

**Purpose**: Provides a comprehensive overview of your business operations

**Key Features**:
- **Business Metrics Cards**:
  - Total Manufacturers count
  - Total Products count
  - Items in Stock count
  - Total Suppliers count
  - Total Customers count

- **Stock Alerts**:
  - **Out of Stock Items** table showing critical inventory
  - **Visual warnings** with color-coded alerts
  - **Product details** including batch numbers and expiry dates

**Information Displayed**:
- Product name, company, batch number
- Expiry dates and sale prices
- Stock status indicators

---

### 🏢 Manufacturers Management

**Purpose**: Manage pharmaceutical companies that manufacture products

**Key Features**:
- **Add New Manufacturers** with company details
- **Edit Existing** manufacturer information
- **Delete Manufacturers** (with validation)
- **Search & Filter** by company name
- **Sort** by various fields (name, creation date, etc.)

**Data Fields**:
- Company Name (required)
- Creation and modification timestamps

**Available Actions**:
- ➕ **Add** - Create new manufacturer
- ✏️ **Edit** - Modify existing details
- 🗑️ **Delete** - Remove manufacturer (if no associated products)
- 🔍 **Search** - Find specific manufacturers

---

### 📦 Products Management

**Purpose**: Maintain a comprehensive catalog of pharmaceutical products

**Key Features**:
- **Product Registration** with detailed information
- **Manufacturer Association** linking products to companies
- **Search Functionality** across product names and manufacturers
- **Sorting Options** by various criteria
- **Product Validation** ensuring data integrity

**Data Fields**:
- Product Name (required)
- Associated Manufacturer (dropdown selection)
- Creation and modification timestamps

**Available Actions**:
- ➕ **Add Product** - Register new pharmaceutical product
- ✏️ **Edit Product** - Update product information
- 🗑️ **Delete Product** - Remove product (if no stock exists)
- 🔍 **Search** - Find products by name or manufacturer

---

### 📊 Stock Management

**Purpose**: Real-time inventory tracking and management

**Key Features**:
- **Stock Registration** with comprehensive details
- **Batch Tracking** for pharmaceutical compliance
- **Expiry Date Management** for safety compliance
- **Pricing Management** (purchase, sale, MRP)
- **Tax Calculations** with HSN code support
- **Low Stock Filtering** option
- **Advanced Search** across multiple fields

**Data Fields**:
- **Product Selection** (dropdown with search)
- **Batch Number** (unique identifier)
- **Expiry Date** (date picker)
- **Quantity** (numeric input)
- **Purchase Price** (per unit)
- **Sale Price** (per unit)
- **MRP** (Maximum Retail Price)
- **Tax Percentage**
- **HSN Code** (for tax compliance)

**Special Features**:
- **Auto-calculation** of total price
- **Zero quantity filtering** option
- **Expiry date validation**
- **Batch number uniqueness**

**Available Actions**:
- ➕ **Add Stock** - Register new inventory
- ✏️ **Edit Stock** - Update stock details
- 🗑️ **Delete Stock** - Remove stock entry
- 🔍 **Search** - Multi-field search capability
- 📋 **Sort** - Multiple sorting options
- 👁️ **Filter** - Hide/show zero quantity items

---

### 👥 Suppliers Management

**Purpose**: Maintain supplier database for purchase management

**Key Features**:
- **Comprehensive Supplier Profiles** with contact details
- **License Management** for regulatory compliance
- **Contact Information** tracking
- **Search Capabilities** across all fields
- **Supplier Validation** ensuring complete information

**Data Fields**:
- **Supplier Name** (company name)
- **Contact Person** (primary contact)
- **Phone Number** (contact number)
- **Email Address** (for communication)
- **Physical Address** (complete address)
- **Drug License Number** (regulatory requirement)
- **GST Number** (tax identification)

**Available Actions**:
- ➕ **Add Supplier** - Register new supplier
- ✏️ **Edit Supplier** - Update supplier information
- 🗑️ **Delete Supplier** - Remove supplier record
- 🔍 **Search** - Find suppliers by any field
- 📧 **Contact** - Quick access to contact information

---

### 👤 Customers Management

**Purpose**: Customer database for sales tracking and relationship management

**Key Features**:
- **Customer Registration** with complete profiles
- **Contact Management** for customer relationships
- **Search and Filter** capabilities
- **Customer History** tracking
- **Data Validation** for accuracy

**Data Fields**:
- Customer Name
- Contact Information
- Address Details
- Registration Date

**Available Actions**:
- ➕ **Add Customer** - Register new customer
- ✏️ **Edit Customer** - Update customer details
- 🗑️ **Delete Customer** - Remove customer record
- 🔍 **Search** - Find customers quickly

---

### 🛒 Purchase Management

**Purpose**: Handle purchase orders and supplier transactions

**Key Features**:
- **Purchase Order Creation** with multiple items
- **Supplier Integration** linking orders to suppliers
- **Item Management** within orders
- **Status Tracking** throughout purchase lifecycle
- **Order Validation** ensuring completeness

**Data Fields**:
- **Supplier Selection** (dropdown)
- **Invoice Number** (unique identifier)
- **Order Date** (date picker)
- **Order Status** (pending, confirmed, shipped, delivered, completed, cancelled)
- **Order Items**:
  - Product selection
  - Quantity
  - Unit price
  - Total calculation

**Purchase Order Lifecycle**:
1. **Pending** - Order created, awaiting confirmation
2. **Confirmed** - Order confirmed by supplier
3. **Shipped** - Items dispatched by supplier
4. **Delivered** - Items received
5. **Completed** - Order processing complete
6. **Cancelled** - Order cancelled

**Available Actions**:
- ➕ **Create Order** - New purchase order
- ✏️ **Edit Order** - Modify existing order
- 🗑️ **Delete Order** - Remove purchase order
- 📋 **View Details** - Complete order information
- 🔄 **Update Status** - Change order status

---

### 💰 Sales Management

**Purpose**: Process sales transactions and track revenue

**Key Features**:
- **Sales Transaction Recording** with detailed items
- **Customer Association** linking sales to customers
- **Inventory Integration** automatic stock reduction
- **Receipt Generation** for customer records
- **Sales Analytics** and reporting

**Data Fields**:
- Customer Selection
- Sale Date
- Sale Items (product, quantity, price)
- Payment Details
- Total Amount

**Available Actions**:
- ➕ **Record Sale** - Create new sales transaction
- ✏️ **Edit Sale** - Modify sales details
- 🗑️ **Delete Sale** - Remove sales record
- 🧾 **Print Receipt** - Generate customer receipt
- 📊 **View Reports** - Sales analytics

---

### ⚙️ Settings

**Purpose**: System configuration and user preferences

**Key Features**:
- **User Profile Management**
- **System Preferences**
- **Security Settings**
- **Data Export/Import** options
- **Backup Configuration**

---

## 📚 Step-by-Step Guides

### 🔧 Setting Up Your Inventory System

#### Step 1: Add Manufacturers
1. Click **"Manufacturers"** in the sidebar
2. Click the **"+ Add"** button
3. Enter the **company name**
4. Click **"Save"** to create the manufacturer

#### Step 2: Add Products
1. Navigate to **"Products"** page
2. Click **"+ Add"** button
3. Enter **product name**
4. Select **manufacturer** from dropdown
5. Click **"Save"** to create the product

#### Step 3: Add Suppliers
1. Go to **"Suppliers"** page
2. Click **"+ Add"** button
3. Fill in all required fields:
   - Supplier name
   - Contact person
   - Phone and email
   - Complete address
   - Drug license number
   - GST number
4. Click **"Save"** to register supplier

#### Step 4: Register Stock
1. Navigate to **"Stock"** page
2. Click **"+ Add"** button
3. Complete the stock form:
   - Search and select **product**
   - Enter **batch number**
   - Set **expiry date**
   - Enter **quantity**
   - Input **pricing details** (purchase, sale, MRP)
   - Enter **tax percentage**
   - Add **HSN code**
4. Click **"Save"** to register stock

---

### 📦 Managing Stock Operations

#### Adding New Stock
1. **Navigate** to Stock page
2. **Click** the Add button (+ icon)
3. **Search for product** by typing in the product field
4. **Select product** from dropdown
5. **Enter batch details**:
   - Unique batch number
   - Expiry date (use date picker)
6. **Input quantities and pricing**:
   - Current quantity
   - Purchase price per unit
   - Sale price per unit
   - Maximum retail price (MRP)
   - Tax percentage
7. **Add regulatory information**:
   - HSN code for tax compliance
8. **Review and save**

#### Updating Existing Stock
1. **Find the stock item** using search or scrolling
2. **Click the Edit icon** (✏️) in the Actions column
3. **Modify necessary fields**
4. **Ensure batch number remains unique**
5. **Update quantities** if stock received/sold
6. **Adjust pricing** if needed
7. **Save changes**

#### Searching Stock
- **Quick search**: Use the search box at the top
- **Advanced filtering**: Use the filter options
- **Sort results**: Click column headers to sort
- **Hide zero quantities**: Toggle the checkbox to focus on available stock

---

### 🛒 Creating Purchase Orders

#### Step-by-Step Purchase Order Creation

1. **Navigate to Purchases** page
2. **Click Add Purchase Order** button
3. **Select Supplier**:
   - Choose from dropdown list
   - Supplier must be pre-registered
4. **Enter Order Details**:
   - Invoice number (unique)
   - Order date (use date picker)
   - Initial status (usually "pending")
5. **Add Order Items**:
   - Click "Add Item" button
   - Select product from dropdown
   - Enter quantity needed
   - Input unit price (negotiated with supplier)
   - System calculates total automatically
6. **Review Order**:
   - Check all items and quantities
   - Verify supplier information
   - Confirm total amount
7. **Save Order**:
   - Click "Save" to create purchase order
   - Order receives unique ID for tracking

#### Managing Purchase Order Status
- **Pending**: Initial status when order created
- **Confirmed**: Mark when supplier confirms order
- **Shipped**: Update when supplier dispatches items
- **Delivered**: Mark when items arrive at your location
- **Completed**: Final status when stock is added to inventory

---

### 💰 Processing Sales

#### Creating a Sales Transaction

1. **Navigate to Sales** page
2. **Click Add Sale** button
3. **Select Customer** (if registered) or add new
4. **Choose Sale Date** (defaults to today)
5. **Add Sale Items**:
   - Select products from available stock
   - Enter quantities being sold
   - System shows available stock quantities
   - Prices auto-populate from stock data
6. **Review Transaction**:
   - Verify all items and quantities
   - Check total amount calculation
   - Ensure stock availability
7. **Complete Sale**:
   - Save transaction
   - Stock quantities automatically reduced
   - Receipt generated for customer

#### Important Sales Notes
- **Stock Validation**: System prevents overselling
- **Automatic Calculations**: Totals, taxes computed automatically
- **Stock Updates**: Inventory reduced in real-time
- **Customer History**: All transactions linked to customer records

---

## 🔧 Common Operations

### 🔍 Searching and Filtering

#### Universal Search Features
Every list page includes powerful search capabilities:

1. **Quick Search Box**:
   - Type any keyword to search across relevant fields
   - Real-time filtering as you type
   - Case-insensitive matching

2. **Column Sorting**:
   - Click any column header to sort
   - Click again to reverse sort order
   - Sort indicator shows current direction

3. **Advanced Filtering**:
   - Use specific filters where available
   - Combine multiple criteria
   - Reset filters to view all data

#### Search Tips
- **Use partial matches**: "asp" finds "Aspirin"
- **Search multiple terms**: "paracetamol 500mg"
- **Use company names**: Search products by manufacturer
- **Try batch numbers**: Find specific stock items

### 📊 Pagination and Navigation

**Large Datasets**: The system handles large amounts of data efficiently:

1. **Automatic Pagination**: Data loads in manageable chunks
2. **Infinite Scroll**: More data loads as you scroll down
3. **Loading Indicators**: Shows when data is being fetched
4. **Error Handling**: Graceful handling of connection issues

### 💾 Data Entry Best Practices

#### Required Fields
- **Red asterisk (*)** indicates required fields
- **Form validation** prevents incomplete submissions
- **Error messages** guide you to fix issues

#### Data Validation
- **Format checking**: Emails, phone numbers, dates
- **Range validation**: Prices, quantities within acceptable limits
- **Uniqueness**: Batch numbers, invoice numbers must be unique
- **Dependency validation**: Products must have manufacturers

#### Saving Your Work
- **Auto-save**: Some forms save automatically
- **Manual save**: Click Save button to confirm changes
- **Cancel option**: Discard changes if needed
- **Confirmation dialogs**: Prevent accidental deletions

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 🔐 Login Problems

**Issue**: Cannot log in to the system
**Solutions**:
1. **Check credentials**: Verify username and password
2. **Clear browser cache**: Delete cached data and cookies
3. **Try different browser**: Test with Chrome, Firefox, or Safari
4. **Check internet connection**: Ensure stable connectivity
5. **Contact administrator**: For password reset or account issues

**Issue**: Session expires frequently
**Solutions**:
1. **Check system activity**: Inactive sessions timeout automatically
2. **Refresh before expiry**: Click refresh or navigate to extend session
3. **Save work frequently**: Don't lose data due to timeouts

#### 📡 Connection Issues

**Issue**: "Failed to load data" or slow loading
**Solutions**:
1. **Check internet speed**: Ensure adequate bandwidth
2. **Refresh the page**: Press F5 or click refresh
3. **Clear browser cache**: Remove old cached files
4. **Try incognito mode**: Test without browser extensions
5. **Check with other users**: Verify if it's a system-wide issue

#### 📝 Data Entry Problems

**Issue**: Form won't submit or shows validation errors
**Solutions**:
1. **Check required fields**: All red asterisk (*) fields must be filled
2. **Verify data format**: Dates, emails, numbers in correct format
3. **Check field limits**: Text fields have maximum character limits
4. **Review error messages**: Red text indicates specific problems
5. **Try saving sections**: Complete one section at a time

**Issue**: Dropdown menus empty or not loading
**Solutions**:
1. **Check dependencies**: Ensure related data exists (e.g., manufacturers before products)
2. **Refresh page**: Reload to fetch latest data
3. **Clear filters**: Remove any active search filters
4. **Check permissions**: Verify access to required data

#### 🔢 Calculation Errors

**Issue**: Totals or calculations seem incorrect
**Solutions**:
1. **Verify input values**: Check all numbers are entered correctly
2. **Understand tax calculations**: Tax percentages applied as configured
3. **Check decimal places**: System rounds to 2 decimal places for currency
4. **Refresh calculations**: Edit and save to recalculate

#### 📱 Mobile Device Issues

**Issue**: Interface doesn't work well on mobile
**Solutions**:
1. **Use landscape mode**: Rotate device for better view
2. **Zoom appropriately**: Pinch to zoom for better text size
3. **Use desktop for complex tasks**: Some operations better on larger screens
4. **Ensure modern browser**: Update mobile browser to latest version

---

## 💡 Tips & Best Practices

### 🏆 Efficiency Tips

#### ⚡ Quick Navigation
- **Keyboard shortcuts**: Use Tab to move between fields
- **Bookmark frequently used pages**: Save time navigating
- **Use search extensively**: Faster than scrolling through lists
- **Keep multiple tabs open**: Work on different sections simultaneously

#### 📋 Data Management
- **Standardize naming**: Use consistent product and company names
- **Regular updates**: Keep stock levels current
- **Batch processing**: Add multiple items at once when possible
- **Regular backups**: Export important data periodically

#### 🔍 Search Optimization
- **Use specific terms**: "Paracetamol 500mg" vs just "medicine"
- **Try abbreviations**: "PCM" for Paracetamol
- **Search by batch**: Use batch numbers for specific stock
- **Filter by dates**: Use date ranges for time-specific data

### 📈 Business Process Tips

#### 📦 Inventory Management
- **Set reorder levels**: Know when to restock items
- **Track expiry dates**: Rotate stock using FIFO (First In, First Out)
- **Monitor trends**: Use dashboard metrics to identify patterns
- **Plan purchases**: Based on sales history and forecasts

#### 💼 Supplier Relations
- **Maintain accurate contacts**: Keep supplier information current
- **Track performance**: Note delivery times and quality
- **Multiple suppliers**: Have backup suppliers for critical items
- **Negotiate terms**: Use purchase history for better deals

#### 👥 Customer Service
- **Quick customer lookup**: Use search to find customer history
- **Accurate records**: Maintain complete customer information
- **Transaction history**: Track customer buying patterns
- **Prompt service**: Use system efficiency to serve customers faster

### 🔒 Security Best Practices

#### 🛡️ Account Security
- **Strong passwords**: Use complex passwords with mixed characters
- **Regular logout**: Always logout when finished
- **Secure workstations**: Don't leave system unattended while logged in
- **Report issues**: Notify administrator of any security concerns

#### 💾 Data Protection
- **Regular backups**: Export important data regularly
- **Verify entries**: Double-check critical data entry
- **Access control**: Only access areas relevant to your role
- **Confidentiality**: Protect sensitive business information

---

## ❓ Frequently Asked Questions

### 🔧 General System Questions

**Q: How often is data backed up?**
A: Data is backed up regularly by the system administrator. Contact them for specific backup schedules and recovery procedures.

**Q: Can I use the system on my mobile phone?**
A: Yes, the system is fully responsive and works on mobile devices. For complex data entry tasks, a desktop or tablet is recommended for better user experience.

**Q: What browsers are supported?**
A: The system works best with modern browsers including Chrome, Firefox, Safari, and Edge. Ensure your browser is updated to the latest version.

**Q: How do I get additional user accounts?**
A: Contact your system administrator to request additional user accounts or to modify existing user permissions.

### 📊 Stock Management Questions

**Q: How do I handle expired products?**
A: The system shows expiry dates clearly. Create a process to regularly review expiring stock and dispose of expired products according to regulations. You can search/sort by expiry date to identify products nearing expiration.

**Q: Can I track multiple batches of the same product?**
A: Yes, each stock entry has a unique batch number. You can have multiple entries for the same product with different batch numbers, expiry dates, and prices.

**Q: What happens if I enter a negative stock quantity?**
A: The system validates stock quantities and prevents negative values. If you need to adjust stock due to damage or loss, create appropriate entries to reflect actual quantities.

**Q: How do I handle returns or damaged goods?**
A: Adjust stock quantities by editing existing stock entries or creating new entries with adjusted quantities. Maintain records of reasons for adjustments.

### 💰 Sales and Purchase Questions

**Q: Can I modify a purchase order after it's been created?**
A: Yes, you can edit purchase orders before they are marked as "completed." However, be cautious about modifying orders that have been confirmed with suppliers.

**Q: What happens to stock when I record a sale?**
A: Stock quantities are automatically reduced when you record a sale. The system prevents overselling by validating available quantities.

**Q: Can I issue partial refunds or returns?**
A: The current system focuses on forward transactions. For refunds or returns, consult with your administrator about the best process for your business needs.

**Q: How do I handle discounts or special pricing?**
A: You can enter specific sale prices for individual transactions that differ from the standard stock prices.

### 🔍 Search and Data Questions

**Q: Why don't I see all my data in the lists?**
A: The system uses pagination to load data efficiently. Scroll down to see more items, or use the search function to find specific entries.

**Q: Can I export data to Excel or other formats?**
A: Export functionality may be available in the Settings area. Contact your administrator for specific export options and procedures.

**Q: How do I fix data entry mistakes?**
A: Most data can be edited by clicking the Edit (✏️) button next to the item. Some critical data may require administrator assistance to modify.

**Q: Why do some dropdown menus appear empty?**
A: Dropdown menus show data that exists in the system. For example, the product dropdown in stock entry will only show products that have been added to the system first.

### 🚨 Error and Technical Questions

**Q: What do I do if I see a "500 Internal Server Error"?**
A: This indicates a server issue. Try refreshing the page, and if the problem persists, contact your system administrator.

**Q: Why am I getting logged out frequently?**
A: Sessions expire for security. The timeout period is set by your administrator. Save your work frequently and stay active in the system.

**Q: What if I accidentally delete important data?**
A: Contact your system administrator immediately. Depending on backup procedures, deleted data may be recoverable.

**Q: Why are some features not visible to me?**
A: The system may have role-based permissions. Contact your administrator if you need access to additional features.

---

## 📞 Support and Contact

### 🆘 Getting Help

#### System Administrator
- **First point of contact** for technical issues
- **Account management** and password resets
- **System configuration** and customization
- **Data backup and recovery** assistance

#### Technical Support Process
1. **Try troubleshooting steps** in this manual first
2. **Document the issue**: Note what you were doing when the problem occurred
3. **Capture screenshots**: Include error messages or unexpected behavior
4. **Contact administrator**: Provide detailed information about the issue
5. **Follow up**: Check if the issue is resolved and provide feedback

#### Best Practices for Support Requests
- **Be specific**: Describe exactly what happened and what you expected
- **Include context**: What page were you on? What were you trying to do?
- **Provide details**: Browser, device type, time of issue
- **Screenshots**: Visual information helps diagnose problems quickly

---

## 📚 Additional Resources

### 📖 Related Documentation
- **Technical Documentation** - For system administrators
- **API Documentation** - For developers and integrations
- **Setup Guide** - Initial system configuration
- **Security Guidelines** - Best practices for data protection

### 🎓 Training and Learning
- **New User Training** - Contact administrator for training sessions
- **Feature Updates** - Stay informed about new system capabilities
- **Best Practices Workshops** - Optimize your use of the system
- **User Community** - Connect with other users for tips and tricks

---

## 📝 Document Information

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**System Version**: InvoicERP v1.0  
**Author**: InvoicERP Development Team  

### 📋 Revision History
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 26, 2025 | Initial user manual release |

---

**© 2025 InvoicERP. All rights reserved.**

*This manual is designed to help you get the most out of your InvoicERP system. For the latest updates and additional resources, contact your system administrator.*