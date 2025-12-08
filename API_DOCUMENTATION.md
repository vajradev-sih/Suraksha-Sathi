# 🚀 Suraksha-Sathi API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## 🔑 Demo Credentials

### Admin Account
```json
{
  "email": "admin@suraksha.com",
  "password": "Admin@123"
}
```

### Safety Officer Account
```json
{
  "email": "safety@suraksha.com",
  "password": "Safety@123"
}
```

### Manager Account
```json
{
  "email": "manager@suraksha.com",
  "password": "Manager@123"
}
```

### Worker Account
```json
{
  "email": "worker@suraksha.com",
  "password": "Worker@123"
}
```

---

## 📋 Table of Contents
1. [Authentication & User Management](#1-authentication--user-management)
2. [Role Management](#2-role-management)
3. [Task Management](#3-task-management)
4. [Checklist Management](#4-checklist-management)
5. [Worker Video Management](#5-worker-video-management)
6. [Social Features (Likes & Follows)](#6-social-features)
7. [Recommendations](#7-recommendations)
8. [Hazard Management](#8-hazard-management)
9. [Attendance & Payroll](#9-attendance--payroll)
10. [Notifications](#10-notifications)
11. [Safety Videos & Prompts](#11-safety-videos--prompts)

---

## 1. Authentication & User Management

### 1.1 Register User
**Endpoint:** `POST /user/register`  
**Auth Required:** No  
**Description:** Register a new worker account

**Request Body:**
```json
{
  "userName": "john_doe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass@123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "userId",
    "userName": "john_doe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role_name": "Worker"
  },
  "message": "User registered successfully"
}
```

---

### 1.2 Login User
**Endpoint:** `POST /user/login`  
**Auth Required:** No  
**Description:** Login and receive access & refresh tokens

**Request Body:**
```json
{
  "email": "admin@suraksha.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "userId",
      "email": "admin@suraksha.com",
      "fullName": "Admin User",
      "role_name": "Admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully"
}
```

**Note:** Store `accessToken` for authenticated requests. Include in headers:
```
Authorization: Bearer <accessToken>
```

---

### 1.3 Logout User
**Endpoint:** `POST /user/logout`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

---

### 1.4 Refresh Access Token
**Endpoint:** `POST /user/refresh-token`  
**Auth Required:** No  
**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "newAccessToken",
    "refreshToken": "newRefreshToken"
  },
  "message": "Access token refreshed"
}
```

---

### 1.5 Get Current User
**Endpoint:** `GET /user/current-user`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "userId",
    "userName": "admin",
    "fullName": "Admin User",
    "email": "admin@suraksha.com",
    "role_name": "Admin"
  },
  "message": "Current user fetched successfully"
}
```

---

### 1.6 Update Account Details
**Endpoint:** `PUT /user/update-details`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "phone": "+9876543210"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "userId",
    "fullName": "Updated Name",
    "phone": "+9876543210"
  },
  "message": "Account details updated successfully"
}
```

---

### 1.7 Change Password
**Endpoint:** `PUT /user/change-password`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "oldPassword": "OldPass@123",
  "newPassword": "NewPass@123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password changed successfully"
}
```

---

### 1.8 Create User (Admin)
**Endpoint:** `POST /user/`  
**Auth Required:** Yes (Admin)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Request Body:**
```json
{
  "userName": "new_worker",
  "fullName": "New Worker",
  "email": "newworker@example.com",
  "password": "Worker@123",
  "phone": "+1234567890",
  "role_id": "roleObjectId"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "newUserId",
    "userName": "new_worker",
    "fullName": "New Worker",
    "email": "newworker@example.com",
    "role_name": "Worker"
  },
  "message": "User created successfully"
}
```

---

### 1.9 Get All Users (Admin/Manager)
**Endpoint:** `GET /user/`  
**Auth Required:** Yes (Admin/Manager)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "userId1",
      "userName": "admin",
      "fullName": "Admin User",
      "email": "admin@suraksha.com",
      "role_name": "Admin"
    },
    {
      "_id": "userId2",
      "userName": "worker1",
      "fullName": "Worker One",
      "email": "worker@suraksha.com",
      "role_name": "Worker"
    }
  ],
  "message": "Users fetched successfully"
}
```

---

### 1.10 Get User by ID (Admin/Manager)
**Endpoint:** `GET /user/:id`  
**Auth Required:** Yes (Admin/Manager)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Example:** `GET /user/6579abc123def456789`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "6579abc123def456789",
    "userName": "worker1",
    "fullName": "Worker One",
    "email": "worker@suraksha.com",
    "role_name": "Worker"
  },
  "message": "User fetched successfully"
}
```

---

### 1.11 Update User (Admin/Manager)
**Endpoint:** `PUT /user/:id`  
**Auth Required:** Yes (Admin/Manager)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "fullName": "Updated Worker Name",
  "role_id": "newRoleId"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "userId",
    "fullName": "Updated Worker Name",
    "role_name": "UpdatedRole"
  },
  "message": "User updated successfully"
}
```

---

### 1.12 Delete User (Admin)
**Endpoint:** `DELETE /user/:id`  
**Auth Required:** Yes (Admin only)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User deleted successfully"
}
```

---

## 2. Role Management

### 2.1 Create Role
**Endpoint:** `POST /roles/`  
**Auth Required:** Yes (Admin)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Request Body:**
```json
{
  "roleName": "Supervisor",
  "description": "Supervises workers on site"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "roleId",
    "roleName": "Supervisor",
    "description": "Supervises workers on site"
  },
  "message": "Role created successfully"
}
```

---

### 2.2 Get All Roles
**Endpoint:** `GET /roles/`  
**Auth Required:** Yes (Admin)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "roleId1",
      "roleName": "Admin",
      "description": "System administrator"
    },
    {
      "_id": "roleId2",
      "roleName": "Worker",
      "description": "Field worker"
    }
  ],
  "message": "Roles fetched successfully"
}
```

---

### 2.3 Get Role by ID
**Endpoint:** `GET /roles/:id`  
**Auth Required:** Yes (Admin)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "roleId",
    "roleName": "Worker",
    "description": "Field worker"
  },
  "message": "Role fetched successfully"
}
```

