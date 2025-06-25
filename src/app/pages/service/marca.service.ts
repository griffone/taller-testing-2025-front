import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MarcaService {
    private baseUrl = environment.apiUrl+'/marca';

    constructor(private http: HttpClient) {}

    guardar(marca: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/guardar`, marca);
    }

    mostrar(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/mostrar`);
    }

    mostrarHabilitados(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/mostrarHabilitados`);
    }

    mostrarPaginado(page: number = 0, size: number = 10): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/mostrarpaginado?page=${page}&size=${size}`);
    }

    longitud(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/longitud`);
    }

    actualizar(id: number, marca: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/editar/${id}`, marca);
    }

    eliminar(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/eliminar/${id}`, {});
    }
}
