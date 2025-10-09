import { Attendance } from '../models/attendance.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Clock-in endpoint
const clockIn = asyncHandler(async (req, res) => {
  const { user_id, shift_date } = req.body;
  if (!user_id || !shift_date) throw new ApiError(400, "user_id and shift_date required");

  const existing = await Attendance.findOne({ user_id, shift_date });
  if (existing) throw new ApiError(409, "Already checked in for this shift");

  const attendance = await Attendance.create({
    user_id,
    check_in_time: new Date(),
    shift_date,
    status: 'present'
  });

  res.status(201).json(new ApiResponse(201, attendance, "Checked in successfully"));
});

// Clock-out endpoint
const clockOut = asyncHandler(async (req, res) => {
  const { user_id, shift_date } = req.body;
  if (!user_id || !shift_date) throw new ApiError(400, "user_id and shift_date required");

  const attendance = await Attendance.findOne({ user_id, shift_date });
  if (!attendance) throw new ApiError(404, "No check-in record found");

  if (attendance.check_out_time) throw new ApiError(409, "Already checked out");

  attendance.check_out_time = new Date();
  await attendance.save();

  res.status(200).json(new ApiResponse(200, attendance, "Checked out successfully"));
});

// Fetch attendance for user over date range
const getAttendanceForUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { start, end } = req.query;
  if (!user_id) throw new ApiError(400, "user_id is required");

  const filter = { user_id };
  if (start && end) {
    filter.shift_date = { $gte: new Date(start), $lte: new Date(end) };
  }

  const attendanceRecords = await Attendance.find(filter).sort({ shift_date: -1 });
  res.status(200).json(new ApiResponse(200, attendanceRecords, "Attendance records fetched"));
});

export { clockIn, clockOut, getAttendanceForUser };
