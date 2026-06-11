import { describe, expect, it } from "vitest"
import {
  DRIVE_FOLDER_TO_ALBUM_FOLDER,
  albumFolderForDriveSlug,
  albumTitleForDriveSlug,
  driveImageSrc,
  driveVideoEmbedSrc,
  embeddedFolderViewUrl,
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
})
