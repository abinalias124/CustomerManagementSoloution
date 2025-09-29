import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { Returnrequest } from './returnrequest';

describe('Returnrequest', () => {
  let component: Returnrequest;
  let fixture: ComponentFixture<Returnrequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Returnrequest],
      providers:[
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Returnrequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