---

### 2.4 Update Role
**Endpoint:** `PUT /roles/:id`  
**Auth Required:** Yes (Admin)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Request Body:**
```json
{
  "roleName": "Senior Worker",
  "description": "Experienced field worker"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "roleId",
    "roleName": "Senior Worker",
    "description": "Experienced field worker"
  },
  "message": "Role updated successfully"
}
```

---

### 2.5 Delete Role
**Endpoint:** `DELETE /roles/:id`  
**Auth Required:** Yes (Admin)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Role deleted successfully"
}
```

---

## 3. Task Management

### 3.1 Create Task
**Endpoint:** `POST /tasks/`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "task_name": "Safety Inspection",
  "description": "Conduct daily safety inspection of equipment",
  "status": "pending",
  "priority": "high",
  "due_date": "2025-12-15T10:00:00Z"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "taskId",
    "task_name": "Safety Inspection",
    "description": "Conduct daily safety inspection of equipment",
    "status": "pending",
    "priority": "high",
    "due_date": "2025-12-15T10:00:00Z"
  },
  "message": "Task created successfully"
}
```

---

### 3.2 Get All Tasks
**Endpoint:** `GET /tasks/`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "taskId1",
      "task_name": "Safety Inspection",
      "status": "pending",
      "priority": "high"
    },
    {
      "_id": "taskId2",
      "task_name": "Equipment Check",
      "status": "completed",
      "priority": "medium"
    }
  ],
  "message": "Tasks fetched successfully"
}
```

---

### 3.3 Get Task by ID
**Endpoint:** `GET /tasks/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "taskId",
    "task_name": "Safety Inspection",
    "description": "Conduct daily safety inspection",
    "status": "pending"
  },
  "message": "Task fetched successfully"
}
```

---

### 3.4 Update Task
**Endpoint:** `PUT /tasks/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Inspection completed successfully"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "taskId",
    "task_name": "Safety Inspection",
    "status": "completed",
    "notes": "Inspection completed successfully"
  },
  "message": "Task updated successfully"
}
```

---

### 3.5 Delete Task
**Endpoint:** `DELETE /tasks/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Task deleted successfully"
}
```

---

## 4. Checklist Management

### 4.1 Create Checklist
**Endpoint:** `POST /checklists/`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "checklist_name": "Daily Safety Checklist",
  "description": "Items to check daily for safety compliance"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "checklistId",
    "checklist_name": "Daily Safety Checklist",
    "description": "Items to check daily for safety compliance"
  },
  "message": "Checklist created successfully"
}
```

