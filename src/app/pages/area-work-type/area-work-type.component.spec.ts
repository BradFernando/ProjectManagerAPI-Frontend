import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaWorkTypeComponent } from './area-work-type.component';

describe('AreaWorkTypeComponent', () => {
  let component: AreaWorkTypeComponent;
  let fixture: ComponentFixture<AreaWorkTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaWorkTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaWorkTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
