// src/lib/clubs.ts
export interface Club {
  slug: string;
  csvName: string;         // exact match with performance_team.csv `clube`
  displayName: string;
  badge: string;           // URL path starting with /
  backdrop: string | null; // URL path or null
}

export const CLUBS: Club[] = [
  { slug: "atletico-mg",          csvName: "Atletico MG",        displayName: "Atlético MG",          badge: "/clubs/Atlético.png",              backdrop: "/clubs_backdrop/atletico_backdrop.jpg" },
  { slug: "bahia",                csvName: "Bahia",              displayName: "Bahia",                badge: "/clubs/Bahia.png",                  backdrop: "/clubs_backdrop/bahia_backdrop.jpg" },
  { slug: "botafogo",             csvName: "Botafogo",           displayName: "Botafogo",             badge: "/clubs/Botafogo.png",               backdrop: "/clubs_backdrop/botafogo_backdrop.jpg" },
  { slug: "ceara",                csvName: "Ceara",              displayName: "Ceará",                badge: null as unknown as string,           backdrop: "/clubs_backdrop/ceara_backdrop.jpg" },
  { slug: "corinthians",          csvName: "Corinthians",        displayName: "Corinthians",          badge: "/clubs/Corinthians.png",            backdrop: "/clubs_backdrop/corinthians_backdrop.jpg" },
  { slug: "cruzeiro",             csvName: "Cruzeiro",           displayName: "Cruzeiro",             badge: "/clubs/Cruzeiro.png",               backdrop: "/clubs_backdrop/cruzeiro_backdrop.jpg" },
  { slug: "flamengo",             csvName: "Flamengo",           displayName: "Flamengo",             badge: "/clubs/Flamengo.png",               backdrop: "/clubs_backdrop/flamengo_backdrop.jpg" },
  { slug: "fluminense",           csvName: "Fluminense",         displayName: "Fluminense",           badge: "/clubs/Fluminense.png",             backdrop: "/clubs_backdrop/fluminense_backdrop.jpg" },
  { slug: "fortaleza",            csvName: "Fortaleza",          displayName: "Fortaleza",            badge: null as unknown as string,           backdrop: "/clubs_backdrop/fortaleza_backdrop.jpg" },
  { slug: "gremio",               csvName: "Gremio",             displayName: "Grêmio",               badge: "/clubs/Grêmio.png",                 backdrop: "/clubs_backdrop/gremio_backdrop.jpg" },
  { slug: "internacional",        csvName: "Internacional",      displayName: "Internacional",        badge: "/clubs/Internacional.png",          backdrop: "/clubs_backdrop/internacional_backdrop.jpg" },
  { slug: "juventude",            csvName: "Juventude",          displayName: "Juventude",            badge: null as unknown as string,           backdrop: "/clubs_backdrop/juventude_backdrop.jpg" },
  { slug: "mirassol",             csvName: "Mirassol",           displayName: "Mirassol",             badge: "/clubs/Mirassol.png",               backdrop: "/clubs_backdrop/mirassol_backdrop.jpg" },
  { slug: "palmeiras",            csvName: "Palmeiras",          displayName: "Palmeiras",            badge: "/clubs/Palmeiras.png",              backdrop: "/clubs_backdrop/palmeiras_backdrop.jpg" },
  { slug: "red-bull-bragantino",  csvName: "Red Bull Bragantino",displayName: "RB Bragantino",        badge: "/clubs/Red Bull Bragantino.png",    backdrop: "/clubs_backdrop/red_bull_bragantino_backdrop.jpg" },
  { slug: "santos",               csvName: "Santos",             displayName: "Santos",               badge: "/clubs/Santos.png",                 backdrop: "/clubs_backdrop/santos_backdrop.jpg" },
  { slug: "sao-paulo",            csvName: "Sao Paulo",          displayName: "São Paulo",            badge: "/clubs/São Paulo.png",              backdrop: "/clubs_backdrop/sao_paulo_backdrop.jpg" },
  { slug: "sport",                csvName: "Sport",              displayName: "Sport",                badge: null as unknown as string,           backdrop: "/clubs_backdrop/sport_backdrop.jpg" },
  { slug: "vasco-da-gama",        csvName: "Vasco",              displayName: "Vasco da Gama",        badge: "/clubs/Vasco.png",                  backdrop: "/clubs_backdrop/vasco_backdrop.jpg" },
  { slug: "vitoria",              csvName: "Vitoria",            displayName: "Vitória",              badge: "/clubs/Vitória.png",                backdrop: "/clubs_backdrop/vitoria_backdrop.jpg" },
];

export function bySlug(slug: string): Club | undefined {
  return CLUBS.find((c) => c.slug === slug);
}
export function byCsvName(name: string): Club | undefined {
  return CLUBS.find((c) => c.csvName === name);
}
