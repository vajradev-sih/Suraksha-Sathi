# Checklist Media Testing Guide

## Prerequisites
You need:
1. JWT Token (from login)
2. Valid Role ID
3. Valid Task ID
4. User ID

---

## Step 1: Login to Get JWT Token

**Request:**
```
POST http://localhost:3000/api/v1/user/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "_id": "USER_ID_HERE",
      "username": "...",
      "role": "..."
    },
    "accessToken": "COPY_THIS_TOKEN"
  }
}
```

**→ Copy the `accessToken` and `_id`**

---

## Step 2: Get Existing Roles

**Request:**
```
GET http://localhost:3000/api/v1/roles
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "data": [
    {
      "_id": "ROLE_ID_HERE",
      "role_name": "Worker"
    }
  ]
}
```

**→ Copy a `_id` from roles**

---

## Step 3: Get Existing Tasks

**Request:**
```
GET http://localhost:3000/api/v1/tasks
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "data": {
    "tasks": [
      {
        "_id": "TASK_ID_HERE",
        "title": "Fire Safety Inspection"
      }
    ]
  }
}
```

**→ Copy a `_id` from tasks**

---

## Step 4: Create a Checklist

**Request:**
```
POST http://localhost:3000/api/v1/checklists
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "role_id": "PASTE_ROLE_ID",
  "task_id": "PASTE_TASK_ID",
  "name": "Test Media Upload Checklist",
  "created_by": "PASTE_YOUR_USER_ID"
}
```

**Response:**
```json
{
  "data": {
    "_id": "CHECKLIST_ID_HERE",
    "name": "Test Media Upload Checklist",
    ...
  }
}
```

**→ Copy the checklist `_id`**

---

## Step 5: Create a Checklist Item

**Request:**
```
POST http://localhost:3000/api/v1/checklist-items
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "checklist_id": "PASTE_CHECKLIST_ID",
  "description": "Check fire extinguisher pressure gauge",
  "is_mandatory": true,
  "order": 1
}
```

**Response:**
```json
{
  "data": {
    "_id": "CHECKLIST_ITEM_ID_HERE",
    "description": "Check fire extinguisher pressure gauge",
    ...
  }
}
```

**→ Copy the checklist item `_id`**

---

## Step 6: Upload Media for Checklist Item

**Request:**
```
POST http://localhost:3000/api/v1/checklist-item-media/upload
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

Form Data:
- file: [Select your image/video file]
- checklist_item_id: "PASTE_CHECKLIST_ITEM_ID"
- media_purpose: "completion_proof"
- language_code: "en"
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
    "url": "https://res.cloudinary.com/...",
    "media_purpose": "completion_proof"
  }
}
```

---

## Alternative: Create Checklist Item with Equipment Image

**Request:**
```
POST http://localhost:3000/api/v1/checklist-items/with-image
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

Form Data:
- equipment_image: [Select equipment reference image]
- checklist_id: "PASTE_CHECKLIST_ID"
- description: "Check fire extinguisher pressure gauge is in GREEN zone"
- is_mandatory: true
- order: 1
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist item created with equipment image",
  "data": {
    "_id": "...",
    "description": "Check fire extinguisher...",
    "equipment_image_url": "https://res.cloudinary.com/...",
    ...
  }
}
```

---

## Step 7: Get Checklist Items with Media

**Request:**
```
GET http://localhost:3000/api/v1/checklist-items?checklist_id=PASTE_CHECKLIST_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "description": "Check fire extinguisher...",
      "equipment_image_url": "https://...",
      "media": [
        {
          "media_type": "image",
          "url": "https://...",
          "media_purpose": "completion_proof",
          "uploaded_by": {
            "username": "worker123",
            "fullname": "John Doe"
          }
        }
      ]
    }
  ]
}
```

---

## Quick Test with Postman/Thunder Client

### Setup Headers (Use for All Requests):
```
Authorization: Bearer YOUR_TOKEN_FROM_LOGIN
```

### Test Sequence:

1. **Login** → Get token
2. **GET /roles** → Get role_id
3. **GET /tasks** → Get task_id  
4. **POST /checklists** → Create checklist (need role_id, task_id, user_id)
5. **POST /checklist-items** → Create item (need checklist_id)
6. **POST /checklist-item-media/upload** → Upload media (need checklist_item_id)
7. **GET /checklist-items?checklist_id=...** → View result with media

---

## Common Errors

### 500 Internal Server Error
- **Cause:** Invalid IDs (role_id, task_id, checklist_id don't exist)
- **Fix:** Use actual IDs from GET requests

### 400 Bad Request - "All fields required"
- **Cause:** Missing required fields
- **Fix:** Include all required fields (see Step 4)

### 400 Bad Request - "Checklist item ID is required"
- **Cause:** Missing `checklist_item_id` in form-data
- **Fix:** Add `checklist_item_id` field to form-data

### 404 Not Found - "Checklist item not found"
- **Cause:** Invalid checklist_item_id
- **Fix:** Create a checklist item first (Step 5)

### 401 Unauthorized
- **Cause:** Missing or invalid JWT token
- **Fix:** Login again and use fresh token

---

## Postman Collection Format

```json
{
  "info": {
    "name": "Checklist Media Testing"
  },
  "item": [
    {
      "name": "1. Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/user/login",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"test_user\",\n  \"password\": \"password123\"\n}"
        }
      }
    },
    {
      "name": "2. Get Roles",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/v1/roles",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "3. Get Tasks",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/v1/tasks",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "4. Create Checklist",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/checklists",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"role_id\": \"{{role_id}}\",\n  \"task_id\": \"{{task_id}}\",\n  \"name\": \"Test Checklist\",\n  \"created_by\": \"{{user_id}}\"\n}"
        }
      }
    },
    {
      "name": "5. Create Checklist Item",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/checklist-items",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"checklist_id\": \"{{checklist_id}}\",\n  \"description\": \"Test item\",\n  \"is_mandatory\": true,\n  \"order\": 1\n}"
        }
      }
    },
    {
      "name": "6. Upload Media",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/checklist-item-media/upload",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "path/to/image.jpg"
            },
            {
              "key": "checklist_item_id",
              "value": "{{checklist_item_id}}"
            },
            {
              "key": "media_purpose",
              "value": "completion_proof"
            }
          ]
        }
      }
    }
  ]
}
```

---

## Summary

**The 500 error happens because you need valid IDs.** Follow the steps above in order to get all required IDs before testing media upload.
