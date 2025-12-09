# SURAKSHA-SATHI API Documentation - Part 3

**Continuation from Part 2**

---

## 19. Safety Videos

### 19.1 Upload Safety Video

**Endpoint:** `POST /api/v1/safety-videos/upload`  
**Authentication:** Required  
**Roles:** Admin, TrainingOfficer  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
video: [Video file]
title: "Fire Safety Training"
description: "Comprehensive fire safety procedures"
category: "Fire Safety"
duration: 600 (optional, in seconds)
external_integration_id: "integration_id" (optional)
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Safety video uploaded successfully",
  "data": {
    "_id": "video_id",
    "title": "Fire Safety Training",
    "description": "Comprehensive fire safety procedures",
    "url": "https://res.cloudinary.com/.../safety-video.mp4",
    "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
    "category": "Fire Safety",
    "duration": 600,
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - File not provided

---

### 19.2 Get All Safety Videos

**Endpoint:** `GET /api/v1/safety-videos`  
**Authentication:** Required

**Query Parameters:**
- `category` (optional) - Filter by category

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Safety videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Fire Safety Training",
      "description": "Comprehensive fire safety procedures",
      "url": "https://res.cloudinary.com/.../safety-video.mp4",
      "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
      "category": "Fire Safety",
      "duration": 600
    }
  ]
}
```

---

### 19.3 Get Safety Video by ID

**Endpoint:** `GET /api/v1/safety-videos/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Safety video fetched",
  "data": {
    "_id": "video_id",
    "title": "Fire Safety Training",
    "description": "Comprehensive fire safety procedures",
    "url": "https://res.cloudinary.com/.../safety-video.mp4",
    "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
    "category": "Fire Safety"
  }
}
```

---

### 19.4 Update Safety Video

**Endpoint:** `PUT /api/v1/safety-videos/:id`  
**Authentication:** Required  
**Roles:** Admin, TrainingOfficer

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Updated Category"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Safety video updated",
  "data": {
    "_id": "video_id",
    "title": "Updated Title",
    "description": "Updated description",
    "category": "Updated Category"
  }
}
```

---

### 19.5 Delete Safety Video

**Endpoint:** `DELETE /api/v1/safety-videos/:id`  
**Authentication:** Required  
**Roles:** Admin, TrainingOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Safety video deleted",
  "data": {}
}
```

---

## 20. Daily Videos

### 20.1 Assign Daily Video

**Endpoint:** `POST /api/v1/daily-videos`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "video_id": "safety_video_id",
  "assigned_date": "2025-12-09"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Daily video assigned",
  "data": {
    "_id": "daily_video_id",
    "user_id": "user_id",
    "video_id": "video_id",
    "assigned_date": "2025-12-09",
    "watched": false
  }
}
```

---

### 20.2 Get Daily Videos for User

**Endpoint:** `GET /api/v1/daily-videos/:user_id`  
**Authentication:** Required

