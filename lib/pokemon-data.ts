export type PokemonData = {
  number: string
  name: string
  type1: string
  type2?: string
}

export async function loadPokemonData(): Promise<Map<string, PokemonData>> {
  const CSV_URL =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E3%83%9B%E3%82%9A%E3%82%B1%E3%83%A2%E3%83%B3_%E3%81%97%E3%82%8A%E3%81%A8%E3%82%8A%20-%20%E3%82%B7%E3%83%BC%E3%83%881-Pt1zIgXI0v9BDrPGk3MaQi0PwbDC0j.csv"

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
