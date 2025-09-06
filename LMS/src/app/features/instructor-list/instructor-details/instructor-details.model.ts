// Communication Channel interfaces
export interface CommunicationChannel {
  id: number;
  name: string;
  communicationChannels: {
    $type: string;
    $values: any[];
  };
}

export interface TrainerCommunicationChannel {
  id: number;
  trainerId: number;
  communicationChannelId: number;
  communicationChannel: CommunicationChannel;
  link: string;
}

// Main Instructor Details interface matching the API response
export interface InstructorDetailsResponse {
  id: number;
  name: string;
  title: string;
  mainSkill: string;
  about: string;
  imageURL: string;
  imageAbsoluteUrl: string;
  communicationChannels: {
    $type: string;
    $values: TrainerCommunicationChannel[];
  };
  courses: any[] | null;
}

// UI-friendly interface for displaying instructor details
export interface InstructorDetailsDisplay {
  id: number;
  name: string;
  title: string;
  mainSkill: string;
  about: string;
  imageURL: string;
  imageAbsoluteUrl: string;
  communicationChannels: CommunicationChannelDisplay[];
  courses: any[] | null;
}

// Simplified interface for displaying communication channels
export interface CommunicationChannelDisplay {
  id: number;
  name: string;
  link: string;
  icon: string;
}
