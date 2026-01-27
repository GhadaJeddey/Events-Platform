import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. IMPORT THIS
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../Models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  isEditing = false;
  userRole: string = '';
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef 
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadRealUser();
  }

  get avatarUrl(): string {
    const fName = this.profileForm.get('firstName')?.value || 'User';
    const lName = this.profileForm.get('lastName')?.value || '';
    return `https://ui-avatars.com/api/?background=random&name=${fName}+${lName}`;
  }

  loadRealUser() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const idToFetch = parsedUser.id;

      this.userService.getProfile(idToFetch).subscribe({
        next: (user: User) => {
          this.userId = typeof user.id === 'number' ? String(user.id) : user.id;
          this.userRole = user.role;

          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
        },
        error: (err) => {
          this.toastr.error('Could not load profile data', 'Error');
        }
      });
    } else {
       this.toastr.warning('Please log in to view your profile', 'Guest');
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadRealUser();
    }
  }

 saveProfile() {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      this.isEditing = false;
      this.cd.detectChanges();
      this.userService.updateProfile(this.userId, updatedData).subscribe({
        next: (result) => {
          this.toastr.success('Profile updated successfully!', 'Success');
        },
        error: (err) => {
          this.isEditing = true;
          this.cd.detectChanges();

          this.toastr.error('Failed to update profile. Please try again.', 'Error');
          console.error(err);
        }
      });
    } else {
        this.toastr.warning('Please check the form for errors', 'Invalid Form');
    }
  }
}
