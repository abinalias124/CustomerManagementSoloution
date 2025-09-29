import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { Purchasetable } from './purchasetable';

describe('Purchasetable', () => {
  let component: Purchasetable;
  let fixture: ComponentFixture<Purchasetable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Purchasetable],
      providers:[
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideToastr(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Purchasetable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
