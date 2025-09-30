export type PokemonData = {
  number: string
  name: string
  type1: string
  type2?: string
}

export async function loadPokemonData(): Promise<Map<string, PokemonData>> {
  const CSV_URL =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokemon-data_v2-ERSzI2cgqJxe4gIRkCtrwFDvM3FkUU.csv"

  try {
    const response = await fetch(CSV_URL)
    const csvText = await response.text()

    const lines = csvText.split("\n")
    const pokemonMap = new Map<string, PokemonData>()

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const columns = line.split(",")
      if (columns.length < 3) continue

      const hiddenFlag = columns[4]?.trim()

      // Skip Pokemon with hidden flag
      if (hiddenFlag) continue

      const pokemonData: PokemonData = {
        number: columns[0].trim(),
        name: columns[1].trim(),
        type1: columns[2].trim(),
        type2: columns[3]?.trim() || undefined,
      }

      pokemonMap.set(pokemonData.name, pokemonData)
    }

    return pokemonMap
  } catch (error) {
    console.error("[v0] Failed to load Pokemon data:", error)
    return new Map()
  }
}

export function getRandomPokemon(
  pokemonMap: Map<string, PokemonData>,
  filterFn?: (pokemon: PokemonData) => boolean,
): PokemonData | null {
  let pokemonArray = Array.from(pokemonMap.values())

  if (filterFn) {
    pokemonArray = pokemonArray.filter(filterFn)
  }

  if (pokemonArray.length === 0) return null
  const randomIndex = Math.floor(Math.random() * pokemonArray.length)
  return pokemonArray[randomIndex]
}
