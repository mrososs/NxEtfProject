import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomePageService } from '../../courses/services/home-page.service';
import {
  InstructorDetailsResponse,
  InstructorDetailsDisplay,
  CommunicationChannelDisplay,
} from './instructor-details.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-instructor-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './instructor-details.component.html',
  styleUrl: './instructor-details.component.scss',
})
export class InstructorDetailsComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _homePageService = inject(HomePageService);

  instructor!: InstructorDetailsDisplay;
  loading = true;
  error = false;
  instructorId!: number;

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.instructorId = +params['id'];
      this.loadInstructorDetails();
    });
  }

  private loadInstructorDetails(): void {
    this.loading = true;
    this.error = false;

    this._homePageService
      .getInstructorByIdFromApi(this.instructorId)
      .subscribe({
        next: (response: any) => {
          // Cast the response to our expected type
          const instructorResponse = response as InstructorDetailsResponse;
          this.instructor = this.transformInstructorData(instructorResponse);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching instructor details:', err);
          this.error = true;
          this.loading = false;
        },
      });
  }

  /**
   * Transform API response to display-friendly format
   */
  private transformInstructorData(
    response: InstructorDetailsResponse
  ): InstructorDetailsDisplay {
    return {
      id: response.id,
      name: response.name,
      title: response.title,
      mainSkill: response.mainSkill,
      about: response.about,
      imageURL: response.imageURL,
      imageAbsoluteUrl: response.imageAbsoluteUrl,
      communicationChannels: this.transformCommunicationChannels(
        response.communicationChannels
      ),
      courses: response.courses,
    };
  }

  /**
   * Transform communication channels to display format
   */
  private transformCommunicationChannels(
    channels: any
  ): CommunicationChannelDisplay[] {
    if (!channels?.$values) return [];

    return channels.$values.map((channel: any) => ({
      id: channel.id,
      name: channel.communicationChannel.name,
      link: channel.link,
      icon: this.getChannelIcon(channel.communicationChannel.name),
    }));
  }

  /**
   * Get appropriate icon for communication channel
   */
  private getChannelIcon(channelName: string): string {
    const iconMap: { [key: string]: string } = {
      Facebook: 'pi-facebook',
      Linkedin: 'pi-linkedin',
      Telephone: 'pi-phone',
      Email: 'pi-envelope',
      Twitter: 'pi-twitter',
      Instagram: 'pi-instagram',
      WhatsApp: 'pi-whatsapp',
      YouTube: 'pi-youtube',
    };

    return iconMap[channelName] || 'pi-link';
  }

  /**
   * Check if instructor has a valid image
   */
  hasValidImage(): boolean {
    return !!(
      this.instructor?.imageAbsoluteUrl &&
      this.instructor.imageAbsoluteUrl.trim() !== ''
    );
  }

  /**
   * Get instructor image URL
   */
  getInstructorImage(): string {
    return this.instructor?.imageAbsoluteUrl || this.instructor?.imageURL || '';
  }

  /**
   * Handle image loading error
   */
  onImageError(event: Event): void {
    console.log('Image failed to load:', event);
  }

  /**
   * Get formatted link for communication channel
   */
  getChannelLink(channel: CommunicationChannelDisplay): string {
    if (channel.name === 'Telephone') {
      return `tel:${channel.link}`;
    } else if (channel.name === 'Email') {
      return `mailto:${channel.link}`;
    } else if (channel.name === 'WhatsApp') {
      return `https://wa.me/${channel.link.replace(/[^0-9]/g, '')}`;
    } else {
      return channel.link;
    }
  }

  /**
   * Get display text for communication channel
   */
  getChannelDisplayText(channel: CommunicationChannelDisplay): string {
    if (channel.name === 'Telephone') {
      return channel.link;
    } else if (channel.name === 'Email') {
      return channel.link;
    } else if (channel.name === 'WhatsApp') {
      return channel.link;
    } else {
      return 'فتح الرابط';
    }
  }
}
