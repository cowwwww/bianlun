export type FinishedTournament = {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string;
  year?: string;
  tag?: string;
};

/**
 * Finished tournament info sourced from the legacy ArcX static site.
 * These are static links so we can surface them without extra backend calls.
 */
export const getFinishedTournaments = (): FinishedTournament[] => {
  const fallback = 'https://placehold.co/640x360/111827/ffffff?text=ArcX+ADA';

  const data: FinishedTournament[] = [
    {
      id: 'ada-2024-a',
      title: 'ADA全国赛-甲级',
      description: '2024年ADA全国线上辩论赛甲级完整赛果',
      link: '/arcx/2024winter1.pdf',
      image: '/arcx/ada-2024-a.jpg',
      year: '2024',
      tag: '全国赛',
    },
    {
      id: 'ada-2024-b',
      title: 'ADA全国赛-乙级',
      description: '2024年ADA全国线上辩论赛乙级完整赛果',
      link: '/arcx/2024winter2.pdf',
      image: '/arcx/ada-2024-b.jpg',
      year: '2024',
      tag: '全国赛',
    },
    {
      id: 'ada-2024-summer',
      title: 'ADA夏季线上辩论赛',
      description: '2024年ADA夏季线上辩论赛完整赛果',
      link: '/arcx/2024summer.pdf',
      image: '/arcx/ada-2024-summer.jpg',
      year: '2024',
      tag: '夏季赛',
    },
    {
      id: 'ada-2025-national',
      title: 'ADA全国线上辩论赛',
      description: '2025年ADA全国线上辩论赛完整赛果',
      link: '/arcx/2025winter.pdf',
      image: '/arcx/ada-2025-national.jpg',
      year: '2025',
      tag: '全国赛',
    },
    {
      id: 'ada-2025-summer-individual',
      title: 'ADA夏季个人赛实时信息',
      description: '2025年ADA夏季个人赛实时信息与赛果',
      link: '/arcx/2025summer.pdf',
      image: '/arcx/ada-2026.jpg',
      year: '2025',
      tag: '夏季赛',
    },
  ];

  return data
    .map((item) => ({
      ...item,
      image: item.image || fallback,
    }))
    .sort((a, b) => (parseInt(b.year || '0', 10) || 0) - (parseInt(a.year || '0', 10) || 0));
};

