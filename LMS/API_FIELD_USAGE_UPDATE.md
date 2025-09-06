# تحديث استخدام حقول API - استخدام حقل category مباشرة

## التغييرات المطبقة

### 1. استخدام حقل `category` من API Response

**الملف المحدث**: `category-names.service.ts`

```typescript
// استخدام حقل category من API إذا كان متاحاً
if (course.category && course.category.trim() !== '') {
  categoryMap.set(course.categoryId, course.category);
} else {
  // إذا كان category null أو فارغ، استخدم categoryId
  categoryMap.set(course.categoryId, `فئة ${course.categoryId}`);
}
```

### 2. تسجيل مفصل لمصدر الأسماء

**الملف المحدث**: `course-category.component.ts`

```typescript
// تسجيل مصدر كل اسم
Object.entries(names).forEach(([id, name]) => {
  if (name.startsWith('فئة ')) {
    console.log(`Category ${id}: Using generic name "${name}" (API returned null)`);
  } else {
    console.log(`Category ${id}: Using API name "${name}"`);
  }
});
```

### 3. عرض أسماء الكورسات من API

**الملف المحدث**: `selected-courses.component.ts`

```typescript
getCourseLabel(course: Category): string {
  // استخدام اسم الكورس من API إذا كان متاحاً
  if (course.course && course.course.trim() !== '') {
    return course.course;
  }
  return `كورس ${course.courseId}`;
}
```

### 4. عرض معلومات واضحة في الواجهة

**الملف المحدث**: `selected-courses.component.html`

```html
<!-- عرض اسم الفئة من API -->
<p *ngIf="course.category && course.category.trim() !== ''"><strong>اسم الفئة:</strong> {{ course.category }}</p>
<p *ngIf="!course.category || course.category.trim() === ''"><strong>اسم الفئة:</strong> فئة {{ course.categoryId }} (غير متوفر في API)</p>

<!-- عرض اسم الكورس من API -->
<p *ngIf="course.course && course.course.trim() !== ''"><strong>اسم الكورس:</strong> {{ course.course }}</p>
<p *ngIf="!course.course || course.course.trim() === ''"><strong>اسم الكورس:</strong> كورس {{ course.courseId }} (غير متوفر في API)</p>
```

## منطق النظام الجديد

### 1. للفئات (Categories):

```
API Response → course.category
   ↓ (إذا كان null أو فارغ)
Fallback → `فئة ${course.categoryId}`
```

### 2. للكورسات (Courses):

```
API Response → course.course
   ↓ (إذا كان null أو فارغ)
Fallback → `كورس ${course.courseId}`
```

## مثال على API Response الحالي:

```json
[
  {
    "id": 6,
    "category": null, // ← سيستخدم "فئة 1"
    "categoryId": 1,
    "course": null, // ← سيستخدم "كورس 3"
    "courseId": 3
  }
]
```

## مثال على API Response المطلوب:

```json
[
  {
    "id": 6,
    "category": "دورات الإرشاد السياحي", // ← سيستخدم هذا الاسم
    "categoryId": 1,
    "course": "مقدمة في الإرشاد السياحي", // ← سيستخدم هذا الاسم
    "courseId": 3
  }
]
```

## المزايا الجديدة:

1. **🎯 استخدام البيانات الفعلية**: النظام يستخدم حقل `category` من API مباشرة
2. **📊 تسجيل مفصل**: يمكن تتبع مصدر كل اسم في console
3. **🔄 fallback ذكي**: إذا كان الحقل فارغ، يستخدم `categoryId`
4. **👁️ وضوح في الواجهة**: المستخدم يرى ما إذا كان الاسم من API أم fallback
5. **🛠️ سهولة الصيانة**: لا توجد أسماء ثابتة في الكود

## رسائل Console المتوقعة:

### عند استخدام API names:

```
Category 1: Using API name "دورات الإرشاد السياحي"
Category 2: Using API name "دورات إدارة الفنادق"
```

### عند استخدام fallback:

```
Category 1: Using generic name "فئة 1" (API returned null)
Category 2: Using generic name "فئة 2" (API returned null)
```

## التوصية للفريق:

**لتشغيل النظام بشكل مثالي، يرجى تحديث API ليرسل:**

```json
{
  "category": "اسم الفئة الفعلي",
  "course": "اسم الكورس الفعلي"
}
```

**بدلاً من:**

```json
{
  "category": null,
  "course": null
}
```

## حالة النظام الحالية:

✅ **يستخدم حقل category من API**
✅ **fallback ذكي عند null**
✅ **تسجيل مفصل في console**
✅ **واجهة واضحة للمستخدم**
✅ **لا توجد أسماء ثابتة**
