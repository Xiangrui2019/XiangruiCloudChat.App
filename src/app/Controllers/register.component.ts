import { Component } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AiurCollection } from '../Models/AiurCollection';
import { catchError } from 'rxjs/operators';
import { InitService } from '../Services/InitService';

@Component({
    templateUrl: '../Views/register.html',
    styleUrls: ['../Styles/signin.css',
                '../Styles/button.css']
})
export class RegisterComponent {
    public email = '';
    public password = '';
    public confirmPassword = '';
    public connecting = false;
    public samePassword = true;

    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        private initService: InitService) { }

    public register(): void {
        if (this.connecting) {
            return;
        }
        this.connecting = true;
        this.authApiService.Register(this.email, this.password, this.confirmPassword)
            .pipe(catchError(error => {
                this.connecting = false;
                Swal.fire('网络错误', '无法连接到服务器.', 'error');
                return Promise.reject(error.message || error);
            }))
            .subscribe(t => {
                if (t.code === 0) {
                    this.authApiService.AuthByPassword(this.email, this.password)
                        .subscribe(p => {
                            if (p.code === 0) {
                                this.router.navigate(['/conversations'], {replaceUrl: true});
                                this.initService.init();
                            } else {
                                Swal.fire('注册失败', '出现未知错误, 无法注册.', 'error');
                            }
                        });
                } else if (t.code === -10) {
                    Swal.fire('注册失败', (t as AiurCollection<string>).items[0], 'error');
                } else {
                    Swal.fire('注册失败', t.message, 'error');
                }
                this.connecting = false;
            });
    }

    public checkSame(): void {
        const confirmInput = document.querySelector('#confirmInput');
        if (this.password === this.confirmPassword) {
            this.samePassword = true;
            confirmInput.classList.remove('invalid');
        } else {
            this.samePassword = false;
            confirmInput.classList.add('invalid');
        }
    }
}
