import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const WILD_POOL = [
  { species: "pidgey",    types: ["normal","flying"],      hp: 40, atk: 45, def: 40, rarity: "Common"   },
  { species: "rattata",   types: ["normal"],               hp: 30, atk: 56, def: 35, rarity: "Common"   },
  { species: "caterpie",  types: ["bug"],                  hp: 45, atk: 30, def: 35, rarity: "Common"   },
  { species: "zubat",     types: ["poison","flying"],      hp: 40, atk: 45, def: 35, rarity: "Common"   },
  { species: "oddish",    types: ["grass","poison"],       hp: 45, atk: 50, def: 55, rarity: "Common"   },
  { species: "meowth",    types: ["normal"],               hp: 40, atk: 45, def: 35, rarity: "Common"   },
  { species: "psyduck",   types: ["water"],                hp: 50, atk: 52, def: 48, rarity: "Uncommon" },
  { species: "growlithe", types: ["fire"],                 hp: 55, atk: 70, def: 45, rarity: "Uncommon" },
  { species: "geodude",   types: ["rock","ground"],        hp: 40, atk: 80, def: 100, rarity: "Uncommon"},
  { species: "slowpoke",  types: ["water","psychic"],      hp: 90, atk: 65, def: 65, rarity: "Uncommon" },
  { species: "gastly",    types: ["ghost","poison"],       hp: 30, atk: 35, def: 30, rarity: "Uncommon" },
  { species: "machop",    types: ["fighting"],             hp: 70, atk: 80, def: 50, rarity: "Uncommon" },
  { species: "horsea",    types: ["water"],                hp: 30, atk: 40, def: 70, rarity: "Uncommon" },
  { species: "eevee",     types: ["normal"],               hp: 55, atk: 55, def: 50, rarity: "Rare"     },
  { species: "abra",      types: ["psychic"],              hp: 25, atk: 20, def: 15, rarity: "Rare"     },
  { species: "voltorb",   types: ["electric"],             hp: 40, atk: 30, def: 50, rarity: "Rare"     },
  { species: "jigglypuff",types: ["normal","fairy"],      hp: 115, atk: 45, def: 20, rarity: "Rare"     },
  { species: "magikarp",  types: ["water"],                hp: 20, atk: 10, def: 55, rarity: "Common"   },
  { species: "staryu",    types: ["water"],                hp: 30, atk: 45, def: 55, rarity: "Rare"     },
  { species: "snorlax",   types: ["normal"],               hp: 160, atk: 110, def: 65, rarity: "Epic"   },
  { species: "chansey",   types: ["normal"],               hp: 250, atk: 5,  def: 5,  rarity: "Epic"    },
  { species: "dragonair", types: ["dragon"],               hp: 61, atk: 84, def: 65, rarity: "Epic"     },
  { species: "scyther",   types: ["bug","flying"],         hp: 70, atk: 110, def: 80, rarity: "Epic"    },
  { species: "dratini",   types: ["dragon"],               hp: 41, atk: 64, def: 45, rarity: "Rare"     },
  { species: "bulbasaur", types: ["grass","poison"],       hp: 45, atk: 49, def: 49, rarity: "Rare"     },
  { species: "charmander",types: ["fire"],                 hp: 39, atk: 52, def: 43, rarity: "Rare"     },
  { species: "squirtle",  types: ["water"],                hp: 44, atk: 48, def: 65, rarity: "Rare"     },
  { species: "pikachu",   types: ["electric"],             hp: 35, atk: 55, def: 40, rarity: "Uncommon" },
  { species: "gengar",    types: ["ghost","poison"],       hp: 60, atk: 65, def: 60, rarity: "Epic"     },
  { species: "lapras",    types: ["water","ice"],          hp: 130, atk: 85, def: 80, rarity: "Epic"    },
];

// Weighted selection: Common=50%, Uncommon=30%, Rare=15%, Epic=5%
const WEIGHTS: Record<string, number> = { Common: 50, Uncommon: 30, Rare: 15, Epic: 5 };

function pickWild() {
  const pool: typeof WILD_POOL = [];
  for (const p of WILD_POOL) {
    const w = WEIGHTS[p.rarity] ?? 10;
    for (let i = 0; i < w; i++) pool.push(p);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const base = pickWild();
    const level = Math.floor(Math.random() * 30) + 1;
    const isShiny = Math.random() < 0.01; // 1% shiny
    const iv = Math.floor(Math.random() * 31) + 1;

    const maxHp = Math.floor(base.hp + level * 2.5 + Math.random() * 10);
    const atk   = Math.floor(base.atk + level * 0.8);
    const def   = Math.floor(base.def + level * 0.8);

    // Pokémon Showdown sprites (reliable, no ID needed)
    const spriteName = base.species.replace(/-/g, "").toLowerCase();
    const sprite = isShiny
      ? `https://play.pokemonshowdown.com/sprites/gen5-shiny/${spriteName}.gif`
      : `https://play.pokemonshowdown.com/sprites/gen5/${spriteName}.gif`;

    return NextResponse.json({
      species: base.species,
      name: base.species.charAt(0).toUpperCase() + base.species.slice(1),
      types: base.types,
      rarity: base.rarity,
      level,
      maxHp,
      hp: maxHp,
      atk,
      def,
      iv,
      shiny: isShiny,
      sprite,
    });
  } catch (err) {
    console.error("Spawn error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
