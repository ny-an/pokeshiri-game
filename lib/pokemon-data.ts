export type PokemonData = {
  number: string
  name: string
  type1: string
  type2?: string
}

export async function loadPokemonData(): Promise<Map<string, PokemonData>> {
  try {
    // ローカルのCSVファイルを読み込み
    const response = await fetch('/data/pokemon-list.csv')
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

export function getPokemonByFirstChar(
  pokemonMap: Map<string, PokemonData>,
  firstChar: string,
  usedNames: Set<string>,
  dakutenMap: { [key: string]: string[] },
): PokemonData | null {
  const variants = dakutenMap[firstChar] || [firstChar]

  const pokemonArray = Array.from(pokemonMap.values()).filter((pokemon) => {
    if (usedNames.has(pokemon.name)) return false
    const pokemonFirstChar = pokemon.name.charAt(0)
    return variants.includes(pokemonFirstChar)
  })

  if (pokemonArray.length === 0) return null
  const randomIndex = Math.floor(Math.random() * pokemonArray.length)
  return pokemonArray[randomIndex]
}

export function getAllPokemonSorted(pokemonMap: Map<string, PokemonData>): PokemonData[] {
  return Array.from(pokemonMap.values()).sort((a, b) => {
    const numA = Number.parseInt(a.number, 10)
    const numB = Number.parseInt(b.number, 10)
    return numA - numB
  })
}
