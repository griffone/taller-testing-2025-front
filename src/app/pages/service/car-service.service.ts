import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../model/servicio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarServiceService {
  private baseUrl = environment.apiUrl+'/servicio';

  constructor(private http: HttpClient) { }

  guardar(servicio: Servicio): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/guardar`, servicio);
  }

  mostrar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.baseUrl}/mostrar`);
  }

  mostrarHabilitados(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.baseUrl}/mostrarHabilitados`);
  }

  mostrarPaginado(page: number = 0, size: number = 10): Observable<Servicio[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Servicio[]>(`${this.baseUrl}/mostrarpaginado`, { params });
  }

  longitud(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/longitud`);
  }

  editar(id: number, servicio: Servicio): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/editar/${id}`, servicio);
  }

  eliminar(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/eliminar/${id}`, null);
  }
}
