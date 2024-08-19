import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRestorePasswordComponent } from './form-restore-password.component';

describe('FormRestorePasswordComponent', () => {
  let component: FormRestorePasswordComponent;
  let fixture: ComponentFixture<FormRestorePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRestorePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRestorePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
