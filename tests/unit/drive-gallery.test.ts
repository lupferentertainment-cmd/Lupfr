import { afterEach, describe, expect, it, vi } from "vitest"
import {
  DRIVE_FOLDER_TO_ALBUM_FOLDER,
  albumFolderForDriveSlug,
  albumTitleForDriveSlug,
  driveImageSrc,
  driveVideoEmbedSrc,
  embeddedFolderViewUrl,
  fetchDriveGalleryAlbums,
  humanizeDriveSlug,
  mediaItemsFromEntry,
  mediaKindForName,
  parseDriveFolderEntries,
} from "@/lib/drive-gallery"
import { GALLERY_ALBUM_FOLDER_DEFAULT_DATES } from "@/lib/data/gallery"

// Trimmed real markup from Drive's anonymous embeddedfolderview (file + folder entries).
const FIXTURE_HTML = `
<div class="flip-entries">
<div class="flip-entry" id="entry-1VPCFsYlIwGkEkBzUESWtFXq3Dee2QqDJ" tabindex="0" role="link"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/1VPCFsYlIwGkEkBzUESWtFXq3Dee2QqDJ/view?usp=drive_web" target="_blank"><div class="flip-entry-visual"></div><div class="flip-entry-title">IMG_6720.JPG</div></a></div></div>
<div class="flip-entry" id="entry-1C5RdzHJlVS7Squ9MiHQcMo1yPDErn23i" tabindex="0" role="link"><div class="flip-entry-info"><a href="https://drive.google.com/drive/folders/1C5RdzHJlVS7Squ9MiHQcMo1yPDErn23i" target="_blank"><div class="flip-entry-visual"></div><div class="flip-entry-title">shamrock_&amp;_house</div></a></div></div>
<div class="flip-entry" id="entry-2AbCdEfGhIjKlMnOpQrStUvWxYz12345" tabindex="0" role="link"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/2AbCdEfGhIjKlMnOpQrStUvWxYz12345/view?usp=drive_web" target="_blank"><div class="flip-entry-visual"></div><div class="flip-entry-title">recap_video.mp4</div></a></div></div>
</div>`

describe("drive gallery folder parsing", () => {
  it("extracts file and folder entries with decoded names from embeddedfolderview HTML", () => {
    const entries = parseDriveFolderEntries(FIXTURE_HTML)
    expect(entries).toEqual([
      { id: "1VPCFsYlIwGkEkBzUESWtFXq3Dee2QqDJ", name: "IMG_6720.JPG", kind: "file" },
      { id: "1C5RdzHJlVS7Squ9MiHQcMo1yPDErn23i", name: "shamrock_&_house", kind: "folder" },
      { id: "2AbCdEfGhIjKlMnOpQrStUvWxYz12345", name: "recap_video.mp4", kind: "file" },
    ])
  })

  it("returns an empty list for unrecognized HTML instead of throwing", () => {
    expect(parseDriveFolderEntries("<html><body>sign in</body></html>")).toEqual([])
  })
})

describe("drive gallery media classification", () => {
  it("classifies media kind by file extension, case-insensitive", () => {
    expect(mediaKindForName("IMG_6720.JPG")).toBe("image")
    expect(mediaKindForName("photo.heic")).toBe("image")
    expect(mediaKindForName("recap.MOV")).toBe("video")
    expect(mediaKindForName("notes.pdf")).toBe("other")
    expect(mediaKindForName("no-extension")).toBe("other")
  })

  it("maps image entries to lh3 CDN sources and drops non-media files", () => {
    const img = mediaItemsFromEntry({ id: "abc123", name: "x.jpg", kind: "file" })
    expect(img).toEqual([
      { kind: "image", fileId: "abc123", name: "x.jpg", src: "https://lh3.googleusercontent.com/d/abc123=w1600" },
    ])
    expect(mediaItemsFromEntry({ id: "abc123", name: "x.pdf", kind: "file" })).toEqual([])
  })

  it("maps video entries to a Drive preview embed plus an lh3 poster", () => {
    const [video] = mediaItemsFromEntry({ id: "vid1", name: "clip.mp4", kind: "file" })
    expect(video).toEqual({
      kind: "video",
      fileId: "vid1",
      name: "clip.mp4",
      posterSrc: "https://lh3.googleusercontent.com/d/vid1=w1600",
      embedSrc: "https://drive.google.com/file/d/vid1/preview",
    })
  })
})