---

### 4.2 Get All Checklists
**Endpoint:** `GET /checklists/`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "checklistId1",
      "checklist_name": "Daily Safety Checklist"
    },
    {
      "_id": "checklistId2",
      "checklist_name": "Equipment Maintenance Checklist"
    }
  ],
  "message": "Checklists fetched successfully"
}
```

---

### 4.3 Get Checklist by ID
**Endpoint:** `GET /checklists/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "checklistId",
    "checklist_name": "Daily Safety Checklist",
    "description": "Items to check daily for safety compliance"
  },
  "message": "Checklist fetched successfully"
}
```

---

### 4.4 Update Checklist
**Endpoint:** `PUT /checklists/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "checklist_name": "Updated Safety Checklist",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "checklistId",
    "checklist_name": "Updated Safety Checklist"
  },
  "message": "Checklist updated successfully"
}
```

---

### 4.5 Delete Checklist
**Endpoint:** `DELETE /checklists/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Checklist deleted successfully"
}
```

---

## 5. Worker Video Management

### 5.1 Upload Worker Video
**Endpoint:** `POST /worker-videos/upload`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <video_file>
title: "Safety Training Video"
description: "How to use protective equipment"
category: "training"
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "videoId",
    "title": "Safety Training Video",
    "description": "How to use protective equipment",
    "video_url": "https://cloudinary.com/...",
    "thumbnail_url": "https://cloudinary.com/...",
    "category": "training",
    "approval_status": "pending",
    "moderation_status": "passed",
    "uploaded_by": {
      "_id": "userId",
      "fullName": "Worker One"
    }
  },
  "message": "Video uploaded successfully and pending approval"
}
```

---

### 5.2 Get My Uploaded Videos
**Endpoint:** `GET /worker-videos/my-videos`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId1",
      "title": "Safety Training Video",
      "approval_status": "pending",
      "like_count": 0,
      "views": 5,
      "is_liked": false
    }
  ],
  "message": "Your videos fetched successfully"
}
```

---

### 5.3 Get Approved Videos
**Endpoint:** `GET /worker-videos/approved?category=training`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `category` (optional): safety, training, incident, tutorial, other

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId1",
      "title": "Safety Training Video",
      "approval_status": "approved",
      "like_count": 15,
      "views": 120,
      "is_liked": true,
      "is_following_uploader": false,
      "uploaded_by": {
        "fullName": "Expert Worker"
      }
    }
  ],
  "message": "Approved videos fetched successfully"
}
```

---

### 5.4 Get Pending Videos (Admin)
**Endpoint:** `GET /worker-videos/pending`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId",
      "title": "New Safety Video",
      "approval_status": "pending",
      "moderation_status": "passed",
      "uploaded_by": {
        "fullName": "Worker One"
      }
    }
  ],
  "message": "Pending videos fetched successfully"
}
```

---

### 5.5 Approve Video (Admin)
**Endpoint:** `POST /worker-videos/:id/approve`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "videoId",
    "title": "Safety Training Video",
    "approval_status": "approved",
    "approved_by": {
      "fullName": "Admin User"
    },
    "approved_at": "2025-12-09T10:00:00Z"
  },
  "message": "Video approved successfully"
}
```

---

### 5.6 Reject Video (Admin)
**Endpoint:** `POST /worker-videos/:id/reject`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Request Body:**
```json
{
  "rejection_reason": "Video quality is too low"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "videoId",
    "approval_status": "rejected",
    "rejection_reason": "Video quality is too low"
  },
  "message": "Video rejected"
}
```

---

### 5.7 Get Video by ID
**Endpoint:** `GET /worker-videos/:id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "videoId",
    "title": "Safety Training Video",
    "description": "How to use protective equipment",
    "video_url": "https://cloudinary.com/...",
    "like_count": 25,
    "views": 151,
    "is_liked": true,
    "is_following_uploader": true,
    "uploaded_by": {
      "fullName": "Expert Worker"
    }
  },
  "message": "Video fetched successfully"
}
```

