import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { Productlist } from './productlist';

describe('Productlist', () => {
  let component: Productlist;
  let fixture: ComponentFixture<Productlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Productlist],
      providers:[
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Productlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
