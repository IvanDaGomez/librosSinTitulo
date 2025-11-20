import { DataType } from '@/utils/email/htmlTemplates'

export const mockEmailData: Required<DataType> = {
  book: {
    title: 'The Great Book of Programming',
    author: 'Jane Doe',
    price: 40000,
    offer: 0,
    isbn: '978-3-16-148410-0',
    images: ['https://example.com/book.png'],
    keywords: ['programming', 'book', 'technology'],
    id: '1234-5678-9101-1121-3141',
    description: 'A comprehensive book about programming.',
    status: 'Nuevo',
    genre: 'Technology',
    format: 'Physical',
    seller: 'John Doe',
    seller_id: 'd67b5339-c80b-4fab-847a-82aa1a303b8e',
    edition: '',
    language: 'Spanish',
    location: {
      city: 'Medellín',
      department: 'Antioquia',
      country: 'Colombia'
    },
    cover: 'Hardcover',
    age: '',
    created_at: '2012-12-12T10:00:00Z',
    updated_at: '2023-10-01T10:00:00Z',
    availability: 'Available',
    messages: [
      {
        question: 'Hello, I am interested in the book.',
        answer: 'Hello! Sure, the book is available.',
        sender_id: '9b922eb4-33e8-4781-9863-c066992e1620'
      },
      {
        question: 'Is it available?',
        answer: 'Yes, it is available for sale.',
        sender_id: '834a9dda-5cf5-4438-9499-eed4b8ec3e45'
      }
    ],
    collections_ids: ['88c87f69-4b49-4633-bfba-cd3d29b1a21d']
  },
  user: {
    id: '5678-9101-1121-3141-1234',
    name: 'John Doe',
    role: 'user',
    profile_picture: 'https://example.com/profile.png',
    email: 'john@gmail.com',
    password: 'hashed_password',
    shipping_address: {
      street: 'Calle 123',
      city: 'Medellín',
      country: 'Colombia',
      postal_code: '050001'
    },
    books_ids: ['1234-5678-9101-1121-3141'],
    account_status: 'Activo',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-10-01T10:00:00Z',
    bio: 'Software developer.',
    favorites: ['1234-5678-9101-1121-3141'],
    conversations_ids: ['1234-5678-9101-1121-3141'],
    notifications_ids: ['1234-5678-9101-1121-3141'],
    validated: true,
    login: 'Default',
    location: {
      street: 'Calle 123',
      city: 'Medellín',
      country: 'Colombia',
      postal_code: '050001'
    },
    followers: ['1234-5678-9101-1121-3141'],
    following: ['1234-5678-9101-1121-3141'],
    collections_ids: [
      {
        name: 'My favorite books',
        books_ids: ['1234-5678-9101-1121-3141']
      }
    ],
    purchases_ids: ['1234-5678-9101-1121-3141'],
    preferences: {
      programming: 5,
      technology: 3
    },
    search_history: {
      programming: 10,
      technology: 5
    },
    balance: {
      pending: 0,
      available: 100000,
      incoming: 0
    }
  },
  seller: {
    id: '5678-9101-1121-3141-1234',
    name: 'John Doe',
    role: 'user',
    profile_picture: 'https://example.com/profile.png',
    email: 'john@gmail.com',
    password: 'hashed_password',
    shipping_address: {
      street: 'Calle 123',
      city: 'Medellín',
      country: 'Colombia',
      postal_code: '050001'
    },
    books_ids: ['1234-5678-9101-1121-3141'],
    account_status: 'Activo',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-10-01T10:00:00Z',
    bio: 'Software developer.',
    favorites: ['1234-5678-9101-1121-3141'],
    conversations_ids: ['1234-5678-9101-1121-3141'],
    notifications_ids: ['1234-5678-9101-1121-3141'],
    validated: true,
    login: 'Default',
    location: {
      street: 'Calle 123',
      city: 'Medellín',
      country: 'Colombia',
      postal_code: '050001'
    },
    followers: ['1234-5678-9101-1121-3141'],
    following: ['1234-5678-9101-1121-3141'],
    collections_ids: [
      {
        name: 'My favorite books',
        books_ids: ['1234-5678-9101-1121-3141']
      }
    ],
    purchases_ids: ['1234-5678-9101-1121-3141'],
    preferences: {
      programming: 5,
      technology: 3
    },
    search_history: {
      programming: 10,
      technology: 5
    },
    balance: {
      pending: 0,
      available: 100000,
      incoming: 0
    }
  },
  transaction: {
    id: '1111-1111-1111-1111-1111',
    from_id: '5678-9101-1121-3141-1234',
    book_id: '1234-5678-9101-1121-3141',
    to_id: '5678-9101-1121-3141-1234',
    status: 'pending',
    metadata: {
      additional_info: {
        ip_address: '277.0.0.1'
      },
      address: {
        city: 'Medellín',
        department: 'Antioquia',
        neighborhood: 'El Poblado',
        street_name: 'Calle 10',
        street_number: '123',
        zip_code: '050001'
      },
      first_name: 'John',
      last_name: 'Doe',
      phone: {
        area_code: '57',
        number: '123456789'
      },
      status: 'pending'
    },
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2023-10-01T10:10:00Z'
  },
  shipping_details: {
    id: '2222-2222-2222-2222-2222',
    user_id: '5678-9101-1121-3141-1234',
    address: {
      street: 'Calle 123',
      city: 'Medellín',
      country: 'Colombia',
      postal_code: '050001'
    },
    status: 'pending',
    tracking_number: 'TRACK123456',
    carrier: 'DHL',
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2023-10-01T10:10:00Z'
  },
  metadata: {}
}
