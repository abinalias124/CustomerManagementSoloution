import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';


import { Login } from './login';
import { provideToastr } from 'ngx-toastr';
import { provideRouter } from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers:[
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize form with empty fields', () => {
    const form = component.loginForm;
  
    // Check that form exists
    expect(form).toBeDefined();
  
    // Check initial values
    expect(form.get('email')?.value).toBe('');
    expect(form.get('password')?.value).toBe('');
  
    // Form should be invalid initially because both fields are required
    expect(form.valid).toBeFalse();
  });


  it('should toggle showPassword when togglePassword is called', () => {
    // Initial state should be false
    expect(component.showPassword).toBeFalse();
  
    // Call the method once
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  
    // Call the method again
    component.togglePassword();
    expect(component.showPassword).toBeFalse();
  });


  
    
});
