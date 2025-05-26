import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Auto {
  id?: number;
  patente: string;
  marca?: any; // Para compatibilidad
  modelo: any; // Cambio a objeto para reflejar el uso real
  anio: number;
  estado?: boolean;
  cliente?: any; // Añadido porque se usa en el template
}

@Injectable({
  providedIn: 'root'
})
export class AutoService {
  private baseUrl = 'http://localhost:8080/auto';

  constructor(private http: HttpClient) { }

  getMostrarPaginado(page: number = 0, size: number = 10): Observable<Auto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Auto[]>(`${this.baseUrl}/mostrarpaginado`, { params });
  }

  buscarPorPatente(patente: string): Observable<Auto[]> {
    return this.http.get<Auto[]>(`${this.baseUrl}/mostrar/${patente}`);
  }

  getLongitud(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/longitud`);
  }

  guardar(auto: Auto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/guardar`, auto);
  }

  getMostrar(): Observable<Auto[]> {
    return this.http.get<Auto[]>(`${this.baseUrl}/mostrar`);
  }

  getMostrarHabilitados(): Observable<Auto[]> {
    return this.http.get<Auto[]>(`${this.baseUrl}/mostrarHabilitados`);
  }

  editar(id: number, auto: Auto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/editar/${id}`, auto);
  }

  eliminar(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/eliminar/${id}`, null);
  }
}