**Query Parameters:**
- `date` (optional) - Filter by specific date

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Daily videos fetched",
  "data": [
    {
      "_id": "daily_video_id",
      "user_id": "user_id",
      "video_id": {
        "_id": "video_id",
        "title": "Fire Safety Training",
        "url": "https://..."
      },
      "assigned_date": "2025-12-09",
      "watched": false
    }
  ]
}
```

---

### 20.3 Mark Video as Watched

**Endpoint:** `PUT /api/v1/daily-videos/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "watched_at": "2025-12-09T10:30:00.000Z",
  "watch_duration": 580
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Daily video updated",
  "data": {
    "_id": "daily_video_id",
    "watched": true,
    "watched_at": "2025-12-09T10:30:00.000Z",
    "watch_duration": 580
  }
}
```

---

## 21. Worker Videos

### 21.1 Upload Worker Video

**Endpoint:** `POST /api/v1/worker-videos/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
video: [Video file] (field name can be anything)
title: "Safety Best Practice Demo"
description: "Demonstrating proper use of safety equipment"
category: "Safety Practices"
duration: 180 (optional)
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Worker video uploaded successfully",
  "data": {
    "_id": "video_id",
    "title": "Safety Best Practice Demo",
    "description": "Demonstrating proper use of safety equipment",
    "url": "https://res.cloudinary.com/.../worker-video.mp4",
    "thumbnail_url": "https://res.cloudinary.com/.../thumbnail.jpg",
    "uploaded_by": "user_id",
    "category": "Safety Practices",
    "approval_status": "pending",
    "moderation_status": "pending",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - File not provided or title missing

---

### 21.2 Get My Uploaded Videos

**Endpoint:** `GET /api/v1/worker-videos/my-videos`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Worker videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Safety Best Practice Demo",
      "url": "https://res.cloudinary.com/.../worker-video.mp4",
      "thumbnail_url": "https://...",
      "approval_status": "pending",
      "moderation_status": "approved",
      "likes_count": 0,
      "views_count": 0
    }
  ]
}
```

---

### 21.3 Get Approved Videos (Public Feed)

**Endpoint:** `GET /api/v1/worker-videos/approved`  
**Authentication:** Required

**Query Parameters:**
- `category` (optional) - Filter by category
- `sort` (optional) - Sort by: 'recent', 'popular', 'trending'
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Example:** `GET /api/v1/worker-videos/approved?category=Safety&sort=popular&page=1&limit=20`

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Approved worker videos fetched",
  "data": {
    "videos": [
      {
        "_id": "video_id",
        "title": "Safety Best Practice Demo",
        "description": "Demonstrating proper use of safety equipment",
        "url": "https://res.cloudinary.com/.../worker-video.mp4",
        "thumbnail_url": "https://...",
        "uploaded_by": {
          "_id": "user_id",
          "fullName": "John Doe",
          "username": "johndoe"
        },
        "category": "Safety Practices",
        "likes_count": 45,
        "views_count": 230,
        "approval_status": "approved",
        "createdAt": "2025-12-09T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

---

### 21.4 Get Pending Videos (Admin Review)

**Endpoint:** `GET /api/v1/worker-videos/pending`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Pending videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Safety Best Practice Demo",
      "url": "https://res.cloudinary.com/.../worker-video.mp4",
      "uploaded_by": {
        "_id": "user_id",
        "fullName": "John Doe"
      },
      "approval_status": "pending",
      "moderation_status": "approved",
      "moderation_summary": {
        "is_appropriate": true,
        "confidence_score": 0.95
      }
    }
  ]
}
```

---

### 21.5 Get All Videos (Admin)

**Endpoint:** `GET /api/v1/worker-videos/all`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Query Parameters:**
- `status` (optional) - Filter by approval_status: 'pending', 'approved', 'rejected'

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Worker videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Safety Best Practice Demo",
      "approval_status": "pending",
      "moderation_status": "approved",
      "uploaded_by": {
        "fullName": "John Doe"
      }
    }
  ]
}
```

---

### 21.6 Approve Video

**Endpoint:** `POST /api/v1/worker-videos/:id/approve`  
**Authentication:** Required  
**Custom Middleware:** requireApprovalPermission

**Request Body:**
```json
{
  "approval_notes": "Great demonstration of safety procedures"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Video approved successfully",
  "data": {
    "_id": "video_id",
    "approval_status": "approved",
    "approved_by": "admin_user_id",
    "approved_at": "2025-12-09T10:00:00.000Z",
    "approval_notes": "Great demonstration of safety procedures"
  }
}
```

---

### 21.7 Reject Video

**Endpoint:** `POST /api/v1/worker-videos/:id/reject`  
**Authentication:** Required  
**Custom Middleware:** requireApprovalPermission

**Request Body:**
```json
{
  "rejection_reason": "Video quality is too low, please re-record"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Video rejected",
  "data": {
    "_id": "video_id",
    "approval_status": "rejected",
    "rejected_by": "admin_user_id",
    "rejected_at": "2025-12-09T10:00:00.000Z",
    "rejection_reason": "Video quality is too low, please re-record"
  }
}
```

---

### 21.8 Get Auto-Rejected Videos

**Endpoint:** `GET /api/v1/worker-videos/moderation/auto-rejected`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Auto-rejected videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Video Title",
      "moderation_status": "auto_rejected",
      "moderation_summary": {
        "is_appropriate": false,
        "rejection_reason": "Inappropriate content detected",
        "confidence_score": 0.98
      }
    }
  ]
}
```

