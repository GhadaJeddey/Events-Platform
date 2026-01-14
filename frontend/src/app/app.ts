import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventList } from './events/event-list/event-list';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [Navbar, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Events Platform');
}