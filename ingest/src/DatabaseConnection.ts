import { strict as assert } from "assert";
import { MongoClient } from "mongodb";
import { PageStore, PersistedPage } from "./updatePages";
import {
  EmbeddedContentStore,
  EmbeddedEmbeddedContent,
} from "./updateEmbeddedContent";

export type DatabaseConnection = {
  /**
    Close the connection.

    @param force - Force close, emitting no events
   */
  close(force?: boolean): Promise<void>;
};

/**
  Create a connection to the database.
 */
export const makeDatabaseConnection = async ({
  connectionUri,
  databaseName,
}: {
  connectionUri: string;
  databaseName: string;
}): Promise<DatabaseConnection & PageStore & EmbeddedContentStore> => {
  const client = await new MongoClient(connectionUri).connect();
  const db = client.db(databaseName);
  const embeddedContentCollection =
    db.collection<EmbeddedEmbeddedContent>("embeddedContent");
  const pagesCollection = db.collection<PersistedPage>("pages");
  const instance: DatabaseConnection & PageStore & EmbeddedContentStore = {
    close: (force) => client.close(force),

    async loadEmbeddedContent({ page }) {
      return await embeddedContentCollection.find(pageIdentity(page)).toArray();
    },

    async deleteEmbeddedContent({ page }) {
      const deleteResult = await embeddedContentCollection.deleteMany(
        pageIdentity(page)
      );
      if (!deleteResult.acknowledged) {
        throw new Error("EmbeddedContent deletion not acknowledged!");
      }
    },

    async updateEmbeddedContent({ page, embeddedContent }) {
      embeddedContent.forEach((embeddedContent) => {
        assert(
          embeddedContent.source === page.sourceName &&
            embeddedContent.url === page.url,
          `EmbeddedContent source/url (${embeddedContent.source} / ${embeddedContent.url}) must match give page source/url (${page.sourceName} / ${page.url})!`
        );
      });
      await client.withSession(async (session) => {
        await session.withTransaction(async () => {
          // First delete all the embeddedContent for the given page
          const deleteResult = await embeddedContentCollection.deleteMany(
            pageIdentity(page),
            { session }
          );
          if (!deleteResult.acknowledged) {
            throw new Error("EmbeddedContent deletion not acknowledged!");
          }

          // Insert the embedded content for the page
          const insertResult = await embeddedContentCollection.insertMany(
            [...embeddedContent],
            {
              session,
            }
          );

          if (!insertResult.acknowledged) {
            throw new Error("EmbeddedContent insertion not acknowledged!");
          }
          const { insertedCount } = insertResult;
          if (insertedCount !== embeddedContent.length) {
            throw new Error(
              `Expected ${embeddedContent.length} inserted, got ${insertedCount}`
            );
          }
        });
      });
    },

    async loadPages({ sourceName }) {
      return pagesCollection.find({ sourceName }).toArray();
    },

    async updatePages(pages) {
      await Promise.all(
        pages.map(async (page) => {
          const result = await pagesCollection.updateOne(
            pageIdentity(page),
            { $set: page },
            { upsert: true }
          );
          if (!result.acknowledged) {
            throw new Error(`update pages not acknowledged!`);
          }
          if (!result.modifiedCount && !result.upsertedCount) {
            throw new Error(
              `Page ${JSON.stringify(pageIdentity(page))} not updated!`
            );
          }
        })
      );
    },
  };
  return instance;
};

/**
  Returns a query filter that represents a unique page in the system.
 */
export const pageIdentity = ({ url, sourceName }: PersistedPage) => ({
  url,
  sourceName,
});
