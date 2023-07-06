import {
  EmbedFunc,
  EmbeddedContent,
  EmbeddedContentStore,
  PersistedPage,
  Page,
  PageStore,
} from "chat-core";

/**
  (Re-)embeddedContent the pages in the page store that have changed since the given date
  and stores the embeddedContent in the embeddedContent store.
 */
export const updateEmbeddedContent = async ({
  since,
  embeddedContentStore,
  pageStore,
  embed,
}: {
  since: Date;
  embeddedContentStore: EmbeddedContentStore;
  pageStore: PageStore;
  embed: EmbedFunc;
}): Promise<void> => {
  const changedPages = await pageStore.loadPages({ updated: since });

  const promises = changedPages.map(async (page) => {
    switch (page.action) {
      case "deleted":
        return await embeddedContentStore.deleteEmbeddedContent({
          page,
        });
      case "created": // fallthrough
      case "updated":
        return updateEmbeddedContentForPage({
          store: embeddedContentStore,
          page,
          embed,
        });
    }
  });

  await Promise.all(promises);
};

export const updateEmbeddedContentForPage = async ({
  page,
  store,
  embed,
}: {
  page: PersistedPage;
  store: EmbeddedContentStore;
  embed: EmbedFunc;
}): Promise<void> => {
  const contentChunks = await chunkPage(page);

  const embeddedContent = await Promise.all(
    contentChunks.map(async (chunk): Promise<EmbeddedContent> => {
      const { embedding } = await embed({
        text: chunk.text,
        userIp: "",
      });
      return {
        ...chunk,
        embedding,
        updated: new Date(),
      };
    })
  );

  await store.updateEmbeddedContent({
    page,
    embeddedContent,
  });
};

export type ContentChunk = Omit<EmbeddedContent, "embedding" | "updated">;

export const chunkPage = async (page: Page): Promise<ContentChunk[]> => {
  return [];
};
