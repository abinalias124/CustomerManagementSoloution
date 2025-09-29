import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { Approverequest } from './approverequest';

describe('Approverequest', () => {
  let component: Approverequest;
  let fixture: ComponentFixture<Approverequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Approverequest],
      providers:[
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Approverequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
