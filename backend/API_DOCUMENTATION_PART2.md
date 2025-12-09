# SURAKSHA-SATHI API Documentation - Part 2

**Continuation from Part 1**

---

## 11. Hazard Categories

### 11.1 Create Hazard Category

**Endpoint:** `POST /api/v1/hazard-categories`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Chemical Hazard",
  "description": "Hazards related to chemical exposure"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hazard category created",
  "data": {
    "_id": "category_id",
    "name": "Chemical Hazard",
    "description": "Hazards related to chemical exposure",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - Name is required
- `409` - Hazard category already exists

---

### 11.2 Get All Hazard Categories

**Endpoint:** `GET /api/v1/hazard-categories`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard categories fetched",
  "data": [
    {
      "_id": "category_id_1",
      "name": "Chemical Hazard",
      "description": "Hazards related to chemical exposure"
    },
    {
      "_id": "category_id_2",
      "name": "Physical Hazard",
      "description": "Hazards related to physical conditions"
    }
  ]
}
```

---

### 11.3 Get Hazard Category by ID

**Endpoint:** `GET /api/v1/hazard-categories/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category fetched",
  "data": {
    "_id": "category_id",
    "name": "Chemical Hazard",
    "description": "Hazards related to chemical exposure"
  }
}
```

---

### 11.4 Update Hazard Category

**Endpoint:** `PUT /api/v1/hazard-categories/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category updated",
  "data": {
    "_id": "category_id",
    "name": "Updated Category Name",
    "description": "Updated description"
  }
}
```

---

### 11.5 Delete Hazard Category

**Endpoint:** `DELETE /api/v1/hazard-categories/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category deleted",
  "data": {}
}
```

---

## 12. Severity Tags

### 12.1 Create Severity Tag

**Endpoint:** `POST /api/v1/severity-tags`  
**Authentication:** Required

**Request Body:**
```json
{
  "level": "Critical",
  "description": "Immediate action required"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Severity tag created",
  "data": {
    "_id": "tag_id",
    "level": "Critical",
    "description": "Immediate action required",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - Level is required
- `409` - Severity tag exists

---

### 12.2 Get All Severity Tags

**Endpoint:** `GET /api/v1/severity-tags`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Severity tags fetched",
  "data": [
    {
      "_id": "tag_id_1",
      "level": "Critical",
      "description": "Immediate action required"
    },
    {
      "_id": "tag_id_2",
      "level": "High",
      "description": "Action required within 24 hours"
    },
    {
      "_id": "tag_id_3",
      "level": "Medium",
      "description": "Action required within 1 week"
    },
    {
      "_id": "tag_id_4",
      "level": "Low",
      "description": "Monitor and address as needed"
    }
  ]
}
```

---

### 12.3 Get Severity Tag by ID

**Endpoint:** `GET /api/v1/severity-tags/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Severity tag fetched",
  "data": {
    "_id": "tag_id",
    "level": "Critical",
    "description": "Immediate action required"
  }
}
```

---

### 12.4 Update Severity Tag

**Endpoint:** `PUT /api/v1/severity-tags/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "level": "Updated Level",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Severity tag updated",
  "data": {
    "_id": "tag_id",
    "level": "Updated Level",
    "description": "Updated description"
  }
}
```

---

### 12.5 Delete Severity Tag

**Endpoint:** `DELETE /api/v1/severity-tags/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Severity tag deleted",
  "data": {}
}
```

---

## 13. Hazard Reports

### 13.1 Create Hazard Report

**Endpoint:** `POST /api/v1/hazard-reports`  
**Authentication:** Required

**Request Body:**
```json
{
  "user_id": "user_id_here",
  "reported_at": "2025-12-09T10:00:00.000Z",
  "location": "Mining Site A, Section 3",
  "category_id": "category_id_here",
  "severity_id": "severity_id_here",
  "description": "Exposed electrical wiring near water source",
  "notes": "Immediate attention required"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hazard report created",
  "data": {
    "_id": "report_id",
    "user_id": "user_id",
    "reported_at": "2025-12-09T10:00:00.000Z",
    "location": "Mining Site A, Section 3",
    "category_id": "category_id",
    "severity_id": "severity_id",
    "description": "Exposed electrical wiring near water source",
    "status": "open"
  }
}
```

**Possible Errors:**
- `400` - Missing mandatory fields

---

### 13.2 Get All Hazard Reports

**Endpoint:** `GET /api/v1/hazard-reports`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard reports fetched",
  "data": [
    {
      "_id": "report_id",
      "user_id": {
        "_id": "user_id",
        "fullName": "John Doe"
      },
      "reported_at": "2025-12-09T10:00:00.000Z",
      "location": "Mining Site A, Section 3",
      "category_id": {
        "_id": "category_id",
        "name": "Electrical Hazard"
      },
      "severity_id": {
        "_id": "severity_id",
        "level": "Critical"
      },
      "description": "Exposed electrical wiring near water source",
      "status": "open"
    }
  ]
}
```

