# Profile Component - إعادة هيكلة صفحة الملف الشخصي

## التحديثات المنجزة

### 1. إضافة التبويبات الجديدة

- **الملف الشخصي**: يحتوي على جميع معلومات المستخدم
- **الدورات المسجلة**: عرض وإدارة الدورات المسجلة

### 2. إضافة الأقسام الجديدة للـ Profile

#### أ) قسم التعليم (Education)

- المعهد/الجامعة
- الدرجة العلمية
- التقدير
- التخصص

#### ب) قسم الخبرة العملية (Experience)

- اسم الشركة
- تاريخ البداية
- تاريخ النهاية
- العمل الحالي (checkbox)
- وصف المهام والمسؤوليات

#### ج) قسم المهارات (Skills)

- اسم المهارة
- وصف المهارة

#### د) قسم معلومات التواصل (Contacts)

- نوع التواصل (dropdown)
- معلومات التواصل

### 3. منطق View/Edit

- **وضع العرض**: عرض البيانات بشكل read-only مع إمكانية التعديل
- **وضع التعديل**: نموذج تفاعلي لإضافة/تعديل/حذف البيانات
- زر تبديل بين الوضعين

### 4. تحديث النماذج (Models)

- تحديث `Profile` interface لتشمل البيانات الجديدة
- إضافة `Education`, `Experience`, `Skill`, `Contact` interfaces
- تحديث `Enrollment` interface

### 5. تحديث الخدمات (Services)

- تحديث `ProfileService` للتعامل مع البيانات الجديدة
- إضافة دوال جديدة لإدارة البيانات

### 6. تحسينات UI/UX

- تصميم responsive للتبويبات
- تحسين الألوان والخطوط
- إضافة أيقونات مناسبة لكل قسم
- تحسين تجربة المستخدم

## كيفية الاستخدام

### إضافة بيانات جديدة

1. اضغط على زر "تعديل الملف الشخصي"
2. في كل قسم، اضغط على زر "+" لإضافة عنصر جديد
3. املأ البيانات المطلوبة
4. اضغط "تحديث الملف الشخصي" للحفظ

### حذف بيانات

1. في وضع التعديل، اضغط على زر "🗑️" بجانب العنصر المراد حذفه

### إدارة الدورات المسجلة

1. انتقل إلى تبويب "الدورات المسجلة"
2. يمكنك بدء الدورة أو حذف التسجيل

## API Integration

### GET Profile API

```
GET https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Profile/me
```

- **Response**: Profile object أو null إذا لم يكن هناك ملف شخصي
- **Error Handling**: إذا حدث خطأ 500، يتم عرض رسالة تنبيه للمستخدم

### POST Profile API

```
POST https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Profile/me
Content-Type: multipart/form-data

Fields:
- FirstName: string (required)
- MiddleName: string (optional)
- LastName: string (required)
- Description: string (optional)
- Image: File (optional)
- Educations: JSON string (optional - only if there are educations)
- Experiences: JSON string (optional - only if there are experiences)
- Skills: JSON string (optional - only if there are skills)
- Contacts: JSON string (optional - only if there are contacts)
```

### JSON Structure Examples

#### Education

```json
{
  "institute": "Cairo University",
  "degree": "Bachelor",
  "grade": "Excellent",
  "specialization": "Computer Science"
}
```

#### Experience

```json
{
  "employer": "Tech Company",
  "startDate": "2022-01-01T00:00:00.000Z",
  "endDate": "2023-12-31T00:00:00.000Z",
  "isCurrent": false,
  "description": "Software Developer"
}
```

#### Skill

```json
{
  "name": "JavaScript",
  "description": "Advanced JavaScript programming"
}
```

#### Contact

```json
{
  "contactType": "email",
  "contactDetail": "user@example.com"
}
```

## الملفات المحدثة

1. `profile.component.html` - واجهة المستخدم الجديدة
2. `profile.component.ts` - منطق المكون
3. `profile.component.scss` - التصميمات الجديدة
4. `model/profile.model.ts` - النماذج المحدثة
5. `services/profile.service.ts` - الخدمات المحدثة

## التحديثات الجديدة (Real API Integration)

