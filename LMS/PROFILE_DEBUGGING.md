# Profile System Debugging Guide

## المشاكل المحلولة:

### 1. ✅ مشكلة BrowserAnimationsModule

- تم إضافة `provideAnimations()` إلى `app.config.ts`
- هذا يحل مشكلة PrimeNG Toast animations

### 2. ✅ مشكلة Authentication Token

- تم إضافة debugging شامل للـ ProfileService
- تم تحسين token retrieval من localStorage و cookies

### 3. ✅ مشكلة Redirect عند عدم وجود Token

- تم إضافة redirect تلقائي إلى [http://etf.itechpro-eg.com/](http://etf.itechpro-eg.com/) عند عدم وجود token
- يتم الـ redirect في جميع الـ methods: `getUserProfile`, `createProfile`, `updateProfile`, `isAuthenticated`

### 4. ✅ مشكلة API-Based Authentication

- تم تغيير النظام ليعتمد على الـ API بدلاً من الـ localStorage/cookies
- الـ Backend يقرأ الـ userId من الـ cookie داخلياً
- عند خطأ 500/401/403 → عرض صفحة خطأ مصادقة
- عند خطأ "No Profile Created" → توجيه إلى صفحة الـ profile
- عند النجاح → الاستمرار بشكل طبيعي

## كيفية الاختبار:

### الخطوة 1: إضافة Test Tokens

افتح browser console واكتب:

```javascript
// إضافة test tokens
localStorage.setItem('authToken', 'test-auth-token-123');
localStorage.setItem('token', 'test-token-456');
localStorage.setItem('accessToken', 'test-access-token-789');
localStorage.setItem('userId', 'test-user-123');

// إضافة cookies
document.cookie = 'authToken=test-auth-token-123; path=/';
document.cookie = 'token=test-token-456; path=/';
document.cookie = 'accessToken=test-access-token-789; path=/';
document.cookie = 'userId=test-user-123; path=/';

console.log('✅ Test tokens added');
```

### الخطوة 2: تحديث API URL

في `LMS/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-actual-api-domain.com/api', // ضع الـ API URL الحقيقي هنا
  profileEndpoint: '/Profile',
  coursesEndpoint: '/Course',
  instructorsEndpoint: '/Trainer',
};
```

### الخطوة 3: مراقبة Console

افتح browser console وسترى:

```
🚀 AppComponent initialized
🔐 User authentication status: true/false
🔍 Searching for authentication token...
📦 localStorage tokens: {...}
✅ Found authToken in localStorage
🔍 Getting user profile...
🔑 Using token for profile request
🌐 Making API request to: https://...
```

## Debugging Messages:

### ✅ رسائل النجاح:

- `🔐 User authentication status: true`
- `✅ Found authToken in localStorage`
- `✅ Profile API response: {...}`

### ❌ رسائل الخطأ:

- `❌ No authentication token found`
- `❌ Error fetching profile: {...}`
- `❌ Error creating profile: {...}`

### ℹ️ رسائل المعلومات:

- `ℹ️ No profile found for user`
- `📝 User has no profile, will redirect when needed`

## المشاكل المحتملة:

### 1. API URL غير صحيح

**الحل:** تحديث `environment.ts` بالـ API URL الصحيح

### 2. Token غير موجود

**الحل:** التأكد من أن الـ login system يحفظ الـ token بشكل صحيح

### 3. CORS Issues

**الحل:** التأكد من أن الـ API يدعم CORS للـ domain الحالي

### 4. Network Issues

**الحل:** التأكد من أن الـ API متاح ويمكن الوصول إليه

## Testing Steps:

1. **إضافة Test Tokens** (كما هو موضح أعلاه)
2. **تحديث API URL** في environment.ts
3. **Refresh الصفحة**
4. **مراقبة Console** للـ debugging messages
5. **اختبار Profile Creation** من خلال الواجهة

## Expected Flow:

### ✅ مع وجود Token:

1. App starts → Authentication check
2. If authenticated → Profile check
3. If no profile → Show profile creation page
4. User fills form → Submit → API call
5. Success → Page refresh → Show profile data

### ❌ بدون Token:

1. App starts → API call to getProfile
2. Backend reads userId from cookie internally
3. If 500/401/403 error → **Show auth error page**
4. If "No Profile Created" error → **Redirect to /profile**
5. If other error → **Redirect to [http://etf.itechpro-eg.com/](http://etf.itechpro-eg.com/)**

## Testing Redirect:

### لاختبار الـ Redirect:

1. افتح browser console
2. اكتب: `localStorage.clear()`
3. اكتب: `document.cookie = ''`
4. Refresh الصفحة
5. ستتم إعادة التوجيه إلى [http://etf.itechpro-eg.com/](http://etf.itechpro-eg.com/)

### لاختبار الـ Normal Flow:

1. افتح browser console
2. اكتب الكود من `test-auth.js`
3. Refresh الصفحة
4. ستستمر في التطبيق بشكل طبيعي
