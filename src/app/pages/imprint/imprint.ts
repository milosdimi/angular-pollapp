import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-imprint',
  imports: [Navbar, RouterLink],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
export class Imprint implements OnInit {
  private titleService = inject(Title);

  ngOnInit(): void {
    this.titleService.setTitle('Impressum – PollApp');
  }
}
