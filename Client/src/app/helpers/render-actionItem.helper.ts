export class RenderActionItemsHelper {
  static general(item) {
    return `<p class="mb-1 pt-2 notificationTextSize text-wrap">
              ${item.entityTypeName} [#${item.entityObjectId}] ${item.entityTitle}
            </p>`;
  }

  static refinement(item) {
    return `<p class="mb-1 pt-2 notificationTextSize text-wrap">
      Refine ${item.entityTypeName} [#${item.entityObjectId}] ${item.entityTitle}
    </p>`;
  }

  static scoreCard(item) {
    return `<p class="mb-1 pt-2 notificationTextSize text-wrap">
      Evaluate ${item.entityTypeName} [#${item.entityObjectId}] ${item.entityTitle}
    </p>`;
  }
}
