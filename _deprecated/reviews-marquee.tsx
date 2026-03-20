"use client"

/**
 * ARCHIVED: Reviews section — horizontal scrolling marquee tracks (desktop 3-layer + mobile single strip).
 * Not imported anywhere.
 * To restore: merge `_deprecated/reviews-marquee.css` into `app/globals.css` as documented in that file,
 * then import `ReviewsMarqueeArchive` from here into `components/reviews.tsx` below the stats carousel.
 */

import { useReducedMotion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

export type StarRating = 4 | 4.5 | 5
/** Most reviews 4.5, some 4 and 5. */
function getRating(id: number): StarRating {
  if (id % 10 === 0) return 5
  if (id % 5 === 2) return 4
  return 4.5
}

export interface ReviewItem {
  id: number
  name: string
  quote: string
  avatarSeed: number
}

const REVIEWS_LEFT: ReviewItem[] = [
  { id: 1, name: "Sarah M.", quote: "Best night ever. The boat party was incredible.", avatarSeed: 1 },
  { id: 2, name: "James K.", quote: "LUPFR knows how to throw a party. 10/10.", avatarSeed: 2 },
  { id: 3, name: "Elena R.", quote: "Rooftop vibes were unmatched. Will be back.", avatarSeed: 3 },
  { id: 4, name: "Marcus T.", quote: "Professional, fun, and the sound was perfect.", avatarSeed: 4 },
  { id: 5, name: "Nina P.", quote: "Warehouse session was fire. Book them.", avatarSeed: 5 },
  { id: 6, name: "David L.", quote: "From start to finish, everything was flawless.", avatarSeed: 6 },
  { id: 7, name: "Zoe W.", quote: "San Francisco's best. No question.", avatarSeed: 7 },
  { id: 8, name: "Alex C.", quote: "The crowd, the music, the venue—all gold.", avatarSeed: 8 },
  { id: 9, name: "Maya S.", quote: "We hired them for our launch. Huge success.", avatarSeed: 9 },
  { id: 10, name: "Jordan B.", quote: "Atmosphere was electric. Can't wait for next time.", avatarSeed: 10 },
  { id: 11, name: "Chris H.", quote: "Best event production in the Bay. Period.", avatarSeed: 11 },
  { id: 12, name: "Lily F.", quote: "Every detail was thought through. Loved it.", avatarSeed: 12 },
  { id: 13, name: "Ryan G.", quote: "Boat party under the stars. Unforgettable.", avatarSeed: 13 },
  { id: 14, name: "Sofia N.", quote: "Music curation was on point. So good.", avatarSeed: 14 },
  { id: 15, name: "Omar D.", quote: "Smooth operations, great vibes. Recommend.", avatarSeed: 15 },
  { id: 16, name: "Emma V.", quote: "Our corporate event felt like a real party.", avatarSeed: 16 },
  { id: 17, name: "Leo J.", quote: "Rooftop + sunset + LUPFR = magic.", avatarSeed: 17 },
  { id: 18, name: "Ava M.", quote: "They turned our idea into reality. Stunning.", avatarSeed: 18 },
  { id: 19, name: "Noah K.", quote: "Professional team, incredible energy.", avatarSeed: 19 },
  { id: 20, name: "Chloe R.", quote: "Best night out in SF. Hands down.", avatarSeed: 20 },
  { id: 21, name: "Liam P.", quote: "Warehouse party was next level. Wow.", avatarSeed: 21 },
  { id: 22, name: "Isabella T.", quote: "We've worked with many. LUPFR is the one.", avatarSeed: 22 },
  { id: 23, name: "Ethan S.", quote: "Sound, lights, crowd—all perfect.", avatarSeed: 23 },
  { id: 24, name: "Olivia W.", quote: "From booking to last song, flawless.", avatarSeed: 24 },
  { id: 25, name: "Mason L.", quote: "Bay Area's premier entertainment. Book now.", avatarSeed: 25 },
  { id: 26, name: "Aria C.", quote: "The boat party exceeded every expectation.", avatarSeed: 26 },
  { id: 27, name: "Lucas B.", quote: "Best event we've ever attended. No cap.", avatarSeed: 27 },
  { id: 28, name: "Mia H.", quote: "They know how to move a crowd. Incredible.", avatarSeed: 28 },
  { id: 29, name: "Lucas F.", quote: "Rooftop event was dreamy. So well run.", avatarSeed: 29 },
  { id: 30, name: "Harper N.", quote: "Music, production, vibes—all 5 stars.", avatarSeed: 30 },
  { id: 31, name: "Henry D.", quote: "Corporate event that actually felt fun.", avatarSeed: 31 },
  { id: 32, name: "Ella V.", quote: "LUPFR delivered beyond what we asked for.", avatarSeed: 32 },
  { id: 33, name: "Sebastian J.", quote: "Warehouse session. Best night of the year.", avatarSeed: 33 },
  { id: 34, name: "Scarlett M.", quote: "Every party should be this good. Book them.", avatarSeed: 34 },
  { id: 35, name: "Jack K.", quote: "Boat party on the Bay. Unreal experience.", avatarSeed: 35 },
  { id: 36, name: "Grace R.", quote: "From first contact to last song—perfect.", avatarSeed: 36 },
  { id: 37, name: "Aiden P.", quote: "Sound quality and production were top.", avatarSeed: 37 },
  { id: 38, name: "Victoria T.", quote: "We'll definitely book again. So good.", avatarSeed: 38 },
  { id: 39, name: "Wyatt S.", quote: "Rooftop vibes, golden hour. Perfect.", avatarSeed: 39 },
  { id: 40, name: "Penelope W.", quote: "Best event production in the city.", avatarSeed: 40 },
  { id: 41, name: "Owen L.", quote: "Warehouse was packed and everyone had a blast.", avatarSeed: 41 },
  { id: 42, name: "Hannah C.", quote: "LUPFR made our launch unforgettable.", avatarSeed: 42 },
  { id: 43, name: "Samuel B.", quote: "Music selection was fire. Crowd loved it.", avatarSeed: 43 },
  { id: 44, name: "Addison H.", quote: "Smooth, professional, and so much fun.", avatarSeed: 44 },
  { id: 45, name: "Nathan F.", quote: "Boat party under the bridge. Iconic.", avatarSeed: 45 },
  { id: 46, name: "Layla N.", quote: "They get it. Best in the business.", avatarSeed: 46 },
  { id: 47, name: "Caleb D.", quote: "Rooftop event was everything we wanted.", avatarSeed: 47 },
  { id: 48, name: "Zoey V.", quote: "From setup to breakdown—flawless.", avatarSeed: 48 },
  { id: 49, name: "Hunter J.", quote: "San Francisco nightlife at its best.", avatarSeed: 49 },
  { id: 50, name: "Natalie M.", quote: "We've found our go-to for every event.", avatarSeed: 50 },
]

/** Fewer cards on mobile single-strip marquee (performance). */
const REVIEWS_MOBILE_STRIP: ReviewItem[] = REVIEWS_LEFT.slice(0, 18)

const REVIEWS_RIGHT: ReviewItem[] = [
  { id: 51, name: "Brandon S.", quote: "Incredible production. Will book again.", avatarSeed: 51 },
  { id: 52, name: "Kennedy L.", quote: "The energy they bring is unmatched.", avatarSeed: 52 },
  { id: 53, name: "Tyler R.", quote: "Boat party was the highlight of our summer.", avatarSeed: 53 },
  { id: 54, name: "Reagan C.", quote: "Professional, creative, and so much fun.", avatarSeed: 54 },
  { id: 55, name: "Blake W.", quote: "Warehouse party exceeded expectations.", avatarSeed: 55 },
  { id: 56, name: "Morgan T.", quote: "Best event we've ever thrown. Thank you.", avatarSeed: 56 },
  { id: 57, name: "Parker H.", quote: "Rooftop + LUPFR = perfect combination.", avatarSeed: 57 },
  { id: 58, name: "Quinn B.", quote: "Sound and lights were absolutely top tier.", avatarSeed: 58 },
  { id: 59, name: "Riley F.", quote: "They turned our vision into reality.", avatarSeed: 59 },
  { id: 60, name: "Hayden N.", quote: "Every detail was perfect. 5 stars.", avatarSeed: 60 },
  { id: 61, name: "Cameron D.", quote: "Bay Area's best. No doubt about it.", avatarSeed: 61 },
  { id: 62, name: "Skylar J.", quote: "Our guests are still talking about it.", avatarSeed: 62 },
  { id: 63, name: "Dakota M.", quote: "Boat party on the water. Dream come true.", avatarSeed: 63 },
  { id: 64, name: "Jordan K.", quote: "Smooth from start to finish. Book them.", avatarSeed: 64 },
  { id: 65, name: "Taylor P.", quote: "Warehouse session was next level.", avatarSeed: 65 },
  { id: 66, name: "Casey S.", quote: "Music, vibes, production—all flawless.", avatarSeed: 66 },
  { id: 67, name: "Avery W.", quote: "We'll be back for every big event.", avatarSeed: 67 },
  { id: 68, name: "Morgan L.", quote: "Rooftop event was magical. So good.", avatarSeed: 68 },
  { id: 69, name: "Riley C.", quote: "Best night in San Francisco. Period.", avatarSeed: 69 },
  { id: 70, name: "Peyton T.", quote: "LUPFR knows how to move a crowd.", avatarSeed: 70 },
  { id: 71, name: "Drew H.", quote: "Professional and so much fun. Recommend.", avatarSeed: 71 },
  { id: 72, name: "Jesse B.", quote: "From booking to execution—perfect.", avatarSeed: 72 },
  { id: 73, name: "Kendall F.", quote: "Boat party was unforgettable. Thank you.", avatarSeed: 73 },
  { id: 74, name: "Reese N.", quote: "Sound quality was incredible. Loved it.", avatarSeed: 74 },
  { id: 75, name: "Sage D.", quote: "Warehouse vibes were exactly what we wanted.", avatarSeed: 75 },
  { id: 76, name: "Finley J.", quote: "Our go-to for every major event now.", avatarSeed: 76 },
  { id: 77, name: "Emerson M.", quote: "Rooftop sunset + great music. Perfect.", avatarSeed: 77 },
  { id: 78, name: "Rowan K.", quote: "They delivered beyond our expectations.", avatarSeed: 78 },
  { id: 79, name: "Charlie P.", quote: "Best event production in the Bay.", avatarSeed: 79 },
  { id: 80, name: "Frankie S.", quote: "Smooth ops, great crowd, amazing night.", avatarSeed: 80 },
  { id: 81, name: "River W.", quote: "Boat party under the stars. Incredible.", avatarSeed: 81 },
  { id: 82, name: "Shiloh L.", quote: "We've worked with many. LUPFR is the best.", avatarSeed: 82 },
  { id: 83, name: "Phoenix C.", quote: "Rooftop event was everything. Book them.", avatarSeed: 83 },
  { id: 84, name: "Arlo T.", quote: "Music and production were top notch.", avatarSeed: 84 },
  { id: 85, name: "Ellis H.", quote: "Warehouse party—best night of the year.", avatarSeed: 85 },
  { id: 86, name: "Remington B.", quote: "From first call to last song—flawless.", avatarSeed: 86 },
  { id: 87, name: "Sawyer F.", quote: "San Francisco's finest. No question.", avatarSeed: 87 },
  { id: 88, name: "Harley N.", quote: "Our launch party was a huge success.", avatarSeed: 88 },
  { id: 89, name: "Marley D.", quote: "Boat party vibes were unmatched.", avatarSeed: 89 },
  { id: 90, name: "Dylan J.", quote: "They get the crowd moving every time.", avatarSeed: 90 },
  { id: 91, name: "Hayden M.", quote: "Rooftop + golden hour. Perfect combo.", avatarSeed: 91 },
  { id: 92, name: "Parker K.", quote: "Best event we've ever attended.", avatarSeed: 92 },
  { id: 93, name: "Quinn R.", quote: "Sound, lights, energy—all 5 stars.", avatarSeed: 93 },
  { id: 94, name: "Blair P.", quote: "Warehouse session was fire. Will return.", avatarSeed: 94 },
  { id: 95, name: "Reese S.", quote: "LUPFR made our night unforgettable.", avatarSeed: 95 },
  { id: 96, name: "Cameron W.", quote: "Professional team. Amazing results.", avatarSeed: 96 },
  { id: 97, name: "Dakota L.", quote: "Boat party on the Bay. Iconic night.", avatarSeed: 97 },
  { id: 98, name: "Skylar C.", quote: "Every detail was thought through. Love it.", avatarSeed: 98 },
  { id: 99, name: "Jordan T.", quote: "Best in the business. Book with confidence.", avatarSeed: 99 },
  { id: 100, name: "Taylor H.", quote: "We'll be back. Again and again.", avatarSeed: 100 },
]

/** Third strip: mix of left and right for variety. */
const REVIEWS_MIDDLE: ReviewItem[] = [
  ...REVIEWS_LEFT.slice(0, 25),
  ...REVIEWS_RIGHT.slice(0, 25),
]

function GoldStars({ rating }: { rating: StarRating }) {
  const full = Math.floor(rating)
  const hasHalf = rating % 1 !== 0
  return (
    <div className="flex items-center gap-px shrink-0" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full) {
          return (
            <span key={i} className="stars-modern text-[0.65rem] sm:text-[0.75rem] leading-none">
              ★
            </span>
          )
        }
        if (hasHalf && i === full + 1) {
          return (
            <span key={i} className="stars-modern stars-half text-[0.65rem] sm:text-[0.75rem] leading-none">
              ★
            </span>
          )
        }
        return (
          <span key={i} className="text-border/60 text-[0.65rem] sm:text-[0.75rem] leading-none">
            ★
          </span>
        )
      })}
    </div>
  )
}

