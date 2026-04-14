export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: 'bebes' | 'ninas' | 'ninos' | 'accesorios';
    stock: number;
    rating?: number;
    /** Mostrar en bloque "destacados" del inicio */
    is_featured?: boolean;
}
