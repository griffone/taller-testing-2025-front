import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModeloService {
    private baseUrl = 'http://localhost:8080/modelo';

    constructor(private http: HttpClient) {}

    guardar(modelo: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/guardar`, modelo);
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

    actualizar(id: number, modelo: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/editar/${id}`, modelo);
    }

    eliminar(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/eliminar/${id}`, {});
    }

    mostrarXMarca(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/mostrarXMarca/${id}`);
    }
}
