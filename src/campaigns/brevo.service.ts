import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BrevoContact {
  email: string;
  attributes?: {
    NAME?: string;
    PHONE?: string;
    [key: string]: any;
  };
}

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private readonly brevoApiKey: string;
  private readonly brevoApiUrl = 'https://api.brevo.com/v3';

  constructor(private configService: ConfigService) {
    this.brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!this.brevoApiKey) {
      this.logger.warn('BREVO_API_KEY is not configured');
    }
  }

  private async makeBrevoRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
  ): Promise<any> {
    if (!this.brevoApiKey) {
      throw new HttpException(
        'Brevo API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = `${this.brevoApiUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'api-key': this.brevoApiKey,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        this.logger.error(
          `Brevo API error: ${response.status} - ${JSON.stringify(data)}`,
        );
        throw new HttpException(
          data.message || 'Brevo API request failed',
          response.status,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Brevo API request failed: ${error.message}`);
      throw new HttpException(
        'Failed to communicate with Brevo API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createList(name: string, description?: string): Promise<string> {
    try {
      const body = {
        name,
        folderId: 1, // Default folder
      };

      const response = await this.makeBrevoRequest(
        '/contacts/lists',
        'POST',
        body,
      );

      this.logger.log(`Created Brevo list: ${name} with ID: ${response.id}`);
      return response.id.toString();
    } catch (error) {
      this.logger.error(`Failed to create Brevo list: ${error.message}`);
      throw error;
    }
  }

  async updateList(
    listId: string,
    name: string,
    description?: string,
  ): Promise<void> {
    try {
      const body = {
        name,
      };

      await this.makeBrevoRequest(`/contacts/lists/${listId}`, 'PUT', body);
      this.logger.log(`Updated Brevo list: ${listId}`);
    } catch (error) {
      this.logger.error(`Failed to update Brevo list: ${error.message}`);
      throw error;
    }
  }

  async deleteList(listId: string): Promise<void> {
    try {
      await this.makeBrevoRequest(`/contacts/lists/${listId}`, 'DELETE');
      this.logger.log(`Deleted Brevo list: ${listId}`);
    } catch (error) {
      this.logger.error(`Failed to delete Brevo list: ${error.message}`);
      // Don't throw error if list doesn't exist
      if (error.status === 404) {
        this.logger.warn(`Brevo list ${listId} not found, skipping deletion`);
        return;
      }
      throw error;
    }
  }

  async syncContactsToList(
    listId: string,
    contacts: BrevoContact[],
  ): Promise<number> {
    try {
      if (contacts.length === 0) {
        this.logger.warn(`No contacts to sync to list ${listId}`);
        return 0;
      }

      // Brevo API allows batch adding contacts
      const body = {
        listIds: [parseInt(listId)],
        updateEnabled: true, // Update existing contacts
      };

      let syncedCount = 0;

      // Batch sync contacts in chunks of 100 (Brevo limit)
      const chunkSize = 100;
      for (let i = 0; i < contacts.length; i += chunkSize) {
        const chunk = contacts.slice(i, i + chunkSize);

        for (const contact of chunk) {
          try {
            await this.makeBrevoRequest('/contacts', 'POST', {
              ...contact,
              ...body,
            });
            syncedCount++;
          } catch (error) {
            // Log error but continue with other contacts
            this.logger.error(
              `Failed to sync contact ${contact.email}: ${error.message}`,
            );
          }
        }
      }

      this.logger.log(
        `Synced ${syncedCount} contacts to Brevo list ${listId}`,
      );
      return syncedCount;
    } catch (error) {
      this.logger.error(`Failed to sync contacts to Brevo: ${error.message}`);
      throw error;
    }
  }

  formatContactForBrevo(user: {
    email: string;
    name?: string;
    phone?: string;
  }): BrevoContact {
    return {
      email: user.email,
      attributes: {
        ...(user.name && { NAME: user.name }),
        ...(user.phone && { PHONE: user.phone }),
      },
    };
  }

  async getAllContacts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    listId?: string,
  ): Promise<{
    contacts: any[];
    count: number;
  }> {
    try {
      // Brevo uses offset instead of page
      const offset = (page - 1) * limit;

      // Build query parameters
      let endpoint = `/contacts?limit=${Math.min(limit, 50)}&offset=${offset}`;

      if (listId) {
        endpoint += `&listIds=${listId}`;
      }

      const response = await this.makeBrevoRequest(endpoint, 'GET');

      let contacts = response.contacts || [];
      let count = response.count || 0;

      // Filter by email if search is provided (client-side filtering)
      if (search) {
        contacts = contacts.filter((contact: any) =>
          contact.email?.toLowerCase().includes(search.toLowerCase()),
        );
        count = contacts.length;
      }

      this.logger.log(`Retrieved ${contacts.length} contacts from Brevo`);
      return { contacts, count };
    } catch (error) {
      this.logger.error(`Failed to get contacts from Brevo: ${error.message}`);
      throw error;
    }
  }

  async deleteContact(identifier: string): Promise<void> {
    try {
      await this.makeBrevoRequest(`/contacts/${identifier}`, 'DELETE');
      this.logger.log(`Deleted Brevo contact: ${identifier}`);
    } catch (error) {
      // If contact doesn't exist, treat as success
      if (error.status === 404) {
        this.logger.warn(`Brevo contact ${identifier} not found, already deleted`);
        return;
      }
      this.logger.error(`Failed to delete Brevo contact: ${error.message}`);
      throw error;
    }
  }
}
