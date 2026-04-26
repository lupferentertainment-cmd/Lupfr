import { describe, expect, it } from "vitest"
import {
  GALLERY_CAROUSEL_PHOTOS,
  GALLERY_HOME_ALBUM_FOLDERS,
  GALLERY_PHOTOS,
  albumBreadcrumbForFolder,
  galleryPathFolderSegmentsFromSrc,
  getGalleryIndexById,
  getGalleryPhotoById,
  getGalleryPhotosByAlbumFolder,
} from "@/lib/data/gallery"

describe("gallery album from path", () => {
  it("derives album folder, path segments, and human label for known gallery subfolders", () => {
    const bb = GALLERY_PHOTOS.find((p) => p.albumFolder === "boiler_boat_003")
    expect(bb).toBeDefined()
    expect(bb?.albumPathSegments).toEqual(["boiler_boat_003"])
    expect(bb?.albumBreadcrumb).toBe("Boiler Boat 003")
    expect(bb?.dateISO).toBe("2026-04-04")
    const ww = GALLERY_PHOTOS.find((p) => p.albumFolder === "where_is_west")
    expect(ww).toBeDefined()
    expect(ww?.albumPathSegments).toEqual(["where_is_west"])
    expect(ww?.albumBreadcrumb).toBe("Where's West?")
    expect(ww?.dateISO).toBe("2026-04-18")
  })

  it("galleryPathFolderSegmentsFromSrc lists every directory under gallery/ before the filename", () => {
    expect(galleryPathFolderSegmentsFromSrc("/gallery/boiler_boat_003/boiler_boat_003_01.webp")).toEqual([
      "boiler_boat_003",
    ])
    expect(galleryPathFolderSegmentsFromSrc("/gallery/a/b/c/x.webp")).toEqual(["a", "b", "c"])
    expect(galleryPathFolderSegmentsFromSrc("/gallery/onlyfile.webp")).toEqual([])
  })

  it("home carousel includes both home albums so #gallery breadcrumbs can show each folder", () => {
    const foldersInCarousel = new Set(GALLERY_CAROUSEL_PHOTOS.map((p) => p.albumFolder))
    expect(foldersInCarousel.has("boiler_boat_003")).toBe(true)
    expect(foldersInCarousel.has("where_is_west")).toBe(true)
  })

  it("albumBreadcrumbForFolder falls back to folder name when unknown", () => {
    expect(albumBreadcrumbForFolder("totally_unknown_folder_xyz")).toBe("totally_unknown_folder_xyz")
  })

  it("getGalleryPhotoById and getGalleryIndexById match generated photos", () => {
    const first = GALLERY_PHOTOS[0]
    expect(getGalleryPhotoById(first.id)).toBeDefined()
    expect(getGalleryPhotoById(-999999)).toBeUndefined()
    expect(getGalleryIndexById(first.id)).toBe(0)
    expect(getGalleryIndexById(-999999)).toBe(-1)
  })

  it("home album section order and per-folder photo lists", () => {
    expect(GALLERY_HOME_ALBUM_FOLDERS).toEqual(["boiler_boat_003", "where_is_west"])
    expect(albumBreadcrumbForFolder("boiler_boat_003")).toBe("Boiler Boat 003")
    expect(albumBreadcrumbForFolder("where_is_west")).toBe("Where's West?")
    const bbOnly = getGalleryPhotosByAlbumFolder("boiler_boat_003")
    const wwOnly = getGalleryPhotosByAlbumFolder("where_is_west")
    expect(bbOnly.every((p) => p.albumFolder === "boiler_boat_003")).toBe(true)
    expect(wwOnly.every((p) => p.albumFolder === "where_is_west")).toBe(true)
    expect(bbOnly.length).toBeGreaterThan(0)
    expect(wwOnly.length).toBeGreaterThan(0)
  })
})
