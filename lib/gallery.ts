/**
 * Home gallery: build-time `data/gallery.yml` → `lib/data/generated/gallery.json` → `lib/data/gallery.ts`.
 */
export {
  GALLERY_CAROUSEL_PHOTOS,
  GALLERY_CAROUSEL_PHOTOS as GALLERY_ITEMS,
  GALLERY_HOME_ALBUM_FOLDERS,
  GALLERY_PHOTOS,
  albumBreadcrumbForFolder,
  getGalleryIndexById,
  getGalleryPhotoById,
  getGalleryPhotosByAlbumFolder,
  type GalleryHomeAlbumFolder,
  type GalleryPhoto,
} from "@/lib/data/gallery"

export type GalleryItem = import("@/lib/data/gallery").GalleryPhoto
