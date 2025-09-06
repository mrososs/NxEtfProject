# تكامل API مزدوج - أسماء الفئات وعدد الكورسات

## البنية الجديدة

### API الأول: أسماء الفئات

**Endpoint**: `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Categories`

**Response**:

```json
[
  {
    "id": 1,
    "name": "Test",
    "nameAr": null
  },
  {
    "id": 2,
    "name": "Test2",
    "nameAr": null
  }
]
```

### API الثاني: الكورسات وعددها

**Endpoint**: `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course/categories`

**Response**:

```json
[
  {
    "id": 6,
    "category": null,
    "categoryId": 1,
    "course": null,
    "courseId": 3
  },
  {
    "id": 11,
    "category": null,
    "categoryId": 1,
    "course": null,
    "courseId": 3
  }
]
```

## التكامل الجديد

### 1. خدمة أسماء الفئات

**الملف**: `category-names.service.ts`

```typescript
getCategoryNames(): Observable<{ [key: number]: string }> {
  return this._http.get<CategoryName[]>('/api/Categories').pipe(
    map((categories) => {
      const categoryNames: { [key: number]: string } = {};
      categories.forEach((cat) => {
        // استخدام الاسم العربي إذا كان متاحاً، وإلا الاسم الإنجليزي
        categoryNames[cat.id] = cat.nameAr || cat.name;
      });
      return categoryNames;
    })
  );
}
```

### 2. خدمة عدد الكورسات

**الملف**: `category.service.ts`

```typescript
getCoursesCountByCategory(): Observable<{ [key: number]: number }> {
  return this.getCategories().pipe(
    map((courses) => {
      const categoryCounts: { [key: number]: number } = {};

      courses.forEach((course) => {
        if (course.categoryId) {
          categoryCounts[course.categoryId] = (categoryCounts[course.categoryId] || 0) + 1;
        }
      });

      return categoryCounts;
    })
  );
}
```

### 3. مكون الفئات المحدث

**الملف**: `course-category.component.ts`

```typescript
ngOnInit(): void {
  this.loadCategoryNames();    // من /api/Categories
  this.loadCategories();       // من /api/Course/categories
  this.loadCoursesCount();     // عدد الكورسات من /api/Course/categories
}

private processCategories(): void {
  const uniqueCategoryIds = [...new Set(this.allCategories.map(cat => cat.categoryId))];

  this.categories = uniqueCategoryIds.map(categoryId => ({
    id: categoryId,
    label: this.getCategoryLabel(categoryId),           // من /api/Categories
    checked: false,
    courseCount: this.categoryCounts[categoryId] || 0,  // من /api/Course/categories
  }));
}
```

## تدفق البيانات

```
1. /api/Categories → أسماء الفئات (nameAr أو name)
   ↓
2. /api/Course/categories → عدد الكورسات لكل فئة
   ↓
3. دمج البيانات → عرض الفئات مع الأسماء والعدد
```

## مثال على النتيجة

**مع البيانات الحالية**:

- **الفئة 1**: "Test" (4 كورسات)
- **الفئة 2**: "Test2" (0 كورسات)

**Console Logs المتوقعة**:

```
Category names loaded from /api/Categories: {1: "Test", 2: "Test2"}
Courses count loaded from /api/Course/categories: {1: 4}
Category 1: Using name from /api/Categories: "Test"
Category 2: Using name from /api/Categories: "Test2"
Processed categories: [
  {id: 1, label: "Test", courseCount: 4},
  {id: 2, label: "Test2", courseCount: 0}
]
```

## المزايا الجديدة

1. **🎯 دقة البيانات**: الأسماء من API مخصص للفئات
2. **📊 عدد دقيق**: عدد الكورسات محسوب من API الكورسات
3. **🔄 تكامل مثالي**: استخدام كلا API بشكل صحيح
4. **📝 تسجيل مفصل**: تتبع مصدر كل بيانات
5. **🛠️ مرونة**: يعمل حتى لو كان nameAr null

## التوصيات

### للفريق Backend:

1. **إضافة الأسماء العربية**:

   ```json
   {
     "id": 1,
     "name": "Tourism Guiding",
     "nameAr": "دورات الإرشاد السياحي"
   }
   ```

2. **إضافة أسماء الكورسات**:
   ```json
   {
     "id": 6,
     "category": "دورات الإرشاد السياحي",
     "categoryId": 1,
     "course": "مقدمة في الإرشاد السياحي",
     "courseId": 3
   }
   ```

## حالة النظام الحالية

✅ **يستخدم /api/Categories للأسماء**
✅ **يستخدم /api/Course/categories للعدد**
✅ **يدمج البيانات من كلا API**
✅ **تسجيل مفصل في console**
✅ **fallback ذكي عند null values**
