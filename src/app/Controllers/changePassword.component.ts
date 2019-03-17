import { Component } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/changePassword.html',
    styleUrls: [
      '../Styles/userDetail.css',
      '../Styles/button.css'
    ]
})
export class ChangePasswordComponent {
    public oldPassword = '';
    public newPassword = '';
    public confirmPassword = '';
    public samePassword = false;
    private valid = false;

    constructor(
        private authApiServer: AuthApiService,
        private headerService: HeaderService
    ) {
        this.headerService.title = '修改密码';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    public checkValid(): void {
        this.samePassword = this.newPassword === this.confirmPassword ? true : false;
        if (this.oldPassword.length >= 6 && this.oldPassword.length <= 32 && this.newPassword.length >= 6 &&
            this.newPassword.length <= 32 && this.samePassword) {
                this.valid = true;
        }
    }

    public onSubmit(): void {
        this.checkValid();
        if (!this.samePassword) {
            Swal.fire('新密码和确认密码不匹配!', 'error');
        }
        if (!this.valid && this.samePassword) {
            Swal.fire('密码的长度在 6 - 100之间');
        }
        if (this.valid) {
            this.authApiServer.ChangePassword(this.oldPassword, this.newPassword, this.confirmPassword)
            .pipe(catchError(error => {
                Swal.fire('网络错误！', '无法连接到服务器.', 'error');
                return Promise.reject(error.message || error);
            }))
            .subscribe(result => {
                if (result.code === 0) {
                    Swal.fire('成功', result.message, 'success');
                } else {
                    Swal.fire('请重试', result.message, 'error');
                }
            });
        }
    }
}
