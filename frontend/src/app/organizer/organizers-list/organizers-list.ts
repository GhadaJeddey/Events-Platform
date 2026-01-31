import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrganizersService } from '../../services/organizers.service';
import { Organizer } from '../../Models/Organizer';

@Component({
    selector: 'app-organizers-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './organizers-list.html',
    styleUrl: './organizers-list.css'
})
export class OrganizersList implements OnInit {
    private organizersService = inject(OrganizersService);
    
    organizers = signal<Organizer[]>([]);
    isLoading = signal<boolean>(true);

    ngOnInit() {
        this.loadOrganizers();
    }

    loadOrganizers() {
        this.organizersService.getAllOrganizers().subscribe({
            next: (data) => {
                this.organizers.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.isLoading.set(false);
            }
        });
    }
}