---

### 21.9 Get Flagged Videos

**Endpoint:** `GET /api/v1/worker-videos/moderation/flagged`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Flagged videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Video Title",
      "moderation_status": "flagged",
      "moderation_summary": {
        "is_appropriate": false,
        "flags": ["potential_violence", "unsafe_practices"]
      }
    }
  ]
}
```

---

### 21.10 Get Moderation Stats

**Endpoint:** `GET /api/v1/worker-videos/moderation/stats`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Moderation stats fetched",
  "data": {
    "total_videos": 500,
    "pending_moderation": 15,
    "auto_approved": 450,
    "auto_rejected": 20,
    "flagged": 10,
    "manual_review_needed": 5
  }
}
```

---

### 21.11 Get Worker Video by ID

**Endpoint:** `GET /api/v1/worker-videos/:id`  
**Authentication:** Required  
**Custom Middleware:** requireApprovedVideo (for non-admin users)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Worker video fetched",
  "data": {
    "_id": "video_id",
    "title": "Safety Best Practice Demo",
    "description": "Demonstrating proper use of safety equipment",
    "url": "https://res.cloudinary.com/.../worker-video.mp4",
    "thumbnail_url": "https://...",
    "uploaded_by": {
      "_id": "user_id",
      "fullName": "John Doe",
      "username": "johndoe"
    },
    "likes_count": 45,
    "views_count": 231,
    "approval_status": "approved"
  }
}
```

---

### 21.12 Update Worker Video

**Endpoint:** `PUT /api/v1/worker-videos/:id`  
**Authentication:** Required (Must be video owner)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Updated Category"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Worker video updated",
  "data": {
    "_id": "video_id",
    "title": "Updated Title",
    "description": "Updated description",
    "category": "Updated Category"
  }
}
```

---

### 21.13 Delete Worker Video

**Endpoint:** `DELETE /api/v1/worker-videos/:id`  
**Authentication:** Required (Owner or Admin)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Worker video deleted",
  "data": {}
}
```

---

## 22. Likes

### 22.1 Like a Video

**Endpoint:** `POST /api/v1/likes/:videoId/like`  
**Authentication:** Required

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Video liked successfully",
  "data": {
    "_id": "like_id",
    "user_id": "user_id",
    "video_id": "video_id",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `409` - Already liked this video

---

### 22.2 Unlike a Video

**Endpoint:** `DELETE /api/v1/likes/:videoId/unlike`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Video unliked successfully",
  "data": {}
}
```

---

### 22.3 Get My Liked Videos

**Endpoint:** `GET /api/v1/likes/my-liked-videos`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Liked videos fetched",
  "data": [
    {
      "_id": "like_id",
      "video_id": {
        "_id": "video_id",
        "title": "Safety Best Practice Demo",
        "url": "https://...",
        "uploaded_by": {
          "fullName": "John Doe"
        }
      },
      "createdAt": "2025-12-09T10:00:00.000Z"
    }
  ]
}
```

---

### 22.4 Get Likes for a Video

**Endpoint:** `GET /api/v1/likes/:videoId/likes`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Likes fetched",
  "data": {
    "total_likes": 45,
    "likes": [
      {
        "_id": "like_id",
        "user_id": {
          "_id": "user_id",
          "fullName": "Jane Smith",
          "username": "janesmith"
        },
        "createdAt": "2025-12-09T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 22.5 Check if Liked

**Endpoint:** `GET /api/v1/likes/:videoId/check`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Like status checked",
  "data": {
    "isLiked": true,
    "like_id": "like_id"
  }
}
```

---

### 22.6 Get Popular Videos

