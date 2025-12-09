# Checklist Media API Documentation

## Overview
The Checklist Media system allows:
1. **Admins/Managers** to add equipment reference images when creating checklist items
2. **Workers** to upload proof-of-completion media after completing tasks
3. Multi-language support for equipment descriptions via images

---

## Models

### ChecklistItem Model
```javascript
{
  checklist_id: ObjectId (ref: Checklist),
  description: String,
  equipment_image_url: String (optional) - Reference image for equipment,
  is_mandatory: Boolean,
  order: Number,
  created_by: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### ChecklistItemMedia Model
```javascript
{
  checklist_item_id: ObjectId (ref: ChecklistItem),
  media_type: String (enum: ['image', 'video', 'audio']),
  url: String,
  media_purpose: String (enum: ['equipment_reference', 'completion_proof']),
  language_code: String (default: 'en'),
  uploaded_by: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Checklist Items

#### 1. Create Checklist Item (with optional equipment image)
**Endpoint:** `POST /api/v1/checklist-items/with-image`  
**Authorization:** Admin, SafetyOfficer, Manager  
**Content-Type:** multipart/form-data

**Request:**
```
equipment_image: File (image)
checklist_id: String
description: String
is_mandatory: Boolean
order: Number
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist item created with equipment image",
  "data": {
    "_id": "...",
    "checklist_id": "...",
    "description": "Check fire extinguisher pressure gauge",
    "equipment_image_url": "https://res.cloudinary.com/.../fire_extinguisher.jpg",
    "is_mandatory": true,
    "order": 1,
    "created_by": "..."
  }
}
```

#### 2. Create Checklist Item (without image)
**Endpoint:** `POST /api/v1/checklist-items`  
**Authorization:** Admin, SafetyOfficer, Manager  
**Content-Type:** application/json

**Request:**
```json
{
  "checklist_id": "...",
  "description": "Verify emergency exits are clear",
  "is_mandatory": true,
  "order": 2,
  "equipment_image_url": "https://..." // optional
}
```

#### 3. Get Checklist Items (with media)
**Endpoint:** `GET /api/v1/checklist-items?checklist_id=...`  
**Authorization:** All authenticated users

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist items fetched",
  "data": [
    {
      "_id": "...",
      "checklist_id": "...",
      "description": "Check fire extinguisher",
      "equipment_image_url": "https://...",
      "is_mandatory": true,
      "order": 1,
      "media": [
        {
          "_id": "...",
          "media_type": "image",
          "url": "https://...",
          "media_purpose": "completion_proof",
          "uploaded_by": {
            "username": "worker123",
            "fullname": "John Doe",
            "role": "Worker"
          }
        }
      ]
    }
  ]
}
```

#### 4. Update Checklist Item (with new equipment image)
**Endpoint:** `PUT /api/v1/checklist-items/:id/with-image`  
**Authorization:** Admin, SafetyOfficer, Manager  
**Content-Type:** multipart/form-data

**Request:**
```
equipment_image: File (image)
description: String (optional)
is_mandatory: Boolean (optional)
order: Number (optional)
```

#### 5. Update Checklist Item (without image)
**Endpoint:** `PUT /api/v1/checklist-items/:id`  
**Authorization:** Admin, SafetyOfficer, Manager  
**Content-Type:** application/json

**Request:**
```json
{
  "description": "Updated description",
  "is_mandatory": false,
  "order": 3,
  "equipment_image_url": "https://..." // optional
}
```

#### 6. Get Single Checklist Item
**Endpoint:** `GET /api/v1/checklist-items/:id`  
**Authorization:** All authenticated users

#### 7. Delete Checklist Item
**Endpoint:** `DELETE /api/v1/checklist-items/:id`  
**Authorization:** Admin, SafetyOfficer

---

### Checklist Item Media

#### 1. Upload Media (Worker Completion Proof or Equipment Reference)
**Endpoint:** `POST /api/v1/checklist-item-media/upload`  
**Authorization:** All authenticated users  
**Content-Type:** multipart/form-data

**Request:**
```
media: File (image/video/audio)
checklist_item_id: String
media_purpose: String ('equipment_reference' or 'completion_proof')
language_code: String (optional, default: 'en')
uploaded_by: String (optional, auto-filled from req.user)
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist item media uploaded successfully",
  "data": {
    "_id": "...",
    "checklist_item_id": "...",
    "media_type": "image",
    "url": "https://res.cloudinary.com/.../completion_proof.jpg",
    "media_purpose": "completion_proof",
    "language_code": "en",
    "uploaded_by": "..."
  }
}
```

#### 2. Get All Media (with filters)
**Endpoint:** `GET /api/v1/checklist-item-media?checklist_item_id=...&media_purpose=...`  
**Authorization:** All authenticated users

**Query Parameters:**
- `checklist_item_id` (optional): Filter by specific checklist item
- `media_purpose` (optional): Filter by purpose ('equipment_reference' or 'completion_proof')

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item media fetched",
  "data": [
    {
      "_id": "...",
      "checklist_item_id": {
        "_id": "...",
        "description": "Check fire extinguisher"
      },
      "media_type": "image",
      "url": "https://...",
      "media_purpose": "completion_proof",
      "uploaded_by": {
        "username": "worker123",
        "fullname": "John Doe",
        "role": "Worker"
      },
      "createdAt": "2025-12-09T..."
    }
  ]
}
```

