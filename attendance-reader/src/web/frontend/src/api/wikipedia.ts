type WikiPerson = {
    title   : string;
    quote   : string;
    imageUrl: string | null;
};

const CATEGORIES = [
    'Category:日本の物理学者',
    'Category:日本の数学者',
    'Category:アメリカ合衆国の発明家',
    'Category:古代ギリシアの哲学者',
];

const fetchRandomPersonTitle = async (): Promise<string | null> => {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmtype=page&cmlimit=500&format=json&origin=*`;

    const res  = await fetch(url);
    const data = await res.json();

    const members = data.query?.categorymembers;
    if (!members?.length) return null;

    return members[Math.floor(Math.random() * members.length)].title;
};

const fetchQuote = async (title: string): Promise<string> => {
    const url = `https://ja.wikiquote.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=revisions&rvprop=content&format=json&origin=*`;

    const res  = await fetch(url);
    const data = await res.json();

    const pages    = data.query?.pages;
    const page     = pages?.[Object.keys(pages)[0]];
    const wikitext = page?.revisions?.[0]?.['*'];

    if (wikitext) {
        const quotes = wikitext.split('\n')
            .filter((line: string) => line.startsWith('*') && !line.startsWith('**'))
            .map((line: string) =>
                line
                    .replace(/\[\[.*?\]\]/g, '')
                    .replace(/\{\{.*?\}\}/g, '')
                    .replace(/[*']/g, '')
                    .trim()
            )
            .filter((line: string) => line.length > 10);

        if (quotes.length) return quotes[Math.floor(Math.random() * quotes.length)];
    }

    // フォールバック：Wikipediaのextractの最初の1文
    const wikiUrl  = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const wikiRes  = await fetch(wikiUrl);
    const wikiData = await wikiRes.json();
    return wikiData.extract?.split('。')[0] + '。' || '';
};

const fetchImageUrl = async (title: string): Promise<string | null> => {
    const url  = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res  = await fetch(url);
    const data = await res.json();
    return data.thumbnail?.source ?? null;
};

export const fetchRandomPerson = async (): Promise<WikiPerson | null> => {
    try {
        const title = await fetchRandomPersonTitle();
        if (!title) return null;

        const [quote, imageUrl] = await Promise.all([
            fetchQuote(title),
            fetchImageUrl(title),
        ]);

        return { title, quote, imageUrl };

    } catch {
        return null;
    }
};
