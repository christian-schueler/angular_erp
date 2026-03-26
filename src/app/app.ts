<<<<<<< HEAD
import { Component } from '@angular/core';
=======
import { Component, signal } from '@angular/core';
>>>>>>> f630513 (initial commit)
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
<<<<<<< HEAD
  template: '<router-outlet />',
})
export class App {}
=======
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-erp');
}
>>>>>>> f630513 (initial commit)
