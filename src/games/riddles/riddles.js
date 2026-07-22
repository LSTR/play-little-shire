// Riddle bank. `answer` and `choices` are token names (labels via strings `tokens.<name>`;
// textures resolve via TOKEN_TEX in the scene). Texts are original paraphrases in both
// languages — never Tolkien quotes. Each game draws a random subset.
export const RIDDLES = [
  {
    answer: 'mountain',
    choices: ['mountain', 'tree', 'dragon'],
    text: {
      es: 'Tiene raíces que nadie ve,\nes más alta que los árboles,\nsube y sube… ¡y nunca crece!',
      en: 'It has roots nobody sees,\nit stands taller than the trees,\nup and up it goes… yet it never grows!',
    },
  },
  {
    answer: 'egg',
    choices: ['egg', 'mushroom', 'barrel'],
    text: {
      es: 'Una cajita sin puerta ni llave,\ny adentro un tesoro dorado\nque nadie ha tocado.',
      en: 'A little box with no door or key,\nyet inside sleeps a golden treasure\nnobody has ever touched.',
    },
  },
  {
    answer: 'fish',
    choices: ['fish', 'spider', 'sword'],
    text: {
      es: 'Vive sin respirar,\nfría como el hielo está,\nnunca tiene sed… ¡y siempre bebe!',
      en: 'It lives without breathing,\nit is as cold as ice,\nit is never thirsty… yet always drinking!',
    },
  },
  {
    answer: 'wind',
    choices: ['wind', 'dragon', 'tree'],
    text: {
      es: 'Vuela sin tener alas,\nsusurra sin tener boca,\ny muerde sin tener dientes.',
      en: 'It flies without wings,\nit whispers without a mouth,\nand it bites without teeth.',
    },
  },
  {
    answer: 'ring',
    choices: ['ring', 'mushroom', 'wizard'],
    text: {
      es: 'Es redondo y dorado,\nbrilla en la oscuridad…\n¿Qué guardo en mi bolsillo?',
      en: 'It is round and golden,\nit glows in the dark…\nWhat is in my pocket?',
    },
  },
  {
    answer: 'tree',
    choices: ['tree', 'mushroom', 'wind'],
    text: {
      es: 'En invierno duerme desnudo,\nen primavera se viste de verde,\ny en otoño suelta su ropa.',
      en: 'In winter it sleeps bare,\nin spring it dresses in green,\nand in autumn it drops its clothes.',
    },
  },
  {
    answer: 'moon',
    choices: ['moon', 'sun', 'star'],
    text: {
      es: 'De noche aparece\nsin que nadie la llame,\nde día se esconde sin que la roben.',
      en: 'It appears at night\nwithout being called,\nby day it hides without being stolen.',
    },
  },
  {
    answer: 'sun',
    choices: ['sun', 'candle', 'dragon'],
    text: {
      es: 'Da calor y da luz,\nmadruga cada mañana,\ny de noche nunca lo ves.',
      en: 'It gives warmth and light,\nit rises early every morning,\nand you never see it at night.',
    },
  },
  {
    answer: 'candle',
    choices: ['candle', 'fish', 'sun'],
    text: {
      es: 'Baila sin piernas,\nllora sin ojos,\ny se muere si la soplas.',
      en: 'It dances without legs,\nit cries without eyes,\nand it dies if you blow on it.',
    },
  },
  {
    answer: 'star',
    choices: ['star', 'moon', 'gem'],
    text: {
      es: 'De día se esconden,\nde noche despiertan,\nbrillan y parpadean.',
      en: 'They hide by day,\nthey wake at night,\nthey twinkle and shine.',
    },
  },
  {
    answer: 'key',
    choices: ['key', 'sword', 'ring'],
    text: {
      es: 'Pequeña como un dedo,\nabre puertas y cofres,\ny vive en tu bolsillo.',
      en: 'Small as a finger,\nit opens doors and chests,\nand it lives in your pocket.',
    },
  },
  {
    answer: 'spider',
    choices: ['spider', 'eagle', 'fish'],
    text: {
      es: 'Teje sin agujas,\ncaza sin correr,\ny tiene ocho patas.',
      en: 'It weaves without needles,\nit hunts without running,\nand it has eight legs.',
    },
  },
  {
    answer: 'mushroom',
    choices: ['mushroom', 'tree', 'egg'],
    text: {
      es: 'Con sombrero rojo\ny lunares blancos,\ncrece después de la lluvia.',
      en: 'With a red hat\nand white polka dots,\nit grows after the rain.',
    },
  },
  {
    answer: 'dragon',
    choices: ['dragon', 'eagle', 'troll'],
    text: {
      es: 'Duerme sobre oro,\nvuela sin plumas,\ny escupe fuego.',
      en: 'It sleeps on gold,\nit flies without feathers,\nand it breathes fire.',
    },
  },
  {
    answer: 'barrel',
    choices: ['barrel', 'door', 'honey'],
    text: {
      es: 'Barriga de madera,\ncinturón de metal,\nguarda lo que le des.',
      en: 'A belly of wood,\na belt of metal,\nit keeps whatever you give it.',
    },
  },
  {
    answer: 'eagle',
    choices: ['eagle', 'dragon', 'fish'],
    text: {
      es: 'Reina del cielo,\nojos de cazadora,\nnido en la montaña.',
      en: 'Queen of the sky,\nwith a hunter’s eyes,\nher nest on the mountain.',
    },
  },
  {
    answer: 'honey',
    choices: ['honey', 'egg', 'gem'],
    text: {
      es: 'Dorada y pegajosa,\nregalo de las abejas,\ndulce como ninguna.',
      en: 'Golden and sticky,\na gift from the bees,\nsweeter than anything.',
    },
  },
  {
    answer: 'gem',
    choices: ['gem', 'star', 'ring'],
    text: {
      es: 'Nace dentro de la roca,\nbrilla como el agua,\ny vale un tesoro.',
      en: 'It is born inside rock,\nit shines like water,\nand it is worth a treasure.',
    },
  },
  {
    answer: 'door',
    choices: ['door', 'barrel', 'mountain'],
    text: {
      es: 'No camina y todos pasan por ella,\nse abre y se cierra\nsin ir a ningún lado.',
      en: 'It never walks yet everyone passes through,\nit opens and closes\nwithout going anywhere.',
    },
  },
  {
    answer: 'sword',
    choices: ['sword', 'key', 'candle'],
    text: {
      es: 'Lengua de metal\nque duerme en su funda,\nsolo el valiente la despierta.',
      en: 'A tongue of metal\nthat sleeps in its sheath,\nonly the brave wake it.',
    },
  },
];
