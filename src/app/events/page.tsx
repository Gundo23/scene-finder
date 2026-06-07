import { supabase } from "@/lib/supabase";
import Link from "next/link";
import FallbackImage from "@/app/components/FallbackImage";
import { cleanText } from "@/lib/cleanText";

const PLACEHOLDER_IMAGE = "/images/venue-placeholder.jpg";

const EVENT_TAG_OPTIONS = [
  "Newbie Friendly",
  "Couples",
  "Single Men Welcome",
  "Single Women Welcome",
  "Curvy / BBW",
  "Interracial",
  "Greedy Girls",
  "Bi",
  "Hotwife",
  "Cuckold",
  "Bull Night",
  "Unicorn Friendly",
  "Fetish",
  "Kink",
  "BDSM",
  "Rope",
  "Shibari",
  "Dom/Sub",
  "Leather",
  "Latex",
  "Roleplay",
  "Masked",
  "Fantasy",
  "Voyeur",
  "Exhibitionist",
  "Nudist",
  "Naturist",
  "LGBTQ+",
  "Trans Friendly",
  "Social",
  "Munch",
  "Meet & Greet",
  "Party",
  "Club Night",
  "Play Party",
  "Sauna",
  "Workshop",
  "Hotel Takeover",
  "Weekender",
  "Festival",
  "Retreat",
];

function formatDate(date: string | null) {
  if (!date) return "Date TBC";

  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) return null;
  return time.slice(0, 5);
}

function inferEventTags(event: any) {
  const savedTags = Array.isArray(event.tags)
    ? event.tags.map((tag: string) => cleanText(tag)).filter(Boolean)
    : [];

  const text = cleanText(
    `${event.event_name || ""} ${event.description || ""} ${event.event_type || ""}`,
  ).toLowerCase();

  const compactText = text.replace(/[^a-z0-9]/g, "");
  const tags = new Set<string>(savedTags);

  if (
    text.includes("newbie") ||
    text.includes("newcomer") ||
    text.includes("first time")
  )
    tags.add("Newbie Friendly");
  if (text.includes("couple")) tags.add("Couples");
  if (
    text.includes("single men") ||
    text.includes("single man") ||
    text.includes("single male") ||
    text.includes("single guy") ||
    text.includes("single gent")
  )
    tags.add("Single Men Welcome");
  if (
    text.includes("single women") ||
    text.includes("single woman") ||
    text.includes("single female") ||
    text.includes("single ladies") ||
    text.includes("single lady")
  )
    tags.add("Single Women Welcome");
  if (
    text.includes("bbw") ||
    text.includes("curvy") ||
    text.includes("full figured") ||
    text.includes("full figure")
  )
    tags.add("Curvy / BBW");
  if (text.includes("interracial") || text.includes("black magic"))
    tags.add("Interracial");
  if (text.includes("greedy girl")) tags.add("Greedy Girls");
  if (text.includes("bi") || text.includes("bisexual")) tags.add("Bi");
  if (text.includes("hotwife") || text.includes("hot wife"))
    tags.add("Hotwife");
  if (text.includes("cuckold") || text.includes("cuck")) tags.add("Cuckold");
  if (text.includes("bull")) tags.add("Bull Night");
  if (text.includes("unicorn")) tags.add("Unicorn Friendly");
  if (text.includes("fetish")) tags.add("Fetish");

  if (
    text.includes("kink") ||
    text.includes("fetish") ||
    text.includes("bdsm") ||
    compactText.includes("bdsm") ||
    text.includes("bondage") ||
    text.includes("domination") ||
    text.includes("dominance") ||
    text.includes("submission") ||
    text.includes("submissive") ||
    text.includes("dom/sub") ||
    text.includes("dom sub") ||
    text.includes("d/s")
  ) {
    tags.add("Kink");
  }

  if (
    text.includes("bdsm") ||
    compactText.includes("bdsm") ||
    text.includes("b d s m") ||
    text.includes("b.d.s.m") ||
    text.includes("bondage") ||
    text.includes("discipline") ||
    text.includes("dominance") ||
    text.includes("domination") ||
    text.includes("submission") ||
    text.includes("submissive") ||
    text.includes("sadism") ||
    text.includes("masochism") ||
    text.includes("dom/sub") ||
    text.includes("dom sub") ||
    text.includes("d/s")
  ) {
    tags.add("BDSM");
  }

  if (text.includes("rope")) tags.add("Rope");
  if (text.includes("shibari")) tags.add("Shibari");
  if (text.includes("dom") || text.includes("sub")) tags.add("Dom/Sub");
  if (text.includes("leather")) tags.add("Leather");
  if (text.includes("latex") || text.includes("rubber")) tags.add("Latex");
  if (text.includes("roleplay") || text.includes("role play"))
    tags.add("Roleplay");
  if (text.includes("mask") || text.includes("masquerade")) tags.add("Masked");
  if (text.includes("fantasy")) tags.add("Fantasy");
  if (text.includes("voyeur")) tags.add("Voyeur");
  if (text.includes("exhibition")) tags.add("Exhibitionist");
  if (
    text.includes("nudist") ||
    text.includes("naturist") ||
    text.includes("naked")
  )
    tags.add("Nudist");
  if (text.includes("lgbt") || text.includes("queer")) tags.add("LGBTQ+");
  if (text.includes("trans")) tags.add("Trans Friendly");
  if (text.includes("social")) tags.add("Social");
  if (text.includes("munch")) tags.add("Munch");
  if (text.includes("meet") || text.includes("greet")) tags.add("Meet & Greet");
  if (text.includes("party")) tags.add("Party");
  if (text.includes("club night")) tags.add("Club Night");
  if (text.includes("play party")) tags.add("Play Party");
  if (text.includes("sauna")) tags.add("Sauna");
  if (text.includes("workshop")) tags.add("Workshop");
  if (text.includes("hotel takeover")) tags.add("Hotel Takeover");
  if (text.includes("weekender") || text.includes("weekend"))
    tags.add("Weekender");
  if (text.includes("festival") || text.includes("fest")) tags.add("Festival");
  if (text.includes("retreat")) tags.add("Retreat");

  if (tags.size === 0) tags.add("General");

  return [...tags];
}

function distanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const radius = 3958.8;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
}

type PostcodeCoordinates = {
  latitude: number;
  longitude: number;
};

async function getPostcodeCoordinates(
  postcode: string,
): Promise<PostcodeCoordinates | null> {
  const cleanedPostcode = postcode.replace(/\s+/g, "").trim();

  if (!cleanedPostcode) return null;

  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanedPostcode)}`,
      { next: { revalidate: 60 * 60 * 24 } },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const latitude = Number(data?.result?.latitude);
    const longitude = Number(data?.result?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    type?: string | string[];
    region?: string;
    city?: string;
    postcode?: string;
    distance?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.search || "";
  const selectedTag = Array.isArray(params.type)
    ? params.type[0] || ""
    : params.type || "";
  const region = params.region || "";
  const city = params.city || "";
  const postcode = params.postcode || "";
  const distance = params.distance || "";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const selectedDistance = distance ? Number(distance) : null;
  const postcodeCoordinates = postcode
    ? await getPostcodeCoordinates(postcode)
    : null;
  const postcodeSearchFailed = Boolean(postcode && selectedDistance && !postcodeCoordinates);

  const today = new Date().toISOString().split("T")[0];
  const queryStartDate = startDate || today;

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .or(`event_date.gte.${queryStartDate},event_date.is.null`)
    .limit(1000);

  const { data: venues } = await supabase
    .from("venues")
    .select("venue_id, name, city_area, region, latitude, longitude");

  const venueMap = new Map(
    venues?.map((venue) => [venue.venue_id, venue]) || [],
  );

  const cities = [
    ...new Set(
      venues
        ?.map((venue) => venue.city_area)
        .filter(Boolean)
        .sort(),
    ),
  ];


  const filteredEvents = events
    ?.filter((event) => {
      const venue = venueMap.get(event.venue_id);
      const searchTerm = cleanText(search).toLowerCase();
      const eventTags = inferEventTags(event);

      const searchMatch =
        !search ||
        cleanText(event.event_name || "")
          .toLowerCase()
          .includes(searchTerm) ||
        cleanText(event.event_type || "")
          .toLowerCase()
          .includes(searchTerm) ||
        cleanText(event.description || "")
          .toLowerCase()
          .includes(searchTerm) ||
        cleanText(event.ticket_url || "")
          .toLowerCase()
          .includes(searchTerm) ||
        cleanText(event.source_url || "")
          .toLowerCase()
          .includes(searchTerm) ||
        eventTags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        cleanText(venue?.name || "")
          .toLowerCase()
          .includes(searchTerm) ||
        cleanText(venue?.city_area || "")
          .toLowerCase()
          .includes(searchTerm) ||
        cleanText(venue?.region || "")
          .toLowerCase()
          .includes(searchTerm);

      const tagMatch =
        !selectedTag ||
        eventTags.some(
          (eventTag) => eventTag.toLowerCase() === selectedTag.toLowerCase(),
        );

      const regionMatch =
        !region ||
        cleanText(venue?.region || "").toLowerCase() ===
          cleanText(region).toLowerCase();

      const cityMatch =
        !city ||
        cleanText(venue?.city_area || "").toLowerCase() ===
          cleanText(city).toLowerCase();

      const distanceMatch =
        !selectedDistance ||
        !postcode ||
        (!!postcodeCoordinates &&
          venue?.latitude &&
          venue?.longitude &&
          distanceInMiles(
            postcodeCoordinates.latitude,
            postcodeCoordinates.longitude,
            Number(venue.latitude),
            Number(venue.longitude),
          ) <= selectedDistance);

      const dateMatch =
        !startDate && !endDate
          ? true
          : !!event.event_date &&
            (!startDate || event.event_date >= startDate) &&
            (!endDate || event.event_date <= endDate);

      return (
        searchMatch &&
        tagMatch &&
        regionMatch &&
        cityMatch &&
        distanceMatch &&
        dateMatch
      );
    })
    .sort((a, b) => {
      if (!a.event_date && !b.event_date) return 0;
      if (!a.event_date) return 1;
      if (!b.event_date) return -1;
      return (
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );
    });

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-zinc-950 px-3 py-5 text-white sm:px-6 sm:py-10">
      <section className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <div className="flex justify-center">
          <FallbackImage
            src="/images/home-hero.jpg"
            fallbackSrc="/images/venue-placeholder.jpg"
            alt="Scene Finder"
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
        </div>

        <div className="mt-5">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            All Events
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-lg">
            Search all events by keyword, tags, town/city, postcode radius, date
            range, venue, or region.
          </p>
        </div>

        <form className="mt-5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="min-w-0 sm:col-span-2 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Keyword
              </label>
              <input
                name="search"
                defaultValue={search}
                placeholder="Curvy, couples, Leeds..."
                className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Event type
              </label>
              <select
                name="type"
                defaultValue={selectedTag}
                className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">All Event Types</option>
                {EVENT_TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Region
              </label>
              <select
                name="region"
                defaultValue={region}
                className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">All Regions</option>
                <option value="North West">North West</option>
                <option value="North East">North East</option>
                <option value="Yorkshire">Yorkshire</option>
                <option value="Midlands">Midlands</option>
                <option value="South East">South East</option>
                <option value="South West">South West</option>
                <option value="London">London</option>
                <option value="Wales">Wales</option>
                <option value="Scotland">Scotland</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Town / City
              </label>
              <select
                name="city"
                defaultValue={city}
                className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">All Towns</option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Postcode
              </label>
              <input
                name="postcode"
                defaultValue={postcode}
                placeholder="M1 1AA"
                className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 uppercase text-white placeholder:normal-case placeholder:text-zinc-500"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Distance from postcode
              </label>
              <select
                name="distance"
                defaultValue={distance}
                className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
              >
                <option value="">Any distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
              </select>
            </div>

            <div className="min-w-0 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Date range
              </label>
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                <input
                  type="date"
                  name="startDate"
                  defaultValue={startDate}
                  aria-label="Start date"
                  className="min-w-0 border-r border-zinc-700 bg-zinc-950 px-3 py-3 text-white [color-scheme:dark]"
                />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={endDate}
                  aria-label="End date"
                  className="min-w-0 bg-zinc-950 px-3 py-3 text-white [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex min-w-0 items-end">
              <button
                type="submit"
                className="w-full rounded-xl border border-blue-500 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-400"
              >
                Search
              </button>
            </div>
          </div>

          {postcodeSearchFailed && (
            <p className="mt-4 rounded-lg border border-amber-800 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
              Postcode not recognised. Check it and search again.
            </p>
          )}

          {selectedTag && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-800 bg-blue-950/40 px-3 py-1 text-xs text-blue-200">
                {selectedTag}
              </span>
            </div>
          )}

          {(search ||
            selectedTag ||
            region ||
            city ||
            postcode ||
            distance ||
            startDate ||
            endDate) && (
            <Link
              href="/events"
              className="mt-4 inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200"
            >
              Clear Filters
            </Link>
          )}
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          Showing {filteredEvents?.length || 0} of {events?.length || 0} events
        </p>

        <div className="mt-4 grid w-full grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents && filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const venue = venueMap.get(event.venue_id);
              const startTime = formatTime(event.start_time);
              const tags = inferEventTags(event);

              return (
                <Link
                  key={event.event_id}
                  href={`/events/${event.event_id}`}
                  className="group block min-w-0"
                >
                  <article className="h-full min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 hover:border-blue-500">
                    <div className="h-28 w-full overflow-hidden bg-zinc-950 sm:h-44">
                      <FallbackImage
                        src={event.image_url}
                        fallbackSrc={PLACEHOLDER_IMAGE}
                        alt={cleanText(event.event_name || "Event")}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 p-3 sm:p-4">
                      <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                        {tags.slice(0, 4).map((tag) => (
                          <p
                            key={tag}
                            className="max-w-full truncate rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300"
                          >
                            {tag}
                          </p>
                        ))}
                      </div>

                      <h2 className="line-clamp-2 break-words text-base font-semibold leading-snug sm:text-lg">
                        {cleanText(event.event_name || "Untitled event")}
                      </h2>

                      {venue && (
                        <p className="mt-2 truncate text-sm font-medium text-blue-400">
                          {cleanText(venue.name || "")}
                        </p>
                      )}

                      {venue && (
                        <p className="mt-1 truncate text-xs text-zinc-400 sm:text-sm">
                          {cleanText(venue.city_area || "")} •{" "}
                          {cleanText(venue.region || "")}
                        </p>
                      )}

                      <p className="mt-2 break-words text-xs font-medium text-zinc-300 sm:text-sm">
                        {formatDate(event.event_date)}
                        {startTime ? ` • ${startTime}` : ""}
                      </p>

                      {event.description && (
                        <p className="mt-2 line-clamp-2 break-words text-xs text-zinc-400 sm:text-sm">
                          {cleanText(event.description)}
                        </p>
                      )}

                      <div className="mt-4">
                        <span className="inline-flex items-center rounded-xl border border-blue-500 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition group-hover:bg-blue-500 group-hover:text-white">
                          View Event →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })
          ) : (
            <p className="text-zinc-400">No events found.</p>
          )}
        </div>
      </section>
    </main>
  );
}
