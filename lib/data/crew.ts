/**
 * Our Team roster (owner design handoff "LUPFR Website Design v15",
 * 2026-11-15): the Exec Team (Will + Eliott) on top, then five dashed group
 * frames. The standalone Founders section is gone — Will and Eliott now
 * open the section as the Exec Team, with the founder bios carried over
 * verbatim from `data/team.yml` / the v4 design file.
 *
 * Bios, short lines, roles, and social/website URLs are the owner's handoff
 * copy verbatim — group order and member order are the display order.
 * Photos live in `public/images/team/` (exec) and `public/images/team/crew/`
 * (everyone else), WebP.
 */

export type CrewIconKey = "ops" | "biz" | "media" | "legal" | "adv"

export interface CrewMember {
  name: string
  /** Mono role line under the name (tile + pop-up). */
  role: string
  /** One-line summary on the tile (clamped to 4 lines). */
  short: string
  /** Full bio shown in the pop-up. */
  bio: string
  photo: string
  /** Optional business website + its pop-up pill label (e.g. ERIA.CO). */
  link?: string
  linkLabel?: string
  linkedin?: string
  instagram?: string
  /** CSS object-position for cropping the photo into the tile/pop-up. */
  focus?: string
  /** "contain" for logo artwork that must not be cropped (Link Studios). */
  fit?: "cover" | "contain"
}

export interface CrewGroup {
  label: string
  /** Small mono line under the frame header (e.g. "PRODUCTION · LOGISTICS · EXECUTION"). */
  sub: string
  icon: CrewIconKey
  members: CrewMember[]
}

/** A member plus its group context, as the pop-up needs it (flat display order). */
export interface CrewEntry extends CrewMember {
  group: string
  icon: CrewIconKey
  /** Stable id: slugified name ("exec-" prefixed for the Exec Team, since Will and Eliott also appear in their working groups). */
  id: string
}

const WILL_EXEC_BIO = [
  "Will founded LUPFR Entertainment to bring unique, untraditional live music experiences to California. Splitting his time between the LA & SF markets, he leads sponsorship, brand strategy, and the vision behind LUPFR's flagship franchises - from SEA//SIDE yacht charters, SOUND//CHECK artist interviews, and full-scale HIGH//RISE corporate productions.",
  "Raised in Oregon - Portland first, Bend second - Will grew up around brand-building and entrepreneurship; raised in a Nike family and later exposed to business creation. One house, two lessons: how a great brand gets made, and what it takes to build something of your own. The early culture Phil Knight created serves as the blueprint for LUPFR: build a brand, not a product; sell experience rather than a ticket; and grow an ecosystem of artists, venues, media, and community rather than a company. Nike had Just Do It. LUPFR has Redefine the Music Experience.",
  "His entrepreneurial track record starts young: at 16 he founded B2 Authentic LLC, an e-commerce business selling custom sports iPhone cases, growing it to $15K+ in revenue, 1,000+ units sold, and a social following of 30K+ before heading to college in Colorado.",
  "Between ventures, Will built a career in renewable energy project finance, where he led portfolio modeling and diligence on over $2B in debt, tax equity, and development capital financings.",
  "That range - building a company from scratch as a teenager, executing complex project financings, and now founding and scaling LUPFR Entertainment - reflects the same instinct throughout: take something unstructured and build the infrastructure underneath it.",
].join("\n\n")

/** Exec Team: the two founders, shown as large tiles above the group frames. */
export const CREW_EXEC: CrewGroup = {
  label: "EXEC TEAM",
  sub: "LEADERSHIP · STRATEGY · VISION",
  icon: "ops",
  members: [
    {
      name: "Will Lupfer",
      role: "Founder & CEO",
      short:
        "Founded LUPFR to bring non-traditional live music experiences to California, leading sponsorships, brand strategy and the vision behind every LUPFR franchise.",
      bio: WILL_EXEC_BIO,
      photo: "/images/team/will-2026.webp",
      linkedin: "https://www.linkedin.com/in/will-lupfer-ba56a1143/",
      instagram: "https://www.instagram.com/wlupfer/",
      focus: "50% 22%"
    },
    {
      name: "Eliott Nazarian",
      role: "Co-Founder, General Counsel",
      short:
        "Shapes LUPFR's strategy, partnerships and expansion across Los Angeles and beyond, as a licensed attorney, actor and entrepreneur.",
      bio: "Eliott is a co-founder of LUPFR, helping shape the company's strategy, partnerships, and expansion across Los Angeles and beyond. A licensed attorney, actor, entrepreneur, and entertainment professional, he brings a multidisciplinary perspective to building the brand — developing partnerships, structuring opportunities, and turning ambitious ideas into scalable ventures. With roots in LA's creative community spanning music, nightlife, film, fashion, and media, Eliott is focused on growing LUPFR into a platform where culture, community, and business intersect.",
      photo: "/images/team/eliott-2026.webp",
      linkedin: "https://www.linkedin.com/in/eliottnazarian/",
      instagram: "https://www.instagram.com/eliottnazarian/",
      focus: "50% 18%"
    }
  ]
}

