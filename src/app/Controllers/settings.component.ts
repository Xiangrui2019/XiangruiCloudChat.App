import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { Router } from '@angular/router';
import { Values } from '../values';
import { InitService } from '../Services/InitService';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';
import Swal from 'sweetalert2';
import { ElectronService } from 'ngx-electron';
import { HomeApiService } from '../Services/HomeApiService';

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
        private _electronService: ElectronService,
        private homeApiService: HomeApiService) {
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

    public pingnetwork(): void {
        const success = (_data) => {
            Swal.fire('很棒', '您的网络连接正常', 'success');
        };
        const error = (_err) => {
            Swal.fire('错误', '您的网络连接出现了问题', 'error');
        };
        this.homeApiService.Ping().subscribe(success, error);
    }

    public share() {
        // tslint:disable-next-line:max-line-length
        const message = `您好, 您的好友${this.messageService.me.nickName} 推荐您使用祥瑞云易信, 已获得更加优秀的安全通信和用户体验. 请使用Chrome Firefox打开 http://t.cn/EJPUpCN 使用.`;

        Swal.fire('成功', '请复制下面的文字, 使用短信或其他方式发送给您的好友!', 'success')
            .then(() => {
                Swal.fire('请复制文字', message, 'success');
            });
    }
}