**Endpoint:** `GET /api/v1/likes/popular/videos`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional) - Number of videos (default: 10)
- `timeframe` (optional) - 'day', 'week', 'month', 'all' (default: 'all')

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Popular videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Safety Best Practice Demo",
      "url": "https://...",
      "thumbnail_url": "https://...",
      "uploaded_by": {
        "fullName": "John Doe"
      },
      "likes_count": 120,
      "views_count": 500
    }
  ]
}
```

---

## 23. Follows

### 23.1 Follow a User

**Endpoint:** `POST /api/v1/follows/:userId/follow`  
**Authentication:** Required

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User followed successfully",
  "data": {
    "_id": "follow_id",
    "follower_id": "your_user_id",
    "following_id": "followed_user_id",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - Cannot follow yourself
- `409` - Already following this user

---

### 23.2 Unfollow a User

**Endpoint:** `DELETE /api/v1/follows/:userId/unfollow`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User unfollowed successfully",
  "data": {}
}
```

---

### 23.3 Get User's Followers

**Endpoint:** `GET /api/v1/follows/:userId/followers`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Followers fetched",
  "data": {
    "total_followers": 25,
    "followers": [
      {
        "_id": "follow_id",
        "follower_id": {
          "_id": "user_id",
          "fullName": "Jane Smith",
          "username": "janesmith"
        },
        "createdAt": "2025-12-09T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 23.4 Get User's Following

**Endpoint:** `GET /api/v1/follows/:userId/following`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Following fetched",
  "data": {
    "total_following": 15,
    "following": [
      {
        "_id": "follow_id",
        "following_id": {
          "_id": "user_id",
          "fullName": "John Doe",
          "username": "johndoe"
        },
        "createdAt": "2025-12-09T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 23.5 Get My Followers

**Endpoint:** `GET /api/v1/follows/my/followers`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "My followers fetched",
  "data": {
    "total_followers": 30,
    "followers": [
      {
        "_id": "user_id",
        "fullName": "Jane Smith",
        "username": "janesmith"
      }
    ]
  }
}
```

---

### 23.6 Get My Following

**Endpoint:** `GET /api/v1/follows/my/following`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "My following fetched",
  "data": {
    "total_following": 20,
    "following": [
      {
        "_id": "user_id",
        "fullName": "John Doe",
        "username": "johndoe"
      }
    ]
  }
}
```

---

### 23.7 Check Follow Status

**Endpoint:** `GET /api/v1/follows/:userId/check`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Follow status checked",
  "data": {
    "isFollowing": true,
    "follow_id": "follow_id"
  }
}
```

---

### 23.8 Get User Profile with Stats

**Endpoint:** `GET /api/v1/follows/:userId/profile`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "username": "johndoe"
    },
    "stats": {
      "followers_count": 150,
      "following_count": 75,
      "videos_count": 25,
      "total_likes": 500
    },
    "isFollowing": false
  }
}
```

---

### 23.9 Get Suggested Users to Follow

**Endpoint:** `GET /api/v1/follows/suggestions/users`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional) - Number of suggestions (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User suggestions fetched",
  "data": [
    {
      "_id": "user_id",
      "fullName": "Jane Smith",
      "username": "janesmith",
      "followers_count": 200,
      "videos_count": 30
    }
  ]
}
```

---

## 24. Recommendations

### 24.1 Get Recommended Videos

**Endpoint:** `GET /api/v1/recommendations/videos`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional) - Number of recommendations (default: 20)
- `category` (optional) - Filter by category

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Recommended videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Safety Best Practice Demo",
      "url": "https://...",
      "thumbnail_url": "https://...",
      "uploaded_by": {
        "fullName": "John Doe",
        "username": "johndoe"
      },
      "likes_count": 45,
      "views_count": 230,
      "recommendation_score": 0.95
    }
  ]
}
```

---

### 24.2 Get Personalized Feed

**Endpoint:** `GET /api/v1/recommendations/feed`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional) - Videos per page (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Personalized feed fetched",
  "data": {
    "videos": [
      {
        "_id": "video_id",
        "title": "Safety Best Practice Demo",
        "url": "https://...",
        "uploaded_by": {
          "fullName": "John Doe"
        },
        "likes_count": 45,
        "isLiked": false,
        "isFollowing": true
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

### 24.3 Get Similar Videos

**Endpoint:** `GET /api/v1/recommendations/similar/:videoId`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional) - Number of similar videos (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Similar videos fetched",
  "data": [
    {
      "_id": "video_id",
      "title": "Advanced Safety Techniques",
      "url": "https://...",
      "thumbnail_url": "https://...",
      "uploaded_by": {
        "fullName": "Jane Smith"
      },
      "category": "Safety Practices",
      "similarity_score": 0.88
    }
  ]
}
```

---

## 25. Notifications

### 25.1 Create Notification

**Endpoint:** `POST /api/v1/notifications`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "title": "Safety Alert",
  "message": "New hazard reported in your area",
  "type": "hazard_alert",
  "priority": "high"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Notification created",
  "data": {
    "_id": "notification_id",
    "user_id": "user_id",
    "title": "Safety Alert",
    "message": "New hazard reported in your area",
    "type": "hazard_alert",
    "priority": "high",
    "read": false,
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

---

### 25.2 Get User Notifications

**Endpoint:** `GET /api/v1/notifications/user/:user_id`  
**Authentication:** Required

**Query Parameters:**
- `read_status` (optional) - 'read', 'unread', 'all' (default: 'all')
- `type` (optional) - Filter by notification type

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications fetched",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "title": "Safety Alert",
        "message": "New hazard reported in your area",
        "type": "hazard_alert",
        "priority": "high",
        "read": false,
        "createdAt": "2025-12-09T10:00:00.000Z"
      }
    ],
    "unread_count": 5,
    "total_count": 25
  }
}
```

---

### 25.3 Mark Notification as Read

**Endpoint:** `PUT /api/v1/notifications/:id/read`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": {
    "_id": "notification_id",
    "read": true,
    "read_at": "2025-12-09T10:30:00.000Z"
  }
}
```

---

## 26. Push Notifications

### 26.1 Get VAPID Public Key

**Endpoint:** `GET /api/v1/push/public-key`  
**Authentication:** None (Public)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "VAPID public key fetched",
  "data": {
    "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtmcsz..."
  }
}
```

---

### 26.2 Subscribe to Push Notifications

**Endpoint:** `POST /api/v1/push/subscribe`  
**Authentication:** Required

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BGgP3...",
      "auth": "F8t..."
    }
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Push subscription saved",
  "data": {
    "_id": "subscription_id",
    "user_id": "user_id",
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

---

### 26.3 Unsubscribe from Push Notifications

**Endpoint:** `POST /api/v1/push/unsubscribe`  
**Authentication:** Required

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Push subscription removed",
  "data": {}
}
```

---

### 26.4 Get User Subscriptions

**Endpoint:** `GET /api/v1/push/subscriptions`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subscriptions fetched",
  "data": [
    {
      "_id": "subscription_id",
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "createdAt": "2025-12-09T10:00:00.000Z"
    }
  ]
}
```

---

### 26.5 Send Test Notification

**Endpoint:** `POST /api/v1/push/test`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Test notification sent",
  "data": {
    "sent_count": 2,
    "failed_count": 0
  }
}
```

---

### 26.6 Send Notification to User

**Endpoint:** `POST /api/v1/push/send`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "title": "Safety Alert",
  "message": "Immediate evacuation required",
  "data": {
    "type": "emergency",
    "url": "/emergency/details"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification sent",
  "data": {
    "sent_count": 3,
    "failed_count": 0
  }
}
```

---

### 26.7 Cleanup Invalid Subscriptions

**Endpoint:** `DELETE /api/v1/push/cleanup`  
**Authentication:** Required  
**Roles:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invalid subscriptions cleaned up",
  "data": {
    "removed_count": 15
  }
}
```

---

## 27. Safety Prompts

### 27.1 Schedule Safety Prompt

**Endpoint:** `POST /api/v1/prompts`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "prompt_text": "Remember to wear safety goggles",
  "schedule_time": "2025-12-09T08:00:00.000Z",
  "priority": "medium"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Safety prompt scheduled",
  "data": {
    "_id": "prompt_id",
    "user_id": "user_id",
    "prompt_text": "Remember to wear safety goggles",
    "schedule_time": "2025-12-09T08:00:00.000Z",
    "priority": "medium",
    "status": "scheduled"
  }
}
```

