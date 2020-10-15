syntax = {
    version: "00504",
    functionalgroup: "CB",
};

structure = [
    {
        ID: "ST",
        MIN: 1,
        MAX: 1,
        LEVEL: [
            { ID: "BTI", MIN: 1, MAX: 1 },
            {
                ID: "N1",
                MIN: 1,
                MAX: 99999,
                LEVEL: [
                    { ID: "N2", MIN: 0, MAX: 1 },
                    { ID: "N3", MIN: 0, MAX: 1 },
                    { ID: "N4", MIN: 0, MAX: 1 },
                    { ID: "REF", MIN: 0, MAX: 99999 },
                    { ID: "AMT", MIN: 0, MAX: 99999 },
                    { ID: "PCT", MIN: 0, MAX: 99999 },
                    { ID: "CHB", MIN: 0, MAX: 99999 },
                    { ID: "DTM", MIN: 0, MAX: 99999 },
                    { ID: "PER", MIN: 0, MAX: 99999 },
                ],
            },
            {
                ID: "NM1",
                MIN: 1,
                MAX: 99999,
                LEVEL: [
                    { ID: "DPN", MIN: 0, MAX: 99999 },
                    { ID: "REF", MIN: 0, MAX: 99999 },
                    { ID: "AMT", MIN: 0, MAX: 99999 },
                    { ID: "PCT", MIN: 0, MAX: 99999 },
                    { ID: "CHB", MIN: 0, MAX: 99999 },
                    { ID: "DTM", MIN: 0, MAX: 99999 },
                    { ID: "MSG", MIN: 0, MAX: 99999 },
                    {
                        ID: "PAM",
                        MIN: 0,
                        MAX: 99999,
                        LEVEL: [
                            { ID: "REF", MIN: 0, MAX: 99999 },
                            { ID: "CHB", MIN: 0, MAX: 99999 },
                        ],
                    },
                ],
            },
            { ID: "SE", MIN: 1, MAX: 1 },
        ],
    },
];
