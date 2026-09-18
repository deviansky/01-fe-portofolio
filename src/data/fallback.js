/**
 * Data cadangan. Dipakai saat API be-portofolio tidak bisa dihubungi,
 * supaya halaman tetap tampil. Bentuknya HARUS sama persis dengan
 * response GET /api/portfolio (lihat docs/api-contract.md).
 *
 * Semua teks bertanda TODO wajib kamu cek/ganti sebelum dipublikasikan.
 */
export const fallbackPortfolio = {
  profile: {
    name: 'David Reza Widhiwipati',
    short_name: 'David Reza W.',
    headline: 'Fullstack Developer',
    tagline:
      'Saya membangun sistem yang dipakai tim operasional setiap hari: modul ERP, aplikasi untuk tim lapangan, dan platform CRM berbasis web.',
    bio: [
      'Fullstack developer yang terbiasa dengan sistem berskala perusahaan. Sehari-hari saya mengerjakan modul ERP dengan Laravel dan React, aplikasi mobile React Native untuk tim sales di lapangan, sekaligus menjadi maintainer dan code reviewer lintas proyek.',
      'Saat ini saya mahasiswa tingkat akhir D4 Teknologi Rekayasa Perangkat Lunak di Sekolah Vokasi IPB University.',
    ],
    location: 'Indonesia', // TODO: kota kamu
    email: '', // TODO: email kerja
    phone: '',
    avatar_url: '',
    cv_url: '', // TODO: link CV (PDF)
    socials: {
      github: '', // TODO
      linkedin: '', // TODO
      instagram: '',
    },
    available_for_work: true,
    // Ditampilkan di "surat jalan" pada hero: apa yang bisa kamu kerjakan.
    focus_areas: [
      { title: 'Modul ERP', detail: 'Laravel + React' },
      { title: 'Aplikasi tim lapangan', detail: 'React Native' },
      { title: 'Platform CRM', detail: 'Web' },
    ],
  },

  skills: [
    { id: 1, name: 'React', category: 'frontend' },
    { id: 2, name: 'Vite', category: 'frontend' },
    { id: 3, name: 'JavaScript', category: 'frontend' },
    { id: 4, name: 'TypeScript', category: 'frontend' },
    { id: 5, name: 'Bootstrap / React Bootstrap', category: 'frontend' },
    { id: 6, name: 'Laravel', category: 'backend' },
    { id: 7, name: 'PHP', category: 'backend' },
    { id: 8, name: 'REST API', category: 'backend' },
    { id: 9, name: 'Role-based access control', category: 'backend' },
    { id: 10, name: 'React Native CLI', category: 'mobile' },
    { id: 11, name: 'WatermelonDB (offline-first)', category: 'mobile' },
    { id: 12, name: 'MySQL', category: 'database' },
    { id: 13, name: 'Git', category: 'tools' },
    { id: 14, name: 'Code review', category: 'tools' },
  ],

  projects: [
    {
      id: 1,
      slug: 'tap-sales-erp',
      title: 'TAP Sales ERP',
      summary:
        'Sistem ERP distribusi untuk PT Mitra Indo Maju: pembelian, penerimaan barang, delivery order, dan mutasi stok.',
      category: 'erp',
      role: 'Fullstack Developer & code reviewer',
      stack: ['Laravel', 'React', 'Vite', 'MySQL'],
      thumbnail_url: '',
      repo_url: '',
      demo_url: '',
      is_featured: true,
      is_confidential: true,
      year: 2026, // TODO
      description:
        'ERP multi-modul yang menangani alur barang dari pembelian sampai pengiriman. Saya mengerjakan modul di sisi backend dan frontend, termasuk alur penerimaan barang dari gudang berikat ke gudang utama, delivery order transfer dan konsinyasi, serta alur approval dan mutasi stoknya.',
      highlights: [
        'Delivery order transfer dan konsinyasi dalam satu tabel dengan tipe sebagai pembeda.',
        'Penerimaan barang multi-RO digabung menjadi satu dokumen penerimaan gudang utama.',
        'Mutasi stok baru dicatat saat approval, bukan saat dokumen dibuat.',
      ],
      images: [],
    },
    {
      id: 2,
      slug: 'tap-sales-forces',
      title: 'Modul Sales Forces',
      summary:
        'Modul canvassing: alokasi stok harian, surat jalan, setoran, dan serah terima uang dari salesman sampai team leader.',
      category: 'erp',
      role: 'Fullstack Developer',
      stack: ['Laravel', 'React', 'React Native', 'MySQL'],
      thumbnail_url: '',
      repo_url: '',
      demo_url: '',
      is_featured: true,
      is_confidential: true,
      year: 2026,
      description:
        'Modul untuk tim sales lapangan yang terdiri dari GUI web untuk team leader, admin, dan master data, serta aplikasi mobile untuk salesman. Setiap perpindahan barang dan uang punya kontrol silang di tiap peran.',
      highlights: [
        'Empat peran dengan aliran uang salesman → admin → team leader.',
        'Konfirmasi foto surat jalan saat tap-out gudang.',
        'Aturan maker-checker agar satu orang tidak memproses sekaligus memverifikasi setoran yang sama.',
      ],
      images: [],
    },
    {
      id: 3,
      slug: 'journey-plan',
      title: 'Journey Plan',
      summary:
        'Fitur perencanaan kunjungan outlet di aplikasi Tap Sales, sekaligus topik tugas akhir saya.',
      category: 'mobile',
      role: 'Mobile & backend developer',
      stack: ['React Native', 'Laravel', 'MySQL'],
      thumbnail_url: '',
      repo_url: '',
      demo_url: '',
      is_featured: false,
      is_confidential: true,
      year: 2026,
      description:
        'TODO: jelaskan masalah yang diselesaikan Journey Plan, siapa penggunanya, dan hasilnya.',
      highlights: [],
      images: [],
    },
    {
      id: 4,
      slug: 'dompetkita',
      title: 'DompetKita',
      summary:
        'Aplikasi keuangan pribadi yang tetap jalan tanpa internet.',
      category: 'mobile',
      role: 'Solo developer',
      stack: ['React Native', 'TypeScript', 'WatermelonDB'],
      thumbnail_url: '',
      repo_url: '', // TODO: link repo kalau publik
      demo_url: '',
      is_featured: true,
      is_confidential: false,
      year: 2026,
      description:
        'Proyek pribadi: aplikasi pencatat keuangan dengan database lokal WatermelonDB sehingga semua fitur utama tetap bisa dipakai offline.',
      highlights: [],
      images: [],
    },
    {
      id: 5,
      slug: 'mim-company-profile',
      title: 'Website Company Profile MIM',
      summary:
        'Website profil perusahaan dengan katalog produk per kategori minuman.',
      category: 'web',
      role: 'Frontend developer',
      stack: ['React', 'React Bootstrap'],
      thumbnail_url: '',
      repo_url: '',
      demo_url: '', // TODO: URL live kalau boleh ditampilkan
      is_featured: false,
      is_confidential: false,
      year: 2026,
      description:
        'Redesain halaman portfolio brand menjadi katalog produk dengan pemilih kategori visual, hero per kategori, dan kartu produk detail.',
      highlights: [],
      images: [],
    },
    {
      id: 6,
      slug: 'mim-cms-admin',
      title: 'CMS Admin MIM',
      summary: 'Panel admin untuk mengelola konten website perusahaan.',
      category: 'web',
      role: 'Frontend developer',
      stack: ['React'],
      thumbnail_url: '',
      repo_url: '',
      demo_url: '',
      is_featured: false,
      is_confidential: true,
      year: 2026,
      description: 'TODO: lengkapi.',
      highlights: [],
      images: [],
    },
    {
      id: 7,
      slug: 'go-to-thailand-lucky-draw',
      title: 'Lucky Draw "Go to Thailand"',
      summary: 'Frontend publik untuk event undian berhadiah.',
      category: 'web',
      role: 'Frontend developer',
      stack: ['React'],
      thumbnail_url: '',
      repo_url: '',
      demo_url: '',
      is_featured: false,
      is_confidential: false,
      year: 2026,
      description: 'TODO: lengkapi.',
      highlights: [],
      images: [],
    },
  ],

  experiences: [
    {
      id: 1,
      company: 'Univerz Teknologi Utama',
      position: 'Full Stack Developer',
      employment_type: 'Purnawaktu',
      location: 'Jakarta Raya, Indonesia',
      work_mode: 'Di lokasi',
      logo_url: null,
      started_at: '2026-01-01',
      ended_at: null,
      is_current: true,
      description: 'Saat ini, saya bekerja di Univerz dengan tanggung jawab utama mengelola dan memelihara ekosistem website perusahaan.',
      highlights: [],
      skills: ['Full-Stack Development', 'React.js'],
    },
    {
      id: 2,
      company: 'PT Mitra Indo Maju',
      position: 'Mobile Application Developer Internship',
      employment_type: 'Magang',
      location: 'Jakarta Raya, Indonesia',
      work_mode: 'Di lokasi',
      logo_url: null,
      started_at: '2025-06-01',
      ended_at: '2025-12-31',
      is_current: false,
      description: 'Sebagai Mobile Developer Intern di PT Mitra Indo Maju, saya bertanggung jawab merombak total antarmuka aplikasi seluler secara end-to-end.',
      highlights: [],
      skills: ['Mobile Application Development', 'Mobile Applications'],
    },
  ],

  educations: [
    {
      id: 1,
      institution: 'IPB University',
      degree: 'D4 Teknologi Rekayasa Perangkat Lunak',
      field: null,
      location: null,
      work_mode: null,
      logo_url: null,
      started_at: '2022-08-01',
      ended_at: '2026-08-31',
      description: 'Mahasiswa Teknologi Rekayasa Perangkat Lunak di IPB University yang memiliki ketertarikan kuat pada perpaduan pemrograman dan desain multimedia.',
      skills: ['Front-End Development', 'Back-End Web Development'],
    },
    {
      id: 2,
      institution: 'SMAN 1 Jawilan',
      degree: 'SMA IPA',
      field: null,
      location: null,
      work_mode: null,
      logo_url: null,
      started_at: '2018-04-01',
      ended_at: '2022-05-31',
      description: null,
      skills: [],
    },
  ],

  certifications: [],
}