---

### 5.8 Update Video
**Endpoint:** `PUT /worker-videos/:id`  
**Auth Required:** Yes (Owner)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "title": "Updated Video Title",
  "description": "Updated description",
  "category": "tutorial"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "videoId",
    "title": "Updated Video Title",
    "description": "Updated description"
  },
  "message": "Video updated successfully"
}
```

---

### 5.9 Delete Video
**Endpoint:** `DELETE /worker-videos/:id`  
**Auth Required:** Yes (Owner/Admin)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Video deleted successfully"
}
```

---

### 5.10 Get Auto-Rejected Videos (Admin)
**Endpoint:** `GET /worker-videos/moderation/auto-rejected?page=1&limit=20`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "_id": "videoId",
        "title": "Inappropriate Content",
        "approval_status": "auto_rejected",
        "moderation_status": "auto_rejected",
        "moderation_flags": ["Inappropriate content detected: violence"],
        "rejection_reason": "Auto-rejected: Inappropriate content detected: violence"
      }
    ],
    "total": 5,
    "page": 1,
    "total_pages": 1
  },
  "message": "Auto-rejected videos fetched successfully"
}
```

---

### 5.11 Get Flagged Videos (Admin)
**Endpoint:** `GET /worker-videos/moderation/flagged`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId",
      "title": "Potentially Problematic Video",
      "requires_manual_review": true,
      "moderation_status": "flagged",
      "moderation_flags": ["Unusually large file size"]
    }
  ],
  "message": "Flagged videos requiring review fetched successfully"
}
```

---

### 5.12 Get Moderation Statistics (Admin)
**Endpoint:** `GET /worker-videos/moderation/stats`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "moderation_stats": [
      {
        "_id": "passed",
        "count": 150,
        "avg_score": 0.95
      },
      {
        "_id": "auto_rejected",
        "count": 5,
        "avg_score": 0.3
      }
    ],
    "approval_stats": [
      {
        "_id": "approved",
        "count": 120
      },
      {
        "_id": "pending",
        "count": 30
      }
    ],
    "flagged_for_review": 3
  },
  "message": "Moderation statistics fetched successfully"
}
```

---

## 6. Social Features

### 6.1 Like Video
**Endpoint:** `POST /likes/:videoId/like`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "like": {
      "_id": "likeId",
      "user_id": "userId",
      "video_id": "videoId"
    },
    "like_count": 26
  },
  "message": "Video liked successfully"
}
```

---

### 6.2 Unlike Video
**Endpoint:** `DELETE /likes/:videoId/unlike`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "like_count": 25
  },
  "message": "Video unliked successfully"
}
```

---

### 6.3 Get My Liked Videos
**Endpoint:** `GET /likes/my-liked-videos`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId",
      "title": "Safety Training Video",
      "like_count": 25,
      "views": 150,
      "liked_at": "2025-12-09T10:00:00Z",
      "is_liked": true
    }
  ],
  "message": "Liked videos fetched successfully"
}
```

---

### 6.4 Get Video Likes
**Endpoint:** `GET /likes/:videoId/likes?page=1&limit=50`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "likes": [
      {
        "user": {
          "fullName": "Worker One",
          "email": "worker@example.com"
        },
        "liked_at": "2025-12-09T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "total_pages": 1
  },
  "message": "Video likes fetched successfully"
}
```

---

### 6.5 Check Like Status
**Endpoint:** `GET /likes/:videoId/check`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "is_liked": true
  },
  "message": "Like status checked"
}
```

---

### 6.6 Get Popular Videos
**Endpoint:** `GET /likes/popular/videos?limit=20&category=training`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional): Number of videos (default: 20)
- `category` (optional): Filter by category

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId",
      "title": "Most Popular Safety Video",
      "like_count": 150,
      "views": 1200,
      "is_liked": true
    }
  ],
  "message": "Popular videos fetched successfully"
}
```

---

### 6.7 Follow User
**Endpoint:** `POST /follows/:userId/follow`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "followId",
    "follower_id": "currentUserId",
    "following_id": {
      "_id": "targetUserId",
      "fullName": "Expert Worker",
      "role_name": "Worker"
    }
  },
  "message": "User followed successfully"
}
```

