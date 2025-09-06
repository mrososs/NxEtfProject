# Category API Integration

## Overview

تم دمج API الفئات والكورسات في النظام لتمكين المستخدمين من اختيار الفئات وعرض الكورسات المرتبطة بها.

## API Endpoint

```
GET https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course/categories
```

## Response Format

```json
[
  {
    "id": 6,
    "category": null,
    "categoryId": 1,
    "course": null,
    "courseId": 3
  }
]
```

## Files Created/Modified

### New Files

1. **`LMS/src/app/features/homepage/model/category.model.ts`**

   - نموذج البيانات للفئات والكورسات

2. **`LMS/src/app/features/homepage/services/category.service.ts`**

   - خدمة API للتعامل مع الفئات والكورسات

3. **`LMS/src/app/features/homepage/selected-courses/selected-courses.component.ts`**

   - مكون عرض الكورسات المختارة

4. **`LMS/src/app/features/homepage/selected-courses/selected-courses.component.html`**

   - قالب HTML لعرض الكورسات

5. **`LMS/src/app/features/homepage/selected-courses/selected-courses.component.scss`**
   - أنماط CSS للمكون

### Modified Files

1. **`LMS/src/app/features/homepage/course-category/course-category.component.ts`**

   - تحديث المكون لاستخدام API الجديد
   - إضافة منطق تجميع الكورسات حسب الفئة
   - إضافة عرض عدد الكورسات لكل فئة

2. **`LMS/src/app/features/homepage/course-category/course-category.component.html`**

   - تحديث القالب لعرض عدد الكورسات
   - إضافة مؤشر التحميل

3. **`LMS/src/app/features/homepage/course-category/course-category.component.scss`**

   - إضافة أنماط لعرض عدد الكورسات

4. **`LMS/src/app/features/homepage/homepage.component.ts`**

   - إضافة متغير `selectedCourses`
   - إضافة دالة `onSelectedCoursesChange`
   - استيراد مكون `SelectedCoursesComponent`

5. **`LMS/src/app/features/homepage/homepage.component.html`**

   - إضافة مكون `selected-courses`
   - ربط event handlers

6. **`LMS/src/environments/environment.ts`**
   - تحديث API URL

## Features

### 1. Dynamic Category Loading

- تحميل الفئات من API بدلاً من البيانات الثابتة
- عرض عدد الكورسات لكل فئة

### 2. Course Selection

- عند اختيار فئة، يتم عرض جميع الكورسات المرتبطة بها
- تجميع الكورسات حسب الفئة

### 3. Real-time Updates

- تحديث فوري للكورسات عند تغيير اختيار الفئات
- إزالة الكورسات عند إلغاء اختيار الفئة

### 4. User Experience

- مؤشر تحميل أثناء جلب البيانات
- رسائل واضحة عند عدم وجود كورسات
- تصميم responsive

## Category Mapping

```typescript
const categoryLabels: { [key: number]: string } = {
  1: 'دورات الإرشاد السياحي',
  2: 'دورات إدارة الفنادق',
  3: 'دورات السياحة',
  4: 'دورات الضيافة',
  5: 'دورات الطيران والسفر',
  6: 'دورات الدعم والمهارات',
  7: 'دورات تقنية',
};
```

## Usage

1. المستخدم يختار فئة من قائمة الفئات
2. يتم عرض عدد الكورسات لكل فئة
3. عند الاختيار، تظهر الكورسات المرتبطة بالفئة
4. يمكن اختيار عدة فئات في نفس الوقت
5. الكورسات تظهر مجمعة حسب الفئة

## Error Handling

- معالجة أخطاء API
- عرض رسائل خطأ واضحة
- fallback للبيانات في حالة فشل API

## Future Enhancements

- إضافة pagination للكورسات
- إضافة بحث داخل الكورسات المختارة
- إضافة sorting options
- تحسين الأداء مع caching
