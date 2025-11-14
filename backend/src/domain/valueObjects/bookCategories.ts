export class BookCategories {
  static readonly formats = ['Físico', 'Digital', 'AudioLibro']
  static readonly genres = [
    'Novela',
    'Ciencia ficción',
    'Fantasía',
    'Misterio',
    'Biografía',
    'Romance',
    'Tecnología',
    'Ingeniería',
    'Terror',
    'Histórica',
    'Poesía',
    'No ficción',
    'Literatura juvenil',
    'Thriller',
    'Policiaca',
    'Aventura',
    'Drama',
    'Autoayuda',
    'Ensayo',
    'Educativo',
    'Literatura contemporánea',
    'Literatura clásica',
    'Ficción histórica',
    'Cuento',
    'Ciencia popular',
    'Literatura erótica',
    'Ficción especulativa',
    'Gótico',
    'Steampunk',
    'Magical realism',
    'Parodia',
    'Distopía',
    'Realismo mágico',
    'Crónica',
    'Sátira',
    'Ficción psicológica',
    'Ficción literaria',
    'Relato corto',
    'Ficción de aventuras',
    'Amor',
    'Ficción familiar',
    'Filosofía',
    'Salud',
    'Gastronomía',
    'Cocina',
    'Ciencias políticas',
    'Tecnología',
    'Nativa gráfica',
    'Ciencia ficción distópica',
    'Ficción alternativa',
    'Antología',
    'Novela gráfica',
    'Nativa no lineal'
  ]
  static readonly languages = [
    'Español',
    'Inglés',
    'Francés',
    'Alemán',
    'Italiano',
    'Portugués',
    'Ruso',
    'Chino (Mandarín)',
    'Japonés',
    'Coreano',
    'Árabe',
    'Hindi',
    'Bengalí',
    'Turco',
    'Vietnamita',
    'Polaco',
    'Holandés',
    'Sueco',
    'Danés',
    'Noruego',
    'Finlandés',
    'Checo',
    'Húngaro',
    'Rumano',
    'Griego',
    'Hebreo',
    'Tailandés',
    'Ucraniano',
    'Malay',
    'Filipino (Tagalo)',
    'Indonesio',
    'Swahili',
    'Persa (Farsi)',
    'Serbio',
    'Croata',
    'Búlgaro',
    'Eslovaco',
    'Esloveno',
    'Catalán',
    'Gallego',
    'Vasco',
    'Latín',
    'Aragonés',
    'Sánscrito',
    'Tamil',
    'Telugu',
    'Gujarati',
    'Punjabi',
    'Otro'
  ]
  static readonly states = [
    'Nuevo Sellado',
    'Un solo Uso',
    'Usado',
    'Con detalles y Rayones'
  ]
  static readonly editions = [
    '',
    '1ra Edición',
    '2da Edición',
    'Edición Especial',
    'Edición de Coleccionista',
    'Reimpresión',
    'Edición Limitada'
  ]
  static readonly covers = [
    '',
    'Dura',
    'Blanda',
    'Semi-Dura',
    'Edición de bolsillo',
    'Sin tapa'
  ]
  static readonly ages = [
    '',
    'Menor de 12 años',
    '13-18 años',
    '19-45 años',
    '46-65 años',
    'Más de 65 años'
  ]
  static readonly availabilities = [
    'Disponible',
    'No disponible',
    'Vendido',
    'En revisión'
  ]

  get formats () {
    return BookCategories.formats
  }
  get genres () {
    return BookCategories.genres
  }
  get languages () {
    return BookCategories.languages
  }
  get states () {
    return BookCategories.states
  }
  get editions () {
    return BookCategories.editions
  }
  get covers () {
    return BookCategories.covers
  }
  get ages () {
    return BookCategories.ages
  }
  get availabilities () {
    return BookCategories.availabilities
  }

  static isFormat (value: unknown): value is FormatType {
    return (BookCategories.formats as readonly unknown[]).includes(value)
  }
  static isGenre (value: unknown): value is GenreType {
    return (BookCategories.genres as readonly unknown[]).includes(value)
  }
  static isLanguage (value: unknown): value is LanguageType {
    return (BookCategories.languages as readonly unknown[]).includes(value)
  }
  static isState (value: unknown): value is StateType {
    return (BookCategories.states as readonly unknown[]).includes(value)
  }
  static isEdition (value: unknown): value is EditionType {
    return (BookCategories.editions as readonly unknown[]).includes(value)
  }
  static isCover (value: unknown): value is CoverType {
    return (BookCategories.covers as readonly unknown[]).includes(value)
  }
  static isAge (value: unknown): value is AgeType {
    return (BookCategories.ages as readonly unknown[]).includes(value)
  }
  static isAvailability (value: unknown): value is AvailabilityType {
    return (BookCategories.availabilities as readonly unknown[]).includes(value)
  }
}

export type StateType = 'Nuevo' | 'Usado' | 'En reparación' | 'Desconocido'
export type GenreType = string
export type FormatType = 'Tapa blanda' | 'Tapa dura' | 'Digital' | string
export type EditionType = string
export type LanguageType = string
export type CoverType = 'Rústica' | 'Cartoné' | 'Ebook' | string
export type AgeType = 'Adulto' | 'Juvenil' | 'Infantil' | string
export type AvailabilityType = 'Disponible' | 'Agotado' | 'En revisión' | string

export { BookCategories as default, BookCategories as bookCategories }