---

### 6.8 Unfollow User
**Endpoint:** `DELETE /follows/:userId/unfollow`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User unfollowed successfully"
}
```

---

### 6.9 Get User Followers
**Endpoint:** `GET /follows/:userId/followers?page=1&limit=50`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "followers": [
      {
        "user": {
          "fullName": "Worker One",
          "email": "worker@example.com"
        },
        "followed_at": "2025-12-09T10:00:00Z",
        "is_following": true
      }
    ],
    "total": 50,
    "page": 1,
    "total_pages": 1
  },
  "message": "Followers fetched successfully"
}
```

---

### 6.10 Get User Following
**Endpoint:** `GET /follows/:userId/following?page=1&limit=50`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "following": [
      {
        "user": {
          "fullName": "Expert Worker",
          "email": "expert@example.com"
        },
        "followed_at": "2025-12-09T10:00:00Z",
        "is_following": true
      }
    ],
    "total": 30,
    "page": 1,
    "total_pages": 1
  },
  "message": "Following list fetched successfully"
}
```

---

### 6.11 Get My Followers
**Endpoint:** `GET /follows/my/followers`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "followers": [
      {
        "user": {
          "fullName": "Worker One",
          "role_name": "Worker"
        },
        "followed_at": "2025-12-09T10:00:00Z",
        "is_following": false
      }
    ],
    "total": 25
  },
  "message": "Followers fetched successfully"
}
```

---

### 6.12 Get My Following
**Endpoint:** `GET /follows/my/following`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "following": [
      {
        "user": {
          "fullName": "Expert Worker",
          "role_name": "SafetyOfficer"
        },
        "followed_at": "2025-12-08T10:00:00Z",
        "is_following": true
      }
    ],
    "total": 15
  },
  "message": "Following list fetched successfully"
}
```

---

### 6.13 Check Follow Status
**Endpoint:** `GET /follows/:userId/check`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "is_following": true
  },
  "message": "Follow status checked"
}
```

---

### 6.14 Get User Profile with Stats
**Endpoint:** `GET /follows/:userId/profile`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "userId",
    "fullName": "Expert Worker",
    "email": "expert@example.com",
    "role_name": "Worker",
    "follower_count": 150,
    "following_count": 45,
    "is_following": true
  },
  "message": "User profile fetched successfully"
}
```

---

### 6.15 Get Suggested Users to Follow
**Endpoint:** `GET /follows/suggestions/users?limit=10`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional): Number of suggestions (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "userId",
      "fullName": "Popular Worker",
      "email": "popular@example.com",
      "role_name": "SafetyOfficer",
      "follower_count": 250
    }
  ],
  "message": "Suggested users fetched successfully"
}
```

---

## 7. Recommendations

### 7.1 Get Recommended Videos
**Endpoint:** `GET /recommendations/videos?limit=20&page=1`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional): Number of videos (default: 20)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "_id": "videoId",
        "title": "Recommended Safety Video",
        "like_count": 45,
        "views": 320,
        "is_liked": false,
        "recommendation_reason": "From users you follow",
        "recommendation_score": 5
      }
    ],
    "total": 50,
    "page": 1,
    "total_pages": 3
  },
  "message": "Recommended videos fetched successfully"
}
```

---

### 7.2 Get Personalized Feed
**Endpoint:** `GET /recommendations/feed?limit=10&offset=0`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional): Number of videos (default: 10)
- `offset` (optional): Starting position (default: 0)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "_id": "videoId",
        "title": "Personalized Content",
        "like_count": 30,
        "views": 200,
        "is_liked": false,
        "uploaded_by": {
          "fullName": "Followed User"
        }
      }
    ],
    "has_more": true
  },
  "message": "Personalized feed fetched successfully"
}
```

---

