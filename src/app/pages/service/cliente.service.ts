import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../model/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:8080/cliente';

  constructor(private http: HttpClient) { }

  mostrarPaginado(page: number, size: number): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/mostrarpaginado`, { params: { page: page.toString(), size: size.toString() } });
  }

  longitud(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/longitud`);
  }

  buscarPorAtributo(nombre: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/mostrar/${nombre}`);
  }

  guardar(cliente: Cliente): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/guardar`, cliente);
  }

  mostrar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/mostrar`);
  }

  actualizar(id: number, cliente: Cliente): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/editar/${id}`, cliente);
  }

  mostrarHabilitados(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/mostrarHabilitados`);
  }

  eliminar(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/eliminar/${id}`, {});
  }
}
