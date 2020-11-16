syntax = {
  version: "00504",
  functionalgroup: "BG",
}

structure = [
  {
    ID: "ST",
    MIN: 1,
    MAX: 1,
    LEVEL: [
      { ID: "CPM", MIN: 1, MAX: 1 },
      { ID: "PER", MIN: 0, MAX: 1 },
      {
        ID: "NM1",
        MIN: 0,
        MAX: 999,
        LEVEL: [
          { ID: "DMG", MIN: 0, MAX: 1 },
          { ID: "DMA", MIN: 0, MAX: 1 },
          { ID: "REF", MIN: 0, MAX: 2 },
          { ID: "N3", MIN: 0, MAX: 2 },
          { ID: "N4", MIN: 0, MAX: 1 },
          { ID: "AAA", MIN: 0, MAX: 1 },
        ],
      },
      {
        ID: "VEH",
        MIN: 0,
        MAX: 999,
        LEVEL: [
          { ID: "CII", MIN: 0, MAX: 1 },
          { ID: "AAA", MIN: 0, MAX: 1 },
        ],
      },
      {
        ID: "VID",
        MIN: 0,
        MAX: 999,
        LEVEL: [
          { ID: "CII", MIN: 0, MAX: 1 },
          { ID: "AAA", MIN: 0, MAX: 1 },
        ],
      },
      { ID: "SE", MIN: 1, MAX: 1 },
    ],
  },
]
