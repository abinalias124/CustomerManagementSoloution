import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewproduct } from './viewproduct';

describe('Viewproduct', () => {
  let component: Viewproduct;
  let fixture: ComponentFixture<Viewproduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewproduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Viewproduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
