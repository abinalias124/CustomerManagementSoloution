import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-profilecompletion',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './profilecompletion.html',
  styleUrl: './profilecompletion.css'
})
export class Profilecompletion {
  profileForm!: FormGroup;
  postOffices: any[] = [];
  loading = false;
  today: string = new Date().toISOString().split('T')[0];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check query params for edit mode
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.isEditMode = true;  // flag for template button text
        this.loadUserProfile();  // fetch user data and pre-fill the form
      }
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      address: ['', [Validators.required, Validators.maxLength(300)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      stateId: ['', Validators.required],
      stateName: [''],
      districtId: ['', Validators.required],
      districtName: [''],
      postOfficeId: ['', Validators.required]
    });
  }

  // Only triggered when user types a new pincode
  onPincodeChange(pincode: string): void {
    if (!pincode || pincode.length !== 6) return;

    this.auth.getPincodeDetails(pincode).subscribe({
      next: (res: any) => {
        if (res && res.StateId) {
          this.postOffices = res.PostOffices || [];
          this.profileForm.patchValue({
            stateId: res.StateId,
            stateName: res.StateName,
            districtId: res.DistrictId,
            districtName: res.DistrictName,
          });
          this.profileForm.get('pincode')?.setErrors(null);
        } else {
          this.profileForm.get('pincode')?.setErrors({ notFound: true });
          this.postOffices = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.profileForm.get('pincode')?.setErrors({ notFound: true });
        this.postOffices = [];
        this.cdr.detectChanges();
      }
    });
  }

  // Load user data when edit mode
  loadUserProfile(): void {
    this.auth.getMyProfile().subscribe({
      next: (res: any) => {
        if (res) {
          this.profileForm.patchValue({
            fullName: res.FullName || '',
            dateOfBirth: res.DateOfBirth ? res.DateOfBirth.split('T')[0] : '',
            gender: res.Gender || '',
            phoneNumber: res.PhoneNumber || '',
            address: res.Address || '',
            pincode: res.Pincode || '',
            stateId: res.StateId || '',
            stateName: res.StateName || '',
            districtId: res.DistrictId || '',
            districtName: res.DistrictName || '',
            postOfficeId: res.PostOfficeId || ''
          });

          if (res.Pincode) this.onPincodeChange(res.Pincode);

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.toastr.error('Failed to load profile info');
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Please fill all required fields correctly', 'Error');
      return;
    }
  
    this.loading = true;
    this.cdr.detectChanges();
  
    const payload = {
      fullName: this.profileForm.value.fullName,
      phoneNumber: this.profileForm.value.phoneNumber,
      address: this.profileForm.value.address,
      stateId: this.profileForm.value.stateId,
      districtId: this.profileForm.value.districtId,
      pincode: this.profileForm.value.pincode,
      postOfficeId: this.profileForm.value.postOfficeId,
      dateOfBirth: this.profileForm.value.dateOfBirth,
      gender: this.profileForm.value.gender
    };
  
    this.auth.completeProfile(payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || (this.isEditMode ? 'Profile updated successfully!' : 'Profile saved successfully!'), 'Success');
  
        // Clear form and postOffices after success
        // this.profileForm.reset();
        this.postOffices = [];
  
        if (!this.isEditMode) {
          // First-time save → navigate to checkout
          this.router.navigate(['/customer/viewproduct']);
        }
  
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to save profile', 'Error');
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  
  
  
}
