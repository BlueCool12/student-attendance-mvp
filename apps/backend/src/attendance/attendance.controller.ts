import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateBulkAttendanceDto } from './dto/create-bulk-attendance.dto';
import { FindAttendanceDto } from './dto/find-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { FindAttendanceLogsDto } from './dto/find-attendance-logs.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Get()
  findAll(@Query() query: FindAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  @Get('summary')
  getSummary(@Query() query: AttendanceSummaryDto) {
    return this.attendanceService.getSummary(query);
  }

  @Get('logs')
  getLogs(@Query() queryDto: FindAttendanceLogsDto) {
    return this.attendanceService.findLogs(queryDto);
  }

  @Post()
  record(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.upsert(createAttendanceDto);
  }

  @Post('bulk')
  recordBulk(@Body() createBulkAttendanceDto: CreateBulkAttendanceDto) {
    return this.attendanceService.bulkUpdate(createBulkAttendanceDto);
  }
}
