import { AiurProtocal } from './../Models/AiurProtocal';
import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';

@Injectable()
export class HomeApiService {
    private static serverPath = '/home';

    constructor(private apiService: ApiService) {  }

    public Ping(): Observable<AiurProtocal> {
        return this.apiService.Get(HomeApiService.serverPath + '/Ping');
    }
}