import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit: "16kb"}))

// IMPORTANT: urlencoded middleware should NOT process multipart/form-data
// Only process application/x-www-form-urlencoded content type
app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.startsWith('multipart/form-data')) {
        // Skip urlencoded parsing for multipart - let multer handle it
        console.log('[APP] Skipping urlencoded for multipart/form-data');
        return next();
    }
    // Apply urlencoded parsing for other content types
    express.urlencoded({ extended: true, limit: "16kb" })(req, res, next);
});

app.use(express.static("public"));

app.use(cookieParser())

//Routes
import userRouter from './routes/user.routes.js'
import roleRouter from './routes/role.routes.js';
import taskRouter from './routes/task.routes.js';
import checklistRouter from './routes/checklist.routes.js';
import checklistItemRouter from './routes/checklistItem.routes.js';
import checklistItemMediaRouter from './routes/checklistItemMedia.routes.js';
import userTaskAssignmentRouter from './routes/userTaskAssignment.routes.js';
import safetyPromptRouter from './routes/safetyPrompt.routes.js';
import externalIntegrationRouter from './routes/externalIntegration.routes.js';
import safetyVideoRouter from './routes/safetyVideo.routes.js';
import dailyVideoRouter from './routes/dailyVideo.routes.js';
import hazardCategoryRouter from './routes/hazardCategory.routes.js';
import severityTagRouter from './routes/severityTag.routes.js';
import hazardReportRouter from './routes/hazardReport.routes.js';
import hazardMediaRouter from './routes/hazardMedia.routes.js';
import hazardAssignmentRouter from './routes/hazardAssignment.routes.js';
import followUpActionRouter from './routes/followUpAction.routes.js';
import hazardAuditRouter from './routes/hazardAudit.routes.js';
import notificationRouter from './routes/notification.routes.js';
import escalationRouter from './routes/escalation.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import payrollRouter from './routes/payroll.routes.js';
import pushSubscriptionRouter from './routes/pushSubscription.routes.js';
import workerVideoRouter from './routes/workerVideo.routes.js';
import likeRouter from './routes/like.routes.js';
import followRouter from './routes/follow.routes.js';
import recommendationRouter from './routes/recommendation.routes.js';



// http://localhost:8000/api/v1/users/
//routes declaration 
app.use("/api/v1/user", userRouter)
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/checklists', checklistRouter);
app.use('/api/v1/checklist-items', checklistItemRouter);
app.use('/api/v1/checklist-item-media', checklistItemMediaRouter);
app.use('/api/v1/assignments', userTaskAssignmentRouter);
app.use('/api/v1/prompts', safetyPromptRouter);
app.use('/api/v1/external-integrations', externalIntegrationRouter);
app.use('/api/v1/safety-videos', safetyVideoRouter);
app.use('/api/v1/daily-videos', dailyVideoRouter);
app.use('/api/v1/hazard-categories', hazardCategoryRouter);
app.use('/api/v1/severity-tags', severityTagRouter);
app.use('/api/v1/hazard-reports', hazardReportRouter);
app.use('/api/v1/hazard-media', hazardMediaRouter);
app.use('/api/v1/hazard-assignments', hazardAssignmentRouter);
app.use('/api/v1/follow-up-actions', followUpActionRouter);
app.use('/api/v1/hazard-audits', hazardAuditRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/escalations', escalationRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/payroll', payrollRouter);
app.use('/api/v1/push', pushSubscriptionRouter);
app.use('/api/v1/worker-videos', workerVideoRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/follows', followRouter);
app.use('/api/v1/recommendations', recommendationRouter);







// ============ ERROR HANDLING SECTION ===========
import { errorHandler } from './middlewares/error.middleware.js'

// Log all errors before passing to error handler
app.use((err, req, res, next) => {
    console.error('[APP ERROR]', err.message);
    console.error('[APP ERROR] Stack:', err.stack);
    next(err);
});

// IMPORTANT: Error handler must be registered AFTER all routes
// This catches any errors thrown by routes or other middleware
app.use(errorHandler)



export { app }