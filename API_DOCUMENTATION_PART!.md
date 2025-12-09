# SURAKSHA-SATHI API Documentation

**Version:** 1.0.0  
**Last Updated:** December 9, 2025

## Deployment Information

- **Backend (Render):** `https://your-render-app.onrender.com`
- **Frontend (Vercel):** `https://your-vercel-app.vercel.app`
- **Base API URL:** `https://your-render-app.onrender.com/api/v1`

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Role Management](#3-role-management)
4. [Task Management](#4-task-management)
5. [Checklist Management](#5-checklist-management)
6. [Checklist Items](#6-checklist-items)
7. [Checklist Item Media](#7-checklist-item-media)
8. [Task Assignments](#8-task-assignments)
9. [Attendance](#9-attendance)
10. [Payroll](#10-payroll)
11. [Hazard Categories](#11-hazard-categories)
12. [Severity Tags](#12-severity-tags)
13. [Hazard Reports](#13-hazard-reports)
14. [Hazard Media](#14-hazard-media)
15. [Hazard Assignments](#15-hazard-assignments)
16. [Follow-Up Actions](#16-follow-up-actions)
17. [Hazard Audits](#17-hazard-audits)
18. [Escalations](#18-escalations)
19. [Safety Videos](#19-safety-videos)
20. [Daily Videos](#20-daily-videos)
21. [Worker Videos](#21-worker-videos)
22. [Likes](#22-likes)
23. [Follows](#23-follows)
24. [Recommendations](#24-recommendations)
25. [Notifications](#25-notifications)
26. [Push Notifications](#26-push-notifications)
27. [Safety Prompts](#27-safety-prompts)
28. [External Integrations](#28-external-integrations)

---

## Global Information

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer <your_jwt_token>
```

### Common Response Format
**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": []
}
```

### Role Types
- `Admin` - Full system access
- `SafetyOfficer` - Safety and hazard management
- `Manager` - Team and task management
- `TrainingOfficer` - Training content management
- `Worker` - Basic access, reporting

---

## 1. Authentication

### 1.1 Register User (Worker Self-Registration)

**Endpoint:** `POST /api/v1/user/register`  
**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "worker@example.com",
  "userName": "worker123",
  "fullName": "John Doe",
  "password": "securePassword123",
  "phone": "1234567890",
  "language_pref": "en"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id_here",
    "userName": "worker123",
    "email": "worker@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "language_pref": "en",
    "role": null,
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - Missing required fields
- `409` - User with email/username already exists

---

### 1.2 Login

**Endpoint:** `POST /api/v1/user/login`  
**Authentication:** None (Public)

**Request Body:**
```json
{
  "email": "worker@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "user_id_here",
      "userName": "worker123",
      "email": "worker@example.com",
      "fullName": "John Doe",
      "role": {
        "_id": "role_id",
        "roleName": "Worker"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies Set:**
- `accessToken` - HTTP-only cookie
- `refreshToken` - HTTP-only cookie

**Possible Errors:**
- `400` - Email or password missing
- `401` - Invalid credentials

---

### 1.3 Logout

**Endpoint:** `POST /api/v1/user/logout`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": {}
}
```

---

### 1.4 Refresh Access Token

**Endpoint:** `POST /api/v1/user/refresh-token`  
**Authentication:** Refresh token required (from cookies or body)

**Request Body (Optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token refreshed",
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

---

## 2. User Management

### 2.1 Get Current User

**Endpoint:** `GET /api/v1/user/current-user`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user fetched successfully",
  "data": {
    "_id": "user_id",
    "userName": "worker123",
    "email": "worker@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "role": {
      "_id": "role_id",
      "roleName": "Worker",
      "description": "Worker role"
    },
    "language_pref": "en"
  }
}
```

---

### 2.2 Update Account Details

**Endpoint:** `PUT /api/v1/user/update-details`  
**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "email": "updated@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Account details updated successfully",
  "data": {
    "_id": "user_id",
    "userName": "worker123",
    "email": "updated@example.com",
    "fullName": "John Updated Doe"
  }
}
```

---

### 2.3 Change Password

**Endpoint:** `PUT /api/v1/user/change-password`  
**Authentication:** Required

**Request Body:**
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": {}
}
```

**Possible Errors:**
- `400` - Invalid old password
- `400` - Missing required fields

---

### 2.4 Create User (Admin Only)

**Endpoint:** `POST /api/v1/user/create`  
**Authentication:** Required  
**Roles:** Admin, Manager

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "userName": "newuser123",
  "fullName": "New User",
  "password": "password123",
  "phone": "9876543210",
  "language_pref": "en",
  "role_id": "role_id_here"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "_id": "new_user_id",
    "userName": "newuser123",
    "email": "newuser@example.com",
    "fullName": "New User",
    "role": "role_id_here"
  }
}
```

---

### 2.5 Get All Users

**Endpoint:** `GET /api/v1/user/all`  
**Authentication:** Required  
**Roles:** Admin, Manager

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `role` (optional) - Filter by role ID
- `search` (optional) - Search by name or email

**Example:** `GET /api/v1/user/all?page=1&limit=20&role=role_id`

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "_id": "user_id",
        "userName": "worker123",
        "email": "worker@example.com",
        "fullName": "John Doe",
        "role": {
          "_id": "role_id",
          "roleName": "Worker"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### 2.6 Get User by ID

**Endpoint:** `GET /api/v1/user/:id`  
**Authentication:** Required  
**Roles:** Admin, Manager

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": {
    "_id": "user_id",
    "userName": "worker123",
    "email": "worker@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "role": {
      "_id": "role_id",
      "roleName": "Worker"
    }
  }
}
```

---

### 2.7 Update User

**Endpoint:** `PUT /api/v1/user/:id`  
**Authentication:** Required  
**Roles:** Admin, Manager

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "updated@example.com",
  "role_id": "new_role_id",
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User updated successfully",
  "data": {
    "_id": "user_id",
    "userName": "worker123",
    "email": "updated@example.com",
    "fullName": "Updated Name",
    "role": "new_role_id"
  }
}
```

---

### 2.8 Delete User

**Endpoint:** `DELETE /api/v1/user/:id`  
**Authentication:** Required  
**Roles:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deleted successfully",
  "data": {}
}
```

---

## 3. Role Management

### 3.1 Create Role

**Endpoint:** `POST /api/v1/roles`  
**Authentication:** Required  
**Roles:** Admin

**Request Body:**
```json
{
  "roleName": "Custom Role",
  "description": "Description of the role"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Role created successfully",
  "data": {
    "_id": "role_id",
    "roleName": "Custom Role",
    "description": "Description of the role",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

---

### 3.2 Get All Roles

**Endpoint:** `GET /api/v1/roles`  
**Authentication:** Required

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Roles fetched successfully",
  "data": {
    "roles": [
      {
        "_id": "role_id_1",
        "roleName": "Admin",
        "description": "Administrator role"
      },
      {
        "_id": "role_id_2",
        "roleName": "Worker",
        "description": "Worker role"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRoles": 5,
      "limit": 10
    }
  }
}
```

---

### 3.3 Get Role by ID

**Endpoint:** `GET /api/v1/roles/:id`  
**Authentication:** Required  
**Roles:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role fetched successfully",
  "data": {
    "_id": "role_id",
    "roleName": "Worker",
    "description": "Worker role"
  }
}
```

---

### 3.4 Update Role

**Endpoint:** `PUT /api/v1/roles/:id`  
**Authentication:** Required  
**Roles:** Admin

**Request Body:**
```json
{
  "roleName": "Updated Role Name",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role updated successfully",
  "data": {
    "_id": "role_id",
    "roleName": "Updated Role Name",
    "description": "Updated description"
  }
}
```

---

### 3.5 Delete Role

**Endpoint:** `DELETE /api/v1/roles/:id`  
**Authentication:** Required  
**Roles:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role deleted successfully",
  "data": {}
}
```

---

## 4. Task Management

### 4.1 Create Task

**Endpoint:** `POST /api/v1/tasks`  
**Authentication:** Required

**Request Body:**
```json
{
  "taskName": "Safety Inspection",
  "description": "Perform weekly safety inspection of work area"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Task created",
  "data": {
    "_id": "task_id",
    "taskName": "Safety Inspection",
    "description": "Perform weekly safety inspection of work area",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - All fields required
- `409` - Task already exists

---

### 4.2 Get All Tasks

**Endpoint:** `GET /api/v1/tasks`  
**Authentication:** Required

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tasks fetched",
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "taskName": "Safety Inspection",
        "description": "Perform weekly safety inspection"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10
    }
  }
}
```

---

### 4.3 Get Task by ID

**Endpoint:** `GET /api/v1/tasks/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task fetched",
  "data": {
    "_id": "task_id",
    "taskName": "Safety Inspection",
    "description": "Perform weekly safety inspection"
  }
}
```

---

### 4.4 Update Task

**Endpoint:** `PUT /api/v1/tasks/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "taskName": "Updated Task Name",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task updated",
  "data": {
    "_id": "task_id",
    "taskName": "Updated Task Name",
    "description": "Updated description"
  }
}
```

---

### 4.5 Delete Task

**Endpoint:** `DELETE /api/v1/tasks/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task deleted",
  "data": {}
}
```

---

## 5. Checklist Management

### 5.1 Create Checklist

**Endpoint:** `POST /api/v1/checklists`  
**Authentication:** Required

**Request Body:**
```json
{
  "role_id": "role_id_here",
  "task_id": "task_id_here",
  "name": "Pre-shift Safety Checklist",
  "created_by": "user_id_here"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist created",
  "data": {
    "_id": "checklist_id",
    "role_id": "role_id_here",
    "task_id": "task_id_here",
    "name": "Pre-shift Safety Checklist",
    "created_by": "user_id_here",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - All fields required
- `409` - Checklist already exists for this role and task

---

### 5.2 Get All Checklists

**Endpoint:** `GET /api/v1/checklists`  
**Authentication:** Required

**Query Parameters:**
- `role_id` (optional) - Filter by role
- `task_id` (optional) - Filter by task
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklists fetched",
  "data": {
    "checklists": [
      {
        "_id": "checklist_id",
        "name": "Pre-shift Safety Checklist",
        "role_id": {
          "_id": "role_id",
          "roleName": "Worker"
        },
        "task_id": {
          "_id": "task_id",
          "taskName": "Safety Inspection"
        },
        "created_by": {
          "_id": "user_id",
          "fullName": "Admin User"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15
    }
  }
}
```

---

### 5.3 Get Checklist by ID

**Endpoint:** `GET /api/v1/checklists/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist fetched",
  "data": {
    "_id": "checklist_id",
    "name": "Pre-shift Safety Checklist",
    "role_id": "role_id",
    "task_id": "task_id",
    "created_by": "user_id"
  }
}
```

---

### 5.4 Update Checklist

**Endpoint:** `PUT /api/v1/checklists/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Checklist Name"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist updated",
  "data": {
    "_id": "checklist_id",
    "name": "Updated Checklist Name"
  }
}
```

---

### 5.5 Delete Checklist

**Endpoint:** `DELETE /api/v1/checklists/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist deleted",
  "data": {}
}
```

---

## 6. Checklist Items

### 6.1 Create Checklist Item (with Equipment Image)

**Endpoint:** `POST /api/v1/checklist-items/with-image`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
checklist_id: "checklist_id_here"
description: "Check fire extinguisher pressure gauge is in GREEN zone"
is_mandatory: true
order: 1
equipment_image: [File upload]
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist item created with equipment image",
  "data": {
    "_id": "item_id",
    "checklist_id": "checklist_id",
    "description": "Check fire extinguisher pressure gauge is in GREEN zone",
    "equipment_image_url": "https://res.cloudinary.com/.../equipment.jpg",
    "is_mandatory": true,
    "order": 1,
    "created_by": "user_id"
  }
}
```

---

### 6.2 Create Checklist Item (without Image)

**Endpoint:** `POST /api/v1/checklist-items`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "checklist_id": "checklist_id_here",
  "description": "Verify all emergency exits are clear",
  "is_mandatory": true,
  "order": 2,
  "equipment_image_url": "https://optional-url.com/image.jpg"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist item created",
  "data": {
    "_id": "item_id",
    "checklist_id": "checklist_id",
    "description": "Verify all emergency exits are clear",
    "is_mandatory": true,
    "order": 2,
    "created_by": "user_id"
  }
}
```

---

### 6.3 Get Checklist Items (with Media)

**Endpoint:** `GET /api/v1/checklist-items?checklist_id=checklist_id_here`  
**Authentication:** Required

**Query Parameters:**
- `checklist_id` (required) - Checklist ID

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist items fetched",
  "data": [
    {
      "_id": "item_id",
      "checklist_id": "checklist_id",
      "description": "Check fire extinguisher",
      "equipment_image_url": "https://res.cloudinary.com/.../equipment.jpg",
      "is_mandatory": true,
      "order": 1,
      "created_by": {
        "_id": "user_id",
        "username": "admin123",
        "fullname": "Admin User"
      },
      "media": [
        {
          "_id": "media_id",
          "media_type": "image",
          "url": "https://res.cloudinary.com/.../completion.jpg",
          "media_purpose": "completion_proof",
          "uploaded_by": {
            "username": "worker123",
            "fullname": "John Doe",
            "role": "Worker"
          },
          "createdAt": "2025-12-09T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 6.4 Get Checklist Item by ID

**Endpoint:** `GET /api/v1/checklist-items/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item fetched",
  "data": {
    "_id": "item_id",
    "checklist_id": "checklist_id",
    "description": "Check fire extinguisher",
    "equipment_image_url": "https://...",
    "is_mandatory": true,
    "order": 1
  }
}
```

---

### 6.5 Update Checklist Item (with Image)

**Endpoint:** `PUT /api/v1/checklist-items/:id/with-image`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
description: "Updated description"
is_mandatory: false
order: 2
equipment_image: [New file upload]
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item updated",
  "data": {
    "_id": "item_id",
    "description": "Updated description",
    "equipment_image_url": "https://res.cloudinary.com/.../new-image.jpg",
    "is_mandatory": false,
    "order": 2
  }
}
```

---

### 6.6 Update Checklist Item (without Image)

**Endpoint:** `PUT /api/v1/checklist-items/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "description": "Updated description",
  "is_mandatory": false,
  "order": 3,
  "equipment_image_url": "https://new-url.com/image.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item updated",
  "data": {
    "_id": "item_id",
    "description": "Updated description",
    "is_mandatory": false,
    "order": 3
  }
}
```

---

### 6.7 Delete Checklist Item

**Endpoint:** `DELETE /api/v1/checklist-items/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item deleted",
  "data": {}
}
```

---

## 7. Checklist Item Media

### 7.1 Upload Media (Completion Proof or Equipment Reference)

**Endpoint:** `POST /api/v1/checklist-item-media/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: [Image/Video/Audio file] (field name can be anything)
checklist_item_id: "item_id_here"
media_purpose: "completion_proof" or "equipment_reference"
language_code: "en" (optional)
uploaded_by: "user_id" (optional, auto-filled)
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checklist item media uploaded successfully",
  "data": {
    "_id": "media_id",
    "checklist_item_id": "item_id",
    "media_type": "image",
    "url": "https://res.cloudinary.com/.../completion-proof.jpg",
    "media_purpose": "completion_proof",
    "language_code": "en",
    "uploaded_by": "user_id",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - File not provided
- `400` - Checklist item ID is required
- `404` - Checklist item not found

---

### 7.2 Get All Media (with Filters)

**Endpoint:** `GET /api/v1/checklist-item-media`  
**Authentication:** Required

**Query Parameters:**
- `checklist_item_id` (optional) - Filter by checklist item
- `media_purpose` (optional) - Filter by purpose ('equipment_reference' or 'completion_proof')

**Example:** `GET /api/v1/checklist-item-media?checklist_item_id=item_id&media_purpose=completion_proof`

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item media fetched",
  "data": [
    {
      "_id": "media_id",
      "checklist_item_id": {
        "_id": "item_id",
        "description": "Check fire extinguisher"
      },
      "media_type": "image",
      "url": "https://res.cloudinary.com/.../completion.jpg",
      "media_purpose": "completion_proof",
      "language_code": "en",
      "uploaded_by": {
        "username": "worker123",
        "fullname": "John Doe",
        "role": "Worker"
      },
      "createdAt": "2025-12-09T10:00:00.000Z"
    }
  ]
}
```

---

### 7.3 Get Media by ID

**Endpoint:** `GET /api/v1/checklist-item-media/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item media fetched",
  "data": {
    "_id": "media_id",
    "checklist_item_id": "item_id",
    "media_type": "image",
    "url": "https://...",
    "media_purpose": "completion_proof"
  }
}
```

---

### 7.4 Update Media Metadata

**Endpoint:** `PUT /api/v1/checklist-item-media/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "media_purpose": "equipment_reference",
  "language_code": "es"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item media updated",
  "data": {
    "_id": "media_id",
    "media_purpose": "equipment_reference",
    "language_code": "es"
  }
}
```

---

### 7.5 Delete Media

**Endpoint:** `DELETE /api/v1/checklist-item-media/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checklist item media deleted",
  "data": {}
}
```

---

## 8. Task Assignments

### 8.1 Assign Task to User

**Endpoint:** `POST /api/v1/assignments`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "task_id": "task_id_here",
  "assigned_date": "2025-12-09T00:00:00.000Z",
  "due_date": "2025-12-16T00:00:00.000Z"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Task assigned to user",
  "data": {
    "_id": "assignment_id",
    "user_id": "user_id",
    "task_id": "task_id",
    "assigned_date": "2025-12-09T00:00:00.000Z",
    "due_date": "2025-12-16T00:00:00.000Z",
    "status": "pending"
  }
}
```

**Possible Errors:**
- `400` - user_id and task_id required
- `409` - Assignment already exists

---

### 8.2 Get User Assignments

**Endpoint:** `GET /api/v1/assignments?user_id=user_id_here`  
**Authentication:** Required

**Query Parameters:**
- `user_id` (required) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User assignments fetched",
  "data": [
    {
      "_id": "assignment_id",
      "user_id": {
        "_id": "user_id",
        "fullName": "John Doe"
      },
      "task_id": {
        "_id": "task_id",
        "taskName": "Safety Inspection"
      },
      "assigned_date": "2025-12-09T00:00:00.000Z",
      "due_date": "2025-12-16T00:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

---

### 8.3 Update Assignment

**Endpoint:** `PUT /api/v1/assignments/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "status": "completed",
  "due_date": "2025-12-20T00:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignment updated",
  "data": {
    "_id": "assignment_id",
    "status": "completed",
    "due_date": "2025-12-20T00:00:00.000Z"
  }
}
```

---

### 8.4 Delete Assignment

**Endpoint:** `DELETE /api/v1/assignments/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignment deleted",
  "data": {}
}
```

---

## 9. Attendance

### 9.1 Clock In

**Endpoint:** `POST /api/v1/attendance/check-in`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "shift_date": "2025-12-09"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Checked in successfully",
  "data": {
    "_id": "attendance_id",
    "user_id": "user_id",
    "check_in_time": "2025-12-09T08:00:00.000Z",
    "shift_date": "2025-12-09",
    "status": "present"
  }
}
```

**Possible Errors:**
- `400` - user_id and shift_date required
- `409` - Already checked in for this shift

---

### 9.2 Clock Out

**Endpoint:** `POST /api/v1/attendance/check-out`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "shift_date": "2025-12-09"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Checked out successfully",
  "data": {
    "_id": "attendance_id",
    "user_id": "user_id",
    "check_in_time": "2025-12-09T08:00:00.000Z",
    "check_out_time": "2025-12-09T17:00:00.000Z",
    "shift_date": "2025-12-09",
    "status": "present"
  }
}
```

---

### 9.3 Get User Attendance

**Endpoint:** `GET /api/v1/attendance/user/:user_id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Attendance records fetched",
  "data": [
    {
      "_id": "attendance_id",
      "user_id": "user_id",
      "check_in_time": "2025-12-09T08:00:00.000Z",
      "check_out_time": "2025-12-09T17:00:00.000Z",
      "shift_date": "2025-12-09",
      "status": "present"
    }
  ]
}
```

---

## 10. Payroll

### 10.1 Create/Update Salary Record

**Endpoint:** `POST /api/v1/payroll`  
**Authentication:** Required  
**Roles:** Admin, HR

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "base_salary": 50000,
  "bonus": 5000,
  "deductions": 2000,
  "month": 12,
  "year": 2025
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Salary record created/updated",
  "data": {
    "_id": "salary_id",
    "user_id": "user_id",
    "base_salary": 50000,
    "bonus": 5000,
    "deductions": 2000,
    "net_salary": 53000,
    "month": 12,
    "year": 2025
  }
}
```

---

### 10.2 Get User Salary Records

**Endpoint:** `GET /api/v1/payroll/user/:user_id`  
**Authentication:** Required  
**Roles:** Admin, HR

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salary records fetched",
  "data": [
    {
      "_id": "salary_id",
      "user_id": {
        "_id": "user_id",
        "fullName": "John Doe"
      },
      "base_salary": 50000,
      "bonus": 5000,
      "deductions": 2000,
      "net_salary": 53000,
      "month": 12,
      "year": 2025
    }
  ]
}
```

---

**Continue to Part 2 for remaining endpoints (Hazard Management, Videos, Social Features, Notifications)...**

---

## Common Error Codes

- `400` - Bad Request (Missing or invalid parameters)
- `401` - Unauthorized (Invalid or missing authentication)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Resource already exists)
- `500` - Internal Server Error (Server-side error)

## Important Notes for Deployment

1. **Environment Variables Required:**
   - `MONGODB_URI` - MongoDB connection string
   - `CORS_ORIGIN` - Frontend URL (currently set to `*`)
   - `ACCESS_TOKEN_SECRET` - JWT access token secret
   - `REFRESH_TOKEN_SECRET` - JWT refresh token secret
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret

2. **File Upload Limits:**
   - Maximum file size: 50MB
   - Supported types: images, videos, audio

3. **Authentication:**
   - Tokens are sent both in cookies (HTTP-only) and response body
   - For deployed apps, use `Authorization: Bearer <token>` header

4. **CORS:**
   - Currently configured to accept all origins (`*`)
   - Update `CORS_ORIGIN` in production for security

---

**API Documentation - Part 1 of 2**  
*Continued in next response...*