---

### 13.3 Get Hazard Report by ID

**Endpoint:** `GET /api/v1/hazard-reports/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard report fetched",
  "data": {
    "_id": "report_id",
    "user_id": {
      "_id": "user_id",
      "fullName": "John Doe"
    },
    "reported_at": "2025-12-09T10:00:00.000Z",
    "location": "Mining Site A, Section 3",
    "category_id": {
      "_id": "category_id",
      "name": "Electrical Hazard"
    },
    "severity_id": {
      "_id": "severity_id",
      "level": "Critical"
    },
    "description": "Exposed electrical wiring near water source",
    "status": "open"
  }
}
```

---

### 13.4 Update Hazard Report

**Endpoint:** `PUT /api/v1/hazard-reports/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "status": "resolved",
  "description": "Updated description",
  "resolution_notes": "Wiring has been properly insulated and relocated"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard report updated",
  "data": {
    "_id": "report_id",
    "status": "resolved",
    "description": "Updated description",
    "resolution_notes": "Wiring has been properly insulated and relocated"
  }
}
```

---

### 13.5 Delete Hazard Report

**Endpoint:** `DELETE /api/v1/hazard-reports/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard report deleted",
  "data": {}
}
```

---

## 14. Hazard Media

### 14.1 Upload Hazard Media

**Endpoint:** `POST /api/v1/hazard-media/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: [Image/Video/Audio file]
report_id: "report_id_here"
media_type: "photo" (optional, auto-detected: photo/video/audio/file)
language_code: "en" (optional)
duration: 120 (optional, in seconds for video/audio)
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hazard media uploaded",
  "data": {
    "_id": "media_id",
    "report_id": "report_id",
    "media_type": "photo",
    "url": "https://res.cloudinary.com/.../hazard-photo.jpg",
    "language_code": "en",
    "file_size": 2457600,
    "mime_type": "image/jpeg",
    "createdAt": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - File not provided

---

### 14.2 Get All Hazard Media

**Endpoint:** `GET /api/v1/hazard-media`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard media fetched",
  "data": [
    {
      "_id": "media_id",
      "report_id": {
        "_id": "report_id",
        "description": "Exposed electrical wiring"
      },
      "media_type": "photo",
      "url": "https://res.cloudinary.com/.../hazard-photo.jpg",
      "file_size": 2457600
    }
  ]
}
```

---

### 14.3 Get Hazard Media by Report ID

