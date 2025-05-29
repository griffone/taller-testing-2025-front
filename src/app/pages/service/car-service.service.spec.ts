import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CarServiceService } from './car-service.service';
import { Servicio } from '../model/servicio.model';

describe('CarServiceService', () => {
  let service: CarServiceService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/servicio';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarServiceService]
    });
    service = TestBed.inject(CarServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should guardar a new servicio', () => {
    const mockServicio: Servicio = {
      nombre: 'Test Service',
      descripcion: 'Service Description',
      precio: 100
    };
    const mockResponse = { message: 'success' };

    service.guardar(mockServicio).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/guardar`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get all servicios', () => {
    const mockServicios: Servicio[] = [
      { id: 1, nombre: 'Service 1', descripcion: 'Description 1', precio: 100 },
      { id: 2, nombre: 'Service 2', descripcion: 'Description 2', precio: 200 }
    ];

    service.mostrar().subscribe(servicios => {
      expect(servicios).toEqual(mockServicios);
    });

    const req = httpMock.expectOne(`${baseUrl}/mostrar`);
    expect(req.request.method).toBe('GET');
    req.flush(mockServicios);
  });

  it('should get enabled servicios', () => {
    const mockServicios: Servicio[] = [
      { id: 1, nombre: 'Service 1', descripcion: 'Description 1', precio: 100, estado: true }
    ];

    service.mostrarHabilitados().subscribe(servicios => {
      expect(servicios).toEqual(mockServicios);
    });

    const req = httpMock.expectOne(`${baseUrl}/mostrarHabilitados`);
    expect(req.request.method).toBe('GET');
    req.flush(mockServicios);
  });

  it('should get paginated servicios', () => {
    const mockServicios: Servicio[] = [
      { id: 1, nombre: 'Service 1', descripcion: 'Description 1', precio: 100 }
    ];
    
    service.mostrarPaginado(0, 5).subscribe(servicios => {
      expect(servicios).toEqual(mockServicios);
    });

    const req = httpMock.expectOne(`${baseUrl}/mostrarpaginado?page=0&size=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockServicios);
  });

  it('should get total count of servicios', () => {
    const count = 5;
    
    service.longitud().subscribe(total => {
      expect(total).toEqual(count);
    });

    const req = httpMock.expectOne(`${baseUrl}/longitud`);
    expect(req.request.method).toBe('GET');
    req.flush(count);
  });

  it('should edit a servicio', () => {
    const mockServicio: Servicio = {
      id: 1,
      nombre: 'Updated Service',
      descripcion: 'Updated Description',
      precio: 150
    };
    const mockResponse = { message: 'success' };

    service.editar(1, mockServicio).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/editar/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should delete a servicio', () => {
    const mockResponse = { message: 'success' };

    service.eliminar(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/eliminar/1`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
