# Trainer API and Profile Image Upload Setup Guide

## 1. Trainer API Setup

### API Endpoint Verification

The trainer API is now configured to work with the correct endpoint:

**✅ Working API Endpoint:**

```
https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Trainer?page=1&pageSize=10&sortBy=Id&sortDir=desc
```

**📊 Current API Response:**

```json
{
  "data": [],
  "count": 0,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

_Note: The API is working but currently returns empty data. This is expected if no trainers are in the database._

### Changes Made

#### 1. Updated Instructor API Service (`instructor-api.service.ts`)

**Before:**

```typescript
return this._http.get<any>('Trainer', {
  params: httpParams,
  headers,
});
```

**After:**

```typescript
return this._http.get<any>('api/Trainer', {
  params: httpParams,
  headers,
});
```

#### 2. Updated Trainer Details Endpoint

**Before:**

```typescript
return this._http.get<ApiInstructor>(`Trainer/${id}`);
```

**After:**

```typescript
return this._http.get<ApiInstructor>(`api/Trainer/${id}`);
```

### API Parameters

- `page=1` - Page number
- `pageSize=10` - Number of trainers per page
- `sortBy=Id` - Sort by ID field
- `sortDir=desc` - Descending order
- `search` - Search by name (optional)
- `mainSkill` - Filter by main skill (optional)

### Expected Trainer Data Structure

```json
{
  "data": [
    {
      "id": 1,
      "name": "اسم المدرب",
      "title": "مدرس",
      "mainSkill": "البرمجة",
      "numberOfCourses": 5,
      "numberOfStudents": 120,
      "starRanking": 4.8,
      "about": "وصف المدرب",
      "channels": []
    }
  ],
  "count": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

## 2. Profile Image Upload Setup

### Features Added

#### 1. Image Upload Component

- **File Upload**: PrimeNG FileUpload component
- **Image Preview**: Real-time preview of selected image
- **Validation**: File type and size validation
- **Remove Functionality**: Ability to remove selected image

#### 2. Image Validation

- **File Type**: Only image files (JPG, PNG, GIF)
- **File Size**: Maximum 5MB
- **Real-time Feedback**: Success/error messages

#### 3. FormData Integration

- **FormData**: Uses FormData for multipart/form-data upload
- **API Integration**: Sends image with profile data
- **Backend Ready**: Compatible with backend image upload

### Implementation Details

#### 1. Component Updates (`profile.component.ts`)

**New Properties:**

```typescript
selectedImage: File | null = null;
imagePreview: string | null = null;
currentProfile: any = null;
```

**New Methods:**

```typescript
onImageSelect(event: any): void {
  // Handle image selection with validation
}

removeImage(): void {
  // Remove selected image
}
```

#### 2. Form Submission

```typescript
onSubmit(): void {
  const formData = new FormData();

  // Add form fields
  formData.append('FirstName', this.profileForm.get('firstName')?.value || '');
  formData.append('MiddleName', this.profileForm.get('middleName')?.value || '');
  formData.append('LastName', this.profileForm.get('lastName')?.value || '');
  formData.append('Description', this.profileForm.get('description')?.value || '');

  // Add image if selected
  if (this.selectedImage) {
    formData.append('Image', this.selectedImage);
  }

  // Send to API
  this.profileService.postProfile(formData).subscribe(...);
}
```

#### 3. HTML Template (`profile.component.html`)

**Image Upload Section:**

```html
<!-- Image Upload -->
<div class="form-group mb-4">
  <label class="form-label">الصورة الشخصية</label>
  <div class="image-upload-container">
    <!-- Current Image Preview -->
    <div *ngIf="imagePreview" class="current-image mb-3">
      <img [src]="imagePreview" alt="Profile Image" class="profile-image-preview" />
      <button type="button" class="btn btn-sm btn-outline-danger mt-2" (click)="removeImage()"><i class="pi pi-trash"></i> إزالة الصورة</button>
    </div>

    <!-- File Upload -->
    <p-fileUpload #fileUpload mode="basic" name="image" accept="image/*" maxFileSize="5000000" chooseLabel="اختيار صورة" [auto]="true" (onSelect)="onImageSelect($event)" [showCancelButton]="false" [showUploadButton]="false" [customUpload]="true" class="mb-2"> </p-fileUpload>

    <small class="text-muted"> الحد الأقصى لحجم الملف: 5 ميجابايت. الأنواع المدعومة: JPG, PNG, GIF </small>
  </div>
</div>
```

#### 4. CSS Styles (`profile.component.scss`)

**Image Preview Styles:**

```scss
.profile-image-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f7941e;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

## 3. Testing

### Trainer API Testing

#### 1. Browser Console Test

```javascript
// Test the trainer API directly
fetch('https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Trainer?page=1&pageSize=5', {
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token'),
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log('✅ Trainer API Response:', data);
    console.log('📊 Total Trainers:', data.count);
    console.log('📄 Trainers:', data.data);
  })
  .catch((error) => console.error('❌ Trainer API Error:', error));
```

#### 2. Angular Service Test

```typescript
// In any component, test the service
this.instructorApiService
  .getAllInstructors({
    page: 1,
    pageSize: 5,
    sortBy: 'Name',
    sortDir: 'asc',
  })
  .subscribe({
    next: (response) => {
      console.log('✅ Trainers loaded:', response);
      console.log('📊 Number of trainers:', response.count);
    },
    error: (error) => {
      console.error('❌ Error loading trainers:', error);
    },
  });
```

### Profile Image Upload Testing

#### 1. Test Image Selection

1. Navigate to profile page
2. Click "اختيار صورة" button
3. Select an image file
4. Verify preview appears
5. Verify success message

#### 2. Test Image Validation

1. Try to select a non-image file (should show error)
2. Try to select an image larger than 5MB (should show error)
3. Verify error messages appear

#### 3. Test Image Upload

1. Fill in profile form
2. Select an image
3. Submit form
4. Check network tab for FormData request
5. Verify image is included in request

#### 4. Test Image Removal

1. Select an image
2. Click "إزالة الصورة" button
3. Verify image preview disappears
4. Verify success message

## 4. Network Request Details

### Trainer API Request

- **Method**: GET
- **URL**: `api/Trainer?page=1&pageSize=10&sortBy=Id&sortDir=desc`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <token>`

### Profile Image Upload Request

- **Method**: POST
- **URL**: `api/profile/me`
- **Headers**:
  - `Accept: application/json`
  - `Content-Type: multipart/form-data` (set by browser)
- **Body**: FormData with:
  - `FirstName`: string
  - `MiddleName`: string
  - `LastName`: string
  - `Description`: string
  - `Image`: File (if selected)

## 5. Expected Behavior

### ✅ **Trainer API:**

1. **Trainer Listing**: All trainers should load from API
2. **Pagination**: Page navigation should work
3. **Filtering**: Search and filters should work
4. **Trainer Details**: Individual trainer pages should load

### ✅ **Profile Image Upload:**

1. **Image Selection**: Users can select profile images
2. **Image Preview**: Real-time preview of selected image
3. **Image Validation**: Proper validation with user feedback
4. **Image Upload**: Images are sent with profile data
5. **Image Removal**: Users can remove selected images

## 6. Troubleshooting

### Trainer API Issues:

1. **Empty Response**: Normal if no trainers in database
2. **CORS Errors**: Check Azure CORS configuration
3. **Authentication Errors**: Verify JWT token is valid

### Profile Image Issues:

1. **File Not Uploading**: Check file size and type
2. **Preview Not Showing**: Check browser console for errors
3. **FormData Issues**: Verify FormData is properly constructed

## 7. Notes

- ✅ Trainer API is working and properly configured
- ✅ Profile image upload is fully implemented
- ⚠️ Trainer API currently returns empty data (expected)
- 🔧 Backend needs trainers data to see results
- 📱 Frontend is ready for both trainer listing and image upload

## 8. Next Steps

1. **Test trainer listing page** - should load trainers from API
2. **Test profile image upload** - should work with image selection
3. **Add trainers to database** - to see trainer listing results
4. **Monitor for any errors** - check console and network tab
5. **Backend team** - ensure image upload endpoint handles FormData
