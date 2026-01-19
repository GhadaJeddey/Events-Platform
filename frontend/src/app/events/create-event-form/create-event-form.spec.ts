import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEventForm } from './create-event-form';

describe('CreateEventForm', () => {
  let component: CreateEventForm;
  let fixture: ComponentFixture<CreateEventForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEventForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEventForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
