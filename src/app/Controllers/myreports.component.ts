import { Component, OnDestroy, OnInit } from '@angular/core';
import {AuthApiService} from '../Services/AuthApiService';
import {HeaderService} from '../Services/HeaderService';
import Swal from 'sweetalert2';

@Component({
    templateUrl: '../Views/myreports.html',
    styleUrls: ['../Styles/myreports.css',
        '../Styles/button.css']
})
export class MyReportsComponent implements OnInit, OnDestroy {
    public reports = [];

    constructor(
        private authApiService: AuthApiService,
        public headerService: HeaderService
    ) {
        this.headerService.title = '我收到的私信';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    ngOnInit(): void {
        this.authApiService.MyReports().subscribe((data) => {
            this.reports = data['value'];
        });
    }

    public showdetil(message: string): void {
        Swal.fire('成功', `本条私信信息: ${message}`, 'success');
    }

    ngOnDestroy(): void {
        this.reports = [];
    }
}
