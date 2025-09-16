import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customermanagement } from './customermanagement';

describe('Customermanagement', () => {
  let component: Customermanagement;
  let fixture: ComponentFixture<Customermanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customermanagement]
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
