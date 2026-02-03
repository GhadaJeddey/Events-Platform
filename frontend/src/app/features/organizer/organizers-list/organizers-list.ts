import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrganizersService } from '../../../services/organizers.service';
import { Organizer } from '../../../shared/models/Organizer';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { SearchComponent } from '../../../shared/components/search/search';

@Component({
    selector: 'app-organizers-list',
    standalone: true,
    imports: [CommonModule, RouterLink, LoaderComponent, TruncatePipe, SearchComponent],
    templateUrl: './organizers-list.html',
    styleUrl: './organizers-list.css'
})
export class OrganizersList implements OnInit {
    private organizersService = inject(OrganizersService);
    
    organizers = signal<Organizer[]>([]);
    searchTerm = signal<string>('');
    isLoading = signal<boolean>(true);

    filteredOrganizers = computed(() => {
        const term = this.searchTerm().toLowerCase();
        const orgs = this.organizers();
        if (!term) return orgs;
        
        return orgs.filter(org => 
            org.name.toLowerCase().includes(term) ||
            (org.description && org.description.toLowerCase().includes(term))
        );
    });

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

    onSearch(term: string) {
        this.searchTerm.set(term);
    }
}