export const CREW_GROUPS: CrewGroup[] = [
  {
    label: "OPERATIONS",
    sub: "PRODUCTION · LOGISTICS · EXECUTION",
    icon: "ops",
    members: [
      {
        name: "Will Lupfer",
        role: "Founder // Head of Operations",
        short: "Runs operations at every LUPFR event, start to finish.",
        bio: "Will runs operations at every LUPFR event. He owns the plan from first walkthrough to final load-out: venue logistics, vendor and production coordination, run-of-show, staffing and on-site execution, across both the LA and SF markets. On event day he is on the floor making sure every detail lands, so the experience feels effortless for guests, artists and partners.",
        photo: "/images/team/crew/will-ops.webp",
        linkedin: "https://www.linkedin.com/in/will-lupfer-ba56a1143/",
        instagram: "https://www.instagram.com/wlupfer/",
        focus: "50% 25%"
      },
      {
        name: "FredEx Entertainment",
        role: "Production Partner",
        short: "Production partner for LUPFR's San Francisco events.",
        bio: "FredEx Entertainment is LUPFR's production partner in San Francisco, supporting sound, lighting, staging and on-site execution for LUPFR's Bay Area events.",
        photo: "/images/team/crew/fredex-productions.webp",
        link: "https://fredexentertainment.com",
        linkLabel: "FREDEXENTERTAINMENT.COM"
      },
      {
        name: "Cube World",
        role: "Production Partner",
        short: "Production partner for LUPFR's Los Angeles events.",
        bio: "Cube World Productions is LUPFR's production partner in Los Angeles, supporting sound, lighting, staging and on-site execution for LUPFR's Southern California events.",
        photo: "/images/team/crew/cube-world-productions.webp",
        link: "https://cubeworldproductions.com",
        linkLabel: "CUBEWORLDPRODUCTIONS.COM"
      }
    ]
  },
  {
    label: "BUSINESS DEVELOPMENT",
    sub: "PARTNERSHIPS · GREEK LIFE · MUSIC",
    icon: "biz",
    members: [
      {
        name: "Robbie Cullerton",
        role: "Business Development",
        short: "Building Greek Life and music industry partnerships.",
        bio: "Robbie Cullerton works in Business Development at LUPFR, building partnerships with Greek Life chapters and across the music industry. A recent Chapman University graduate and bassist in Where's West?, a band LUPFR has booked, he lives on both sides of a show: he knows what artists need on stage and what it takes to fill the room. At LUPFR he connects chapters, artists, managers and venues with events that feel worth showing up for.",
        photo: "/images/team/crew/robbie-cullerton.webp",
        instagram: "https://www.instagram.com/wheres__west/",
        focus: "50% 35%"
      },
      {
        name: "Aliyah Hyman",
        role: "Business Development",
        short: "UCLA grad growing LUPFR's partnerships and reach across LA.",
        bio: "Aliyah Hyman joins LUPFR in Business Development after graduating from UCLA with a degree in sociology. Originally from Santa Barbara, she brings a background in multimedia arts, fashion marketing, social media management and sales, along with experience covering arts, entertainment and athletics for Bruin Life. At LUPFR she helps build partnerships and grow the brand's reach across Los Angeles.",
        photo: "/images/team/crew/aliyah-hyman.webp",
        linkedin: "https://www.linkedin.com/in/aliyah-hyman-ab7986187/",
        focus: "50% 25%"
      },
      {
        name: "Rayan Hashemy",
        role: "Business Development",
        short: "Building Greek Life partnerships across Southern California.",
        bio: "Rayan Hashemy is a Business Development Intern at LUPFR, building Greek Life partnerships across Southern California. A South Bay native and Greek Life member at Michigan State, he knows firsthand what makes a chapter event worth remembering. “I've seen what goes on behind the scenes of chapter events, and I'm excited to help chapters bring LUPFR-level production to their biggest nights.”",
        photo: "/images/team/crew/rayan-hashemy.webp",
        linkedin: "https://www.linkedin.com/in/rayan-hashemy/",
        focus: "50% 30%"
      }
    ]
  },
  {
    label: "MEDIA TEAM",
    sub: "SOCIAL · CONTENT · FILM",
    icon: "media",
    members: [
      {
        name: "Yahsek Gonzalez",
        role: "Head of Media",
        short: "Runs LUPFR's social, content, editing and online brand.",
        bio: "Yahsek leads LUPFR's media: running social, shooting and editing content, and shaping how the brand shows up online. A creative director and DP, he has filmed festival aftermovies for DWP and Black Coffee, led content for Cal Athletics, and worked on studio productions for FOX and Disney. At LUPFR he turns every event into content that keeps building the brand long after the night ends.",
        photo: "/images/team/crew/yahsek-gonzalez.webp",
        instagram: "https://www.instagram.com/yahs3k/",
        focus: "50% 25%"
      },
      {
        name: "Link Studios",
        role: "Media Partner · SEA//SIDE",
        short: "Runs all content and media for SEA//SIDE.",
        bio: "Link Studios is a creative production company specializing in social-first content, from short-form video to long-form storytelling. For LUPFR, they run all content and media for SEA//SIDE, capturing every sailing and turning it into content that grows the brand across digital platforms.",
        photo: "/images/team/crew/link-studios.webp",
        instagram: "https://www.instagram.com/xlancesanchez/",
        fit: "contain"
      }
    ]
  },
  {
    label: "LEGAL TEAM",
    sub: "CONTRACTS · COMPLIANCE",
    icon: "legal",
    members: [
      {
        name: "Eliott Nazarian",
        role: "Legal Counsel · Nazarian Law",
        short: "Contracts, deals and compliance.",
        bio: "Eliott Nazarian is a business attorney with Nazarian Law and serves as LUPFR's legal counsel. He drafts and reviews the contracts behind every event, from artist and talent agreements to venue, vendor and sponsorship deals, and advises on entity structure, compliance and protecting the LUPFR brands.",
        photo: "/images/team/crew/eliott.webp",
        linkedin: "https://www.linkedin.com/in/eliottnazarian/",
        instagram: "https://www.instagram.com/eliottnazarian/",
        focus: "50% 20%"
      }
    ]
  },
  {
    label: "ADVISORS",
    sub: "STRATEGY · OPERATIONS · HOSPITALITY",
    icon: "adv",
    members: [
      {
        name: "Mike Lupfer",
        role: "Advisor",
        short: "Decades of operations leadership at Nike.",
        bio: "Mike Lupfer is the original Lupfer brand-builder. Long before there were yacht parties and masquerades, Mike spent decades at Nike building the operations behind one of the most iconic brands in the world, leading sales and commerce operations across Nike Golf, Nike Global Sales and affiliate brands like Converse and Hurley. He's a big reason Will grew up understanding how a great brand actually gets made. Today Mike advises LUPFR on operations, scaling and partnerships, bringing big-company discipline to a fast-moving events company. ",
        photo: "/images/team/crew/mike-lupfer.webp",
        linkedin: "https://www.linkedin.com/in/mike-lupfer-1b320516/"
      },
      {
        name: "Nikita Khandheria",
        role: "Advisor · Founder & CEO, ERIA",
        short: "Founder & CEO of ERIA, Bay Area luxury hospitality.",
        bio: "Nikita Khandheria is a seasoned entrepreneur and the founder and CEO of ERIA, a luxury hospitality and event-planning company with venues across the San Francisco Bay Area. After building and exiting a consumer goods business at 21, she turned her attention to hospitality, growing ERIA from a single venue into a portfolio of four properties in just 18 months. With a background in mathematics and economics from the University of St Andrews and William & Mary, Nikita brings an unconventional perspective to hospitality, combining entrepreneurship, design, and experiential events to create distinctive spaces and memorable celebrations.",
        photo: "/images/team/crew/nikita-khandheria.webp",
        link: "https://eria.co",
        linkLabel: "ERIA.CO",
        linkedin: "https://www.linkedin.com/in/nikitakhandheria/",
        instagram: "https://www.instagram.com/nikitalyssa/",
        focus: "50% 30%"
      },
      {
        name: "Kamilla Zakirzianova",
        role: "Advisor · Founder, Maison Noir",
        short: "Founder of Maison Noir, SF's black-tie nightlife collective.",
        bio: "Kamilla Zakirzianova is the founder of Maison Noir, San Francisco's members-only collective for black-tie galas, masquerades and immersive nightlife. A creative director and social media strategist, she previously founded the social media agency Camilliada. As an advisor, she brings an eye for luxury experiences and audience-building to LUPFR's events.",
        photo: "/images/team/crew/kamilla-zakirzianova.webp",
        link: "https://maisonnoir.club",
        linkLabel: "MAISONNOIR.CLUB",
        linkedin: "https://www.linkedin.com/in/camilliada/",
        instagram: "https://www.instagram.com/camilliadas/",
        focus: "50% 35%"
      }
    ]
  }
]