#### 3. Get Single Media
**Endpoint:** `GET /api/v1/checklist-item-media/:id`  
**Authorization:** All authenticated users

#### 4. Update Media Metadata
**Endpoint:** `PUT /api/v1/checklist-item-media/:id`  
**Authorization:** Admin, SafetyOfficer, Manager  
**Content-Type:** application/json

**Request:**
```json
{
  "media_purpose": "equipment_reference",
  "language_code": "es"
}
```

#### 5. Delete Media
**Endpoint:** `DELETE /api/v1/checklist-item-media/:id`  
**Authorization:** Admin, SafetyOfficer

---

## Usage Workflows

### Workflow 1: Admin Creates Checklist with Equipment Images

1. **Admin creates checklist items with equipment images:**
```bash
POST /api/v1/checklist-items/with-image
Form Data:
  - equipment_image: [fire_extinguisher.jpg]
  - checklist_id: "abc123"
  - description: "Check fire extinguisher pressure gauge (green zone)"
  - is_mandatory: true
  - order: 1
```

2. **Workers view checklist items with images:**
```bash
GET /api/v1/checklist-items?checklist_id=abc123
```
Workers can see the equipment image even if they can't read the description.

### Workflow 2: Worker Completes Task and Uploads Proof

1. **Worker completes a checklist item and uploads photo:**
```bash
POST /api/v1/checklist-item-media/upload
Form Data:
  - media: [completed_task.jpg]
  - checklist_item_id: "item123"
  - media_purpose: "completion_proof"
```

2. **Manager reviews completion proofs:**
```bash
GET /api/v1/checklist-item-media?checklist_item_id=item123&media_purpose=completion_proof
```

### Workflow 3: Multi-Language Equipment References

1. **Admin uploads equipment image with Spanish description:**
```bash
POST /api/v1/checklist-item-media/upload
Form Data:
  - media: [extintor_es.jpg]
  - checklist_item_id: "item123"
  - media_purpose: "equipment_reference"
  - language_code: "es"
```

2. **Get equipment images by language:**
```bash
GET /api/v1/checklist-item-media?checklist_item_id=item123&media_purpose=equipment_reference
```

---

## Key Features

### ✅ Fixed Issues:
1. **Route Registration:** Added missing route in app.js (`/api/v1/checklist-item-media`)
2. **AsyncHandler:** Wrapped upload controller in asyncHandler for Express 5 compatibility
3. **Validation:** Added checklist item existence validation before upload
4. **Error Handling:** Comprehensive error logging and file cleanup on failure
5. **Authorization:** Role-based access control for all endpoints
6. **Media Purpose:** Distinguish between equipment reference and completion proof
7. **Multipart Parsing:** Skip urlencoded parsing for multipart requests (app.js fix)

### 📸 Equipment Images:
- Stored directly in ChecklistItem model as `equipment_image_url`
- Uploaded via `/checklist-items/with-image` endpoint
- Helps workers who can't read identify equipment visually

### 📱 Completion Proof:
- Workers upload photos/videos after completing tasks
- Stored in ChecklistItemMedia with `media_purpose: 'completion_proof'`
- Linked to specific checklist item for verification

### 🌍 Multi-Language Support:
- Equipment reference images can have language-specific versions
- Use `language_code` field to filter images by language
- Supports workers who speak different languages

---

## Testing

### Test Equipment Image Upload:
```bash
curl -X POST http://localhost:8000/api/v1/checklist-items/with-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "equipment_image=@fire_extinguisher.jpg" \
  -F "checklist_id=abc123" \
  -F "description=Check fire extinguisher pressure" \
  -F "is_mandatory=true" \
  -F "order=1"
```

### Test Completion Proof Upload:
```bash
curl -X POST http://localhost:8000/api/v1/checklist-item-media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@completed_task.jpg" \
  -F "checklist_item_id=item123" \
  -F "media_purpose=completion_proof"
```

### Get Items with Media:
```bash
curl -X GET "http://localhost:8000/api/v1/checklist-items?checklist_id=abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "File not provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Checklist item not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal Server Error"
}
```

---

## Environment Variables
Ensure these are set in `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Notes
- All file uploads are stored in Cloudinary
- Temporary files are automatically cleaned up after upload
- Maximum file size: 50MB (configured in upload middleware)
- Supported file types: images, videos, audio
- Equipment images: stored in `checklist_equipment_images` folder
- Completion proofs: stored in `checklist_item_media` folder
