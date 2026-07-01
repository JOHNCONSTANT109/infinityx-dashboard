import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface UserDoc {
  _id: string;
  pc?: unknown[];
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.botKey) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const pokemon = await req.json();
    if (!pokemon || !pokemon.species) {
      return NextResponse.json({ error: "Invalid Pokémon data" }, { status: 400 });
    }

    // Catch probability based on remaining HP percentage
    const hpPercent = pokemon.maxHp > 0 ? (pokemon.hp / pokemon.maxHp) : 1;
    let catchRate: number;
    if (hpPercent <= 0.15)      catchRate = 0.90;
    else if (hpPercent <= 0.25) catchRate = 0.70;
    else if (hpPercent <= 0.50) catchRate = 0.40;
    else                        catchRate = 0.15;

    if (Math.random() > catchRate) {
      return NextResponse.json({ caught: false, message: "The Pokémon broke free! Weaken it more first." });
    }

    // Add to PC
    const db = await getDb();
    const caughtPokemon = {
      name: pokemon.name || pokemon.species,
      species: pokemon.species,
      level: pokemon.level || 1,
      hp: pokemon.maxHp,
      maxHp: pokemon.maxHp,
      types: pokemon.types || [],
      type: (pokemon.types || [])[0] || "normal",
      rarity: pokemon.rarity || "Common",
      shiny: pokemon.shiny || false,
      iv: pokemon.iv || 0,
      sprite: pokemon.sprite || "",
      caughtAt: Date.now(),
      caughtVia: "web-battle",
    };

    await (db.collection("users") as any).updateOne(
      { _id: session.botKey },
      { $push: { pc: caughtPokemon } as never },
      { upsert: true }
    );

    return NextResponse.json({
      caught: true,
      message: `Gotcha! ${caughtPokemon.name} was sent to your PC!`,
      pokemon: caughtPokemon,
    });
  } catch (err) {
    console.error("Catch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
