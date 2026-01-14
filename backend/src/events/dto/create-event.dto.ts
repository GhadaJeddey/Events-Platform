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
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  @MinLength(10, { message: 'La description doit contenir au moins 10 caractères' })
  description: string;

  @IsDateString({}, { message: 'La date de début doit être valide' })
  startDate: string;

  @IsDateString({}, { message: 'La date de fin doit être valide' })
  endDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Le lieu est obligatoire' })
  @MaxLength(255)
  location: string;

  @IsInt({ message: 'La capacité doit être un nombre entier' })
  @Min(1, { message: 'La capacité doit être au moins 1' })
  @Type(() => Number)
  capacity: number;

  @IsOptional()
  @IsUrl({}, { message: "L'URL de l'image n'est pas valide" })
  imageUrl?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID du club invalide' })
  clubId?: string;

  // organizerId sera extrait du JWT (utilisateur connecté)
}