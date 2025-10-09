import { SalaryRecord } from '../models/salaryRecord.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create/Update salary record
const createOrUpdateSalary = asyncHandler(async (req, res) => {
  const { user_id, period_start, period_end, total_hours, gross_salary, deductions } = req.body;
  if (!user_id || !period_start || !period_end || total_hours === undefined || gross_salary === undefined) {
    throw new ApiError(400, "All mandatory fields required");
  }

  const net_salary = gross_salary - (deductions || 0);

  let salaryRecord = await SalaryRecord.findOneAndUpdate(
    { user_id, period_start, period_end },
    { total_hours, gross_salary, deductions, net_salary },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, salaryRecord, "Salary record saved"));
});

// Get salary records for user
const getSalaryRecordsForUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) throw new ApiError(400, "user_id required");

  const records = await SalaryRecord.find({ user_id }).sort({ period_start: -1 });
  res.status(200).json(new ApiResponse(200, records, "Salary records fetched"));
});

export { createOrUpdateSalary, getSalaryRecordsForUser };
