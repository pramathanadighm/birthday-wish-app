// Database of curated fallback quotes and dynamic quote fetching API service

export const FALLBACK_QUOTES = [
  { text: "Count your age by friends, not years. Count your life by smiles, not tears.", author: "John Lennon" },
  { text: "The more you praise and celebrate your life, the more there is in life to celebrate.", author: "Oprah Winfrey" },
  { text: "Age is merely the number of years the world has been enjoying you!", author: "Anonymous" },
  { text: "You don't get older, you get better.", author: "Shirley Bassey" },
  { text: "Today you are you, that is truer than true. There is no one alive who is you-er than you!", author: "Dr. Seuss" },
  { text: "With mirth and laughter let old wrinkles come.", author: "William Shakespeare" },
  { text: "Do not grow old, no matter how long you live. Never cease to stand like curious children before the great mystery into which we were born.", author: "Albert Einstein" },
  { text: "The secret of staying young is to live honestly, eat slowly, and lie about your age.", author: "Lucille Ball" },
  { text: "Every year on your birthday, you get a chance to start new.", author: "Sammy Hagar" },
  { text: "Life is a journey, not a destination. Celebrate every milestone along the way.", author: "Ralph Waldo Emerson" },
  { text: "Youth is the gift of nature, but age is a work of art.", author: "Stanisław Jerzy Lec" },
  { text: "Don't just count your years, make your years count.", author: "George Meredith" },
  { text: "We turn not older with years, but newer every day.", author: "Emily Dickinson" },
  { text: "It is not the years in your life that count, it is the life in your years.", author: "Abraham Lincoln" },
  { text: "A birthday is not the end of another year, but the start of a new one.", author: "Anonymous" },
  { text: "Live each day as if your life had just begun.", author: "Johann Wolfgang von Goethe" },
  { text: "Grow old along with me! The best is yet to be.", author: "Robert Browning" },
  { text: "Wrinkles should merely indicate where smiles have been.", author: "Mark Twain" },
  { text: "The great thing about getting older is that you don't lose the other ages you've been.", author: "Madeleine L'Engle" },
  { text: "Celebrate what you've accomplished, but raise the bar a little higher each time you succeed.", author: "Mia Hamm" },
  { text: "To keep the heart unwrinkled, to be hopeful, kindly, cheerful, reverent—that is to triumph over old age.", author: "Thomas Bailey Aldrich" },
  { text: "May you live all the days of your life.", author: "Jonathan Swift" },
  { text: "Birthdays are nature's way of telling us to eat more cake.", author: "Edward Morykwas" },
  { text: "Life isn't about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Cherish all your happy moments; they make a fine cushion for old age.", author: "Booth Tarkington" },
  { text: "In the end, it's not the years that count, it's the love, memories, and laughter you gave to the world.", author: "Anonymous" },
  { text: "Let us celebrate the occasion with wine and sweet words.", author: "Plautus" },
  { text: "Age is strictly a case of mind over matter. If you don't mind, it doesn't matter.", author: "Jack Benny" },
  { text: "The years teach much which the days never know.", author: "Ralph Waldo Emerson" },
  { text: "A diplomat is a man who always remembers a woman's birthday but never remembers her age.", author: "Robert Frost" },
  { text: "To know how to grow old is the master work of wisdom, and one of the most difficult chapters in the great art of living.", author: "Henri Frédéric Amiel" },
  { text: "Live long and prosper.", author: "Leonard Nimoy" },
  { text: "Every birthday is a gift. Every day is a gift.", author: "Aretha Franklin" },
  { text: "The older the fiddler, the sweeter the tune.", author: "English Proverb" },
  { text: "The afternoon knows what the morning never suspected.", author: "Robert Frost" },
  { text: "There is still no cure for the common birthday.", author: "John Glenn" },
  { text: "Life seems to go on without effort when I am filled with music.", author: "George Eliot" },
  { text: "Wisdom doesn't necessarily come with age. Sometimes age just shows up all by itself.", author: "Tom Wilson" },
  { text: "Another year older, another year wiser, another year more wonderful!", author: "Anonymous" },
  { text: "Keep smiling, because life is a beautiful thing and there's so much to smile about.", author: "Marilyn Monroe" },
  { text: "You were born an original. Don't die a copy.", author: "John Mason" },
  { text: "How old would you be if you didn't know how old you were?", author: "Satchel Paige" },
  { text: "A birthday is just the first day of another 365-day journey around the sun. Enjoy the trip!", author: "Anonymous" },
  { text: "Be in love with your life. Every detail of it.", author: "Jack Kerouac" },
  { text: "Life was meant for good friends and great adventures.", author: "Anonymous" },
  { text: "The greatest gift you can give yourself on your birthday is permission to live unapologetically.", author: "Anonymous" },
  { text: "The best way to predict your future is to create it.", author: "Peter Drucker" },
  { text: "Let gratitude be the pillow upon which you kneel to say your nightly prayer.", author: "Maya Angelou" },
  { text: "You can live to be a hundred if you give up all the things that make you want to live to be a hundred.", author: "Woody Allen" },
  { text: "Joy is not in things; it is in us.", author: "Richard Wagner" },
  { text: "To me, fair friend, you never can be old, for as you were when first your eye I eyed, such seems your beauty still.", author: "William Shakespeare" },
  { text: "Everything that is made beautiful and fair and lovely is made for the eye of one who sees.", author: "Michelangelo" },
  { text: "The heart that loves becomes never old.", author: "Greek Proverb" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" }
];

/**
 * Gets a random fallback quote from the local database, avoiding the current quote.
 */
export function getRandomFallbackQuote(excludeText = '') {
  const pool = FALLBACK_QUOTES.filter(q => q.text !== excludeText);
  const choices = pool.length > 0 ? pool : FALLBACK_QUOTES;
  const index = Math.floor(Math.random() * choices.length);
  return { ...choices[index], source: 'fallback' };
}

/**
 * Fetches a random quote from the public API with automatic fallback.
 * Uses a 3.5s timeout to guarantee instant responsiveness even if the network is sluggish.
 */
export async function fetchInspirationalQuote(currentText = '') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch('https://dummyjson.com/quotes/random', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.quote && data.author) {
      return {
        text: data.quote.trim(),
        author: data.author.trim(),
        source: 'api'
      };
    }

    throw new Error('Invalid quote response schema');
  } catch (err) {
    clearTimeout(timeoutId);
    // Graceful fallback to rich local quote repository
    return getRandomFallbackQuote(currentText);
  }
}
