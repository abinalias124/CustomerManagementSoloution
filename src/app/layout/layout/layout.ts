import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  imports: [Header,Sidebar,Footer,RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

}
