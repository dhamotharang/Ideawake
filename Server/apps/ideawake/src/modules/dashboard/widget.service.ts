import { Injectable } from '@nestjs/common';
import { WidgetEntity } from './widget.entity';
import { WidgetRepository } from './widget.repository';

@Injectable()
export class WidgetService {
  constructor(public readonly widgetRepository: WidgetRepository) {}

  /**
   * Get widgets
   */
  async getWidgets(options: {}): Promise<WidgetEntity[]> {
    return this.widgetRepository.find(options);
  }

  /**
   * Get single widget
   */
  async getWidget(options: {}): Promise<WidgetEntity> {
    return this.widgetRepository.findOne(options);
  }

  /**
   * Add widget
   */
  async addWidget(data: {}): Promise<WidgetEntity> {
    const widgetCreated = this.widgetRepository.create({
      ...data,
      isDeleted: false,
    });
    return this.widgetRepository.save(widgetCreated);
  }

  /**
   * Update widget
   */
  async updateWidget(options: {}, data: {}): Promise<{}> {
    return this.widgetRepository.update(options, data);
  }

  /**
   * Archive widget
   */
  async archiveWidget(options: { id: number; community: number }): Promise<{}> {
    return this.updateWidget(options, { isDeleted: true });
  }
}
