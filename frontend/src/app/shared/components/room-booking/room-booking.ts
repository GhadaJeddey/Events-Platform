import { Component, inject, signal, computed, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../services/events';

interface TimeSlot {
  time: string;
  available: boolean;
  room: string | null;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  dayNumber: number;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-room-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-booking.html',
  styleUrl: './room-booking.css'
})
export class RoomBookingComponent {
  private eventsService = inject(EventsService);

  // Inputs
  selectedDate = input<Date>(new Date());
  availableRooms = input<string[]>([]);
  
  // Outputs
  slotSelected = output<{ date: Date; startTime: string; endTime: string; room: string }>();
  close = output<void>();

  // State
  currentWeekStart = signal<Date>(this.getWeekStart(new Date()));
  selectedRoom = signal<string | null>(null);
  selectedSlotStart = signal<string | null>(null);
  selectedSlotEnd = signal<string | null>(null);
  isLoading = signal(false);
  occupiedSlots = signal<any[]>([]);

  // Time slots de 8h à 20h par tranches de 30 min
  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  private toLocalDateTimeString(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Génère le calendrier de la semaine
  weekDays = computed<DaySchedule[]>(() => {
    const start = this.currentWeekStart();
    const days: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      days.push({
        date,
        dayName: this.getDayName(date),
        dayNumber: date.getDate(),
        slots: this.timeSlots.map(time => ({
          time,
          available: this.isSlotAvailable(date, time),
          room: null
        }))
      });
    }
    
    return days;
  });

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Commence le lundi
    return new Date(d.setDate(diff));
  }

  private getDayName(date: Date): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[date.getDay()];
  }

  private isSlotAvailable(date: Date, time: string): boolean {
    // Vérifie si le créneau est dans le futur
    const now = new Date();
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    if (slotDateTime <= now) return false;

    // Vérifie si le créneau est occupé par un événement
    const occupied = this.occupiedSlots();
    for (const event of occupied) {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Vérifie si le créneau chevauche cet événement
      if (slotDateTime >= eventStart && slotDateTime < eventEnd) {
        return false;
      }
    }
    
    return true;
  }

  previousWeek() {
    const current = this.currentWeekStart();
    current.setDate(current.getDate() - 7);
    this.currentWeekStart.set(new Date(current));
    
    // Recharger les créneaux pour la nouvelle semaine
    const room = this.selectedRoom();
    if (room) {
      this.loadOccupiedSlots(room);
    }
  }

  nextWeek() {
    const current = this.currentWeekStart();
    current.setDate(current.getDate() + 7);
    this.currentWeekStart.set(new Date(current));
    
    // Recharger les créneaux pour la nouvelle semaine
    const room = this.selectedRoom();
    if (room) {
      this.loadOccupiedSlots(room);
    }
  }

  selectSlot(day: DaySchedule, timeIndex: number) {
    const startSlot = this.selectedSlotStart();
    const selectedRoom = this.selectedRoom();

    if (!selectedRoom) {
      alert('Veuillez d\'abord sélectionner une salle');
      return;
    }

    const time = this.timeSlots[timeIndex];

    if (!startSlot) {
      // Première sélection - début du créneau
      this.selectedSlotStart.set(time);
    } else {
      // Deuxième sélection - fin du créneau
      const startIndex = this.timeSlots.indexOf(startSlot);
      
      if (timeIndex <= startIndex) {
        // Reset si on clique avant le début
        this.selectedSlotStart.set(time);
        this.selectedSlotEnd.set(null);
      } else {
        // Valider la sélection
        this.selectedSlotEnd.set(time);
        
        const startDateTime = new Date(day.date);
        const [startHours, startMinutes] = startSlot.split(':').map(Number);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        const endDateTime = new Date(day.date);
        const [endHours, endMinutes] = time.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 0, 0);

        // Émettre la sélection
        this.slotSelected.emit({
          date: day.date,
          startTime: this.toLocalDateTimeString(startDateTime),
          endTime: this.toLocalDateTimeString(endDateTime),
          room: selectedRoom
        });
      }
    }
  }

  isSlotSelected(day: DaySchedule, time: string): boolean {
    const start = this.selectedSlotStart();
    const end = this.selectedSlotEnd();
    
    if (!start) return false;
    
    const timeIndex = this.timeSlots.indexOf(time);
    const startIndex = this.timeSlots.indexOf(start);
    const endIndex = end ? this.timeSlots.indexOf(end) : startIndex;
    
    return timeIndex >= startIndex && timeIndex <= endIndex;
  }

  isSlotStartOrEnd(day: DaySchedule, time: string): 'start' | 'end' | null {
    if (time === this.selectedSlotStart()) return 'start';
    if (time === this.selectedSlotEnd()) return 'end';
    return null;
  }

  onRoomChange() {
    // Reset la sélection quand on change de salle
    this.selectedSlotStart.set(null);
    this.selectedSlotEnd.set(null);
    
    // Charger les créneaux occupés pour cette salle
    const room = this.selectedRoom();
    if (room) {
      this.loadOccupiedSlots(room);
    }
  }

  loadOccupiedSlots(room: string) {
    this.isLoading.set(true);
    
    // Calculer la plage de dates (semaine actuelle)
    const weekStart = this.currentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    this.eventsService.getRoomSlots(
      room,
      this.toLocalDateTimeString(weekStart),
      this.toLocalDateTimeString(weekEnd)
    )
      .subscribe({
        next: (slots) => {
          this.occupiedSlots.set(slots);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading occupied slots:', err);
          this.occupiedSlots.set([]);
          this.isLoading.set(false);
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
}
