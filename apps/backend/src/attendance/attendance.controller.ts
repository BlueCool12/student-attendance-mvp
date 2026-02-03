import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { FindAttendanceDto } from './dto/find-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post()
  record(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.updateRecord(createAttendanceDto);
  }

  @Get()
  findAll(@Query() query: FindAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  @Get('summary')
  getSummary(@Query() query: AttendanceSummaryDto) {
    return this.attendanceService.getSummary(query);
  }

}
