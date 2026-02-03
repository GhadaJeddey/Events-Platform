import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

}



