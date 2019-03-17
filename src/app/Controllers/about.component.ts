import { AuthApiService } from './../Services/AuthApiService';
import { Component, OnInit } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.css',
        '../Styles/menu.css',
        '../Styles/button.css']
})

export class AboutComponent implements OnInit {
    public serverversion;

    constructor(
        public checkService: CheckService,
        private headerService: HeaderService,
        private authService: AuthApiService
    ) {
        this.headerService.title = '关于';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    ngOnInit(): void {
        this.authService.Version().subscribe((data) => {
            this.serverversion = data['latestVersion'];
        });
    }
}