### 7.3 Get Similar Videos
**Endpoint:** `GET /recommendations/similar/:videoId?limit=10`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `limit` (optional): Number of videos (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "similarVideoId",
      "title": "Similar Safety Training",
      "category": "training",
      "like_count": 20,
      "is_liked": false
    }
  ],
  "message": "Similar videos fetched successfully"
}
```

---

## 8. Hazard Management

### 8.1 Create Hazard Report
**Endpoint:** `POST /hazard-reports/`  
**Auth Required:** Yes (Worker and above)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "hazard_category_id": "categoryId",
  "severity_tag_id": "severityId",
  "location": "Construction Site A, Zone 3",
  "description": "Exposed electrical wiring found near water source",
  "reported_by": "userId",
  "status": "open"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "hazardId",
    "location": "Construction Site A, Zone 3",
    "description": "Exposed electrical wiring found near water source",
    "status": "open",
    "reported_by": {
      "fullName": "Worker One"
    }
  },
  "message": "Hazard report created successfully"
}
```

---

### 8.2 Get All Hazard Reports (Admin/SafetyOfficer/Manager)
**Endpoint:** `GET /hazard-reports/`  
**Auth Required:** Yes (Admin/SafetyOfficer/Manager)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "hazardId1",
      "location": "Construction Site A",
      "description": "Exposed wiring",
      "status": "open"
    },
    {
      "_id": "hazardId2",
      "location": "Mining Area B",
      "description": "Unstable ground",
      "status": "resolved"
    }
  ],
  "message": "Hazard reports fetched successfully"
}
```

---

### 8.3 Get Hazard Report by ID
**Endpoint:** `GET /hazard-reports/:id`  
**Auth Required:** Yes (Worker and above)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "hazardId",
    "location": "Construction Site A, Zone 3",
    "description": "Exposed electrical wiring",
    "status": "open",
    "reported_by": {
      "fullName": "Worker One"
    }
  },
  "message": "Hazard report fetched successfully"
}
```

---

### 8.4 Update Hazard Report (Admin/SafetyOfficer/Manager)
**Endpoint:** `PUT /hazard-reports/:id`  
**Auth Required:** Yes (Admin/SafetyOfficer/Manager)  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Electrical team notified and en route"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "hazardId",
    "status": "in_progress",
    "notes": "Electrical team notified and en route"
  },
  "message": "Hazard report updated successfully"
}
```

---

### 8.5 Delete Hazard Report (Admin/SafetyOfficer)
**Endpoint:** `DELETE /hazard-reports/:id`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Hazard report deleted successfully"
}
```

---

## 9. Attendance & Payroll

### 9.1 Clock In (Check In)
**Endpoint:** `POST /attendance/check-in`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "location": "Construction Site A",
  "notes": "Starting morning shift"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "attendanceId",
    "user_id": "userId",
    "check_in_time": "2025-12-09T08:00:00Z",
    "location": "Construction Site A"
  },
  "message": "Checked in successfully"
}
```

---

### 9.2 Clock Out (Check Out)
**Endpoint:** `POST /attendance/check-out`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "notes": "Completed shift"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "attendanceId",
    "user_id": "userId",
    "check_in_time": "2025-12-09T08:00:00Z",
    "check_out_time": "2025-12-09T17:00:00Z",
    "total_hours": 9
  },
  "message": "Checked out successfully"
}
```

---

### 9.3 Get Attendance for User
**Endpoint:** `GET /attendance/user/:user_id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "attendanceId1",
      "check_in_time": "2025-12-09T08:00:00Z",
      "check_out_time": "2025-12-09T17:00:00Z",
      "total_hours": 9
    },
    {
      "_id": "attendanceId2",
      "check_in_time": "2025-12-08T08:00:00Z",
      "check_out_time": "2025-12-08T17:00:00Z",
      "total_hours": 9
    }
  ],
  "message": "Attendance records fetched successfully"
}
```

---

### 9.4 Create/Update Salary Record (Admin/HR)
**Endpoint:** `POST /payroll/`  
**Auth Required:** Yes (Admin/HR)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Request Body:**
```json
{
  "user_id": "userId",
  "base_salary": 50000,
  "allowances": 5000,
  "deductions": 2000,
  "net_salary": 53000,
  "payment_date": "2025-12-31T00:00:00Z",
  "month": 12,
  "year": 2025
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "salaryId",
    "user_id": "userId",
    "base_salary": 50000,
    "net_salary": 53000,
    "month": 12,
    "year": 2025
  },
  "message": "Salary record created successfully"
}
```

---

