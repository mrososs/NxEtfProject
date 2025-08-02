# نظام إدارة الملف الشخصي للمستخدم

## نظرة عامة

تم إنشاء نظام متكامل لإدارة الملف الشخصي للمستخدم مع الحماية والتحقق من وجود الملف الشخصي قبل الوصول للميزات المحمية.

## المكونات الرئيسية

### 1. ProfileService

- **الموقع**: `src/app/features/profile/profile.service.ts`
- **الوظائف**:
  - `getUserProfile()`: جلب ملف المستخدم من API
  - `createProfile()`: إنشاء ملف شخصي جديد
  - `updateProfile()`: تحديث الملف الشخصي الموجود
  - `hasProfile()`: التحقق من وجود ملف شخصي
  - `isAuthenticated()`: التحقق من تسجيل الدخول

### 2. ProfileComponent

- **الموقع**: `src/app/features/profile/profile.component.ts`
- **الوظائف**:
  - عرض نموذج إنشاء/تحديث الملف الشخصي
  - رفع الصورة الشخصية
  - التحقق من صحة البيانات
  - إرسال البيانات للـ API

### 3. ProfileGuard

- **الموقع**: `src/app/core/guards/profile.guard.ts`
- **الوظائف**:
  - حماية الصفحات التي تتطلب ملف شخصي
  - إعادة التوجيه لصفحة الملف الشخصي إذا لم يكن موجوداً

### 4. ProfileRequiredDialogComponent

- **الموقع**: `src/app/shared/components/profile-required-dialog/`
- **الوظائف**:
  - عرض popup عند محاولة الوصول لصفحة محمية
  - إعادة التوجيه لصفحة إنشاء الملف الشخصي

## كيفية العمل

### 1. عند بدء التطبيق

```typescript
// في app.component.ts
ngOnInit(): void {
  if (this.profileService.isAuthenticated()) {
    this.checkUserProfile();
  }
}
```

### 2. التحقق من الملف الشخصي

```typescript
// في أي مكون
this.profileService.getUserProfile().subscribe({
  next: (profile) => {
    if (profile) {
      // المستخدم لديه ملف شخصي
    } else {
      // المستخدم ليس لديه ملف شخصي
    }
  },
  error: (error) => {
    // خطأ في API أو لا يوجد ملف شخصي
  },
});
```

### 3. إنشاء ملف شخصي

```typescript
const formData = new FormData();
formData.append('FirstName', 'أحمد');
formData.append('LastName', 'محمد');
formData.append('Description', 'وصف المستخدم');

this.profileService.createProfile(formData).subscribe({
  next: (response) => {
    // تم إنشاء الملف الشخصي بنجاح
  },
});
```

### 4. حماية الصفحات

```typescript
// في routing
{
  path: 'courses',
  component: CoursesComponent,
  canActivate: [ProfileGuard]
}
```

## API Endpoints

### 1. جلب الملف الشخصي

```
GET /Profile
Headers: Authorization: Bearer {token}
```

### 2. إنشاء ملف شخصي

```
POST /Profile
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- FirstName: string
- MiddleName: string (optional)
- LastName: string
- Description: string (optional)
- Image: file (optional)
```

### 3. تحديث الملف الشخصي

```
PUT /Profile
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: (same as create)
```

## الاستجابة من API

### عند وجود ملف شخصي

```json
{
  "id": 1,
  "firstName": "أحمد",
  "middleName": "محمد",
  "lastName": "علي",
  "description": "وصف المستخدم",
  "imageUrl": "https://example.com/image.jpg",
  "userId": 123,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### عند عدم وجود ملف شخصي

```json
{
  "message": "No Profile Created For This User Please Contact Your Administrator"
}
```

## التكوين

### 1. تحديث API URL

في ملف `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-actual-api-domain.com/api',
  profileEndpoint: '/Profile',
};
```

### 2. تحديث Authentication

تأكد من أن الـ token يتم حفظه في:

- `localStorage.getItem('authToken')`
- `localStorage.getItem('token')`
- `localStorage.getItem('accessToken')`
- أو في cookies

## الميزات

### 1. التحقق التلقائي

- يتم التحقق من وجود الملف الشخصي عند بدء التطبيق
- يتم التحقق عند محاولة الوصول لصفحات محمية

### 2. الحماية

- Guard يحمي الصفحات التي تتطلب ملف شخصي
- Popup يظهر عند محاولة الوصول لصفحة محمية

### 3. إعادة التوجيه

- إعادة التوجيه التلقائي لصفحة الملف الشخصي إذا لم يكن موجوداً
- إعادة التوجيه للصفحة الرئيسية بعد إنشاء الملف الشخصي

### 4. التحديث التلقائي

- إعادة تحميل الصفحة بعد إنشاء/تحديث الملف الشخصي
- عرض رسائل نجاح/خطأ

## الاستخدام

### 1. في المكونات

```typescript
constructor(
  private profileService: ProfileService,
  private profileRequiredService: ProfileRequiredService
) {}

// التحقق قبل تنفيذ إجراء محمي
checkProfileBeforeAction(() => {
  // الإجراء المحمي
});
```

### 2. في Routing

```typescript
const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  {
    path: 'protected-route',
    component: ProtectedComponent,
    canActivate: [ProfileGuard],
  },
];
```

## الأمان

### 1. التحقق من Authentication

- يتم التحقق من وجود token قبل أي عملية
- إعادة التوجيه للصفحة الرئيسية إذا لم يكن المستخدم مسجل دخول

### 2. حماية البيانات

- استخدام FormData للبيانات الحساسة
- إرسال token مع كل طلب
- معالجة الأخطاء بشكل آمن

## استكشاف الأخطاء

### 1. مشاكل Authentication

```typescript
// التحقق من وجود token
console.log('Token:', this.profileService.getAuthToken());
```

### 2. مشاكل API

```typescript
// التحقق من استجابة API
this.profileService.getUserProfile().subscribe({
  next: (response) => console.log('Success:', response),
  error: (error) => console.error('Error:', error),
});
```

### 3. مشاكل Routing

```typescript
// التحقق من Guard
console.log('Can activate:', this.profileGuard.canActivate());
```

## التطوير المستقبلي

### 1. إضافة ميزات

- تحرير الملف الشخصي
- حذف الملف الشخصي
- تغيير كلمة المرور
- إعدادات الخصوصية

### 2. تحسينات

- Caching للبيانات
- Offline support
- Real-time updates
- Advanced validation

### 3. الأمان

- Two-factor authentication
- Session management
- Rate limiting
- Audit logging