export function getCrewExec(): CrewGroup {
  return CREW_EXEC
}

export function getCrewGroups(): CrewGroup[] {
  return CREW_GROUPS
}

export function crewSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

/** All members in display order (Exec Team first, then group order and member order), group context attached. */
export function getCrewEntries(): CrewEntry[] {
  return [CREW_EXEC, ...CREW_GROUPS].flatMap((g) =>
    g.members.map((m) => ({
      ...m,
      group: g.label,
      icon: g.icon,
      id: g === CREW_EXEC ? `exec-${crewSlug(m.name)}` : crewSlug(m.name)
    }))
  )
}

/** "Kamilla Zakirzianova" -> ["Kamilla", "Zakirzianova"] (first word outlined, rest solid in the pop-up). */
export function splitCrewName(name: string): { first: string; last: string } {
  const [first = "", ...rest] = name.trim().split(/\s+/)
  return { first, last: rest.join(" ") }
}

/** Website pill label: explicit `linkLabel`, else the URL's bare host uppercased. */
export function crewLinkLabel(member: Pick<CrewMember, "link" | "linkLabel">): string {
  if (member.linkLabel) return member.linkLabel
  if (!member.link) return ""
  try {
    return new URL(member.link).host.replace(/^www\./, "").toUpperCase()
  } catch {
    return member.link
  }
}
