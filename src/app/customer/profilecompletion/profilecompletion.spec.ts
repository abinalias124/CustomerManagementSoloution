import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profilecompletion } from './profilecompletion';

describe('Profilecompletion', () => {
  let component: Profilecompletion;
  let fixture: ComponentFixture<Profilecompletion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profilecompletion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profilecompletion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
