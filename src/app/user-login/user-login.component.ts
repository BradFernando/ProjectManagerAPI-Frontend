import { Component, Renderer2, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    const switchCtn = document.querySelector("#switch-cnt");
    const switchC1 = document.querySelector("#switch-c1");
    const switchC2 = document.querySelector("#switch-c2");
    const switchCircle = document.querySelectorAll(".switch__circle");
    const switchBtn = document.querySelectorAll(".switch-btn");
    const aContainer = document.querySelector("#a-container");
    const bContainer = document.querySelector("#b-container");
    const allButtons = document.querySelectorAll(".submit");

    const getButtons = (e: Event) => e.preventDefault();

    const changeForm = () => {
      switchCtn?.classList.add("is-gx");
      setTimeout(() => {
        switchCtn?.classList.remove("is-gx");
      }, 1500);

      switchCtn?.classList.toggle("is-txr");
      switchCircle[0]?.classList.toggle("is-txr");
      switchCircle[1]?.classList.toggle("is-txr");

      switchC1?.classList.toggle("is-hidden");
      switchC2?.classList.toggle("is-hidden");
      aContainer?.classList.toggle("is-txl");
      bContainer?.classList.toggle("is-txl");
      bContainer?.classList.toggle("is-z200");
    };

    allButtons.forEach(button => {
      this.renderer.listen(button, 'click', getButtons);
    });

    switchBtn.forEach(button => {
      this.renderer.listen(button, 'click', changeForm);
    });
  }
}
