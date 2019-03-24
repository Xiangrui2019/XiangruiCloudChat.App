import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { Router } from '@angular/router';
import { Values } from '../values';
import { InitService } from '../Services/InitService';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';
import Swal from 'sweetalert2';
import { ElectronService } from 'ngx-electron';

@Component({
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css',
                '../Styles/badge.css']
})
export class SettingsComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        private initSerivce: InitService,
        public messageService: MessageService,
        private headerService: HeaderService,
        private _electronService: ElectronService) {
            this.headerService.title = '我的';
            this.headerService.returnButton = false;
            this.headerService.button = false;
            this.headerService.shadow = false;
        }

    public ngOnInit(): void {
        this.authApiService.Me().subscribe(p => {
            if (p.code === 0) {
                this.messageService.me = p.value;
                this.messageService.me.avatarURL = Values.fileAddress + p.value.headImgFileKey;
            }
        });
    }

    public SignOut(): void {
        Swal.fire({
            title: '是否要退出?',
            type: 'warning',
            showCancelButton: true
        }).then((willSignOut) => {
            if (willSignOut.value) {
                if (this._electronService.isElectronApp) {
                    this.callLogOffAPI(-1);
                    return;
                }
                const _this = this;
                navigator.serviceWorker.ready.then(function(reg) {
                    return reg.pushManager.getSubscription().then(function(subscription) {
                        let deviceID = localStorage.getItem('deviceID');
                        if (deviceID === null) {
                            deviceID = '-1';
                        }
                        if (subscription != null) {
                            subscription.unsubscribe().then().catch(function(e) {
                                console.log(e);
                            });
                        }
                        _this.callLogOffAPI(Number(deviceID));
                    });
                }.bind(_this));
            }
        });
    }

    private callLogOffAPI(deviceID: number): void {
        const _this = this;
        this.authApiService.LogOut(Number(deviceID)).subscribe({
            next() {
                _this.initSerivce.destroy();
                _this.router.navigate(['/signin'], {replaceUrl: true});
            },
            error(e) {
                Swal.fire('退出出现错误', e.message, 'error');
            }
        });
    }
}
