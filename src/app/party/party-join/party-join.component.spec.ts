import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyJoinComponent } from './party-join.component';

describe('PartyJoinComponent', () => {
  let component: PartyJoinComponent;
  let fixture: ComponentFixture<PartyJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartyJoinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