**Endpoint:** `GET /api/v1/hazard-media/report/:reportId`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard media fetched for report",
  "data": [
    {
      "_id": "media_id",
      "report_id": "report_id",
      "media_type": "photo",
      "url": "https://res.cloudinary.com/.../hazard-photo.jpg",
      "createdAt": "2025-12-09T10:00:00.000Z"
    }
  ]
}
```

---

### 14.4 Get Hazard Media by ID

**Endpoint:** `GET /api/v1/hazard-media/:id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard media fetched",
  "data": {
    "_id": "media_id",
    "report_id": "report_id",
    "media_type": "photo",
    "url": "https://res.cloudinary.com/.../hazard-photo.jpg"
  }
}
```

---

### 14.5 Update Hazard Media

**Endpoint:** `PUT /api/v1/hazard-media/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Request Body:**
```json
{
  "media_type": "video",
  "language_code": "es"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard media updated",
  "data": {
    "_id": "media_id",
    "media_type": "video",
    "language_code": "es"
  }
}
```

---

### 14.6 Delete Hazard Media

**Endpoint:** `DELETE /api/v1/hazard-media/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard media deleted",
  "data": {}
}
```

---

## 15. Hazard Assignments

### 15.1 Create Hazard Assignment

**Endpoint:** `POST /api/v1/hazard-assignments`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "report_id": "report_id_here",
  "assigned_to_id": "user_id_here",
  "assigned_at": "2025-12-09T10:00:00.000Z",
  "due_date": "2025-12-16T10:00:00.000Z",
  "status": "pending"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hazard assigned successfully",
  "data": {
    "_id": "assignment_id",
    "report_id": "report_id",
    "assigned_to_id": "user_id",
    "assigned_at": "2025-12-09T10:00:00.000Z",
    "due_date": "2025-12-16T10:00:00.000Z",
    "status": "pending"
  }
}
```

**Possible Errors:**
- `400` - Missing required fields
- `409` - Report already assigned

---

### 15.2 Get Assignments by Report

**Endpoint:** `GET /api/v1/hazard-assignments/report/:report_id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignments for report fetched",
  "data": [
    {
      "_id": "assignment_id",
      "report_id": {
        "_id": "report_id",
        "description": "Exposed wiring"
      },
      "assigned_to_id": {
        "_id": "user_id",
        "fullName": "Safety Officer Name"
      },
      "assigned_at": "2025-12-09T10:00:00.000Z",
      "due_date": "2025-12-16T10:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

---

### 15.3 Update Hazard Assignment

**Endpoint:** `PUT /api/v1/hazard-assignments/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "status": "completed",
  "due_date": "2025-12-20T10:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard assignment updated",
  "data": {
    "_id": "assignment_id",
    "status": "completed",
    "due_date": "2025-12-20T10:00:00.000Z"
  }
}
```

---

### 15.4 Delete Hazard Assignment

**Endpoint:** `DELETE /api/v1/hazard-assignments/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard assignment deleted",
  "data": {}
}
```

---

## 16. Follow-Up Actions

### 16.1 Create Follow-Up Action

**Endpoint:** `POST /api/v1/follow-up-actions`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "report_id": "report_id_here",
  "action_by_id": "user_id_here",
  "action_date": "2025-12-09T10:00:00.000Z",
  "action_taken": "Installed new safety barriers",
  "notes": "Additional monitoring required"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Follow up action recorded",
  "data": {
    "_id": "action_id",
    "report_id": "report_id",
    "action_by_id": "user_id",
    "action_date": "2025-12-09T10:00:00.000Z",
    "action_taken": "Installed new safety barriers",
    "notes": "Additional monitoring required"
  }
}
```

**Possible Errors:**
- `400` - Missing required fields

---

### 16.2 Get Follow-Ups by Report

**Endpoint:** `GET /api/v1/follow-up-actions/report/:report_id`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Follow ups fetched",
  "data": [
    {
      "_id": "action_id",
      "report_id": {
        "_id": "report_id",
        "description": "Exposed wiring"
      },
      "action_by_id": {
        "_id": "user_id",
        "fullName": "Safety Officer"
      },
      "action_date": "2025-12-09T10:00:00.000Z",
      "action_taken": "Installed new safety barriers"
    }
  ]
}
```

---

### 16.3 Update Follow-Up Action

**Endpoint:** `PUT /api/v1/follow-up-actions/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Request Body:**
```json
{
  "action_taken": "Updated action description",
  "notes": "Updated notes"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Follow up action updated",
  "data": {
    "_id": "action_id",
    "action_taken": "Updated action description",
    "notes": "Updated notes"
  }
}
```

---

### 16.4 Delete Follow-Up Action

**Endpoint:** `DELETE /api/v1/follow-up-actions/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer, Manager

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Follow up action deleted",
  "data": {}
}
```

---

## 17. Hazard Audits

### 17.1 Create Hazard Audit

**Endpoint:** `POST /api/v1/hazard-audits`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Request Body:**
```json
{
  "report_id": "report_id_here",
  "event_type": "inspection",
  "user_id": "auditor_user_id",
  "event_timestamp": "2025-12-09T10:00:00.000Z",
  "details": "Conducted thorough inspection of the area"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hazard audit recorded",
  "data": {
    "_id": "audit_id",
    "report_id": "report_id",
    "event_type": "inspection",
    "user_id": "user_id",
    "event_timestamp": "2025-12-09T10:00:00.000Z",
    "details": "Conducted thorough inspection of the area"
  }
}
```

**Possible Errors:**
- `400` - Missing required fields

---

### 17.2 Get Audits by Report

**Endpoint:** `GET /api/v1/hazard-audits/report/:report_id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard audits fetched",
  "data": [
    {
      "_id": "audit_id",
      "report_id": {
        "_id": "report_id",
        "description": "Exposed wiring"
      },
      "event_type": "inspection",
      "user_id": {
        "_id": "user_id",
        "fullName": "Auditor Name"
      },
      "event_timestamp": "2025-12-09T10:00:00.000Z"
    }
  ]
}
```

---

### 17.3 Update Hazard Audit

**Endpoint:** `PUT /api/v1/hazard-audits/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Request Body:**
```json
{
  "details": "Updated audit details",
  "event_type": "follow_up"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard audit updated",
  "data": {
    "_id": "audit_id",
    "details": "Updated audit details",
    "event_type": "follow_up"
  }
}
```

