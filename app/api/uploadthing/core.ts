import { neon } from "@neondatabase/serverless";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {

  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .input(z.object({ roomId: z.string().min(1) }))
    .middleware(async ({ input }) => {

      if (!process.env.DATABASE_URL) throw new UploadThingError("Database connection string is missing");

      return { roomId: input.roomId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      // console.log("Upload complete for userId:", metadata.userId);

      // console.log("file url", file.ufsUrl);
      const database = neon(process.env.DATABASE_URL as string);

      await database`INSERT INTO photos (room_id, file_key, url, name, size)
        VALUES (
          ${metadata.roomId},
          ${file.key},
          ${file.ufsUrl || file.url},
          ${file.name},
          ${file.size}
        )`

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { roomId: metadata.roomId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
