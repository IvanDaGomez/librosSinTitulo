export class BookCategories {
  static readonly formatsArr = ['Físico', 'Digital', 'AudioLibro']
  static readonly genresArr = [
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
  static readonly languagesArr = [
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
  static readonly statesArr = [
    'Nuevo Sellado',
    'Un solo Uso',
    'Usado',
    'Con detalles y Rayones'
  ]
  static readonly editionsArr = [
    '',
    '1ra Edición',
    '2da Edición',
    'Edición Especial',
    'Edición de Coleccionista',
    'Reimpresión',
    'Edición Limitada'
  ]
  static readonly coversArr = [
    '',
    'Dura',
    'Blanda',
    'Semi-Dura',
    'Edición de bolsillo',
    'Sin tapa'
  ]
  static readonly agesArr = [
    '',
    'Menor de 12 años',
    '13-18 años',
    '19-45 años',
    '46-65 años',
    'Más de 65 años'
  ]
  static readonly availabilitiesArr = [
    'Disponible',
    'No disponible',
    'Vendido',
    'En revisión'
  ]

  get formats () {
    return BookCategories.formatsArr
  }
  get genres () {
    return BookCategories.genresArr
  }
  get languages () {
    return BookCategories.languagesArr
  }
  get states () {
    return BookCategories.statesArr
  }
  get editions () {
    return BookCategories.editionsArr
  }
  get covers () {
    return BookCategories.coversArr
  }
  get ages () {
    return BookCategories.agesArr
  }
  get availabilities () {
    return BookCategories.availabilitiesArr
  }

  static isFormat (value: unknown): value is FormatType {
    return (BookCategories.formatsArr as readonly unknown[]).includes(value)
  }
  static isGenre (value: unknown): value is GenreType {
    return (BookCategories.genresArr as readonly unknown[]).includes(value)
  }
  static isLanguage (value: unknown): value is LanguageType {
    return (BookCategories.languagesArr as readonly unknown[]).includes(value)
  }
  static isState (value: unknown): value is StateType {
    return (BookCategories.statesArr as readonly unknown[]).includes(value)
  }
  static isEdition (value: unknown): value is EditionType {
    return (BookCategories.editionsArr as readonly unknown[]).includes(value)
  }
  static isCover (value: unknown): value is CoverType {
    return (BookCategories.coversArr as readonly unknown[]).includes(value)
  }
  static isAge (value: unknown): value is AgeType {
    return (BookCategories.agesArr as readonly unknown[]).includes(value)
  }
  static isAvailability (value: unknown): value is AvailabilityType {
    return (BookCategories.availabilitiesArr as readonly unknown[]).includes(
      value
    )
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
