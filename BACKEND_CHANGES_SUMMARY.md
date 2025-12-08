# Backend Changes for Multi-Media Hazard Reporting

## Summary of Changes

The backend has been updated to support **audio recordings** in addition to photos and videos for hazard reports.

---

## Files Modified

### ✅ 1. **`src/middlewares/upload.middleware.js`**

**Changes:**
- Added `audioDir` directory for storing audio files
- Updated `storage.destination` to handle audio files (`audio/` MIME types)
- Expanded `fileFilter` to accept audio formats:
  - `audio/mpeg` (MP3)
  - `audio/mp3`
  - `audio/wav`
  - `audio/ogg`
  - `audio/webm`
  - `audio/mp4`
- Added `image/webp` and `video/webm` for better browser support

**Why:** Frontend now sends audio recordings that need to be accepted by the backend.

---

### ✅ 2. **`src/models/hazardMedia.model.js`**

**Changes:**
- Added `duration` field (Number, optional) - stores audio/video duration in seconds
- Added `file_size` field (Number, optional) - stores file size in bytes
- Added `mime_type` field (String, optional) - stores original MIME type
- Updated comments to include 'audio' as a media type

**Why:** Need to store metadata about audio recordings (duration, size) for better UI/UX.

---

### ✅ 3. **`src/controllers/hazardMedia.controller.js`**

**Changes:**

#### `uploadHazardMedia` function:
- Updated Cloudinary upload to use `resource_type: 'auto'` (handles images, videos, AND audio)
- Added automatic media type detection from MIME type
- Now saves `duration`, `file_size`, and `mime_type` fields
- Better error handling for audio uploads

#### New function: `getHazardMediaByReportId`
- Fetches all media (photos, audio, video) for a specific report
- Useful for displaying all evidence together

**Why:** Backend needs to properly handle and store audio files with their metadata.

---

### ✅ 4. **`src/routes/hazardMedia.routes.js`**

**Changes:**
- Added new route: `GET /report/:reportId` to fetch all media for a report
- Imported and registered `getHazardMediaByReportId` controller

**Why:** Frontend needs an easy way to fetch all media attached to a hazard report.

---

## New Backend Capabilities

### Media Types Now Supported:
- ✅ **Photos** - JPEG, PNG, GIF, WebP
- ✅ **Videos** - MP4, AVI, MOV, WebM
- ✅ **Audio** - MP3, WAV, OGG, WebM, M4A

### New API Endpoint:
```
GET /api/v1/hazard-media/report/:reportId
```
Returns all media (photos, videos, audio) for a specific hazard report.

### Enhanced Upload Endpoint:
```
POST /api/v1/hazard-media/upload
```
**New Optional Fields:**
- `duration` - Duration in seconds (for audio/video)
- `media_type` - Explicitly set type: 'photo', 'video', or 'audio'

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', audioBlob);
formData.append('report_id', '507f1f77bcf86cd799439011');
formData.append('media_type', 'audio');
formData.append('duration', 45); // 45 seconds
```

---

## Database Schema Updates

### Before:
```javascript
{
  report_id: ObjectId,
  media_type: String,
  language_code: String,
  url: String
}
```

### After:
```javascript
{
  report_id: ObjectId,
  media_type: String,      // 'photo', 'video', 'audio'
  language_code: String,
  url: String,
  duration: Number,        // NEW - seconds (optional)
  file_size: Number,       // NEW - bytes (optional)
  mime_type: String        // NEW - 'audio/webm', etc. (optional)
}
```

**Note:** Existing data is compatible. New fields are optional and won't break existing records.

---

## Testing the Changes

### 1. Test Audio Upload:
```bash
curl -X POST http://localhost:8000/api/v1/hazard-media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@audio-recording.webm" \
  -F "report_id=507f1f77bcf86cd799439011" \
  -F "media_type=audio" \
  -F "duration=30"
```

### 2. Test Get Media by Report:
```bash
curl -X GET http://localhost:8000/api/v1/hazard-media/report/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Expected Response:
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "report_id": "507f1f77bcf86cd799439011",
      "media_type": "photo",
      "url": "https://cloudinary.com/...",
      "file_size": 245678,
      "mime_type": "image/jpeg"
    },
    {
      "_id": "...",
      "report_id": "507f1f77bcf86cd799439011",
      "media_type": "audio",
      "url": "https://cloudinary.com/...",
      "duration": 30,
      "file_size": 123456,
      "mime_type": "audio/webm"
    }
  ],
  "message": "Hazard media fetched for report"
}
```

---

## Cloudinary Configuration

**Important:** Ensure your Cloudinary account supports audio file uploads.

Cloudinary will automatically handle audio files when `resource_type: 'auto'` is set. Audio files are stored as "raw" resources in Cloudinary.

**No additional Cloudinary configuration needed!** ✅

---

## Migration Notes

### For Existing Data:
- No migration needed
- New fields (`duration`, `file_size`, `mime_type`) are optional
- Existing records without these fields will continue to work

### For Production Deployment:
1. Deploy backend changes
2. Restart server
3. Create `src/media/audio/` directory (automatically created by middleware)
4. Test with a sample audio upload
5. Verify Cloudinary is accepting audio files

---

## Frontend Integration

The frontend (`report.html`) is already configured to send:
- `file` - The audio Blob
- `report_id` - Associated report ID
- `media_type` - Set to 'audio'
- `duration` - Recording duration in seconds

**No additional frontend changes needed!** ✅

---

## Security Considerations

### File Size Limits:
- Maximum: 50MB (configured in `upload.middleware.js`)
- Audio recordings are typically 1-5MB
- Can be adjusted if needed

### Allowed Audio Formats:
- ✅ WebM (recommended - best browser support)
- ✅ MP3
- ✅ WAV
- ✅ OGG
- ✅ M4A/MP4
- ❌ Other formats rejected

### Authentication:
- All upload endpoints require JWT token
- Role-based access: Admin, SafetyOfficer, Worker

---

## Performance Impact

- **Minimal** - Audio files are typically small (1-5MB)
- Cloudinary handles transcoding and optimization
- File size metadata helps track storage usage
- No impact on existing photo/video uploads

---

## Troubleshooting

### Issue: "Unsupported file type" error
**Solution:** Check that audio MIME type is in allowed list

### Issue: Cloudinary upload fails for audio
**Solution:** Verify Cloudinary account supports raw file uploads

### Issue: Duration not saved
**Solution:** Ensure frontend sends `duration` field as number

---

## Summary

✅ Backend now fully supports **audio recordings**  
✅ Automatic media type detection  
✅ Metadata storage (duration, size, MIME type)  
✅ New endpoint to fetch all media by report  
✅ Backward compatible with existing data  
✅ No breaking changes  
✅ Ready for production!

---

**Total Changes:** 4 files modified  
**New Files:** 0  
**Breaking Changes:** None  
**Database Migration Required:** No
