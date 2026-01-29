import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPassDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}