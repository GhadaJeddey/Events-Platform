import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventApproval } from './event-approval';

describe('EventApproval', () => {
  let component: EventApproval;
  let fixture: ComponentFixture<EventApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
