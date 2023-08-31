import { createClient } from "@sanity/client";

import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "m34z0g40",
  dataset: "production",
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: "2023-07-03",
  token:
    "ski8SnJ6ETorIb10f4yqTljHguPgkdnLnqkEMh7b9dzP7XkSDEtZhTGvrk6suIFGp3nodkgPMtY856aMlcPRWdmlM5NhoVcKLykh3Ld22poz9AMAaBzyO48uVMUHjOE9MfZKy5HuCwZUG1m4NkuPPbgefyuERO4WgTVzJ5O0vGNUEQ5o81C3", // use current date (YYYY-MM-DD) to target the latest API version
  // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
