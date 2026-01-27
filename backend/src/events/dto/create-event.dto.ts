import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoomLocation } from 'src/common/enums/room-location.enum';

export class CreateEventDto {
  @ApiProperty({
    example: 'Séminaire Angular',
    description: "Titre de l'évènement",
  })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title: string;

  @ApiProperty({
    example: 'Apprendre les bases de NestJS...',
    description: 'Description détaillée',
  })
  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  @MinLength(10, {
    message: 'La description doit contenir au moins 10 caractères',
  })
  description: string;

  @ApiProperty({ example: '2026-06-15T10:00:00Z' })
  @IsDateString({}, { message: 'La date de début doit être valide' })
  startDate: string;

  @ApiProperty({ example: '2026-06-15T18:00:00Z' })
  @IsDateString({}, { message: 'La date de fin doit être valide' })
  endDate: string;

  @ApiProperty({
    enum: RoomLocation,
    example: RoomLocation.AUDITORIUM,
    description: "Lieu de l'évènement (choisir parmi la liste)",
  })
  @IsNotEmpty({ message: 'Le lieu est obligatoire' })
  @IsEnum(RoomLocation, {
    message: `Le lieu doit être valide (ex: ${Object.values(RoomLocation).join(', ')})`,
  })
  location: RoomLocation;

  @ApiProperty({ example: 100, description: 'Nombre maximum de participants' })
  @IsInt({ message: 'La capacité doit être un nombre entier' })
  @Min(1, { message: 'La capacité doit être au moins 1' })
  @Type(() => Number)
  capacity: number;

  @ApiProperty({ required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl({}, { message: "L'URL de l'image n'est pas valide" })
  imageUrl?: string;

  @ApiProperty({
    required: false,
    example: '00000000-0000-0000-0000-000000000001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID du club invalide' })
  organizerId?: string;
  
}
