const abusiveWords = [
    "kiss",
    "Bitch",
    "bitch",
    "nigga",
    "Stupid",
    "stupidity",
    "fuck",
    "kill",
    "pagal",
    "stupid",
    "darling",
    "marry",
    "sexy",
    "sexy",
    "SEXY",
    "Sexy",
    "sexyyy",
    "sexyyy",
    "sexyyy",
    "hot",
    "hot",
    "HOT",
    "Hot",
    "hottt",
    "hottt",
    "hotyy",
    "babe",
    "babe",
    "babeee",
    "babeee",
    "babeyy",
    "honey",
    "honey",
    "HONEY",
    "Honey",
    "honeyyy",
    "honeyyy",
    "honeyyy",
    "sweetheart",
    "sweetheart",
    "SWEETHEART",
    "Sweetheart",
    "sweethearttt",
    "sweethearttt",
    "sweetheartyy",
    "darling",
    "darling",
    "DARLING",
    "Darling",
    "darlinggg",
    "darlinggg",
    "darlingyy",
    "sugar",
    "sugar",
    "SUGAR",
    "Sugar",
    "sugarrr",
    "sugarrr",
    "sugaryy",
    "charming",
    "charming",
    "CHARMING",
    "Charming",
    "charminggg",
    "charminggg",
    "charmingyy",
    "adorable",
    "adorable",
    "ADORABLE",
    "Adorable",
    "adorableee",
    "adorableee",
    "adorableyy",
    "attractive",
    "attractive",
    "ATTRACTIVE",
    "Attractive",
    "attractiveee",
    "attractiveee",
    "attractiveyy",
    "stunning",
    "stunning",
    "STUNNING",
    "Stunning",
    "stunninggg",
    "stunninggg",
    "stunningyy",
    "sweetie",
    "sweetie",
    "SWEETIE",
    "Sweetie",
    "sweetieee",
    "sweetieee",
    "sweetieyy",
    "baby",
    "baby",
    "BABY",
    "Baby",
    "babyyy",
    "babyyy",
    "babyyy",
    "lovely",
    "lovely",
    "LOVELY",
    "Lovely",
    "lovelyyy",
    "lovelyyy",
    "lovelyyy",
    "seductive",
    "seductive",
    "SEDUCTIVE",
    "Seductive",
    "seductiveee",
    "seductiveee",
    "seductiveyy",
    "tempting",
    "tempting",
    "TEMPTING",
    "Tempting",
    "temptinggg",
    "temptinggg",
    "temptingyy",
    "flirt",
    "flirt",
    "FLIRT",
    "Flirt",
    "flirttt",
    "flirttt",
    "foxy",
    "foxy",
    "FOXY",
    "Foxy",
    "foxyyy",
    "foxyyy",
    "foxyyy",
    "sultry",
    "sultry",
    "SULTRY",
    "Sultry",
    "sultryyy",
    "sultryyy",
    "sultryyy",
    "doll",
    "doll",
    "DOLL",
    "Doll",
    "dollll",
    "dollll",
    "dollyy",
    "hottie",
    "hottie",
    "HOTTIE",
    "Hottie",
    "hottieee",
    "hottieee",
    "hottieyy",
    "cutie",
    "cutie",
    "CUTIE",
    "Cutie",
    "cutieee",
    "cutieee",
    "cutieyy",
    "snack",
    "snack",
    "SNACK",
    "Snack",
    "snackkk",
    "snackkk",
    "snackyy",
    "bombshell",
    "bombshell",
    "BOMBSHELL",
    "Bombshell",
    "bombshellll",
    "bombshellll",
    "bombshellyy",
    "sensual",
    "sensual",
    "SENSUAL",
    "Sensual",
    "sensualll",
    "sensualll",
    "sensualyy",
    "alluring",
    "alluring",
    "ALLURING",
    "Alluring",
    "alluringgg",
    "alluringgg",
    "alluringyy",
    "naughty",
    "naughty",
    "NAUGHTY",
    "Naughty",
    "naughtyyy",
    "naughtyyy",
    "naughtyyy",
    "prince",
    "prince",
    "PRINCE",
    "Prince",
    "princeee",
    "princeee",
    "princeyy",
    "princess",
    "princess",
    "PRINCESS",
    "Princess",
    "princessss",
    "princessss",
    "princessyy",
    "romantic",
    "romantic",
    "ROMANTIC",
    "Romantic",
    "romanticcc",
    "romanticcc",
    "romanticyy",
    "cuddle",
    "cuddle",
    "CUDDLE",
    "Cuddle",
    "cuddleee",
    "cuddleee",
    "cuddleyy",
    "kissable",
    "kissable",
    "KISSABLE",
    "Kissable",
    "kissableee",
    "kissableee",
    "kissableyy",
    "muffin",
    "muffin",
    "MUFFIN",
    "Muffin",
    "muffinnn",
    "muffinnn",
    "muffinyy",
    "sugarplum",
    "sugarplum",
    "SUGARPLUM",
    "Sugarplum",
    "sugarplummm",
    "sugarplummm",
    "sugarplumyy",
    "darlin",
    "darlin",
    "DARLIN",
    "Darlin",
    "darlinnn",
    "darlinnn",
    "darlinyy",
    "bby",
    "bby",
    "BBY",
    "Bby",
    "bbyyy",
    "bbyyy",
    "bbyyy",
    "luv",
    "luv",
    "LUV",
    "Luv",
    "luvvv",
    "luvvv",
    "luvyy",
    "bae",
    "bae",
    "BAE",
    "Bae",
    "baeee",
    "baeee",
    "baeyy",
    "boo",
    "boo",
    "BOO",
    "Boo",
    "boooo",
    "boooo",
    "nigger", "faggot", "fag", "dyke", "tranny", "retard",
    "chink", "kike", "spic", "wetback", "gook", "towelhead",
    "raghead", "sandnigger", "beaner", "cunt", "paki",
    "slut", "whore", "cum", "cumslut", "fuckhole", "cocksucker",
    "twat", "pussy", "dick", "blowjob", "asshole", "fcuk",
    "jerk", "jerkoff", "jackoff", "wank", "wanker", "fap",
    "kys", "killyourself", "killurself", "diealready", "gokill",
    "gohangurself", "shootyou", "rapeyou", "illkill", "illhurt",
    "stab", "murder", "strangle", "torture", "bash", "smash",
    "idiot", "moron", "dumbass", "dumbo", "imbecile", "loser",
    "fool", "pathetic", "worthless", "useless", "failure", "scum",
    "trash", "garbage", "waste", "disgrace", "ugly", "fatso",
    "fatty", "disgusting", "gross", "creep", "stalker", "perv",
    "pervert", "sicko", "psycho", "crazy", "insane", "lunatic",
    "fuckyou", "fucku", "fku", "motherfucker", "stfu", "gtfo",
    "shutup", "gofuckyourself", "ihateyou", "youresodumb",
    "pieceofshit", "pos", "nolife", "kys", "kms",
    "beautiful", "gorgeous", "cute", "handsome", "pretty",
    "wifey", "hubby", "girlfriend", "boyfriend", "love",
    "lover", "crush", "date", "dating", "smooch", "hugs",
    "kisses", "xoxo", "makeout", "makeoutwith", "sex",
    "sexting", "sexytime", "naked", "nude", "nudes",
    "sendnudes", "pics", "sendpics", "snapme",
    "sexxy", "sexxxy", "sexi", "sexxi", "sexxxi",
    "hott", "hotttt", "hawt", "hawtt",
    "babee", "babyy", "babby", "bby",
    "sweetypie", "sweetiepie", "honeybun", "sugarpie",
    "foxxy", "foxxxy", "cutiepatootie", "cutiepie",
    "sweetums", "snuggle", "snuggles", "huggable"
];
const abusiveWordsSet = new Set(abusiveWords);

export { abusiveWordsSet };