// app/data/books.ts
export type Book = {
  id: string;
  title: string;
  price: number;
  desc?: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  longDesc: string;
  image: any;
};

const books: Book[] = [
  {
    id: "1",
    title: "Semua Untuk Hindia",
    price: 85000,
    desc: "Buku sejarah dan kisah Hindia.",
    author: "Iksaka Banu",
    publisher: "Gramedia Pustaka Utama",
    year: 2018,
    category: "Sejarah",
    longDesc:
      "Sebuah kumpulan cerita yang menggambarkan kehidupan masyarakat di masa kolonial Hindia Belanda. Ditulis dengan pendekatan sejarah dan gaya bahasa yang menarik.",
    image: require("../../assets/images/semuauntukhindia.jpg"),
  },
  {
    id: "2",
    title: "Algoritma",
    price: 92000,
    desc: "Belajar dasar-dasar algoritma untuk pemrograman modern.",
    author: "Rinaldi Munir",
    publisher: "Informatika",
    year: 2020,
    category: "Teknologi",
    longDesc:
      "Buku ini menjelaskan konsep algoritma mulai dari dasar hingga tingkat menengah dengan contoh kasus dunia nyata dan implementasi kode.",
    image: require("../../assets/images/algoritma.jpg"),
  },
  {
    id: "3",
    title: "Bahasa Indonesia",
    price: 78000,
    desc: "Materi lengkap bahasa Indonesia untuk pelajar.",
    author: "Sugeng Riyanto",
    publisher: "Erlangga",
    year: 2022,
    category: "Pendidikan",
    longDesc:
      "Membahas materi bahasa Indonesia mulai dari ejaan, sintaksis, paragraf, hingga teks sastra sesuai kurikulum terbaru.",
    image: require("../../assets/images/bahasaindonesia.jpg"),
  },
  {
    id: "4",
    title: "Buya Hamka",
    price: 90000,
    desc: "Kumpulan karya Buya Hamka.",
    author: "Haji Abdul Malik Karim Amrullah",
    publisher: "Mizan",
    year: 2019,
    category: "Biografi",
    longDesc:
      "Mengungkap perjalanan hidup Buya Hamka, perjuangan intelektual, kisah perjalanan dakwah, dan pemikirannya yang mendalam.",
    image: require("../../assets/images/buyahamka.jpg"),
  },
  {
    id: "5",
    title: "Mimpi Di Balik Patah Hati",
    price: 70000,
    desc: "Kumpulan puisi dan kisah inspiratif.",
    author: "Salsa Purnama",
    publisher: "GagasMedia",
    year: 2021,
    category: "Romansa",
    longDesc:
      "Buku berisi kisah-kisah motivasi tentang bangkit dari patah hati, disampaikan melalui puisi dan narasi yang menyentuh.",
    image: require("../../assets/images/mimpi.jpg"),
  },
  {
    id: "6",
    title: "Pemrograman",
    price: 110000,
    desc: "Panduan pemrograman praktis.",
    author: "Ahmad Nazir",
    publisher: "Deepublish",
    year: 2020,
    category: "Teknologi",
    longDesc:
      "Buku ini membantu pemula memahami cara kerja pemrograman menggunakan contoh nyata dan latihan yang mudah diikuti.",
    image: require("../../assets/images/pemrograman.jpg"),
  },
];

export default books;