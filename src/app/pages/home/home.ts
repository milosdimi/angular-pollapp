import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
