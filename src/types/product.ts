export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    /** All product images (including the primary one) */
    images?: string[];
    category: string;
    stock: number;
    rating?: number;
    /** Mostrar en bloque "destacados" del inicio */
    is_featured?: boolean;
}