export type MarqueeLayer = "back" | "mid" | "front"
type MarqueeSpeed = "slow" | "medium" | "fast"

function ReviewItemBlock({
  review,
  layer = "front",
}: {
  review: ReviewItem
  layer?: MarqueeLayer
}) {
  const rating = getRating(review.id)
  return (
    <div
      className={`reviews-item reviews-item--${layer} flex shrink-0 items-center gap-4 sm:gap-5 min-w-[320px] sm:min-w-[380px]`}
    >
      <img
        src={`https://i.pravatar.cc/128?u=review-${review.avatarSeed}`}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className="rounded-full size-14 sm:size-16 object-cover shrink-0 border-2 border-border/80"
      />
      <div className="flex flex-col gap-1.5 min-w-0">
        <GoldStars rating={rating} />
        <p className="text-sm sm:text-base text-foreground/90 line-clamp-2 font-medium leading-snug">
          &ldquo;{review.quote}&rdquo;
        </p>
        <span className="text-sm text-muted-foreground">{review.name}</span>
      </div>
    </div>
  )
}

function MarqueeTrack({
  reviews,
  direction,
  reducedMotion,
  layer,
  speed,
  flat = false,
}: {
  reviews: ReviewItem[]
  direction: "left" | "right"
  reducedMotion: boolean | null
  layer: MarqueeLayer
  speed: MarqueeSpeed
  /** Single-strip mobile layout: no 3D / filter / saturate (cheaper compositing). */
  flat?: boolean
}) {
  const content = (
    <>
      {reviews.map((r) => (
        <ReviewItemBlock key={r.id} review={r} layer={flat ? "front" : layer} />
      ))}
    </>
  )

  const stripClass = flat
    ? "reviews-marquee-outer reviews-marquee-strip--flat overflow-hidden py-1 sm:py-2"
    : `reviews-marquee-outer reviews-marquee-strip--${layer} overflow-hidden py-1 sm:py-2`

  const innerSpeedClass = flat ? "reviews-marquee-inner--mobile" : `reviews-marquee-inner--${speed}`

  return (
    <div className={stripClass}>
      <div
        className={`reviews-marquee-inner ${innerSpeedClass} flex gap-3 sm:gap-4 w-max ${
          direction === "left"
            ? "reviews-marquee-left"
            : "reviews-marquee-right"
        } ${reducedMotion ? "reviews-marquee-paused" : ""}`}
        style={{ width: "max-content" }}
      >
        {content}
        {content}
      </div>
    </div>
  )
}

export function ReviewsMarqueeArchive() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  return (
    <div
      className={
        isMobile === true
          ? "flex flex-col gap-0"
          : "flex flex-col gap-0 [perspective:1200px] [transform-style:preserve-3d]"
      }
    >
      {isMobile === true ? (
        <MarqueeTrack
          reviews={REVIEWS_MOBILE_STRIP}
          direction="left"
          reducedMotion={reducedMotion}
          layer="front"
          speed="medium"
          flat
        />
      ) : (
        <>
          <MarqueeTrack
            reviews={REVIEWS_LEFT}
            direction="left"
            reducedMotion={reducedMotion}
            layer="back"
            speed="slow"
          />
          <MarqueeTrack
            reviews={REVIEWS_RIGHT}
            direction="right"
            reducedMotion={reducedMotion}
            layer="mid"
            speed="medium"
          />
          <MarqueeTrack
            reviews={REVIEWS_MIDDLE}
            direction="left"
            reducedMotion={reducedMotion}
            layer="front"
            speed="fast"
          />
        </>
      )}
    </div>
  )
}
