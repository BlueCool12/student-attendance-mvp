import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  name: string;
}
