import { Component, OnInit } from '@angular/core';
// import { CheckService } from '../Services/CheckService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/news.html',
    styleUrls: [
        '../Styles/news.css',
        '../Styles/menu.css',
        '../Styles/button.css'
    ]
})

export class NewsComponent implements OnInit {
    constructor(
        private headerService: HeaderService
    ) {
        this.headerService.title = '新闻';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    ngOnInit(): void {
    }
}