---

### 27.2 Get User Prompts

**Endpoint:** `GET /api/v1/prompts/:user_id`  
**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status: 'scheduled', 'sent', 'acknowledged'
- `date` (optional) - Filter by date

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Safety prompts fetched",
  "data": [
    {
      "_id": "prompt_id",
      "prompt_text": "Remember to wear safety goggles",
      "schedule_time": "2025-12-09T08:00:00.000Z",
      "priority": "medium",
      "status": "scheduled"
    }
  ]
}
```

---

### 27.3 Update Prompt Status

**Endpoint:** `PUT /api/v1/prompts/:id/status`  
**Authentication:** Required

**Request Body:**
```json
{
  "status": "acknowledged",
  "acknowledged_at": "2025-12-09T08:05:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Prompt status updated",
  "data": {
    "_id": "prompt_id",
    "status": "acknowledged",
    "acknowledged_at": "2025-12-09T08:05:00.000Z"
  }
}
```

---

## 28. External Integrations

### 28.1 Create External Integration

**Endpoint:** `POST /api/v1/external-integrations`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "YouTube Integration",
  "type": "video_platform",
  "api_endpoint": "https://www.googleapis.com/youtube/v3",
  "api_key": "your_api_key_here"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "External Integration created",
  "data": {
    "_id": "integration_id",
    "name": "YouTube Integration",
    "type": "video_platform",
    "api_endpoint": "https://www.googleapis.com/youtube/v3",
    "status": "active"
  }
}
```

