import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../Models/auth.models';
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
    // Initialize Form with all possible fields
    this.profileForm = this.fb.group({
      // Common Fields
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],

      // Password Fields (Optional)
      password: [''],
      confirmPassword: [''],

      // Student Fields
      major: [''],
      studentCardNumber: [''],

      // Organizer Fields
      organizerName: [''], // Club Name
      description: [''],
      website: ['']
    }, { validators: this.passwordMatchValidator }); // Add custom validator
  }

  ngOnInit(): void {
    this.loadRealUser();
  }

  // Custom Validator for Password Matching
  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    // Only return error if password is provided but doesn't match
    if (password && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
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
        next: (user: any) => { // Using 'any' to access nested profiles safely
          this.userId = typeof user.id === 'number' ? String(user.id) : user.id;
          this.userRole = user.role;

          // 1. Patch Common Fields
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '',       // Always clear password fields on load
            confirmPassword: ''
          });

          // 2. Patch Student Fields (if they exist)
          if (user.studentProfile) {
            this.profileForm.patchValue({
              major: user.studentProfile.major,
              studentCardNumber: user.studentProfile.studentCardNumber
            });
          }

          // 3. Patch Organizer Fields (if they exist)
          if (user.organizerProfile) {
            this.profileForm.patchValue({
              organizerName: user.organizerProfile.name,
              description: user.organizerProfile.description,
              website: user.organizerProfile.website
            });
          }
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
      this.loadRealUser(); // Revert changes if cancelled
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;

      // Construct Payload specifically for Backend DTO structure
      const payload: any = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email
      };

      // Only add password if user typed one
      if (formValue.password) {
        payload.password = formValue.password;
      }

      // Add Student Profile Data if Role is Student
      if (this.userRole === 'student') {
        payload.studentProfile = {
          major: formValue.major,
          studentCardNumber: formValue.studentCardNumber
        };
      }

      // Add Organizer Profile Data if Role is Organizer
      if (this.userRole === 'organizer' || this.userRole === 'club') {
        payload.organizerProfile = {
          name: formValue.organizerName,
          description: formValue.description,
          website: formValue.website
        };
      }

      this.isEditing = false;
      this.cd.detectChanges();

      this.userService.updateProfile(this.userId, payload).subscribe({
        next: (result) => {
          this.toastr.success('Profile updated successfully!', 'Success');
          // Update local storage name if needed, or reload
        },
        error: (err) => {
          this.isEditing = true;
          this.cd.detectChanges();
          this.toastr.error('Failed to update profile.', 'Error');
          console.error(err);
        }
      });
    } else {
        this.toastr.warning('Please check the form for errors', 'Invalid Form');
    }
  }
}
