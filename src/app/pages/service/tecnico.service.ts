import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tecnico } from '../model/tecnico.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private baseUrl = `${environment.apiUrl}/tecnico`;

  constructor(private http: HttpClient) { }

  guardar(tecnico: Tecnico): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/guardar`, tecnico);
  }

  mostrar(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.baseUrl}/mostrar`);
  }

  mostrarPaginado(page: number = 0, size: number = 10): Observable<Tecnico[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Tecnico[]>(`${this.baseUrl}/mostrarpaginado`, { params });
  }

  longitud(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/longitud`);
  }

  mostrarHabilitados(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.baseUrl}/mostrarHabilitados`);
  }

  editar(id: number, tecnico: Tecnico): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/editar/${id}`, tecnico);
  }

  eliminar(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/eliminar/${id}`, {});
  }
}
