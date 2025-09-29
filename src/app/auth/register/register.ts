import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../shared/services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  step = 1;
  emailForm: FormGroup;
  otpForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private cd: ChangeDetectorRef,   //  Added ChangeDetectorRef
    private router: Router,
    private toastr: ToastrService
  ) {
    // Step 1: Email form
    this.emailForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,   // Angular built-in validator
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/) // stricter regex
        ]
      ]
  });
  
    

    // Step 2: OTP + Password form
    this.otpForm = this.fb.group({
      otp: this.fb.array(Array(6).fill('').map(() => new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]$/)   // Only digits allowed
      ]))),
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Send OTP
  sendOtp() {
    if (this.emailForm.invalid) {
      this.toastr.warning('Enter a valid email');
      return;
    }
    const { email } = this.emailForm.value;
    this.authService.sendOtp({ email }).subscribe({
      next: (res) => {
        this.toastr.success(res?.message || 'OTP sent');
        this.step = 2;
        this.cd.detectChanges();   // Refresh UI after step change
      },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to send OTP')
    });
  }

  get otpControls(): FormControl[] {
    return (this.otpForm.get('otp') as FormArray).controls as FormControl[];
  }

  moveToNext(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < this.otpControls.length - 1) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  // Verify OTP + Register
  verifyAndRegister() {
    if (this.otpForm.invalid) {
      this.toastr.warning('Please complete the form properly');
      return;
    }

    const { email } = this.emailForm.value;
    const { password, confirmPassword } = this.otpForm.value;
    const otpValue = this.otpControls.map(c => c.value).join('');

    if (otpValue.length !== 6) {
      this.toastr.warning('Enter all 6 digits of OTP');
      return;
    }

    this.authService.verifyAndRegister({ email, otp: otpValue, password, confirmPassword }).subscribe({
      next: (res) => {
        this.toastr.success(res?.message || 'Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => this.toastr.error(err.error?.message || 'Registration failed')
    });
  }

  // Password validator
  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }
}
