import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { Customermanagement } from './customermanagement';

describe('Customermanagement', () => {
  let component: Customermanagement;
  let fixture: ComponentFixture<Customermanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customermanagement],
      providers:[
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customermanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