---

### 17.4 Delete Hazard Audit

**Endpoint:** `DELETE /api/v1/hazard-audits/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Hazard audit deleted",
  "data": {}
}
```

---

## 18. Escalations

### 18.1 Create Escalation

**Endpoint:** `POST /api/v1/escalations`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Request Body:**
```json
{
  "report_id": "report_id_here",
  "escalation_stage": 2,
  "escalated_at": "2025-12-09T10:00:00.000Z"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Escalation recorded",
  "data": {
    "_id": "escalation_id",
    "report_id": "report_id",
    "escalation_stage": 2,
    "escalated_at": "2025-12-09T10:00:00.000Z"
  }
}
```

**Possible Errors:**
- `400` - Missing required fields

---

### 18.2 Get Escalations by Report

**Endpoint:** `GET /api/v1/escalations/report/:report_id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Escalations fetched",
  "data": [
    {
      "_id": "escalation_id",
      "report_id": "report_id",
      "escalation_stage": 2,
      "escalated_at": "2025-12-09T10:00:00.000Z"
    }
  ]
}
```

---

### 18.3 Update Escalation

**Endpoint:** `PUT /api/v1/escalations/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Request Body:**
```json
{
  "escalation_stage": 3,
  "escalated_at": "2025-12-10T10:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Escalation updated",
  "data": {
    "_id": "escalation_id",
    "escalation_stage": 3,
    "escalated_at": "2025-12-10T10:00:00.000Z"
  }
}
```

---

### 18.4 Delete Escalation

**Endpoint:** `DELETE /api/v1/escalations/:id`  
**Authentication:** Required  
**Roles:** Admin, SafetyOfficer

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Escalation deleted",
  "data": {}
}
```

---

**Continue to Part 3 for Videos, Social Features, and Notifications...**

---

**API Documentation - Part 2 of 3**
