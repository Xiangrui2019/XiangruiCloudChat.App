import { Injectable } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import Swal from 'sweetalert2';
import { versions } from '../../environments/versions';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})

export class CheckService {
    public checking = false;
    public version = versions.version;
    public revision = versions.revision;
    public buildTime = versions.buildTime;

    constructor(
        private authApiService: AuthApiService,
        private _electronService: ElectronService
    ) {}

    public checkVersion(checkButton: boolean): void {
        this.checking = true;
        this.authApiService.Version()
            .subscribe(t => {
                const latestVersion: Array<string> = t.latestVersion.split('.');
                const currentVersion: Array<string> = versions.version.split('.');
                const downloadAddress: string = t.downloadAddress;
                if (latestVersion[0] > currentVersion[0]) {
                    this.redirectToDownload(downloadAddress);
                } else if (latestVersion[0] === currentVersion[0] && latestVersion[1] > currentVersion[1]) {
                    this.redirectToDownload(downloadAddress);
                } else if (latestVersion[0] === currentVersion[0] && latestVersion[1] === currentVersion[1]
                    && latestVersion[2] > currentVersion[2]) {
                    this.redirectToDownload(downloadAddress);
                } else if (checkButton) {
                    Swal.fire('成功', '您运行的是最新版本的祥瑞云易信', 'success');
                }
                this.checking = false;
            });
    }

    private redirectToDownload(downloadAddress: string): void {
        console.log(downloadAddress);
    }

    public openWebPage(url: string): void {
        if (this._electronService.isElectronApp) {
            this._electronService.shell.openExternal(url);
        } else {
            location.href = url;
        }
    }
}