describe("drive gallery album mapping", () => {
  it("maps every configured Drive slug to a site album folder with a default event date", () => {
    for (const folder of Object.values(DRIVE_FOLDER_TO_ALBUM_FOLDER)) {
      expect(GALLERY_ALBUM_FOLDER_DEFAULT_DATES[folder], folder).toBeDefined()
    }
  })

  it("resolves mapped Drive slugs to their event titles", () => {
    expect(albumTitleForDriveSlug("shamrock_&_house")).toBe("Shamrock & House")
    expect(albumTitleForDriveSlug("wheres_west_?")).toBe("Where's West?")
    expect(albumTitleForDriveSlug("third_thursdays")).toBe("Third Thursday's")
    expect(albumTitleForDriveSlug("boiler_party_marina")).toBe("BOILER PARTY: MARINA")
  })

  it("falls back to a humanized slug title for unmapped Drive folders", () => {
    expect(albumFolderForDriveSlug("secret_warehouse_001")).toBe("secret_warehouse_001")
    expect(albumTitleForDriveSlug("secret_warehouse_001")).toBe("Secret Warehouse 001")
    expect(humanizeDriveSlug("wheres_west_?")).toBe("Wheres West")
  })
})

describe("drive gallery URLs", () => {
  it("builds anonymous listing and CDN URLs from ids", () => {
    expect(embeddedFolderViewUrl("f1")).toBe("https://drive.google.com/embeddedfolderview?id=f1")
    expect(driveImageSrc("a", 800)).toBe("https://lh3.googleusercontent.com/d/a=w800")
    expect(driveVideoEmbedSrc("a")).toBe("https://drive.google.com/file/d/a/preview")
  })

  it("decodes numeric HTML entities in entry titles", () => {
    const html = `
<div class="flip-entry" id="entry-num1" tabindex="0" role="link"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/num1/view"><div class="flip-entry-title">shot&#38;cut.jpg</div></a></div></div>`
    expect(parseDriveFolderEntries(html)[0]?.name).toBe("shot&cut.jpg")
  })
})

describe("fetchDriveGalleryAlbums", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("returns nested folder media and drops empty albums", async () => {
    const rootHtml = `
<div class="flip-entry" id="entry-rootfolder" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/drive/folders/rootfolder"><div class="flip-entry-title">boiler_boat_003</div></a></div></div>
<div class="flip-entry" id="entry-emptyalbum" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/drive/folders/emptyalbum"><div class="flip-entry-title">empty_set</div></a></div></div>`
    const albumHtml = `
<div class="flip-entry" id="entry-photo1" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/photo1/view"><div class="flip-entry-title">a.jpg</div></a></div></div>
<div class="flip-entry" id="entry-sub" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/drive/folders/sub"><div class="flip-entry-title">PHOTOS</div></a></div></div>`
    const nestedHtml = `
<div class="flip-entry" id="entry-photo2" tabindex="0"><div class="flip-entry-info"><a href="https://drive.google.com/file/d/photo2/view"><div class="flip-entry-title">b.jpg</div></a></div></div>`

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const href = String(url)
        let body = rootHtml
        if (href.includes("id=rootfolder")) body = albumHtml
        else if (href.includes("id=sub")) body = nestedHtml
        else if (href.includes("id=emptyalbum")) body = `<div class="flip-entries"></div>`
        return {
          ok: true,
          status: 200,
          text: async () => body,
        }
      }),
    )

    const albums = await fetchDriveGalleryAlbums()
    expect(albums).toHaveLength(1)
    expect(albums[0]?.driveSlug).toBe("boiler_boat_003")
    expect(albums[0]?.items.map((i) => i.fileId)).toEqual(["photo1", "photo2"])
  })

  it("returns [] and logs when Drive listing fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        text: async () => "down",
      })),
    )
    await expect(fetchDriveGalleryAlbums()).resolves.toEqual([])
    expect(errSpy).toHaveBeenCalled()
  })
})
