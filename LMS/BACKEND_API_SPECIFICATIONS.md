# 🔧 Backend API Specifications

## 📝 **نظام المدونات (Blogs System)**

### **API Endpoints:**

#### **1. جلب جميع المدونات**

```
GET /blogs
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "lang": "ar|en",
  "page": "number",
  "limit": "number",
  "category": "string",
  "search": "string"
}
Response: {
  "data": [
    {
      "id": "number",
      "title": "string",
      "titleEn": "string",
      "content": "string",
      "contentEn": "string",
      "imageUrl": "string",
      "author": "string",
      "category": "string",
      "publishedAt": "date",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### **2. جلب مدونة محددة**

```
GET /blogs/{id}
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Response: {
  "id": "number",
  "title": "string",
  "titleEn": "string",
  "content": "string",
  "contentEn": "string",
  "imageUrl": "string",
  "author": "string",
  "category": "string",
  "publishedAt": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### **3. إنشاء مدونة جديدة**

```
POST /blogs
Headers: {
  "Content-Type": "multipart/form-data"
}
Body: FormData {
  "title": "string",
  "titleEn": "string",
  "content": "string",
  "contentEn": "string",
  "image": "file",
  "author": "string",
  "category": "string",
  "publishedAt": "date"
}
Response: {
  "id": "number",
  "message": "Blog created successfully"
}
```

#### **4. تحديث مدونة**

```
PUT /blogs/{id}
Headers: {
  "Content-Type": "multipart/form-data"
}
Body: FormData {
  "title": "string",
  "titleEn": "string",
  "content": "string",
  "contentEn": "string",
  "image": "file",
  "author": "string",
  "category": "string",
  "publishedAt": "date"
}
Response: {
  "message": "Blog updated successfully"
}
```

#### **5. حذف مدونة**

```
DELETE /blogs/{id}
Headers: {
  "Content-Type": "application/json"
}
Response: {
  "message": "Blog deleted successfully"
}
```

---

## 💳 **نظام الدفع (Payment System)**

### **API Endpoints:**

#### **1. إنشاء عملية دفع**

```
POST /payments/create
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Body: {
  "amount": "number",
  "currency": "string",
  "paymentMethod": "string",
  "courseId": "number",
  "userId": "number",
  "description": "string"
}
Response: {
  "id": "string",
  "amount": "number",
  "currency": "string",
  "paymentUrl": "string",
  "paymentId": "string",
  "status": "pending",
  "createdAt": "date"
}
```

#### **2. جلب تفاصيل الدفع**

```
GET /payments/{id}
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Response: {
  "id": "string",
  "amount": "number",
  "currency": "string",
  "paymentMethod": "string",
  "status": "string",
  "courseId": "number",
  "userId": "number",
  "description": "string",
  "paymentUrl": "string",
  "paymentId": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### **3. التحقق من الدفع**

```
POST /payments/verify
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Body: {
  "paymentId": "string",
  "transactionId": "string"
}
Response: {
  "verified": "boolean",
  "status": "string",
  "message": "string"
}
```

#### **4. مدفوعات المستخدم**

```
GET /payments/user
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "page": "number",
  "limit": "number",
  "status": "string"
}
Response: {
  "data": [
    {
      "id": "string",
      "amount": "number",
      "currency": "string",
      "status": "string",
      "courseId": "number",
      "courseTitle": "string",
      "createdAt": "date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### **5. استرداد المدفوعات**

```
POST /payments/refund
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Body: {
  "paymentId": "string",
  "reason": "string"
}
Response: {
  "refundId": "string",
  "status": "string",
  "message": "string"
}
```

---

## 📊 **نظام التقارير (Reports System)**

### **API Endpoints:**

#### **1. إحصائيات الدورات**

```
GET /reports/courses
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "startDate": "date",
  "endDate": "date",
  "category": "string"
}
Response: {
  "totalCourses": "number",
  "activeCourses": "number",
  "completedCourses": "number",
  "totalEnrollments": "number",
  "averageRating": "number",
  "topCourses": [
    {
      "id": "number",
      "title": "string",
      "enrollments": "number",
      "rating": "number"
    }
  ],
  "categoryStats": [
    {
      "category": "string",
      "count": "number",
      "enrollments": "number"
    }
  ]
}
```

#### **2. إحصائيات المستخدمين**

```
GET /reports/users
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "startDate": "date",
  "endDate": "date"
}
Response: {
  "totalUsers": "number",
  "activeUsers": "number",
  "newUsers": "number",
  "usersWithProfiles": "number",
  "topUsers": [
    {
      "id": "number",
      "name": "string",
      "enrollments": "number",
      "completedCourses": "number"
    }
  ],
  "monthlyGrowth": [
    {
      "month": "string",
      "newUsers": "number",
      "activeUsers": "number"
    }
  ]
}
```

#### **3. إحصائيات المدفوعات**

```
GET /reports/payments
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "startDate": "date",
  "endDate": "date",
  "status": "string"
}
Response: {
  "totalRevenue": "number",
  "totalPayments": "number",
  "successfulPayments": "number",
  "failedPayments": "number",
  "averagePayment": "number",
  "monthlyRevenue": [
    {
      "month": "string",
      "revenue": "number",
      "payments": "number"
    }
  ],
  "paymentMethods": [
    {
      "method": "string",
      "count": "number",
      "amount": "number"
    }
  ]
}
```

#### **4. تحليلات عامة**

```
GET /reports/analytics
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "period": "daily|weekly|monthly|yearly"
}
Response: {
  "overview": {
    "totalUsers": "number",
    "totalCourses": "number",
    "totalRevenue": "number",
    "totalEnrollments": "number"
  },
  "trends": {
    "userGrowth": "number",
    "courseGrowth": "number",
    "revenueGrowth": "number",
    "enrollmentGrowth": "number"
  },
  "performance": {
    "averageSessionDuration": "number",
    "bounceRate": "number",
    "conversionRate": "number"
  }
}
```

---

## 🔔 **نظام الإشعارات (Notifications System)**

### **API Endpoints:**

#### **1. جلب الإشعارات**

```
GET /notifications
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Query Parameters: {
  "page": "number",
  "limit": "number",
  "type": "string",
  "read": "boolean"
}
Response: {
  "data": [
    {
      "id": "number",
      "title": "string",
      "message": "string",
      "type": "string",
      "read": "boolean",
      "createdAt": "date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### **2. إرسال إشعار**

```
POST /notifications/send
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Body: {
  "userId": "number",
  "title": "string",
  "message": "string",
  "type": "string",
  "data": "object"
}
Response: {
  "id": "number",
  "message": "Notification sent successfully"
}
```

#### **3. تحديد كمقروء**

```
PUT /notifications/{id}/read
Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json"
}
Response: {
  "message": "Notification marked as read"
}
```

#### **4. حذف إشعار**

```
DELETE /notifications/{id}
Headers: {
  "Content-Type": "application/json"
}
Response: {
  "message": "Notification deleted successfully"
}
```

---

## 🔐 **Authentication & Authorization**

### **Headers Required:**

```
All API calls require:
- "Content-Type": "application/json"
- "Accept": "application/json"
- Credentials: include (from AuthInterceptor)
```

### **Error Responses:**

```
401 Unauthorized: {
  "error": "Unauthorized",
  "message": "Authentication required"
}

403 Forbidden: {
  "error": "Forbidden",
  "message": "Access denied"
}

404 Not Found: {
  "error": "Not Found",
  "message": "Resource not found"
}

500 Internal Server Error: {
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 📋 **Database Schema Suggestions**

### **Blogs Table:**

```sql
CREATE TABLE blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  content TEXT NOT NULL,
  content_en TEXT,
  image_url VARCHAR(500),
  author VARCHAR(100),
  category VARCHAR(100),
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Payments Table:**

```sql
CREATE TABLE payments (
  id VARCHAR(100) PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EGP',
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(100),
  transaction_id VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Notifications Table:**

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

_تم إنشاء هذه المواصفات في: ديسمبر 2024_
