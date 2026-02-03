import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  name: string;
}