---

### 28.2 Get All External Integrations

**Endpoint:** `GET /api/v1/external-integrations`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "External integrations fetched",
  "data": [
    {
      "_id": "integration_id",
      "name": "YouTube Integration",
      "type": "video_platform",
      "api_endpoint": "https://www.googleapis.com/youtube/v3",
      "status": "active"
    }
  ]
}
```

---

### 28.3 Get External Integration by ID

**Endpoint:** `GET /api/v1/external-integrations/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "External integration fetched",
  "data": {
    "_id": "integration_id",
    "name": "YouTube Integration",
    "type": "video_platform",
    "api_endpoint": "https://www.googleapis.com/youtube/v3",
    "status": "active"
  }
}
```

---

### 28.4 Update External Integration

**Endpoint:** `PUT /api/v1/external-integrations/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Integration Name",
  "api_endpoint": "https://new-endpoint.com/api",
  "status": "inactive"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "External integration updated",
  "data": {
    "_id": "integration_id",
    "name": "Updated Integration Name",
    "api_endpoint": "https://new-endpoint.com/api",
    "status": "inactive"
  }
}
```

---

### 28.5 Delete External Integration

**Endpoint:** `DELETE /api/v1/external-integrations/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "External integration deleted",
  "data": {}
}
```

---

## Summary

**Total Endpoints:** 190+  
**Total Modules:** 28

### Quick Reference by Role

**Public (No Auth):**
- Register, Login, Refresh Token
- Get VAPID Public Key

**All Authenticated Users:**
- Profile management
- Task assignments
- Attendance
- View approved videos
- Like/Follow/Comment
- Upload worker videos
- View hazards (own)

**Admin:**
- Full CRUD on all resources
- User management
- Role management
- Video approval
- Moderation controls
- Push notifications to users

**SafetyOfficer:**
- Hazard management
- Video approval
- Safety video management
- Moderation controls

**Manager:**
- User management (limited)
- Task assignments
- Checklist management
- Hazard review

**TrainingOfficer:**
- Safety video management
- Daily video assignments

---

**End of API Documentation**

**Last Updated:** December 9, 2025  
**Version:** 1.0.0

For support or issues, please contact the development team.