### 9.5 Get Salary Records for User (Admin/HR)
**Endpoint:** `GET /payroll/user/:user_id`  
**Auth Required:** Yes (Admin/HR)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "salaryId1",
      "base_salary": 50000,
      "net_salary": 53000,
      "month": 12,
      "year": 2025,
      "payment_date": "2025-12-31T00:00:00Z"
    }
  ],
  "message": "Salary records fetched successfully"
}
```

---

## 10. Notifications

### 10.1 Create Notification
**Endpoint:** `POST /notifications/`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "user_id": "targetUserId",
  "message": "New safety training video available",
  "notification_type": "info",
  "related_entity": "videoId"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "notificationId",
    "user_id": "targetUserId",
    "message": "New safety training video available",
    "is_read": false,
    "createdAt": "2025-12-09T10:00:00Z"
  },
  "message": "Notification created successfully"
}
```

---

### 10.2 Get Notifications for User
**Endpoint:** `GET /notifications/user/:user_id`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "notificationId1",
      "message": "New safety training video available",
      "is_read": false,
      "createdAt": "2025-12-09T10:00:00Z"
    },
    {
      "_id": "notificationId2",
      "message": "Your video was approved",
      "is_read": true,
      "createdAt": "2025-12-08T15:00:00Z"
    }
  ],
  "message": "Notifications fetched successfully"
}
```

---

### 10.3 Mark Notification as Read
**Endpoint:** `PUT /notifications/:id/read`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "notificationId",
    "is_read": true
  },
  "message": "Notification marked as read"
}
```

---

## 11. Safety Videos & Prompts

### 11.1 Upload Safety Video (Admin/SafetyOfficer)
**Endpoint:** `POST /safety-videos/upload`  
**Auth Required:** Yes (Admin/SafetyOfficer)  
**Headers:**
```
Authorization: Bearer <adminAccessToken>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <video_file>
external_integration_id: "integrationId"
title: "Official Safety Training"
description: "Mandatory safety procedures"
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "message": "Safety video uploaded",
    "url": "https://cloudinary.com/..."
  }
}
```

---

### 11.2 Get All Safety Videos
**Endpoint:** `GET /safety-videos/`  
**Auth Required:** Yes  
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "videoId",
      "title": "Official Safety Training",
      "url": "https://cloudinary.com/...",
      "thumbnail_url": "https://cloudinary.com/..."
    }
  ],
  "message": "Safety videos fetched"
}
```

---

## 🔧 General Notes

### Authentication Flow
1. **Register** or **Login** to get access token
2. **Include token** in Authorization header for all protected routes
3. **Refresh token** when access token expires
4. **Logout** to invalidate tokens

### Error Responses
All endpoints return errors in this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

### Pagination
Endpoints that support pagination use these query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: varies by endpoint)

### File Upload
For file upload endpoints:
- Use `multipart/form-data` content type
- Maximum file size: 50MB
- Supported video formats: mp4, avi, mov, webm
- Supported image formats: jpeg, png, gif, webp

---

## 🧪 Testing in Postman

### Setup
1. Create a new Postman Collection
2. Add environment variables:
   - `base_url`: `http://localhost:8000/api/v1`
   - `access_token`: (will be set after login)
   - `refresh_token`: (will be set after login)

### Quick Start Test Flow

1. **Login as Admin:**
   ```
   POST {{base_url}}/user/login
   Body: {
     "email": "admin@suraksha.com",
     "password": "Admin@123"
   }
   ```
   Copy `accessToken` to environment variable

2. **Get Current User:**
   ```
   GET {{base_url}}/user/current-user
   Headers: Authorization: Bearer {{access_token}}
   ```

3. **Upload Worker Video:**
   ```
   POST {{base_url}}/worker-videos/upload
   Headers: Authorization: Bearer {{access_token}}
   Body (form-data):
     - file: <select video file>
     - title: "Test Safety Video"
     - description: "Test description"
     - category: "training"
   ```

4. **Like a Video:**
   ```
   POST {{base_url}}/likes/<videoId>/like
   Headers: Authorization: Bearer {{access_token}}
   ```

5. **Get Recommendations:**
   ```
   GET {{base_url}}/recommendations/videos
   Headers: Authorization: Bearer {{access_token}}
   ```

---

**Last Updated:** December 9, 2025  
**API Version:** 1.0  
**Backend:** Node.js + Express + MongoDB
