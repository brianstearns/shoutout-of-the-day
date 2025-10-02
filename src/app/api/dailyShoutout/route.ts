import { NextResponse } from "next/server";

// Simple deterministic hash function for daily consistency
function hashStringToInt(str: string, max: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

// In-memory cache
let cachedShoutout: any = null;
let cachedDate: string | null = null;

async function fetchRandomPage(): Promise<any[] | null> {
  try {
    const res = await fetch(
      "https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json&origin=*"
    );
    const data = await res.json();
    return data.query.random;
  } catch (error) {
    console.error("Error fetching random pages:", error);
    return null;
  }
}

async function getPageDetails(title: string) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        title
      )}&prop=extracts|pageimages|pageprops&exintro&explaintext&format=json&pithumbsize=300&origin=*`
    );
    const data = await res.json();
    const pageId = Object.keys(data.query.pages)[0];
    const page = data.query.pages[pageId];

    // Check if page has a Wikidata ID
    const wikidataId = page.pageprops?.wikibase_item;
    if (!wikidataId) return null;

    // Fetch Wikidata entity to check if it is a human (Q5)
    const wikidataRes = await fetch(
      `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`
    );
    const wikidataData = await wikidataRes.json();
    const entity = wikidataData.entities[wikidataId];

    if (
      entity.claims?.P31?.some(
        (claim: any) => claim.mainsnak.datavalue.value.id === "Q5"
      )
    ) {
      return page; // It's a person
    }

    return null; // Not a person
  } catch (error) {
    console.error("Error fetching page details:", error);
    return null;
  }
}

async function getDailyShoutout() {
  const today = new Date().toISOString().split("T")[0];

  // Return cached shoutout if it's still today
  if (cachedShoutout && cachedDate === today) {
    return cachedShoutout;
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const pages = await fetchRandomPage();
    if (!pages || pages.length === 0) continue;

    const index = hashStringToInt(today, pages.length);
    const page = pages[index];

    const pageInfo = await getPageDetails(page.title);
    if (!pageInfo) continue;

    if (
      pageInfo.extract &&
      pageInfo.extract.length > 20 &&
      pageInfo.thumbnail &&
      /(\bborn\b|\bdied\b|\bAmerican\b|\bBritish\b|\bFrench\b|\bpolitician\b|\bartist\b|\bplayer\b)/i.test(
        pageInfo.extract
      )
    ) {
      const shoutout = {
        name: pageInfo.title,
        description: pageInfo.extract,
        image: pageInfo.thumbnail.source,
      };
      cachedShoutout = shoutout;
      cachedDate = today;
      return shoutout;
    }
  }

  // fallback
  const fallback = { name: "Unknown", description: "Couldn't find a person with an image today", image: null };
  cachedShoutout = fallback;
  cachedDate = today;
  return fallback;
}

export async function GET() {
  try {
    const shoutout = await getDailyShoutout();
    return NextResponse.json(shoutout);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ name: "Unknown", description: "Failed to fetch data", image: null });
  }
}
