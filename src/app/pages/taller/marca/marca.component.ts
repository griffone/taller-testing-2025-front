import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';

interface Marca {
    id: number;
    nombre: string;
    estado: string;
}

@Component({
    selector: 'app-marca',
    imports: [Panel, FormsModule, TableModule, InputTextModule, ButtonModule, DropdownModule], 
    templateUrl: './marca.component.html',
    styleUrl: './marca.component.scss'
})
export class MarcaComponent implements OnInit {
    marcas: Marca[] = [];
    newMarca: Partial<Marca> = {};
    nextId = 1;
    estadoOptions: any[] = [];

    ngOnInit(): void {
          this.estadoOptions = [
              { label: 'Activo', value: 'Activo' },
              { label: 'Inactivo', value: 'Inactivo' }
          ];
    }

    addMarca() {
        if (this.newMarca.nombre && this.newMarca.estado) {
            this.marcas.push({ id: this.nextId++, nombre: this.newMarca.nombre, estado: this.newMarca.estado });
            this.newMarca = {};
        }
    }

    editMarca(marca: Marca) {
        const nombre = prompt('Editar nombre de la marca:', marca.nombre);
        const estado = prompt('Editar estado de la marca (Activo/Inactivo):', marca.estado);
        if (nombre !== null && estado !== null && (estado === 'Activo' || estado === 'Inactivo')) {
            marca.nombre = nombre;
            marca.estado = estado;
        }
    }

    deleteMarca(id: number) {
        this.marcas = this.marcas.filter((marca) => marca.id !== id);
    }
}