### ✅ إزالة Mock Data

- تم إزالة جميع البيانات الوهمية
- الآن يتم استخدام الـ API الحقيقي

### ✅ GET Profile API

- عند دخول الصفحة، يتم استدعاء `GET /api/Profile/me`
- إذا كان هناك ملف شخصي موجود، يتم عرضه في وضع العرض
- إذا لم يكن هناك ملف شخصي، يتم عرض النموذج في وضع التعديل

### ✅ POST Profile API

- يتم إرسال البيانات إلى `POST /api/Profile/me`
- البيانات ترسل كـ FormData مع multipart/form-data
- يتم إرسال الحقول الاختيارية فقط إذا كانت تحتوي على بيانات

### ✅ Error Handling

- معالجة أخطاء 500 مع رسائل تنبيه مناسبة
- معالجة أخطاء الشبكة
- معالجة أخطاء المصادقة

### ✅ Data Validation

- التحقق من صحة البيانات قبل الإرسال
- إرسال الحقول المطلوبة فقط
- معالجة البيانات الفارغة بشكل صحيح

### ✅ Professional Code Structure

- فصل منطق التحضير في دوال منفصلة
- دوال مساعدة للتحقق من صحة البيانات
- معالجة الأخطاء بشكل احترافي
- إرسال arrays فارغة للحقول غير المملوءة

## كيفية عمل النظام الجديد

### 📤 إرسال البيانات (POST Request)

عندما يقوم المستخدم بحفظ البيانات، يتم إرسال التالي:

```json
{
  "FirstName": "احمد",
  "MiddleName": "ياسر",
  "LastName": "محمد",
  "Description": "وصف المستخدم",
  "Image": "ملف الصورة (اختياري)",
  "Educations": [
    {
      "institute": "جامعة القاهرة",
      "degree": "بكالوريوس",
      "grade": "ممتاز",
      "specialization": "علوم الحاسب"
    }
  ],
  "Experiences": [
    {
      "employer": "شركة التقنية",
      "startDate": "2022-01-01T00:00:00.000Z",
      "endDate": "2023-12-31T00:00:00.000Z",
      "isCurrent": false,
      "description": "مطور برمجيات"
    }
  ],
  "Skills": [
    {
      "name": "JavaScript",
      "description": "تطوير الواجهات الأمامية"
    }
  ],
  "Contacts": [
    {
      "contactType": "email",
      "contactDetail": "ahmed@example.com"
    }
  ]
}
```

### 🔍 معالجة البيانات الفارغة

- **إذا لم يتم ملء أي قسم**: يتم إرسال array فارغ `[]`
- **إذا تم ملء جزء من القسم**: يتم إرسال البيانات المملوءة فقط
- **التحقق من صحة البيانات**: يتم فلترة البيانات الفارغة قبل الإرسال

### 🏗️ هيكل الكود المحسن

```typescript
// دالة رئيسية مبسطة
onSubmit(): void {
  if (!this.isFormValid()) {
    this.showValidationError();
    return;
  }

  const formData = this.buildFormData();
  this.submitProfileData(formData);
}

// دوال مساعدة منفصلة
private buildFormData(): FormData { ... }
private addBasicProfileData(formData: FormData): void { ... }
private addSectionsData(formData: FormData): void { ... }
private prepareEducationsData(): any[] { ... }
private isEducationValid(education: any): boolean { ... }
```

## ملاحظات مهمة

- جميع الحقول الجديدة اختيارية باستثناء الاسم الأول والأخير
- يتم التحقق من صحة البيانات قبل الإرسال
- يتم حفظ البيانات في localStorage للعرض في الصفحة الرئيسية
- الصفحة تبدأ في وضع العرض إذا كان هناك ملف شخصي موجود
- الصفحة تبدأ في وضع التعديل إذا لم يكن هناك ملف شخصي
- **جديد**: الآن يتم استخدام الـ API الحقيقي بدلاً من البيانات الوهمية
- **جديد**: معالجة شاملة للأخطاء والاستثناءات
- **جديد**: إرسال arrays فارغة للحقول غير المملوءة
- **جديد**: كود منظم ومقسم إلى دوال صغيرة ومتخصصة
